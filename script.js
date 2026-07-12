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

    if (news.length === 0) {

      document.getElementById("news-grid").innerHTML =
      "<h2>No News Found</h2>";

      return;

    }

    // Hero

    document.getElementById("hero-category").innerText =
    news[0].category;

    document.getElementById("hero-title").innerText =
    news[0].title;

    document.getElementById("hero-summary").innerText =
    news[0].summary;

    document.getElementById("hero-image").src =
    news[0].image;

    // Grid

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