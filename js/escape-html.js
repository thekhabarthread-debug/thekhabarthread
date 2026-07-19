// Escapes user-supplied text before it is inserted into innerHTML,
// so stored data (news titles, summaries, ad titles, etc.) can never
// be interpreted as HTML/JS by the browser.
export function escapeHTML(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
