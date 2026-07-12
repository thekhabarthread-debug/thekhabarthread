import { db } from "./js/firebase.js";

import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

async function loadNews() {

  try {

    const q = query(
      collection(db, "news"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    const news = [];

    snapshot.forEach((doc) => {

      news.push({
        id: doc.id,
        ...doc.data()
      });

    });

    if(news.length === 0){

      document.getElementById("news-grid").innerHTML =
      "<h2>No News Found</h2>";

      return;

    }

    // =========================
    // HERO (Featured First)
    // =========================

    const heroNews =
      news.find(item => item.featured === true) || news[0];

    document.getElementById("hero-category").innerText =
      heroNews.category;

    document.getElementById("hero-title").innerText =
      heroNews.title;

    document.getElementById("hero-summary").innerText =
      heroNews.summary;

    document.getElementById("hero-image").src =
      heroNews.image;

    document.getElementById("hero-read").href =
      `news.html?id=${heroNews.id}`;

    // =========================
    // BREAKING BAR
    // =========================

    const breaking =
      news.find(item => item.breaking === true);

    if(breaking){

      document.getElementById("breaking-bar").innerText =
      "🔴 " + breaking.title;

    }

    // =========================
    // NEWS GRID
    // =========================

    const grid = document.getElementById("news-grid");

    grid.innerHTML = "";

    news.forEach(item=>{

      grid.innerHTML += `

      <div class="card">

      <img src="${item.image}" class="card-image">

      <h3>${item.title}</h3>

      <p>${item.summary}</p>

      <a href="news.html?id=${item.id}" class="read-btn">

      पूरा पढ़ें →

      </a>

      </div>

      `;

    });

  }

  catch(error){

    console.error(error);

  }

}

loadNews();