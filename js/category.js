import { db } from "./firebase.js";


import {
    
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const category = params.get("name");
console.log("CATEGORY JS LOADED");
console.log("Category =", category);

const title = document.getElementById("category-title");
const count = document.getElementById("category-count");
const grid = document.getElementById("category-news");

async function loadCategoryNews() {

    if (!category) {

        title.innerText = "Category Not Found";
        count.innerText = "";
        return;

    }

    title.innerText = category;

    try {

        const q = query(
            collection(db, "news"),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        console.log("Documents =", snapshot.size);

        grid.innerHTML = "";

        let total = 0;

        snapshot.forEach((doc) => {

            const news = doc.data();

            if (news.category !== category) return;

            total++;

            grid.innerHTML += `

            <div class="category-card">

                <img src="${news.image}" alt="${news.title}">

                <div class="category-content">

                    <span class="category">
                        ${news.category}
                    </span>

                    <h3>
                        ${news.title}
                    </h3>

                    <p>
                        ${news.summary}
                    </p>

                    <a href="news.html?id=${doc.id}" class="read-btn">
                        पूरा पढ़ें →
                    </a>

                </div>

            </div>

            `;

        });

        count.innerText = `${total} Articles`;

        if (total === 0) {

            grid.innerHTML = `

            <div class="empty-state">

                <h2>No News Found</h2>

                <p>इस Category में अभी कोई News उपलब्ध नहीं है।</p>

            </div>

            `;

        }

    }

    catch (error) {

        console.error(error);

        grid.innerHTML = `

        <div class="empty-state">

            <h2>Error Loading News</h2>

            <p>${error.message}</p>

        </div>

        `;

    }

}

loadCategoryNews();

const badge=document.getElementById("category-badge");

if(badge){

badge.innerText=`📰 ${category} News`;

}