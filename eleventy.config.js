const markdownIt = require("markdown-it");
const markdownItDeflist = require("markdown-it-deflist");
const mk = require("@vscode/markdown-it-katex").default;
const container = require("markdown-it-container");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

// 1. Define Custom Blocks
const customBlocks = [
  { name: "note", title: "Note" },
  { name: "tip", title: "Tip" },
  { name: "warning", title: "Warning" },
  { name: "important", title: "Important" },
  { name: "caution", title: "Caution" },
  // New custom blocks:
  { name: "math", title: "Definition" }, 
  { name: "concept", title: "Concept" },
  { name: "idea", title: "Core Idea" }
];

// 2. Configure Containers
function configureContainers(md) {
  customBlocks.forEach(block => {
    md.use(container, block.name, {
      render: function (tokens, idx) {
        const token = tokens[idx];
        if (token.nesting === 1) {
          // Get the text after ::: blockname
          const rawInfo = token.info.trim().slice(block.name.length).trim();
          
          let displayTitle = "";

          if (!rawInfo) {
            // OPTION 1: No custom text -> Use Default Title
            // Example: ::: idea
            // Result: "Core Idea"
            displayTitle = block.title;
          } 
          else if (rawInfo.startsWith("_")) {
            // OPTION 3: Underscore detected -> Default Title + Custom Text
            // Example: ::: concept _Potential Energy
            // Result: "Concept: Potential Energy"
            const customText = rawInfo.slice(1).trim(); // Remove the underscore
            displayTitle = `${block.title}: ${customText}`;
          } 
          else {
            // OPTION 2: Custom text present -> Full Override
            // Example: ::: idea My Special Title
            // Result: "My Special Title"
            displayTitle = rawInfo;
          }

          return `<div class="callout callout-${block.name}">
                    <p class="callout-title">${md.utils.escapeHtml(displayTitle)}</p>\n`;
        } else {
          return `</div>\n`;
        }
      }
    });
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
  .use(mk);

  configureContainers(md);

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