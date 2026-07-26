/**
 * generate-sitemap.js
 * ---------------------------------------------------------
 * The Khabar Thread — Dynamic Sitemap Generator
 * ---------------------------------------------------------
 * Yeh script Firestore ("news" collection) se saari articles
 * fetch karta hai aur unke liye ek fresh sitemap.xml banata hai,
 * jisme:
 *   - Static pages (home, categories, about, contact)
 *   - Har news article ka apna URL (news.html?id=xxxx)
 * dono shamil hote hain.
 *
 * Yeh GitHub Actions workflow (.github/workflows/update-sitemap.yml)
 * dwara automatically, schedule par chalaya jaata hai — kisi
 * server ki zaroorat nahi, GitHub Pages ke saath perfectly kaam
 * karta hai.
 *
 * Firestore ka "news" collection publicly readable hai
 * (firestore.rules me "allow read: if true;"), isliye yeh script
 * seedha Firestore REST API se data padh sakta hai — Firebase Admin
 * SDK ya kisi secret key ki zaroorat nahi.
 * ---------------------------------------------------------
 */

import { writeFile } from "node:fs/promises";
import { join } from "node:path";

// ===== CONFIG =====
const PROJECT_ID = "the-khabar-thread";
const API_KEY = "AIzaSyDX-1DUOIoKEUUw_Nwj_A4N54Q48Aec2EQ"; // public web API key (safe — read access is controlled by Firestore rules, not this key)
const SITE_URL = "https://thekhabarthread.in";
const OUTPUT_PATH = join(process.cwd(), "sitemap.xml");

// Static pages jo hamesha sitemap me rahenge
const STATIC_URLS = [
  { loc: `${SITE_URL}/`, changefreq: "hourly", priority: "1.0" },
  { loc: `${SITE_URL}/category.html?name=${encodeURIComponent("भारत")}`, changefreq: "daily", priority: "0.9" },
  { loc: `${SITE_URL}/category.html?name=${encodeURIComponent("उत्तर प्रदेश")}`, changefreq: "daily", priority: "0.9" },
  { loc: `${SITE_URL}/category.html?name=${encodeURIComponent("राजनीति")}`, changefreq: "daily", priority: "0.9" },
  { loc: `${SITE_URL}/category.html?name=${encodeURIComponent("दुनिया")}`, changefreq: "daily", priority: "0.9" },
  { loc: `${SITE_URL}/category.html?name=${encodeURIComponent("खेल")}`, changefreq: "daily", priority: "0.9" },
  { loc: `${SITE_URL}/category.html?name=${encodeURIComponent("टेक")}`, changefreq: "daily", priority: "0.9" },
  { loc: `${SITE_URL}/about.html`, changefreq: "monthly", priority: "0.5" },
  { loc: `${SITE_URL}/contact.html`, changefreq: "monthly", priority: "0.5" },
];

/**
 * Firestore REST API se "news" collection ke saare documents
 * fetch karta hai, pagination handle karte hue.
 */
async function fetchAllNews() {
  const documents = [];
  let pageToken;

  do {
    const url = new URL(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/news`
    );
    url.searchParams.set("key", API_KEY);
    url.searchParams.set("pageSize", "300");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Firestore fetch failed (${res.status}): ${body}`);
    }

    const data = await res.json();
    if (Array.isArray(data.documents)) {
      documents.push(...data.documents);
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return documents;
}

/** Firestore REST field format se plain JS value nikalta hai */
function fieldValue(fields, key) {
  const f = fields?.[key];
  if (!f) return undefined;
  if ("stringValue" in f) return f.stringValue;
  if ("integerValue" in f) return Number(f.integerValue);
  if ("doubleValue" in f) return f.doubleValue;
  if ("booleanValue" in f) return f.booleanValue;
  return undefined;
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toIsoDate(ms) {
  const n = Number(ms);
  if (!n || Number.isNaN(n)) return new Date().toISOString().split("T")[0];
  return new Date(n).toISOString().split("T")[0];
}

function buildSitemapXml(urls) {
  const body = urls
    .map((u) => {
      const lastmodLine = u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : "";
      return `  <url>
    <loc>${escapeXml(u.loc)}</loc>${lastmodLine}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

async function main() {
  console.log("Fetching news articles from Firestore...");
  const documents = await fetchAllNews();
  console.log(`Found ${documents.length} article(s).`);

  const newsUrls = documents.map((doc) => {
    const id = doc.name.split("/").pop();
    const createdAt = fieldValue(doc.fields, "createdAt");
    return {
      loc: `${SITE_URL}/news.html?id=${encodeURIComponent(id)}`,
      lastmod: toIsoDate(createdAt),
      changefreq: "daily",
      priority: "0.8",
    };
  });

  const allUrls = [...STATIC_URLS, ...newsUrls];
  const xml = buildSitemapXml(allUrls);

  await writeFile(OUTPUT_PATH, xml, "utf8");
  console.log(`sitemap.xml written with ${allUrls.length} URL(s) → ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("Sitemap generation failed:", err);
  process.exit(1);
});
