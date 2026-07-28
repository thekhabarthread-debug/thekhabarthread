/*==================================================
THE KHABAR THREAD
SCRIPT V3 (fixed — loading + SEO-safe)
==================================================*/

import { db } from "./js/firebase.js";
import { escapeHTML } from "./js/escape-html.js";
import { optimizedImageUrl } from "./js/image-utils.js";

import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  limit
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

let news = [];

const heroImage = document.getElementById("hero-image");
const heroTitle = document.getElementById("hero-title");
const heroSummary = document.getElementById("hero-summary");
const heroCategory = document.getElementById("hero-category");
const heroRead = document.getElementById("hero-read");
const breakingBar = document.getElementById("breaking-bar");

function setBreakingText(text) {
  const el = breakingBar ? breakingBar.querySelector(".breaking-bar-text") : null;
  if (el) el.textContent = text;
}

function showEmptyState(message) {
  if (heroTitle) heroTitle.innerText = message || "अभी कोई खबर उपलब्ध नहीं है";
  if (heroSummary) {
    heroSummary.innerText =
      "जल्द ही नई खबरें यहाँ प्रकाशित होंगी। श्रेणियाँ देखें या बाद में फिर आएँ।";
  }
  if (heroCategory) heroCategory.innerText = "Featured";
  if (heroRead) {
    heroRead.href = "#latest-news";
    heroRead.textContent = "नीचे देखें →";
  }
  setBreakingText("🔴 अभी कोई ब्रेकिंग न्यूज़ नहीं");

  const grid = document.getElementById("news-grid");
  if (grid) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;text-align:center;padding:2rem;">
        <h2>No News Found</h2>
        <p>कोई समाचार नहीं मिला। कृपया बाद में फिर देखें।</p>
      </div>`;
  }
}

async function fetchNewsDocs() {
  try {
    const q = query(
      collection(db, "news"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    return await getDocs(q);
  } catch (err) {
    console.warn("orderBy(createdAt) failed, falling back:", err);
    try {
      return await getDocs(query(collection(db, "news"), limit(50)));
    } catch (err2) {
      console.error("Fallback query also failed:", err2);
      throw err2;
    }
  }
}

async function loadNews() {
  try {
    const snapshot = await fetchNewsDocs();

    news = [];
    snapshot.forEach((docSnap) => {
      news.push({ id: docSnap.id, ...docSnap.data() });
    });

    news.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    if (news.length === 0) {
      showEmptyState("अभी कोई खबर उपलब्ध नहीं है");
      return;
    }

    const hero = news.find((item) => item.featured === true) || news[0];

    if (heroImage) {
      heroImage.src = optimizedImageUrl(hero.image || "assets/news/hero.png", 1400);
      heroImage.alt = hero.title || "Featured News";
      heroImage.onerror = function () {
        this.onerror = null;
        this.src = "assets/news/hero.png";
      };
    }
    if (heroTitle) heroTitle.innerText = hero.title || "";
    if (heroSummary) heroSummary.innerText = hero.summary || "";
    if (heroCategory) heroCategory.innerText = hero.category || "Featured";
    if (heroRead) {
      heroRead.href = `news.html?id=${encodeURIComponent(hero.id)}`;
      heroRead.textContent = "पूरा पढ़ें →";
    }

    const breaking = news.find((item) => item.breaking === true);
    if (breaking) {
      setBreakingText("🔴 " + (breaking.title || "Breaking News"));
    } else {
      setBreakingText("🔴 " + (news[0].title || "Latest updates"));
    }

    const topStories = document.getElementById("top-stories");
    if (topStories) {
      topStories.innerHTML = "";
      news
        .filter((item) => item.id !== hero.id)
        .slice(0, 4)
        .forEach((item) => {
          topStories.innerHTML += `
<div class="side-card">
  <img src="${escapeHTML(optimizedImageUrl(item.image, 400))}" alt="${escapeHTML(item.title)}" loading="lazy" decoding="async" onerror="this.src='assets/news/hero.png'">
  <div>
    <span>${escapeHTML(item.category)}</span>
    <h4>
      <a href="news.html?id=${encodeURIComponent(item.id)}">${escapeHTML(item.title)}</a>
    </h4>
  </div>
</div>`;
        });
    }

    const newsGrid = document.getElementById("news-grid");
    if (newsGrid) {
      newsGrid.innerHTML = "";
      news.slice(0, 12).forEach((item) => {
        newsGrid.innerHTML += `
<div class="card fade-up">
  <img src="${escapeHTML(optimizedImageUrl(item.image, 800))}" class="card-image" alt="${escapeHTML(item.title)}" loading="lazy" decoding="async" onerror="this.src='assets/news/hero.png'">
  <div class="card-content">
    <span class="card-category">${escapeHTML(item.category)}</span>
    <h3>${escapeHTML(item.title)}</h3>
    <p>${escapeHTML(item.summary)}</p>
    <a href="news.html?id=${encodeURIComponent(item.id)}" class="read-btn">पूरा पढ़ें →</a>
  </div>
</div>`;
      });
    }

    function loadCategory(category, id) {
      const box = document.getElementById(id);
      if (!box) return;
      box.innerHTML = "";
      const items = news.filter((item) => item.category === category).slice(0, 4);
      if (items.length === 0) {
        box.innerHTML =
          `<p class="empty-cat" style="opacity:.7;padding:.5rem 0;">इस श्रेणी में अभी कोई खबर नहीं</p>`;
        return;
      }
      items.forEach((item) => {
        box.innerHTML += `
<div class="category-card fade-up">
  <img src="${escapeHTML(optimizedImageUrl(item.image, 600))}" alt="${escapeHTML(item.title)}" loading="lazy" decoding="async" onerror="this.src='assets/news/hero.png'">
  <div class="category-content">
    <h3>${escapeHTML(item.title)}</h3>
    <p>${escapeHTML(item.summary)}</p>
    <a href="news.html?id=${encodeURIComponent(item.id)}" class="view-more">पूरा पढ़ें →</a>
  </div>
</div>`;
      });
    }

    loadCategory("भारत", "india-news");
    loadCategory("उत्तर प्रदेश", "up-news");
    loadCategory("दुनिया", "world-news");
    loadCategory("राजनीति", "politics-news");
    loadCategory("खेल", "sports-news");
    loadCategory("टेक", "tech-news");

    const adBox = document.getElementById("homepage-ad");
    if (adBox) {
      try {
        const adQuery = query(
          collection(db, "ads"),
          where("active", "==", true),
          where("position", "==", "homepage")
        );
        const adSnap = await getDocs(adQuery);
        if (!adSnap.empty) {
          const ad = adSnap.docs[0].data();
          adBox.innerHTML = `
<a href="${escapeHTML(ad.link)}" target="_blank" rel="noopener noreferrer sponsored" class="homepage-ad">
  <img src="${escapeHTML(ad.image)}" alt="${escapeHTML(ad.title)}" loading="lazy" decoding="async">
</a>`;
        }
      } catch (adErr) {
        console.warn("Homepage ad load failed:", adErr);
      }
    }
  } catch (error) {
    console.error("Error Loading News :", error);
    showEmptyState("खबरें लोड नहीं हो सकीं");
    setBreakingText("🔴 खबरें लोड करने में समस्या — पेज रिफ्रेश करें");
  }
}

loadNews();

const searchBox = document.getElementById("searchInput");
if (searchBox) {
  searchBox.addEventListener("input", () => {
    const value = searchBox.value.toLowerCase().trim();
    const cards = document.querySelectorAll("#news-grid .card");
    let found = 0;

    cards.forEach((card) => {
      const titleEl = card.querySelector("h3");
      const title = titleEl ? titleEl.innerText.toLowerCase() : "";
      const text = card.innerText.toLowerCase();
      if (!value || title.includes(value) || text.includes(value)) {
        card.style.display = "";
        found++;
      } else {
        card.style.display = "none";
      }
    });

    const old = document.getElementById("no-search-result");
    if (old) old.remove();

    if (found === 0 && value) {
      const div = document.createElement("div");
      div.id = "no-search-result";
      div.className = "empty-state";
      div.style.cssText = "grid-column:1/-1;text-align:center;padding:2rem;";
      div.innerHTML = `<h2>No News Found</h2><p>कोई समाचार नहीं मिला।</p>`;
      const grid = document.getElementById("news-grid");
      if (grid) grid.appendChild(div);
    }
  });
}
