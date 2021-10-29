const hljs = require("highlight.js");
const anchor = require("markdown-it-anchor");
const md = require('markdown-it')({
  html:         true,        // Enable HTML tags in source
  linkify:      true,        // Autoconvert URL-like text to links

  // Enable some language-neutral replacement + quotes beautification
  // For the full list of replacements, see https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.js
  typographer:  true,
  // quotes: '“”‘’', 

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
  level: 1
});

md.use(require("markdown-it-footnote"));

md.use(require("markdown-it-texmath"), {
  engine: require("katex"),
  delimiters: "dollars"
});


/**
 * Given markdown text as input, returns rendered html
 * @param {*} markdownText markdown text to render
 * @param {*} forceToC if true, file will always have a table of contents even if not present in input
 * @param {*} contentBelowTitle content to place after the page title and before the ToC, if present
 * @param {*} wrapContentInArticle if true, wraps content (excludes title, ToC and contentBelowTitle) in an article tag
 * @returns rendered markdown
 */
module.exports.default = (markdownText, forceToC = true, contentBelowTitle = "", wrapContentInArticle = true) => {
  // Add [toc] if not already present
  if (forceToC) {
    const lines = markdownText.split("\n");
    if (
        lines.length > 3 &&
        lines[0].match(/^# .+/) &&
        lines[1].trim().length == 0 &&
        !lines[2].match(/^\[toc\]$/)
    ) {
      markdownText = lines[0] + "\n\n[toc]\n\n" + lines.slice(2).join("\n");
    }
  }

  let articleBeginLine = 2; // add <article> tag on this line
  if (contentBelowTitle && contentBelowTitle.trim().length) {
    const lines = markdownText.split("\n");
    if (
        lines.length > 2 &&
        lines[0].match(/^# .+/) &&
        lines[1].trim().length == 0
    ) {
      markdownText = lines[0] + "\n\n" + contentBelowTitle + "\n\n" + lines.slice(2).join("\n");
      articleBeginLine += contentBelowTitle.split("\n").length + 2;
    } else {
      console.warn(`Did not insert content below title`);
    }
  }

  const lines = markdownText.split("\n");
  // If it is just wrapped in <article>, the content is assumed to also be HTML and is not rendered as markdown

  // Can't contain any valid markdown or regex characters
  const ARTICLE_SECTION_TAG = "=!=!=!=!=ARTICLE-CONTENT-SIGNALLER=!=!=!=!=";
  // This identifier is added after the top content and is later replaced with a proper article tag
  if (wrapContentInArticle && lines.length >= articleBeginLine) {
    markdownText = 
        lines.slice(0, articleBeginLine).join("\n") + 
        `\n\n${ARTICLE_SECTION_TAG}\n\n` + 
        lines.slice(articleBeginLine).join("\n")
    ;
  }

  let renderedHtml = md.render(markdownText);

  // Horrible way of removing the table of contents if it is empty
  // Need to get a proper HTML parser at some point
  const removeTocIfEmptyReg = /<nav class="table-of-contents"><ol><li><a href="[^"'<>]+">[^"'<>]+<\/a><\/li><\/ol>/;
  renderedHtml = renderedHtml.replace(removeTocIfEmptyReg, "");

  if (wrapContentInArticle) {
    // yes this is horrible
    renderedHtml = renderedHtml.replace(`<p>${ARTICLE_SECTION_TAG}</p>`, "<article>") + "</article>";
  }

  return renderedHtml;
}
