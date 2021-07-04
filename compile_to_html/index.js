const renderMarkdown = require("./render-markdown").default;
const fse = require("fs-extra");
const path = require("path");
const recursiveReaddir = require("recursive-readdir");


// Directories in given directory will be copied to output directory and markdown files rendered
const inDirectory = "./../";
const outDirectory = "./out";

// Blacklist. For copying directories, just the name of the file/folder. For rendering, uses path relative to out directory
const inDirectoryBlackList = [
  /^\./,              // e.g. .git
  /^node_modules/, 
  /index\.md$/,       // index is auto-generated
  /^compile_to_html/  // folder this html gen stuff is in
];
const semesterInfo = require("./semester.json");

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
const cssDir = () => path.join(outDirectory, "css");

const copyLinkedResources = () => {
  linkedResources.forEach(el => {
    let relativeInPath = el;
    let relativeOutPath = el;
    if (typeof el == "object") {
      relativeInPath = el.path;
      relativeOutPath = el.outPath;
    }

    const inPath = path.join(path.dirname(require.main.filename), relativeInPath);
    const outPath = path.join(cssDir(), relativeOutPath);
    fse.ensureDirSync(path.dirname(outPath));
    fse.copySync(inPath, outPath);
  });
}


// CSS links, relative to given file
const cssLinks = (outPath) => {
  // replace all \ with /
  return linkedResources
      .filter(el => typeof el == "string" || !el.dontLink)
      .map(el => typeof el == "string"? el: el.outPath)
      .map(relativePath => {
        const cssPath = path.join(cssDir(), relativePath);
        // Need path.dirname for some reason
        const link = path.relative(path.dirname(outPath), cssPath).replace(/\\/g, "/");
        return `<link rel="stylesheet" href="${link}">`;
      }).join("\n");
}


const render = (inPath, outPath, title, forceToC = true, bodyClasses = "", contentBelowTitle = "") => {
  fse.writeFileSync(outPath, `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    ${cssLinks(outPath)}
    <title>${title}</title>
  </head>
  <body${bodyClasses? " class=\"" + bodyClasses + "\"": ""}>
    <article>
      ${renderMarkdown(fse.readFileSync(inPath, { encoding: "utf8"}), forceToC, contentBelowTitle)}
    </article>
  </body>
  `);
}


const encodeLink = link => encodeURI(link.replace(/\\/g, "/"));
class Node {
  constructor(name, link, children = null) {
    this.name = name;
    this.link = link;
    this.children = children;
    this.description = "";
  }

  isLeaf() {
    return !Array.isArray(this.children);
  }

  /**
   * 
   * @returns true if leaf node or all children are leaf nodes
   */
  allChildrenLeafNodes() {
    return this.isLeaf() || this.children.every(child => child.allChildrenLeafNodes());
  }

  addChildren(...children) {
    if (this.isLeaf()) this.children = [];
    this.children.push(...children);
  }

  /**
   * 
   * @param {*} relativeTo links should be relative to this 
   * @param {*} depth 
   * @returns 
   */
  generateMarkdown(relativeTo = "/", depth = 1, linksContainExtension = true) {
    let relativeLink = path.relative(relativeTo, this.link);

    if (this.isLeaf() && !linksContainExtension) {
      relativeLink = path.join(path.dirname(relativeLink) + path.basename(relativeLink, ".html"));
    }
    
    if (!this.isLeaf() && linksContainExtension) {
      relativeLink = path.join(relativeLink, "./index.html");
    }
    
    relativeLink = "./" + encodeLink(relativeLink); // If windows, replace backslashes

    if (this.isLeaf()) {
      return `[${this.name}](${relativeLink})`;
    }
    
    let md = `${"#".repeat(Math.min(6, depth))} [${this.name}](${relativeLink})`;
    if (this.description) md += "\n\n" + this.description;
    if (depth < 2 && Array.isArray(this.breadcrumbs) && this.breadcrumbs.length) {
      md += "\n\n" + this.breadcrumbsToMarkdown();
    }
    md += `\n\n${this.children.map(child => child.generateMarkdown(relativeTo, depth + 1)).join("\n\n")}`;
    return md;
  }

  /**
   * 
   * @param {*} pages array of links to pages
   * @param {*} rootName 
   */
  static arrayToTree(pages, rootName = "", rootPath = "/") {
    const tree = new Node(rootName, rootPath, []);
    pages.forEach(link => {
      const fragments = link.split("/");
      let node = tree;
      let folderLink = "/";

      // BFS search
      fragments.slice(1, -1).forEach(fragment => {
        // Find node where relative link does not start with ../
        const index = node.children.findIndex(node=> !path.relative(node.link, link).match(/^\.\./))

        folderLink = path.join(folderLink, fragment);
        
        if (index == -1) {
          const childNode = new Node(fragment, folderLink);
          node.addChildren(childNode);
          node = childNode;
        } else {
          node = node.children[index];
        }
      });

      const name = fragments.pop().replace(/\.html$/, "");
      node.addChildren(new Node(name, link));
    });

    return tree;
  }


  /**
   * Sort nodes by their name. Leaf nodes sort before non-leaf nodes
   * @returns this 
   */
  sort() {
    if (this.isLeaf()) return;
    this.children.sort((a, b) => {
      if (a.isLeaf() ^ b.isLeaf()) {
        // If one is file and another is directory, file first
        return a.isLeaf()? 1: -1;
      }

      return a.name < b.name? -1: 1;
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
    if(this.isLeaf()) return;
    this.children.forEach(child => {
      if (!(noLeaves && child.isLeaf())) {
        child.dfs(callback, noLeaves);
      }
    });
  }

  generateBreadcrumbs(prettyLinks = false) {
    this.breadcrumbs = [];
    this.dfs(node => {
      if (!node.isLeaf()) {
        node.children.forEach(child => {
          if (!Array.isArray(child.breadcrumbs)) child.breadcrumbs = [];
          child.breadcrumbs.push(...node.breadcrumbs);
          child.breadcrumbs.push({
            name: node.name,
            link: "./" + encodeLink(path.join(
              path.relative(child.link, node.link),
              prettyLinks? "": "./index.html"
            ))
          });
        });
      }
    });
  }

  breadcrumbsToMarkdown() {
    return `<span class="breadcrumbs">${
      this.breadcrumbs.map(crumb => `[${crumb.name}](${crumb.link})`).join("\n")
    }</span>`
  }
}


const copyInputDirectories = () => {
  // Don't copy if the files are the same length
  if (path.relative(inDirectory, outDirectory).length != 0) {
    fse.ensureDirSync(inDirectory);
    fse.ensureDirSync(outDirectory);
    fse.readdirSync(inDirectory).forEach(name => {
      const inDir = path.join(inDirectory, name);
      const outDir = path.join(outDirectory, name);

      if (fse.statSync(inDir).isFile()) return;
      if (inDirectoryBlackList.some(reg => reg.test(name))) return;
      // Copy all directories - means images etc. get copied

      // if inDir = /, outDir = /out, don't copy /out to /out/out
      if (path.relative(outDirectory, inDir).length == 0) return;
      console.log(`Copying ${name}`);
      fse.copySync(inDir, outDir);
    });
  }
}

const renderAllFiles = () => {
  recursiveReaddir(outDirectory, [filePath => {
    // Ignore directories in blacklist and non-markdown files
    return (fse.statSync(filePath).isFile() && !/\.md$/.test(path.basename(filePath))) ||
           inDirectoryBlackList.some(reg => reg.test(path.relative(outDirectory, filePath)));
  }], function (err, files) {
    if (err) {
      console.error("Error recursively reading output directory");
      console.error(err);
      process.exit(2);
    }

    const renderedPages = [];

    files.forEach(filePath => {
      console.log(`Rendering ${filePath}`);
      const title = path.basename(filePath, ".md");
      const outPath = path.join(path.dirname(filePath), title + ".html");
      render(filePath, outPath, title);
      renderedPages.push("/" + path.relative(outDirectory, outPath).replace(/\\/g, "/"));
    });

    renderIndexFiles(renderedPages);
  });
}

/**
 * 
 * @param {string[]} renderedPages
 */
const renderIndexFiles = (renderedPages, linksContainExtension = true) => {
  // Convert list to tree structure
  const tree = Node.arrayToTree(renderedPages, "COSC Notes");
  
  tree.description = "Notes from the courses I have taken at UC.";

  tree.sort();

  // Appends semester the course was taken e.g. DATA301 => DATA301 (2021-S1)
  tree.dfs(node => {
    Object.keys(semesterInfo).forEach(key => {
      if (semesterInfo[key].find(el => node.name == el)) {
        node.name = `${node.name} (${key})`;
        return;
      }
    });
  }, true);

  tree.generateBreadcrumbs();
  fse.writeFileSync("./test.json", JSON.stringify(tree, null, 2));

  const renderIndex = node => {
    // Only enable ToC if there are any sub-folders
    const enableToC = !node.allChildrenLeafNodes();
    const inPath = path.join(outDirectory, node.link, "index.md");
    const outPath = path.join(outDirectory, node.link, "index.html");
    console.log(`Rendering index for folder ${node.link}`);
    fse.writeFileSync(inPath, node.generateMarkdown(node.link, 1, linksContainExtension));
    render(inPath, outPath, node.name, enableToC, "unstyled-header-links");
  }

  tree.dfs(renderIndex, true);
}

const input = require("./in.json");
renderIndexFiles(input);

// copyInputDirectories();
// copyLinkedResources();
// renderAllFiles();