import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const category = params.get("name");

document.getElementById("category-title").innerText =
category + " News";

async function loadCategoryNews() {

    try {

        const q = query(
            collection(db, "news"),
            where("category", "==", category),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        const grid = document.getElementById("category-news");

        grid.innerHTML = "";

        if (snapshot.empty) {

            grid.innerHTML =
            "<h2>No News Found</h2>";

            return;

        }

        snapshot.forEach((doc) => {

            const news = doc.data();

            grid.innerHTML += `

            <div class="card">

                <img src="${news.image}" class="card-image">

                <h3>${news.title}</h3>

                <p>${news.summary}</p>

                <a href="news.html?id=${doc.id}" class="read-btn">

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

loadCategoryNews();