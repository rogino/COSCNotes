const renderMarkdown = require("./render-markdown").default;
const fse = require("fs-extra");
const fs = require("fs");
const path = require("path");
const readline = require('readline');
const recursiveReaddir = require("recursive-readdir");
const pretty = require("pretty");
const yargs = require("yargs");
const { hideBin } = require('yargs/helpers')

const argv = yargs(hideBin(process.argv))
.option(
  "pretty-links", {
    alias: "p",
    description: "Internal links don't have `index` or `.html`",
    type: "boolean",
    default: false
  }
)
.option(
  "in-directory", {
    alias: "i",
    description: "Directory containing source Markdown files",
    type: "string",
    default: "./../"
  }
)
.option(
  "out-directory", {
    alias: "o",
    description: "Directory to output HTML and other resources to",
    type: "string",
    default:"./out"
  }
)
.option(
  "semester-info-path", {
    alias: "f",
    description: `Path to JSON file containing semester and course name/description
                  Format of { "semesterName": [
                    "CourseCode", /* or */
                    {
                      "name": "CourseCode",
                      "description": "description"
                    }
                  ]}`,
    type: "string",
    default: "./semester.json"
  }
)
.option(
  "steps", {
    alias: "s",
    description: `Steps to execute.
                  - 'd': copy input directories
                  - 'c': copy CSS and other resources
                  - 'r': render files`,
    type: "string",
    default: "dcr"
  }
).option(
  "nuke-out-directory", {
    alias: "n",
    description: `Deletes contents of the output directory before copying.
                  Only if runs if 'd' or 'r' steps enabled`,
    type: "boolean",
    default: false
  }
).option(
  "render-in-series", {
    alias: "r",
    description: `If false, files are rendered one by one instead of concurrently`,
    type: "boolean",
    default: false
  }
).option(
  "render-single-file", {
    description: `Path to a single markdown file to render. All other options ignored`,
    type: "string",
    default: undefined
  }
).option(
  "render-single-file-out", {
    description: `If render-single-file given, is output path for that file. If this
                  is not given, defaults to same path as input except with a .html extension`,
    type: "string",
    default: undefined 
  }
).option(
  "render-single-file-toc", {
    description: `If render-single-file given, determines if a table of contents should
                  be added automatically`,
    type: "boolean",
    default: false
  }
)
.version(false)
.epilogue(
  `NB: on Windows, if any input directories are Junctions, developer mode needs to
  be enabled. See https://stackoverflow.com/a/57725541
`)
.strict()
.help().alias("help", "h").argv;

// To make args: blacklist, semester info path

const NUKE_OUT_DIRECTORY = argv.nukeOutDirectory;

if (typeof argv.steps !== "string" || argv.steps.match(/[^dcr]/)) {
  console.error(`Unknown step(s); only 'dcr' supported`);
  process.exit();
}
const COPY_DIRECTORIES = argv.steps.includes("d");
const COPY_LINKED_RESOURCES = argv.steps.includes("c");
const RENDER_ALL_FILES = argv.steps.includes("r");

const PRETTY_LINKS = argv.prettyLinks;

// Directories in given directory will be copied to output directory and markdown files rendered
const IN_DIRECTORY  = argv.inDirectory;
const OUT_DIRECTORY = argv.outDirectory;

const SEMESTER_INFO_PATH = argv.semesterInfoPath;

const RENDER_IN_SERIES = argv.renderInSeries;
const RENDER_SINGLE_FILE = argv.renderSingleFile;
const RENDER_SINGLE_FILE_OUT = argv.renderSingleFileOut;
const RENDER_SINGLE_FILE_TOC = argv.renderSingleFileToc;

// Blacklist. For copying directories, just the name of the file/folder. For rendering, uses path relative to out directory
const IN_DIRECTORY_BLACKLIST = [
  /^\./,              // e.g. .git
  /^node_modules/,
  /index\.md$/,       // index is auto-generated
  /404\.md$/,         // 404 also auto-generated; don't want it in the table of contents
  /^compile_to_html/  // folder this html gen stuff is in
];


const ROOT_TITLE = "COSC Notes";
const ROOT_DESCRIPTION = "Notes from the courses I have taken at UC.";


/**
 * Extracts the title from the title line with format `# {title}`
 * Does support extracting text if the title includes URLs, but
 * no other syntax is currently supported
 * @param {string} titleLine markdown text to extract title from
 * @return {string|undefined} undefined if could not extract, extracted title otherwise
 */
const extractTitleText = (titleLine) => {
  if (titleLine == undefined) return;
  if (!titleLine.match(/^# .+/g)) return;
  let title = titleLine.substr(2);

  // If link, remove the link-y bits
  title = title.replace(/\[(.+?)\]\(.+?\)/g, (_, group1) => group1);
  title = title.trim();
  return title;
}


/**
 * Reads semester info from SEMESTER_INFO_PATH and parses it
 * @returns { semesterName: [{ name: courseName, description: courseDescription }]}
 */
const readSemesterInfo = () => {
  const semesterInfo = {};
  try {
    let semesterDataRaw = JSON.parse(fse.readFileSync(SEMESTER_INFO_PATH));
    Object.keys(semesterDataRaw).forEach(semester => {
      semesterInfo[semester] = [];
      semesterDataRaw[semester].forEach(el => {
        const course = { name: "", description: "" };
        if (typeof el == "string") course.name = el;
        else {
          course.name = el.name;
          course.description = el.description;
        }

        semesterInfo[semester].push(course);
      });
    });
    
  } catch(err) {
    console.error(`Could not parse or read semester info file at ${SEMESTER_INFO_PATH}`);
    console.error(err);
    process.exit();
  }

  return semesterInfo;
}

// Resources (e.g. css files) that need to be copied
// If string given, used as both relative to input (to current file) and output file (relative to OUT_DIRECTORY/css)
// If `dontLink` given, not linked as a CSS resource
// If `onlineLink` given, alternative HTML tag to use instead of the local file
const linkedResources = ["./monokai.css", "./main.css", {
  path: "./node_modules/katex/dist/katex.min.css",
  outPath: "./katex/katex.min.css",
  onlineLink: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.13.18/dist/katex.min.css" integrity="sha384-zTROYFVGOfTw7JV7KUu8udsvW2fx4lWOsCEDqhBreBwlHI4ioVRtmIvEThzJHGET" crossorigin="anonymous">`

}, {
    path: "./node_modules/katex/dist/fonts",
    outPath: "./katex/fonts",
    dontLink: true /* Don't link in the HTML head */
  }
].map(el => {
  if (typeof el == "string") el = {
    path: el,
    outPath: el
  };
  if (el.dontLink !== true) el.dontLink = false;
  return el;
});

/**
 * Finds absolute path to css directory
 * @returns 
 */
const cssDir = () => path.join(OUT_DIRECTORY, "css");

/**
 * Copy required CSS files etc. to output directory
 * @returns 
 */
const copyLinkedResources = () => {
  console.log("Copying linked resources");
  let promises = [];
  linkedResources.map(el => {
    const inPath = path.join(path.dirname(require.main.filename), el.path);
    const outPath = path.join(cssDir(), el.outPath);

    promises.push((async () => {
      await fse.ensureDir(path.dirname(outPath));
      console.log(`Copying ${inPath}`);
      await fse.copy(inPath, outPath);
    })());
  });

  return Promise.all(promises);
}


/**
 * Copies files and directories in the input directory to the output directory.
 * Top-level items are copied individually after passing through a blocklist
 * @returns 
 */
const copyInputDirectories = async () => {
  // Don't copy if the input and output directories are the same
  if (path.relative(IN_DIRECTORY, OUT_DIRECTORY).length != 0) {
    await fse.ensureDir(OUT_DIRECTORY);
    const names = await fse.readdir(IN_DIRECTORY);
    
    return Promise.all(names.map(async name => {
      const inDir = path.join(IN_DIRECTORY, name);
      const outDir = path.join(OUT_DIRECTORY, name);

      if ((await fse.stat(inDir)).isFile()) return;
      if (IN_DIRECTORY_BLACKLIST.some(reg => reg.test(name))) return;
      // Copy all directories - means images etc. get copied

      // if inDir = /, outDir = /out, don't copy /out to /out/out
      if (path.relative(OUT_DIRECTORY, inDir).length == 0) return;

      console.log(`Copying folder ${inDir}`);

      // If there are symlinks or junctions etc., copy the contents, not the link
      try {
        await fse.copy(inDir, outDir, { dereference: true });
      } catch(err) {
        console.log(`Error copying ${inDir} to ${path.resolve(outDir)}`);
        console.error(err);
      }
    }));
  }
}


/**
 * Generates HTML head tags for CSS resources, relative to the given file
 * @param {*} outPath path to file the links will be relative to
 * @returns HTML link tags to place in the HTML head
 */
const cssLinks = (outPath) => {
  // replace all \ with /
  return linkedResources
    .filter(el => !el.dontLink)
    .map(el => {
      const cssPath = path.join(cssDir(), el.outPath)
      // Need path.dirname for some reason
      const link = path.relative(path.dirname(outPath), cssPath).replace(/\\/g, "/");
      return `<link rel="stylesheet" href="${link}">`;
    }).join("\n");
}

/**
 * Generates HTML head elements for linked CSS resources
 * @return HTML tags to place in the head
 */
const cssLinksInline = async () => {
  const headTags = await Promise.all(linkedResources
    .filter(el => !el.dontLink)
    .map(async el => {
      if (el.onlineLink) return el.onlineLink;
      // Path is relative to this file, not directory the file was run from
      const cssPath = path.join(path.dirname(require.main.filename), el.path);
      const contents = await fse.readFile(cssPath, { encoding: "utf8" });
      return `<style>\n${contents}\n</style>`;
    }));
  
  return headTags.join("\n");
}

/**
 * Given HTML content, title etc., returns a full HTML document. Basically just adds some basic meta tags, wraps content in a <body>
 * @param {*} title title of the document
 * @param {*} content HTML content
 * @param {*} headers additional headers to add
 * @param {*} bodyClasses string of classes to add the to HTML body
 * @returns HTML string
 */
const renderHtml = (title, content, headers, bodyClasses = "") => {
  const html = `
    <!DOCTYPE html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
      <title>${title}</title>
      ${typeof headers == "string"? headers: ""}
    </head>
    <body${typeof bodyClasses == "string" && bodyClasses.trim().length? " class=\"" + bodyClasses + "\"" : ""}>
      ${content}
    </body>
  `;

  return pretty(html, { ocd: false }); // newlines in code blocks get removed with ocd: true
}

/**
 * Renders markdown path at the given path to an HTML file, wrapping the content in an `<main>` tag
 * @param {string} inPath path to markdown
 * @param {string} outPath path to html
 * @param {string|undefined} title HTML title. If undefined, attempts to extract title from first line of file (H1). If this fails uses the filename
 * @param {boolean} inlineCss if true, CSS will be inline or links to online content. Otherwise, it will links reltaive to the current file
 * @param {boolean} forceToC if true, will always have a ToC even if not present in markdown file
 * @param {string|undefined} bodyClasses additional body classes to add; space-separated string
 * @param {string|undefined} contentBelowTitle additional markdown to put below the title
 * @returns 
 */
const renderMarkdownFileToHtml = async (inPath, outPath, title = undefined, inlineCss = false, forceToC = true, bodyClasses = "", contentBelowTitle = "") => {
  const fileContents = await fse.readFile(inPath, { encoding: "utf8" });
  const renderedMarkdown = renderMarkdown(fileContents, forceToC, contentBelowTitle);

  if (title == undefined) title = extractTitleText(fileContents.split("\n")[0]);
  if (title == undefined) title = path.basename(filePath, ".md");
  return fse.writeFile(
    outPath,
    renderHtml(title, `
      <main>
        ${renderedMarkdown}
      </main>`,
      inlineCss? await cssLinksInline(): cssLinks(outPath),
      bodyClasses
    )
  );
}

/**
 * Encodes link. Replaces backslashes with slashes
 * @param {*} link 
 * @returns 
 */
const encodeLink = link => encodeURI(link.replace(/\\/g, "/"));
class Node {
  constructor() {
    this.name = "";
    this.link = null// full link to file (if being run on a http server)
    this.markdownPath = null;
    this.htmlPath = null;
    this.children = null;
    this.description = "";
    this.breadcrumbs = null;
  }

  isLeaf() {
    return !Array.isArray(this.children);
  }

  /**
   * 
   * @returns true if leaf node or all children are leaf nodes
   */
  allChildrenLeafNodes() {
    return this.isLeaf() || this.children.every(child => child.isLeaf());
  }

  /**
   * Adds children to the node
   * @param  {...any} children nodes to add
   */
  addChildren(...children) {
    if (this.isLeaf()) this.children = [];
    this.children.push(...children);
  }

  /**
   * Generate markdown for index pages
   * @param {*} relativeTo links should be relative to this directory
   * @param {*} depth 
   * @returns markdown for the index page
   */
  generateIndexMarkdown(relativeTo = "/", depth = 1, prettyLinks = false) {
    // If `./` is used here, it becomes just `.`
    let relativeLink = path.join("/", path.relative(relativeTo, this.link));

    if (prettyLinks) {
      if (this.isLeaf()) {
        relativeLink = path.join(path.dirname(relativeLink), path.basename(relativeLink, ".html"));
      } else {
        relativeLink = path.dirname(relativeLink);
      }
    }

    // Dot makes it relative
    relativeLink = "." + encodeLink(relativeLink);

    if (this.isLeaf()) {
      return `[${this.name}](${relativeLink})`;
    }

    let md = `${"#".repeat(Math.min(6, depth))} [${this.name}](${relativeLink})`;
    if (this.description) md += "\n\n" + this.description;

    md += "\n\n";
    md += this.children.map(child => child.generateIndexMarkdown(relativeTo, depth + 1, prettyLinks)).join("\n\n");
    return md;
  }

  /**
   * Sort nodes by their link. Leaf nodes sort before non-leaf nodes
   * @returns this 
   */
  sort() {
    if (this.isLeaf()) return;
    this.children.sort((a, b) => {
      if (a.isLeaf() ^ b.isLeaf()) {
        // If one is file and another is directory, file first
        return a.isLeaf() ? -1 : 1;
      }

      return a.link < b.link ? -1 : 1;
    });

    this.children.forEach(child => child.sort());
    return this;
  }


  /**
   * Does a DFS search on the tree, calling the callback on self first and then its children
   * @param {function(Node): void} callback callback function
   * @param {boolean} noLeaves if true, callback is not called on leaf nodes
   */
  dfs(callback, noLeaves = false) {
    callback(this);
    if (this.isLeaf()) return;
    this.children.forEach(child => {
      if (!(noLeaves && child.isLeaf())) {
        child.dfs(callback, noLeaves);
      }
    });
  }

  /**
   * Generates breadcrumbs for node and all children
   * @param {boolean} prettyLinks
   */
  generateBreadcrumbs(prettyLinks = false) {
    this.breadcrumbs = [];
    this.dfs(node => {
      if (!Array.isArray(node.breadcrumbs)) node.breadcrumbs = [];

      if (!node.isLeaf()) node.children.forEach(child => {
        if (!Array.isArray(child.breadcrumbs)) child.breadcrumbs = [];
        // Every link but the link to itself can be used by the child.
        // Since the link to self is added after this loop, all parent breadcrumbs
        // can be added to the child after slightly modifying the link
        child.breadcrumbs.push(...node.breadcrumbs.map(breadcrumb => ({
            // Make shallow copy of breadcrumb
            ...breadcrumb,
            // link: "!" + breadcrumb.link
            link: child.isLeaf()?
                    // No idea why I need to special case leaf nodes but without
                    // it it gets twice the number of `../`'s it needs
                    breadcrumb.link:
                    breadcrumb.link.replace(/^\.\//, "./../")
                    // ./index.html => ./../index.html
          })
        ));

        // Need dirname as relative path from a/b/c.html to a/b/index.html should be ./index.html
        let linkFromSelfToChild = path.relative(path.dirname(child.link), node.link);
        // Dirname to get rid of the .html
        if (prettyLinks) linkFromSelfToChild = path.dirname(linkFromSelfToChild);

        child.breadcrumbs.push({
          name: node.name,
          link: "./" + encodeLink(linkFromSelfToChild)
        });
      });

      // Link to itself is a bit special since if it's a content page the link is
      // in the form ./filename
      let linkFromSelfToSelf = "";
      
      if (node.isLeaf()) {
        linkFromSelfToSelf = path.basename(
          node.link,
          prettyLinks? ".html": ""
        );
      } else if (!prettyLinks) {
        linkFromSelfToSelf = "index.html";
      }
      
      node.breadcrumbs.push({
        name: node.name,
        link: "./" + encodeLink(linkFromSelfToSelf)
      });
    });
  }

  /**
   * Converts the breadcrumbs for the node into an HTML list with class 'breadcrumbs'
   * @returns HTML for breadcrumbs
   */
  breadcrumbsToHtml() {
    if (!Array.isArray(this.breadcrumbs) || this.breadcrumbs.length == 0) return "";
    const breadcrumbsString = this.breadcrumbs.map(crumb => `
      <li>
        <a href="${crumb.link}">
          ${crumb.name}
        </a>
      </li>
    `).join("\n");

    // pretty required as indented lines are parsed as code blocks
    return pretty(`
      <ul class="breadcrumbs highlight-last-element" aria-label="breadcrumbs">
        ${breadcrumbsString}
      </ul>`,
      { ocd: false }
    );
  }
}

class IndexNode extends Node {
  constructor(name, folderPath, relativeTo) {
    super();
    this.name = name;
    this.markdownPath = path.join(folderPath, "index.md");
    this.htmlPath = path.join(folderPath, "index.html");
    this.link = path.join("/", path.relative(relativeTo, this.htmlPath));
    this.children = [];
  }

  /**
   * 
   * @param {*} pages array of paths to pages
   * @param {*} rootName 
   * @param {string} outDirectory links to pages are relative to this
   */
  static arrayToTree(pages, outDirectory, rootName = "") {
    const tree = new IndexNode(rootName, outDirectory, outDirectory);
    pages.forEach(markdownPath => {
      const pageNode = new LeafNode(markdownPath, outDirectory);

      const fragments = []; // Split path into folders (and file name)
      let link = pageNode.link;
      let prevLen = -1;
      while (link.length != prevLen) {
        // Pop the deepest directory (or filename) from the link
        prevLen = link.length;
        fragments.push(path.basename(link));
        link = path.dirname(link);
      }

      fragments.reverse(); // Deepest directory is first, so reverse it

      // Go through tree to find to place node in the tree,
      // creating parent/directory as necessary
      let node = tree;
      let folderPath = outDirectory;

    // BFS search to go down the tree to find the right index node (or make it)
      // First element will be `.` or something, so ignore that - the root
      // Last element is the file name so ignore that too
      fragments.slice(1, -1).forEach(fragment => {
        // Find a node where the relative path from the searchNode to pageNode
        // (the node we are trying to place in the tree) does not start with ../:
        // this means there is no backtracking and hence the searchNode is a parent
        // directory of the pageNode
        // Use dirname as index pages have .index.html, and filter out leaf nodes
        // since they can't have children
        const index = node.children.findIndex(searchNode => 
          !searchNode.isLeaf() &&
          !path.relative(
                path.dirname(searchNode.link),
                path.dirname(pageNode.link)
            ).match(/^\.\./)
        );
        
        // Keep track of the path to the folder in case we need to make an index node
        folderPath = path.join(folderPath, fragment);

        if (index == -1) {
          // Make the directory node if it doesn't exist
          const childNode = new IndexNode(fragment, folderPath, outDirectory);
          node.addChildren(childNode);
          node = childNode;
        } else {
          node = node.children[index];
        }
      });

      node.addChildren(pageNode);
    });
    return tree;
  }

  /**
   * Generates information about leaf node neighbours. Children must be sorted.
   * Does a DFS walkthrough of the tree, adding previous/next neighbour information
   * if both the elements are leaf nodes
   */
  generateLeafNeighbourInformation() {
    for(let i = 0; i < this.children.length; i++) {
      const prev = i != 0 && this.children[i - 1].isLeaf()? this.children[i - 1]: null;
      const curr =           this.children[i    ].isLeaf()? this.children[i    ]: null;
      const next = i + 1 < this.children.length && 
                             this.children[i + 1].isLeaf()? this.children[i + 1]: null;
      if (!curr) {
        // index node: go down the tree
        this.children[i].generateLeafNeighbourInformation();
        continue;
      }

      if (prev) {
        let relativeLink = path.relative(path.dirname(curr.link), prev.link);
        if (PRETTY_LINKS) relativeLink = relativeLink.replace(/\.html$/, "");
        curr.neighbours.previous = {
          name: prev.name,
          link: "./" + encodeLink(relativeLink)
        };
      }

      if (next) {
        let relativeLink = path.relative(path.dirname(curr.link), next.link);
        if (PRETTY_LINKS) relativeLink = relativeLink.replace(/\.html$/, "");
        curr.neighbours.next = {
          name: next.name,
          link: "./" + encodeLink(relativeLink)
        };
      }
    }
  }
}

class LeafNode extends Node {
  /**
   * 
   * @param {*} markdownPath path to markdown file
   * @param {*} relativeTo files will be served relative to this domain
   */
  constructor(markdownPath, relativeTo) {
    super();
    this.name = path.basename(markdownPath, ".md");
    this.markdownPath = markdownPath;
    this.htmlPath = path.join(path.dirname(markdownPath), path.basename(markdownPath, ".md") + ".html");
    // Link is absolute link to the output file when being served. Has the extension
    this.link = path.join("/", path.relative(relativeTo, this.htmlPath));

    this.neighbours = {
      previous: null,
      next: null
    };
  }

  /**
   * Converts the neighbouring links for the node into an HTML list with classes 'breadcrumbs neighbour-links'
   * The list items have class 'prev-page reversed-angle' and 'next-page' respectively
   * @returns HTML
   */
  neighbourLinksToHtml() {
    let listItems = "";
    if (this.neighbours.previous) listItems += `
      <li class="prev-page reversed-angle" aria-label="previous page">
        <a href="${this.neighbours.previous.link}">
          ${this.neighbours.previous.name}
        </a>
      </li>
    `;

    if (this.neighbours.next) listItems += `
      <li class="next-page">
        <a href="${this.neighbours.next.link}" aria-label="next page">
          ${this.neighbours.next.name}
        </a>
      </li>
    `;

    // pretty required as indented lines are parsed as code blocks
    return pretty(`
      <ul class="breadcrumbs neighbour-links">
        ${listItems}
      </ul>`,
      { ocd: false }
    );
  }
}

// https://stackoverflow.com/a/60193465
// May fail on empty files
const getFirstLine = async (pathToFile) => {
  const readable = fs.createReadStream(pathToFile);
  const reader = readline.createInterface({ input: readable });
  const line = await new Promise((resolve) => {
    reader.on('line', (line) => {
      reader.close();
      resolve(line);
    });
  });
  readable.close();
  return line;
}


/**
 * Renders all index and content markdown files in the output directory to HTML
 * @param {*} prettyLinks 
 * @returns 
 */
const renderAllFiles = async (prettyLinks = false) => {
  const pagePaths = await recursiveReaddir(OUT_DIRECTORY, [
    // Ignore non-markdown files
    filePath => fse.statSync(filePath).isFile() && !/\.md$/.test(path.basename(filePath)),

    // Ignore directories in blacklist
    filePath => IN_DIRECTORY_BLACKLIST.some(reg => reg.test(path.relative(OUT_DIRECTORY, filePath))),
   
    // Ignore index.md
    filePath => /index\.md$/.test(path.basename(filePath))
  ]);

  // Convert list to tree structure
  const tree = IndexNode.arrayToTree(pagePaths, OUT_DIRECTORY, ROOT_TITLE);
  tree.description = ROOT_DESCRIPTION;

  tree.sort();

  // Appends semester the course was taken to the page title e.g. DATA301 => DATA301 (2021-S1)
  const semesterInfo = readSemesterInfo();
  tree.dfs(node => {
    Object.keys(semesterInfo).forEach(semester => {
      const course = semesterInfo[semester].find(el => node.name == el.name);
      if (course) {
        node.name = `${course.name} (${semester})`;
        if (course.description) {
          node.description = course.description;
        }
      }
    });
  }, true);

  
  const readTitlePromises = [];
  tree.dfs(node => {
    if (!node.isLeaf()) return;
    readTitlePromises.push((async () => {
      const line = await getFirstLine(node.markdownPath);
      const title = extractTitleText(line);
      if (title) node.name = title;
    })());
  });

  await Promise.all(readTitlePromises);

  tree.generateBreadcrumbs(prettyLinks);
  tree.generateLeafNeighbourInformation();
  
  // await fse.writeFile("./test.json", JSON.stringify(tree, null, 2));
  // return tree.generateIndexMarkdown(OUT_DIRECTORY, 1, true);

  const renderLogic = async node => {
    let forceToC = true;
    let bodyClasses = "";
    let extraContentBelowTitle = node.breadcrumbsToHtml();

    if (!node.isLeaf()) {
      // Don't want headings to look like links in index pages
      bodyClasses = "unstyled-header-links";
      forceToC = !node.allChildrenLeafNodes();
      await fse.writeFile(
          node.markdownPath,
          node.generateIndexMarkdown(path.dirname(node.link), 1, prettyLinks)
      );
    } else {
      extraContentBelowTitle += node.neighbourLinksToHtml();
      console.log(`Rendering page ${node.markdownPath}`);
    }

    await renderMarkdownFileToHtml(node.markdownPath, node.htmlPath, node.name, false, forceToC, bodyClasses, extraContentBelowTitle);
  }

  if (RENDER_IN_SERIES) {
    const nodes = [];
    tree.dfs(node => nodes.push(node));
    for (const node of nodes) {
      await renderLogic(node);
    }
  } else {
    const promises = [];
    tree.dfs(node => promises.push(renderLogic(node)));
    return Promise.all(promises);
  }
}


/**
 * Renders a single markdown file; no breadcrumbs, links to other files etc.
 * @param {string} filePath path to file
 * @param {string|undefined} outPath. If undefined, uses same path as filePath but with a .html extension
 * @param {boolean} addToC if a table of contents should be added to the file
 */
const renderASingleFile = async (filePath, outPath = undefined, addToC = false) => {
  if (outPath == undefined) {
    outPath = path.join(
        path.dirname(filePath),
        path.basename(filePath, ".md") + ".html"
    );
  }
  console.log(`Rendering to ${outPath}`);
  renderMarkdownFileToHtml(filePath, outPath, undefined, true, addToC);
}

/**
 * Creates and renders the 404 page
 * @param {*} outDirectory directory to place the markdown and html files
 * @param {*} prettyLinks if true, links will not have 'index.html'
 */
const render404Page = async (outDirectory, prettyLinks) => {
  const mdPath = path.join(outDirectory, "404.md");
  const outPath = path.join(outDirectory, "404.html");

  await fse.writeFile(mdPath, `
      # 404 Not Found

      Go back to [COSC Notes](${prettyLinks? "./": "./index.html"}) or [Home](${prettyLinks? "/": "/index.html"})
    `
  );
  await renderMarkdownFileToHtml(mdPath, outPath, "404 Not Found", false, false);
}


(async () => {
  if (RENDER_SINGLE_FILE) {
    await renderASingleFile(RENDER_SINGLE_FILE, RENDER_SINGLE_FILE_OUT, RENDER_SINGLE_FILE_TOC);
    return;
  }

  if (NUKE_OUT_DIRECTORY && (COPY_DIRECTORIES || COPY_LINKED_RESOURCES)) try {
    console.log(`Nuking ${OUT_DIRECTORY}`)
    await fse.remove(OUT_DIRECTORY);
  } catch(err) {
    console.error(`Could not delete out ${OUT_DIRECTORY}`);
    console.error(err);
    process.exit();
  }

  if (COPY_DIRECTORIES) await copyInputDirectories();
  if (COPY_LINKED_RESOURCES) await copyLinkedResources();
  if (RENDER_ALL_FILES) {
    await render404Page(OUT_DIRECTORY, PRETTY_LINKS);
    await renderAllFiles(PRETTY_LINKS);
  }
})();

