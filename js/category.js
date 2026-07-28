import { db } from "./firebase.js";
import { escapeHTML } from "./escape-html.js";

import {
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const category = params.get("name");

const title = document.getElementById("category-title");
const count = document.getElementById("category-count");
const grid = document.getElementById("category-news");
const badge = document.getElementById("category-badge");

async function fetchAllNews() {
  try {
    const q = query(collection(db, "news"), orderBy("createdAt", "desc"), limit(100));
    return await getDocs(q);
  } catch (err) {
    console.warn("orderBy failed, falling back:", err);
    return await getDocs(query(collection(db, "news"), limit(100)));
  }
}

async function loadCategoryNews() {
  if (!category) {
    if (title) title.innerText = "Category Not Found";
    if (count) count.innerText = "";
    if (grid) grid.innerHTML = `<div class="empty-state"><h2>Category Not Found</h2></div>`;
    return;
  }

  if (title) title.innerText = category;
  if (badge) badge.innerText = `📰 ${category} News`;

  try {
    const snapshot = await fetchAllNews();
    if (grid) grid.innerHTML = "";

    const items = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.category === category) {
        items.push({ id: docSnap.id, ...data });
      }
    });

    items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    if (count) count.innerText = `${items.length} Articles`;

    if (items.length === 0) {
      if (grid) {
        grid.innerHTML = `
          <div class="empty-state">
            <h2>No News Found</h2>
            <p>इस Category में अभी कोई News उपलब्ध नहीं है।</p>
          </div>`;
      }
      return;
    }

    items.forEach((news) => {
      if (!grid) return;
      grid.innerHTML += `
        <div class="category-card">
          <img src="${escapeHTML(news.image)}" alt="${escapeHTML(news.title)}" loading="lazy" decoding="async" onerror="this.src='assets/news/hero.png'">
          <div class="category-content">
            <span class="category">${escapeHTML(news.category)}</span>
            <h3>${escapeHTML(news.title)}</h3>
            <p>${escapeHTML(news.summary)}</p>
            <a href="news.html?id=${encodeURIComponent(news.id)}" class="read-btn">पूरा पढ़ें →</a>
          </div>
        </div>`;
    });
  } catch (error) {
    console.error(error);
    if (grid) {
      grid.innerHTML = `
        <div class="empty-state">
          <h2>Error Loading News</h2>
          <p>${escapeHTML(error.message || "Unknown error")}</p>
        </div>`;
    }
  }
}

loadCategoryNews();
