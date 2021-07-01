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

contents = `# H1

## H2 first H2

![test image](https://via.placeholder.com/1000x500)

![test image](https://via.placeholder.com/800x2000)

> Working software is the primary measure of progress
>
> *Agile Manifesto, 7th Principle*
> 
> > Another blockquote
> > Recursion

|   While designing   |      Prepare      |
|---------------------|-------------------|
|     Requirements    | Acceptance tests  |
| System requirements |    System tests   |
|    Global design    | Integration tests |
|   Detailed design   |    Unit tests     |
|        UI           |     ~~Scream~~    |


\`\`\`js
const lines = contents.split("\n");
if (
    lines.length > 3 &&
    lines[0].match(/^# .+/) &&
    lines[1].trim().length == 0 &&
    !lines[2].match(/^\[toc\]$/)
) {
  contents = lines[0] + "\n[toc]\n" + lines.slice(3).join("\n");
}
\`\`\`

**bold** and then *italics* then ***both***

\`inline code block\`

### H3

adsfasdf

## H2-2

### H3-2

asdf

#### H4-1

adsf

##### Line Breaks

Apparently two spaces at end is a line break.  
There should be a line break

##### HRs

Line 1

***

Three asterisks 

##### Links

[google](https://google.com "title")

##### Footnotes

- Using GDELT's GCAM[^y] columns, create a list of all dimensions encountered. This is necessary as the data needs to be put in a dense matrix/dataframe
- As there are ~2000 of them, many of which are not relevant to the research question (e.g. \`FISHERIES\` from 'Lexicoder Topic Dictionaries' doesn't indicate the tone of the article), this needed to be pruned. One dictionary, WordNet Affect 1.1 is used. This alone has over 200 dimensions that measure sentiment, and so this was deemed sufficient

[^y]: One interesting note is that of the 40 or so dictionaries found in the [GCAM MASTER CODEBOOK](http://data.gdeltproject.org/documentation/GCAM-MASTER-CODEBOOK.TXT), The 'Central Bank Financial Stability Report Sentiment' dictionary has an ID of \`40\` but each dimension has a value of \`c41.x\` - this made for an interesting debugging session.

##### Reference-style link

[This is a link][1]

[1]: google.com
`;


// Add [toc] if not already present
const lines = contents.split("\n");
if (
    lines.length > 3 &&
    lines[0].match(/^# .+/) &&
    lines[1].trim().length == 0 &&
    !lines[2].match(/^\[toc\]$/)
) {
  contents = lines[0] + "\n[toc]\n" + lines.slice(2).join("\n");
}


fs.writeFileSync("./out.html", `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css">
  <link rel="stylesheet" href="./monokai-light.css">
  <link rel="stylesheet" href="./main.css">
  <title>test</title>
</head>
<body>
  <article>
    ${md.render(contents)}
  </article>
</body>
`);