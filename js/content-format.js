// Converts the simple formatting syntax used in the "Full Article"
// editor into safe HTML for the public news page.
//
// Supported syntax (typed directly, or inserted by the editor toolbar):
//   **bold**
//   *italic*
//   ### Heading
//   - bullet list item   (consecutive lines become one <ul>)
//   > quote              (consecutive lines become one <blockquote>)
//   [link text](https://example.com)
//
// All plain text is escaped first, so this never allows raw HTML/script
// injection — only the specific patterns above are turned into tags.

import { escapeHTML } from "./escape-html.js";

function inlineFormat(escapedText) {
  return escapedText
    // [text](https://url) -> link (http/https only)
    .replace(
      /\[([^\[\]]+)\]\((https?:\/\/[^\s()]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    )
    // **bold**
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    // *italic* (after bold, so single * left over is italic)
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

export function formatContent(raw) {
  const text = String(raw || "").replace(/\r\n/g, "\n").trim();
  if (!text) return "";

  const blocks = text.split(/\n\s*\n/);

  const html = blocks
    .map((block) => {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length);

      if (!lines.length) return "";

      // Bullet list: every line starts with "- "
      if (lines.every((l) => l.startsWith("- "))) {
        const items = lines
          .map((l) => `<li>${inlineFormat(escapeHTML(l.slice(2)))}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }

      // Heading: single line starting with "### "
      if (lines.length === 1 && lines[0].startsWith("### ")) {
        return `<h3>${inlineFormat(escapeHTML(lines[0].slice(4)))}</h3>`;
      }

      // Quote: every line starts with "> "
      if (lines.every((l) => l.startsWith("> "))) {
        const inner = lines
          .map((l) => inlineFormat(escapeHTML(l.slice(2))))
          .join("<br>");
        return `<blockquote>${inner}</blockquote>`;
      }

      // Normal paragraph
      const inner = lines.map((l) => inlineFormat(escapeHTML(l))).join("<br>");
      return `<p>${inner}</p>`;
    })
    .filter(Boolean)
    .join("");

  return html;
}
