const markdownIt = require("markdown-it");
const markdownItDeflist = require("markdown-it-deflist");
const mk = require("@vscode/markdown-it-katex").default;
const container = require("markdown-it-container");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");


const callout = (name, title) => [
  container,
  name,
  {
    render: (tokens, idx) => {
      const token = tokens[idx];
      if (token.nesting === 1) {
        return `<div class="markdown-alert markdown-alert-${name}">
  <p class="markdown-alert-title">${title}</p>\n`;
      } else {
        return `</div>\n`;
      }
    },
  },
];

function calloutPlugin(md, name, defaultTitle) {
  md.use(container, name, {
    render: (tokens, idx) => {
      const token = tokens[idx];

      if (token.nesting === 1) {
        // extract custom title (everything after the name)
        const info = token.info.trim().slice(name.length).trim();
        const title = info || defaultTitle;

        return `<div class="markdown-alert markdown-alert-${name}">
  <p class="markdown-alert-title">${md.utils.escapeHtml(title)}</p>\n`;
      } else {
        return `</div>\n`;
      }
    }
  });
}

module.exports = function(eleventyConfig) {
  // Pass through static files
  eleventyConfig.addPassthroughCopy("index.html");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("resources");
  eleventyConfig.addPassthroughCopy("scripts");

  eleventyConfig.addPlugin(syntaxHighlight);

  let md = markdownIt({
  html: true,
  breaks: true,
  linkify: true
  })
  .use(markdownItDeflist)
  .use(mk)
  .use(...callout("note", "Note"))
  .use(...callout("tip", "Tip"))
  .use(...callout("warning", "Warning"))
  .use(...callout("important", "Important"))
  .use(...callout("caution", "Caution"));

  calloutPlugin(md, "note", "Note");
  calloutPlugin(md, "tip", "Tip");
  calloutPlugin(md, "warning", "Warning");
  calloutPlugin(md, "important", "Important");
  calloutPlugin(md, "caution", "Caution");

  eleventyConfig.setLibrary("md", md);

  // Process files from the 'articles' directory
  return {
    dir: {
      input: ".",
      output: "_site", // Final site build location
      includes: "_includes"
    }
  };
};