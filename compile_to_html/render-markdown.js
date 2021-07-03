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


// md.use(anchor, {
//   permalink: anchor.permalink.headerLink()
// });

// md.use(require("markdown-it-toc-done-right"), {
//   level: 2
// });
// md.use(require("markdown-it-footnote"));
// md.use(require("markdown-it-texmath"), {
//   engine: require("katex"),
//   delimiters: "dollars"
// });


/**
 * Given markdown text as input, returns rendered html
 * @param {*} markdownText markdown text to render
 * @param {*} forceToC if true, file will always have a table of contents even if not present in input
 * @returns rendered markdown
 */
module.exports.default = (markdownText, forceToC = true) => {
  // Add [toc] if not already present
  if (forceToC) {
    const lines = markdownText.split("\n");
    if (
        lines.length > 3 &&
        lines[0].match(/^# .+/) &&
        lines[1].trim().length == 0 &&
        !lines[2].match(/^\[toc\]$/)
    ) {
      markdownText = lines[0] + "\n[toc]\n\n" + lines.slice(2).join("\n");
    }
  }

  return md.render(markdownText);
}
