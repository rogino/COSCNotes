const hljs = require("highlight.js");
const anchor = require("markdown-it-anchor");
const md = require('markdown-it')({
  html:         true,        // Enable HTML tags in source
  linkify:      true,        // Autoconvert URL-like text to links

  // Enable some language-neutral replacement + quotes beautification
  // For the full list of replacements, see https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.js
  typographer:  false,

  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, {
          language: lang
        }).value;
      } catch (__) {}
    }
    return "";
  }
});


md.use(anchor, {
  permalink: anchor.permalink.headerLink()
});

md.use(require("markdown-it-toc-done-right"), {
  level: 2
});
md.use(require("markdown-it-footnote"));
md.use(require("markdown-it-texmath"), {
  engine: require("katex"),
  delimiters: "dollars"
});

const fs = require("fs");

// let contents = fs.readFileSync("./SENG365/SENG365 Exam Notes.md", { encoding: "utf8"});

let contents = fs.readFileSync("./COSC261/2. Regular Expressions.md", { encoding: "utf8"});

/**
 * Given markdown text as input, returns rendered html
 * @param {*} markdownText markdown text to render
 * @param {*} forceToC if true, file will always have a table of contents even if not present in input
 * @returns rendered markdown
 */
  const renderMarkdown = (markdownText, forceToC = true) => {
  // Add [toc] if not already present
  if (forceToC) {
    const lines = markdownText.split("\n");
    if (
        lines.length > 3 &&
        lines[0].match(/^# .+/) &&
        lines[1].trim().length == 0 &&
        !lines[2].match(/^\[toc\]$/)
    ) {
      markdownText = lines[0] + "\n[toc]\n" + lines.slice(2).join("\n");
    }
  }

  markdownText += "\n\n```javascript\n" + fs.readFileSync("./parse.js", {encoding: "utf8"}) + "\n```\n\n";

  return md.render(markdownText);
}


fs.writeFileSync("./out.html", `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css">
  <link rel="stylesheet" href="./monokai.css">
  <link rel="stylesheet" href="./main.css">
  <title>test</title>
</head>
<body>
  <article>
    ${renderMarkdown(contents)}
  </article>
</body>
`);