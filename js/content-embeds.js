// Auto-embeds a YouTube link or an image link that appears on its
// own line inside an article's content. Everything else is escaped
// as plain text, so this never opens up arbitrary HTML injection —
// only a validated YouTube video ID reaches an iframe src, and any
// image URL is still escaped before being placed in an img tag.

import { escapeHTML } from "./escape-html.js";

const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

const IMAGE_EXT_RE = /\.(jpe?g|png|gif|webp|avif|svg)(\?.*)?$/i;

function extractYouTubeId(possibleUrl) {

  let parsed;

  try {
    parsed = new URL(possibleUrl.trim());
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "").replace(/^m\./, "");

  if (host === "youtu.be") {
    const id = parsed.pathname.split("/").filter(Boolean)[0];
    return id && YOUTUBE_ID_RE.test(id) ? id : null;
  }

  if (host === "youtube.com" || host === "music.youtube.com") {

    if (parsed.pathname === "/watch") {
      const id = parsed.searchParams.get("v");
      return id && YOUTUBE_ID_RE.test(id) ? id : null;
    }

    const match = parsed.pathname.match(/^\/(shorts|embed|live)\/([a-zA-Z0-9_-]{11})/);
    if (match) return match[2];
  }

  return null;
}

function isImageURL(possibleUrl) {

  let parsed;

  try {
    parsed = new URL(possibleUrl.trim());
  } catch {
    return false;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;

  // Cloudinary (where pasted images get uploaded to) serves image
  // URLs under /image/upload/ without always having a file
  // extension, so accept those directly as well as any URL ending
  // in a common image extension.
  if (parsed.hostname.endsWith("res.cloudinary.com") && parsed.pathname.includes("/image/")) {
    return true;
  }

  return IMAGE_EXT_RE.test(parsed.pathname);
}

function youtubeEmbedHTML(videoId) {
  return `<div class="video-embed"><iframe src="https://www.youtube-nocookie.com/embed/${videoId}" title="YouTube video player" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;
}

function imageEmbedHTML(url) {
  const safeUrl = escapeHTML(url);
  return `<div class="content-image-wrap"><img src="${safeUrl}" alt="" loading="lazy" class="content-image"></div>`;
}

// Splits the article content into paragraphs (blank line = new
// paragraph, same as the old rendering). Any paragraph that is
// *just* a YouTube link becomes a video embed, any paragraph that
// is *just* an image link becomes an inline image; everything else
// is escaped and rendered as plain text, same as before.
export function renderContentWithEmbeds(rawContent) {

  const text = String(rawContent || "");

  const paragraphs = text.split(/\n\s*\n/);

  return paragraphs
    .map((para) => {

      const trimmed = para.trim();

      if (trimmed) {

        const videoId = extractYouTubeId(trimmed);
        if (videoId) return youtubeEmbedHTML(videoId);

        if (isImageURL(trimmed)) return imageEmbedHTML(trimmed);
      }

      return `<p>${escapeHTML(para).replace(/\n/g, "<br>")}</p>`;

    })
    .join("\n");
}
