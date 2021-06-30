
const hljs = require("highlight.js");
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

md.use(require("markdown-it-anchor"));
md.use(require("markdown-it-toc-done-right"));

md.use(require("markdown-it-texmath"), {
  engine: require("katex"),
  delimiters: "dollars"
});


const fs = require("fs");

// let contents = fs.readFileSync("./SENG365/SENG365 Exam Notes.md", { encoding: "utf8"});

let contents = fs.readFileSync("./COSC261/2. Regular Expressions.md", { encoding: "utf8"});


// Add [toc] if not already present
const lines = contents.split("\n");
if (
    lines.length > 3 &&
    lines[0].match(/^# .+/) &&
    lines[1].trim().length == 0 &&
    !lines[2].match(/^\[toc\]$/)
) {
  contents = lines[0] + "\n[toc]\n" + lines.slice(3).join("\n");
}


fs.writeFileSync("./out.html", `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css">
  <link rel="stylesheet" href="./monokai-light.css">
  <link rel="stylesheet" href="./main.css">
  <title>test</title>
</head>
<body>
  <div>
    ${md.render(contents)}
  </div>
</body>
`);