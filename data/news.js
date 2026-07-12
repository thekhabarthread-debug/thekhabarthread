import { db } from "./js/firebase.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const container = document.getElementById("news-details");

console.log("News ID:", id);

async function loadNews() {

    if (!id) {
        container.innerHTML = "<h2>No ID Found</h2>";
        return;
    }

    try {

        const docRef = doc(db, "news", id);

        const docSnap = await getDoc(docRef);

        console.log("Exists:", docSnap.exists());

        if (!docSnap.exists()) {
            container.innerHTML = "<h2>News Not Found</h2>";
            return;
        }

        const news = docSnap.data();

        console.log(news);

        container.innerHTML = `
        <div class="single-news">

            <span class="category">${news.category}</span>

            <h1>${news.title}</h1>

            <p>${news.date}</p>

            <img src="${news.image}" class="single-image">

            <p class="summary">${news.summary}</p>

            <div class="content">${news.content}</div>

            <br>

            <a href="index.html" class="read-btn">← Home</a>

        </div>
        `;

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <h2>Error Loading News</h2>
            <pre>${error.message}</pre>
        `;

    }

}

loadNews();