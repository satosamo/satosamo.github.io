// .eleventy.js
module.exports = function(eleventyConfig) {
  // Pass through static files
  eleventyConfig.addPassthroughCopy("common.js");
  eleventyConfig.addPassthroughCopy("index.html");
  eleventyConfig.addPassthroughCopy("css");
  // Tell Eleventy to process files from the 'articles' directory
  return {
    dir: {
      input: ".",
      output: "_site", // This is where the final site will be built
      includes: "_includes"
    }
  };
};