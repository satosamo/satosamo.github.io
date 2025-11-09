const markdownIt = require("markdown-it");
const markdownItDeflist = require("markdown-it-deflist");
const mk = require("@vscode/markdown-it-katex").default;

module.exports = function(eleventyConfig) {
  // Pass through static files
  eleventyConfig.addPassthroughCopy("index.html");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("resources");
  eleventyConfig.addPassthroughCopy("scripts");

  let md = markdownIt({
  html: true,
  breaks: true,
  linkify: true
  })
  .use(markdownItDeflist)
  .use(mk);;
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