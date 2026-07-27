const SITE_ORIGIN = "https://thekhabarthread.in";
const NEWS_PATH = "/news.html";
const SECURITY_HEADERS = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "script-src 'self' 'unsafe-inline' https://www.gstatic.com https://www.googletagmanager.com https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
    "font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com",
    "img-src 'self' data: blob: https://res.cloudinary.com https://*.googleusercontent.com",
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://api.cloudinary.com https://www.google-analytics.com https://region1.google-analytics.com",
    "frame-src https://www.youtube-nocookie.com https://accounts.google.com https://*.firebaseapp.com",
    "upgrade-insecure-requests",
  ].join("; "),
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Strict-Transport-Security": "max-age=31536000",
};

let googleJwks;
let googleJwksExpiresAt = 0;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.hostname === "www.thekhabarthread.in") {
      url.hostname = "thekhabarthread.in";
      return Response.redirect(url.toString(), 301);
    }

    try {
      if (url.pathname === "/api/cloudinary-signature") {
        return withSecurityHeaders(await createCloudinarySignature(request, env));
      }

      if (url.pathname === "/sitemap.xml") {
        return withSecurityHeaders(await createSitemap(env, ctx));
      }

      if (url.pathname === NEWS_PATH && url.searchParams.get("id")) {
        return withSecurityHeaders(await renderNewsPage(request, env));
      }

      const assetResponse = await env.ASSETS.fetch(request);
      return withSecurityHeaders(assetResponse, url.pathname);
    } catch (error) {
      console.error("Worker request failed", error);
      return withSecurityHeaders(
        new Response("Service temporarily unavailable", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        }),
      );
    }
  },
};

async function renderNewsPage(request, env) {
  const requestUrl = new URL(request.url);
  const id = requestUrl.searchParams.get("id");

  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id || "")) {
    return new Response("Invalid article ID", { status: 400 });
  }

  const [templateResponse, article] = await Promise.all([
    env.ASSETS.fetch(new URL(NEWS_PATH, request.url)),
    fetchFirestoreDocument(env, "news", id),
  ]);

  if (!templateResponse.ok) return templateResponse;
  if (!article) {
    return new Response("News not found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const canonical = `${SITE_ORIGIN}${NEWS_PATH}?id=${encodeURIComponent(id)}`;
  const publishedAt = toIsoDate(article.publishedAt || article.createdAt);
  const updatedAt = toIsoDate(article.updatedAt || article.createdAt);
  const socialImage = cloudinarySocialImage(article.image);

  let html = await templateResponse.text();
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(article.title)} | The Khabar Thread</title>`);
  html = replaceMeta(html, "name", "description", article.summary);
  html = replaceMeta(html, "property", "og:title", article.title);
  html = replaceMeta(html, "property", "og:description", article.summary);
  html = replaceMeta(html, "property", "og:image", socialImage);
  html = replaceMeta(html, "property", "og:url", canonical);
  html = replaceMeta(html, "name", "twitter:title", article.title);
  html = replaceMeta(html, "name", "twitter:description", article.summary);
  html = replaceMeta(html, "name", "twitter:image", socialImage);
  html = html.replace(
    /<link\s+rel="canonical"[\s\S]*?>/i,
    `<link rel="canonical" id="canonical-link" href="${escapeAttr(canonical)}">`,
  );

  const extraMeta = [
    '<meta property="og:site_name" content="The Khabar Thread">',
    '<meta property="og:locale" content="hi_IN">',
    `<meta property="og:image:secure_url" content="${escapeAttr(socialImage)}">`,
    `<meta property="og:image:alt" content="${escapeAttr(article.title)}">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    `<meta property="article:published_time" content="${escapeAttr(publishedAt)}">`,
    `<meta property="article:modified_time" content="${escapeAttr(updatedAt)}">`,
  ].join("\n");
  html = html.replace("</head>", `${extraMeta}\n</head>`);

  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    headline: String(article.title || "").slice(0, 110),
    description: article.summary || "",
    image: [socialImage],
    datePublished: publishedAt,
    dateModified: updatedAt,
    inLanguage: "hi-IN",
    author: { "@type": "Organization", name: "The Khabar Thread", url: SITE_ORIGIN },
    publisher: {
      "@type": "Organization",
      name: "The Khabar Thread",
      logo: { "@type": "ImageObject", url: `${SITE_ORIGIN}/assets/logo.png` },
    },
  };
  html = html.replace(
    /<script id="news-schema" type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script id="news-schema" type="application/ld+json">${safeJson(schema)}</script>`,
  );

  const articleHtml = renderArticle(article);
  html = html.replace(
    /<section id="news-details">[\s\S]*?<\/section>/i,
    `<section id="news-details">${articleHtml}</section>`,
  );

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
    },
  });
}

async function createSitemap(env, ctx) {
  const cache = caches.default;
  const cacheKey = new Request(`${SITE_ORIGIN}/sitemap.xml`);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const articles = await fetchFirestoreCollection(env, "news");
  const staticUrls = [
    ["/", "hourly", "1.0"],
    ["/category.html?name=%E0%A4%AD%E0%A4%BE%E0%A4%B0%E0%A4%A4", "daily", "0.9"],
    ["/category.html?name=%E0%A4%89%E0%A4%A4%E0%A5%8D%E0%A4%A4%E0%A4%B0%20%E0%A4%AA%E0%A5%8D%E0%A4%B0%E0%A4%A6%E0%A5%87%E0%A4%B6", "daily", "0.9"],
    ["/category.html?name=%E0%A4%B0%E0%A4%BE%E0%A4%9C%E0%A4%A8%E0%A5%80%E0%A4%A4%E0%A4%BF", "daily", "0.9"],
    ["/category.html?name=%E0%A4%A6%E0%A5%81%E0%A4%A8%E0%A4%BF%E0%A4%AF%E0%A4%BE", "daily", "0.9"],
    ["/category.html?name=%E0%A4%96%E0%A5%87%E0%A4%B2", "daily", "0.9"],
    ["/category.html?name=%E0%A4%9F%E0%A5%87%E0%A4%95", "daily", "0.9"],
    ["/about.html", "monthly", "0.5"],
    ["/contact.html", "monthly", "0.5"],
  ];

  const entries = staticUrls.map(([path, changefreq, priority]) => ({
    loc: `${SITE_ORIGIN}${path}`,
    changefreq,
    priority,
  }));
  for (const article of articles) {
    entries.push({
      loc: `${SITE_ORIGIN}${NEWS_PATH}?id=${encodeURIComponent(article.id)}`,
      lastmod: toIsoDate(article.updatedAt || article.createdAt).slice(0, 10),
      changefreq: "daily",
      priority: "0.8",
    });
  }

  const body = entries.map((entry) => [
    "  <url>",
    `    <loc>${escapeXml(entry.loc)}</loc>`,
    entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>` : "",
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority}</priority>`,
    "  </url>",
  ].filter(Boolean).join("\n")).join("\n");

  const response = new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=900",
      },
    },
  );
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

async function createCloudinarySignature(request, env) {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const user = await verifyFirebaseAdmin(request, env);
  if (!user) return jsonResponse({ error: "Unauthorized" }, 401);

  const required = [
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_UPLOAD_PRESET",
  ];
  if (required.some((key) => !env[key])) {
    return jsonResponse({ error: "Cloudinary Worker secrets are not configured" }, 503);
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "thekhabarthread";
  const toSign = `folder=${folder}&timestamp=${timestamp}&upload_preset=${env.CLOUDINARY_UPLOAD_PRESET}${env.CLOUDINARY_API_SECRET}`;
  const signature = await sha1(toSign);

  return jsonResponse({
    signature,
    timestamp,
    folder,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    uploadPreset: env.CLOUDINARY_UPLOAD_PRESET,
  });
}

async function verifyFirebaseAdmin(request, env) {
  const authorization = request.headers.get("Authorization") || "";
  if (!authorization.startsWith("Bearer ")) return null;
  const token = authorization.slice(7);
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  let header;
  let payload;
  try {
    header = JSON.parse(decodeBase64Url(parts[0]));
    payload = JSON.parse(decodeBase64Url(parts[1]));
  } catch {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (
    header.alg !== "RS256" ||
    !header.kid ||
    payload.aud !== env.FIREBASE_PROJECT_ID ||
    payload.iss !== `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}` ||
    payload.exp <= now ||
    payload.iat > now + 60 ||
    payload.email !== env.ADMIN_EMAIL ||
    payload.email_verified !== true
  ) {
    return null;
  }

  const jwks = await getGoogleJwks();
  const jwk = jwks.keys.find((key) => key.kid === header.kid);
  if (!jwk) return null;

  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    base64UrlToBytes(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
  );
  return valid ? payload : null;
}

async function getGoogleJwks() {
  if (googleJwks && Date.now() < googleJwksExpiresAt) return googleJwks;
  const response = await fetch("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com");
  if (!response.ok) throw new Error("Unable to verify Firebase token");
  googleJwks = await response.json();
  const maxAge = Number((response.headers.get("Cache-Control") || "").match(/max-age=(\d+)/)?.[1] || 3600);
  googleJwksExpiresAt = Date.now() + maxAge * 1000;
  return googleJwks;
}

async function fetchFirestoreDocument(env, collection, id) {
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(env.FIREBASE_PROJECT_ID)}/databases/(default)/documents/${encodeURIComponent(collection)}/${encodeURIComponent(id)}?key=${encodeURIComponent(env.FIREBASE_API_KEY)}`;
  const response = await fetch(url);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Firestore returned ${response.status}`);
  const document = await response.json();
  return { id, ...decodeFirestoreFields(document.fields || {}) };
}

async function fetchFirestoreCollection(env, collection) {
  const documents = [];
  let pageToken = "";
  do {
    const url = new URL(`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}`);
    url.searchParams.set("key", env.FIREBASE_API_KEY);
    url.searchParams.set("pageSize", "300");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Firestore returned ${response.status}`);
    const data = await response.json();
    for (const document of data.documents || []) {
      documents.push({
        id: document.name.split("/").pop(),
        ...decodeFirestoreFields(document.fields || {}),
      });
    }
    pageToken = data.nextPageToken || "";
  } while (pageToken);
  return documents;
}

function decodeFirestoreFields(fields) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeFirestoreValue(value)]));
}

function decodeFirestoreValue(value) {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(decodeFirestoreValue);
  if ("mapValue" in value) return decodeFirestoreFields(value.mapValue.fields || {});
  return null;
}

function renderArticle(article) {
  return `
<article class="single-news">
  <div class="news-meta">
    <span class="category">${escapeHtml(article.category || "")}</span>
    <span class="news-date">🗓 ${escapeHtml(article.date || toIsoDate(article.createdAt).slice(0, 10))}</span>
  </div>
  <h1>${escapeHtml(article.title || "")}</h1>
  <img src="${escapeAttr(cloudinaryDisplayImage(article.image))}" alt="${escapeAttr(article.title || "")}" class="single-image" width="1200" height="675" fetchpriority="high">
  <div class="summary">${escapeHtml(article.summary || "")}</div>
  <div class="content">${renderContent(article.content || "")}</div>
</article>`;
}

function renderContent(content) {
  return String(content).split(/\n\s*\n/).map((paragraph) => {
    const trimmed = paragraph.trim();
    const videoId = youtubeId(trimmed);
    if (videoId) {
      return `<div class="video-embed"><iframe src="https://www.youtube-nocookie.com/embed/${videoId}" title="YouTube video player" loading="lazy" allowfullscreen></iframe></div>`;
    }
    if (isSafeImageUrl(trimmed)) {
      return `<div class="content-image-wrap"><img src="${escapeAttr(cloudinaryDisplayImage(trimmed))}" alt="" loading="lazy" decoding="async" class="content-image"></div>`;
    }
    return `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`;
  }).join("\n");
}

function youtubeId(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^(www|m)\./, "");
    let id = "";
    if (host === "youtu.be") id = url.pathname.split("/").filter(Boolean)[0] || "";
    if (host === "youtube.com" && url.pathname === "/watch") id = url.searchParams.get("v") || "";
    if (host === "youtube.com") id ||= url.pathname.match(/^\/(?:shorts|embed|live)\/([A-Za-z0-9_-]{11})/)?.[1] || "";
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

function isSafeImageUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) &&
      (/\.(jpe?g|png|gif|webp|avif)(\?.*)?$/i.test(url.pathname) ||
       (url.hostname === "res.cloudinary.com" && url.pathname.includes("/image/upload/")));
  } catch {
    return false;
  }
}

function cloudinarySocialImage(value) {
  return addCloudinaryTransform(value, "c_fill,g_auto,w_1200,h_630,q_auto:good,f_jpg");
}

function cloudinaryDisplayImage(value) {
  return addCloudinaryTransform(value, "c_limit,w_1600,q_auto:good,f_auto");
}

function addCloudinaryTransform(value, transform) {
  const url = String(value || "");
  if (!url.startsWith("https://res.cloudinary.com/") || !url.includes("/image/upload/")) return url;
  return url.replace("/image/upload/", `/image/upload/${transform}/`);
}

function replaceMeta(html, attribute, key, value) {
  const pattern = new RegExp(`<meta\\s+${attribute}="${escapeRegex(key)}"[\\s\\S]*?>`, "i");
  const id = {
    "og:title": "og-title",
    "og:description": "og-description",
    "og:image": "og-image",
    "og:url": "og-url",
    "twitter:title": "twitter-title",
    "twitter:description": "twitter-description",
    "twitter:image": "twitter-image",
  }[key];
  return html.replace(
    pattern,
    `<meta ${attribute}="${key}"${id ? ` id="${id}"` : ""} content="${escapeAttr(value || "")}">`,
  );
}

function toIsoDate(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return value;
  const number = Number(value);
  const date = Number.isFinite(number) && number > 0 ? new Date(number) : new Date();
  return date.toISOString();
}

function withSecurityHeaders(response, pathname = "") {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) headers.set(key, value);
  if (pathname.startsWith("/admin/")) {
    headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    headers.set("Cache-Control", "no-store");
  }
  if (/\.(?:css|js|png|jpe?g|webp|svg|ico|woff2?)$/i.test(pathname)) {
    headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

async function sha1(value) {
  const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function decodeBase64Url(value) {
  return new TextDecoder().decode(base64UrlToBytes(value));
}

function base64UrlToBytes(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function escapeXml(value) {
  return escapeHtml(value).replace(/&#39;/g, "&apos;");
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
