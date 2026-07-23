// Adds a simple formatting toolbar above the "Full Article" textarea.
// It works by inserting plain-text markers (**bold**, *italic*, etc.)
// into the textarea — no contenteditable, no HTML stored in Firestore.
// See content-format.js for how these markers are turned into HTML
// on the public news page.

import { formatContent } from "./content-format.js";

function wrapSelection(textarea, before, after, placeholder) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end) || placeholder;

  textarea.value =
    textarea.value.slice(0, start) +
    before + selected + after +
    textarea.value.slice(end);

  textarea.focus();
  textarea.selectionStart = start + before.length;
  textarea.selectionEnd = start + before.length + selected.length;
  textarea.dispatchEvent(new Event("input"));
}

function prefixLines(textarea, prefix, placeholder) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;

  let lineStart = value.lastIndexOf("\n", start - 1) + 1;
  let lineEnd = value.indexOf("\n", end);
  if (lineEnd === -1) lineEnd = value.length;

  let block = value.slice(lineStart, lineEnd);
  if (!block.trim()) block = placeholder;

  const prefixed = block
    .split("\n")
    .map((l) => (l.startsWith(prefix) ? l : prefix + l))
    .join("\n");

  textarea.value = value.slice(0, lineStart) + prefixed + value.slice(lineEnd);

  textarea.focus();
  textarea.selectionStart = lineStart;
  textarea.selectionEnd = lineStart + prefixed.length;
  textarea.dispatchEvent(new Event("input"));
}

function insertLink(textarea) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end) || "link text";

  const url = window.prompt("Link URL (https://...)", "https://");
  if (!url) return;
  if (!/^https?:\/\//i.test(url)) {
    alert("Link http:// ya https:// se shuru honi chahiye.");
    return;
  }

  const markdown = `[${selected}](${url})`;
  textarea.value =
    textarea.value.slice(0, start) + markdown + textarea.value.slice(end);

  textarea.focus();
  const cursor = start + markdown.length;
  textarea.selectionStart = cursor;
  textarea.selectionEnd = cursor;
  textarea.dispatchEvent(new Event("input"));
}

function runCommand(cmd, textarea) {
  switch (cmd) {
    case "bold":
      wrapSelection(textarea, "**", "**", "bold text");
      break;
    case "italic":
      wrapSelection(textarea, "*", "*", "italic text");
      break;
    case "heading":
      prefixLines(textarea, "### ", "Heading");
      break;
    case "list":
      prefixLines(textarea, "- ", "List item");
      break;
    case "quote":
      prefixLines(textarea, "> ", "Quote");
      break;
    case "link":
      insertLink(textarea);
      break;
  }
}

function initToolbar(toolbar) {
  const targetId = toolbar.dataset.target;
  const textarea = document.getElementById(targetId);
  if (!textarea) return;

  const preview = toolbar.parentElement.querySelector(".editor-preview");

  toolbar.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-cmd]");
    if (!btn) return;
    e.preventDefault();

    const cmd = btn.dataset.cmd;

    if (cmd === "preview") {
      if (!preview) return;
      const showing = preview.style.display !== "none";
      if (showing) {
        preview.style.display = "none";
        textarea.style.display = "";
        btn.classList.remove("active");
      } else {
        preview.innerHTML = formatContent(textarea.value) || "<p class=\"muted\">Kuch likha nahi hai abhi.</p>";
        preview.style.display = "";
        textarea.style.display = "none";
        btn.classList.add("active");
      }
      return;
    }

    runCommand(cmd, textarea);
  });

  if (preview) {
    textarea.addEventListener("input", () => {
      if (preview.style.display !== "none") {
        preview.innerHTML = formatContent(textarea.value) || "<p class=\"muted\">Kuch likha nahi hai abhi.</p>";
      }
    });
  }
}

document.querySelectorAll(".editor-toolbar").forEach(initToolbar);
