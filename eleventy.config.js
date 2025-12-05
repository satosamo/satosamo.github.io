// eleventy.config.js (ESM)

import markdownIt from "markdown-it";
import markdownItDeflist from "markdown-it-deflist";
import mk from "@vscode/markdown-it-katex";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";

import configureContainers from "./plugins/markdown-containers.js";

export default function(eleventyConfig) {
  // Pass through static files
  eleventyConfig.addPassthroughCopy("index.html");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("resources");
  eleventyConfig.addPassthroughCopy("scripts");

  eleventyConfig.addPlugin(syntaxHighlight);

  const md = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
  })
    .use(markdownItDeflist)
    .use(mk.default);

  configureContainers(md);

  eleventyConfig.setLibrary("md", md);

  // Process files from the 'articles' directory
  return {
    dir: {
      input: ".",
      output: "_site", // Final site build location
      includes: "_includes",
    },
  };
}