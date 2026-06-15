// Applies to every markdown file under content/:
// article layout, clean URLs mirroring folders, last-modified from git.
module.exports = {
  layout: "layouts/article.njk",
  date: "git Last Modified",
  eleventyComputed: {
    permalink: (data) => {
      const stem = data.page.filePathStem.replace(/^\/content\//, "");
      return `/${stem}/index.html`;
    },
  },
};
