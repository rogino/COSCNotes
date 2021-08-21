const renderMarkdown = require("./render-markdown").default;
const fse = require("fs-extra");
const fs = require("fs");
const path = require("path");
const readline = require('readline');
const recursiveReaddir = require("recursive-readdir");
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
)
.version(false)
.epilogue(
`NB: on Windows, if any input directories are Junctions, developer mode needs to
be enabled. See https://stackoverflow.com/a/57725541
`)
.help().alias("help", "h").argv;

// To make args: blacklist, indentation, semester info path

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

// Blacklist. For copying directories, just the name of the file/folder. For rendering, uses path relative to out directory
const IN_DIRECTORY_BLACKLIST = [
  /^\./,              // e.g. .git
  /^node_modules/,
  /index\.md$/,       // index is auto-generated
  /^compile_to_html/  // folder this html gen stuff is in
];


const INDENTATION_STRING = "  ";

const ROOT_TITLE = "COSC Notes";
const ROOT_DESCRIPTION = "Notes from the courses I have taken at UC.";

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

// Resources (e.g. css files) that need to be copied. Input path relative to current file, output path relative to out/css
const linkedResources = ["./monokai.css", "./main.css", {
  path: "./node_modules/katex/dist/katex.min.css",
  outPath: "./katex/katex.min.css",
}, {
    path: "./node_modules/katex/dist/fonts",
    outPath: "./katex/fonts",
    dontLink: true /* Don't link in the HTML head */
  }
];

// Absolute path to css files
const cssDir = () => path.join(OUT_DIRECTORY, "css");

/**
 * Copy required CSS files etc.
 * @returns 
 */
const copyLinkedResources = () => {
  console.log("Copying linked resources");
  let promises = [];
  linkedResources.map(el => {
    let relativeInPath = el;
    let relativeOutPath = el;
    if (typeof el == "object") {
      relativeInPath = el.path;
      relativeOutPath = el.outPath;
    }

    const inPath = path.join(path.dirname(require.main.filename), relativeInPath);
    const outPath = path.join(cssDir(), relativeOutPath);

    promises.push((async () => {
      await fse.ensureDir(path.dirname(outPath));
      console.log(`Copying ${inPath}`);
      await fse.copySync(inPath, outPath);
    })());
  });

  return Promise.all(promises);
}


const copyInputDirectories = async () => {
  // Don't copy if the input and output directories are the same
  if (path.relative(IN_DIRECTORY, OUT_DIRECTORY).length != 0) {
    await fse.ensureDir(OUT_DIRECTORY);
    const names = await fse.readdir(IN_DIRECTORY);
    
    return await Promise.all(names.map(async name => {
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


// CSS links, relative to given file
const cssLinks = (outPath) => {
  // replace all \ with /
  return linkedResources
    .filter(el => typeof el == "string" || !el.dontLink)
    .map(el => typeof el == "string" ? el : el.outPath)
    .map(relativePath => {
      const cssPath = path.join(cssDir(), relativePath);
      // Need path.dirname for some reason
      const link = path.relative(path.dirname(outPath), cssPath).replace(/\\/g, "/");
      return `<link rel="stylesheet" href="${link}">`;
    }).join("\n");
}


const indentLines = (content, depth, indentationString) => {
  if (depth < 1) return content;
  return content.split(/\r?\n/).map(line => indentationString.repeat(depth) + line).join("\n");
}

const render = (title, content, headers, bodyClasses = "") => {

  let output = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`;

  if (headers.length) output += "\n" + indentLines(headers, 1, INDENTATION_STRING);

  output += `
<title>${title}</title>
</head>
<body${bodyClasses ? " class=\"" + bodyClasses + "\"" : ""}>
${indentLines(content, 1, INDENTATION_STRING)}
</body>
  `;

  return output;
}

const renderToFile = async (inPath, outPath, title, forceToC = true, bodyClasses = "", contentBelowTitle = "") => {
  return await fse.writeFile(
    outPath,
    render(title, 
`<article>
  ${renderMarkdown(await fse.readFile(inPath, { encoding: "utf8" }), forceToC, contentBelowTitle)}
</article>`,
      cssLinks(outPath),
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

  addChildren(...children) {
    if (this.isLeaf()) this.children = [];
    this.children.push(...children);
  }

  /**
   * Generate markdown for index pages
   * @param {*} relativeTo links should be relative to this directory
   * @param {*} depth 
   * @returns 
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
   * 
   * @param {*} callback 
   * @param {*} noLeaves if true, callback not called on leaf nodes
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
   * @param {*} prettyLinks 
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
            link: breadcrumb.link.replace(/^\.\//, "./../") // ./index.html => ./../index.html
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

  breadcrumbsToMarkdown(indentationString) {
    if (!Array.isArray(this.breadcrumbs) || this.breadcrumbs.length == 0) return "";
    return `
<ul class="breadcrumbs">${this.breadcrumbs
    .map(crumb => `
${indentationString}<li>
${indentationString.repeat(2)}<a href="${crumb.link}">${crumb.name}</a>
${indentationString}</li>`).join("") // TODO escape
}
</ul>`
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

      if (!line.match(/^# .+/g)) return;
      let title = line.substr(2);
      // If link, remove the link-y bits
      const match = /^\[(.+?)\]\(\)$/.exec(title);
      if (match) title = match[1];
      node.name = title;
    })());
  });

  await Promise.all(readTitlePromises);


  tree.generateBreadcrumbs(prettyLinks);

  // await fse.writeFile("./test.json", JSON.stringify(tree, null, 2));
  // return tree.generateIndexMarkdown(OUT_DIRECTORY, 1, true);

  const renderLogic = async node => {
    let forceToC = true;
    let bodyClasses = "";
    let breadcrumbs = indentLines(node.breadcrumbsToMarkdown(INDENTATION_STRING), 1, INDENTATION_STRING);

    if (!node.isLeaf()) {
      bodyClasses = "unstyled-header-links";
      forceToC = !node.allChildrenLeafNodes();
      await fse.writeFile(
          node.markdownPath,
          node.generateIndexMarkdown(path.dirname(node.link), 1, prettyLinks)
      );
    } else {
      console.log(`Rendering page ${node.markdownPath}`);
    }

    await renderToFile(node.markdownPath, node.htmlPath, node.name, forceToC, bodyClasses, breadcrumbs);
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


const render404Page = async (OUT_DIRECTORY, prettyLinks) => {
  const outPath = path.join(OUT_DIRECTORY, "404.html");
  await fse.writeFile(outPath, render(
    "404 Not Found",
    renderMarkdown(
`# 404 Not Found

Go back to [COSC Notes](${prettyLinks? "./": "./index.html"}) or [Home](${prettyLinks? "/": "/index.html"})
`,
      false
    ),
    cssLinks(outPath),
    ""
  ));
}



(async () => {
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