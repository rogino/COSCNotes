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


const render = (inPath, outPath, title, forceToC = true, bodyClasses = "") => {
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
      ${renderMarkdown(fse.readFileSync(inPath, { encoding: "utf8"}), forceToC)}
    </article>
  </body>
  `);
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
  const tree = { name: "", contents: [] }; /* [{ name: name of folder or file, content: link or []}] */
  renderedPages.forEach(link => {
    const fragments = link.split("/");
    let node = tree;
    // Ignore root and file name
    fragments.slice(1, -1).forEach(fragment => {
      const index = node.contents.findIndex(el => el.name == fragment);
      node = (index == -1)? node.contents[node.contents.push({ name: fragment, contents: []}) - 1]: node.contents[index];
      if (!Array.isArray(node.contents)) console.error(`File and directory with the same name: '${link}', '${fragment}'`);
    });

    node.contents.push({ name: fragments.pop().replace(/\.html$/, ""), contents: link });
  });


  // Sort nodes alphabetically. If files and folders both present, files sorted first
  const recursiveSort = node => (Array.isArray(node.contents))?
      node.contents.sort((a, b) => {
        if (Array.isArray(a.contents) ^ Array.isArray(b.contents)) {
          // If one is file and another is directory, file first
          return Array.isArray(a.contents)? 1: -1;
        }
        return a.name < b.name? -1: 1;
      }).forEach(node => recursiveSort(node)):
      null;

  recursiveSort(tree);


  /**
   * Appends semester the course was taken e.g. DATA301 => DATA301 (2021-S1)
   * @param {*} courseCode 
   */
  const getCourseString = courseCode => {
    let outputStr = courseCode;
    Object.keys(semesterInfo).forEach(key => {
      if (semesterInfo[key].find(el => courseCode == el)) {
        outputStr += ` (${key})`;
      }
    });

    return outputStr;
  }

  tree.name = "COSC Notes";
  tree.description = "Notes from the courses I have taken at UC.";


  /**
   * non-leaf nodes don't have url info, so need to get it from a leaf node
   * This should really be part of the tree, not calculated
   */
  const findNodePath = node => {
    if (!Array.isArray(node.contents)) return node.contents;
    const childIndex = node.contents.findIndex(child => findNodePath(child) != undefined);
    if (childIndex == -1) return undefined; // tree has no children, or true of all its children
    let childPath = findNodePath(node.contents[childIndex]);
    return path.dirname(childPath); // Remove last section from path
  }

  const genMarkdown = (node, parentPath = "/", depth = 1) => {
    const isLeaf = !Array.isArray(node.contents);
    const nodePath = isLeaf? node.contents: findNodePath(node);

    // Links are relative to current parent
    let relativeLink = path.relative(parentPath, nodePath);
    if (isLeaf && !linksContainExtension) {
      relativeLink = path.dirname(relativeLink) + path.basename(relativeLink, ".html");
    }

    if (!isLeaf && linksContainExtension) {
      relativeLink = path.join(relativeLink, "./index.html");
    }
    
    relativeLink = "./" + encodeURI(relativeLink.replace(/\\/g, "/")); // If windows, replace backslashes
    if (!Array.isArray(node.contents)) {
      return `[${node.name}](${relativeLink})`;
    }


    let md = `${"#".repeat(depth)} [${getCourseString(node.name)}](${relativeLink})`;
    if (node.description) md += "\n\n" + node.description;
    md += `\n\n${node.contents.map(el => genMarkdown(el, parentPath, depth + 1)).join("\n\n")}`;
    return md;
  }

  const renderIndex = node => {
    const nodePath = findNodePath(node);
    // Only enable ToC if there are any sub-folders
    const enableToC = node.contents.some(child => Array.isArray(child.contents));
    const inPath = path.join(outDirectory, nodePath, "index.md");
    const outPath = path.join(outDirectory, nodePath, "index.html");
    console.log(`Rendering index for folder ${nodePath}`);
    fse.writeFileSync(inPath, genMarkdown(node, nodePath));
    render(inPath, outPath, node.name, enableToC, "unstyled-header-links");
  }

  const nonLeafDfs = (node, callback) => {
    callback(node);
    node.contents.forEach(child => {
      if (Array.isArray(child.contents)) {
        nonLeafDfs(child, callback);
      }
    });
  }

  nonLeafDfs(tree, renderIndex); 
}


copyInputDirectories();
copyLinkedResources();
renderAllFiles();