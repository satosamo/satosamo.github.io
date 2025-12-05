// plugins/markdown-containers.js

import container from "markdown-it-container";

// 1. Define Custom Blocks
const customBlocks = [
  { name: "note", title: "Note" },
  { name: "tip", title: "Tip" },
  { name: "warning", title: "Warning" },
  { name: "important", title: "Important" },
  { name: "caution", title: "Caution" },
  { name: "math", title: "Definition" },
  { name: "concept", title: "Concept" },
  { name: "idea", title: "Core Idea" },
];

// 2. Configure Containers
export default function configureContainers(md) {
  customBlocks.forEach((block) => {
    md.use(container, block.name, {
      render: function (tokens, idx) {
        const token = tokens[idx];
        if (token.nesting === 1) {
          const rawInfo = token.info.trim().slice(block.name.length).trim();

          let displayTitle = "";

          if (!rawInfo) {
            displayTitle = block.title;
          } else if (rawInfo.startsWith("_")) {
            const customText = rawInfo.slice(1).trim();
            displayTitle = `${block.title}: ${customText}`;
          } else {
            displayTitle = rawInfo;
          }

          return `<div class="callout callout-${block.name}">
                    <p class="callout-title">${md.utils.escapeHtml(displayTitle)}</p>\n`;
        } else {
          return `</div>\n`;
        }
      },
    });
  });
}
