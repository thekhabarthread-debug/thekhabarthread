import { db } from "./js/firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy
}
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const newsRef = collection(db, "news");

const q = query(newsRef, orderBy("createdAt", "desc"));

const snapshot = await getDocs(q);

const news = [];

snapshot.forEach((doc) => {

    news.push(doc.data());

});

// HERO

document.getElementById("hero-category").innerText = news[0].category;

document.getElementById("hero-title").innerText = news[0].title;

document.getElementById("hero-summary").innerText = news[0].summary;

document.getElementById("hero-image").src = news[0].image;


// NEWS GRID

const grid = document.getElementById("news-grid");

grid.innerHTML = "";

news.forEach(item => {

grid.innerHTML += `

<div class="card">

<img src="${item.image}" class="card-image">

<h3>${item.title}</h3>

<p>${item.summary}</p>

<a href="#" class="read-btn">

पूरा पढ़ें →

</a>

</div>

`;

});