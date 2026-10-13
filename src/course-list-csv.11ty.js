const { toCsv } = require("../courses.js");

module.exports = class {
  data() {
    return { permalink: "/other/course-list.csv", eleventyExcludeFromCollections: true };
  }
  render() {
    return toCsv();
  }
};
