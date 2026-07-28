import { db } from "./firebase.js";
import { requireAdmin } from "./auth.js";

import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

requireAdmin(() => {
  loadNews();
});

const table = document.getElementById("newsTable");

async function loadNews() {

    table.innerHTML = "";

    let snapshot;
    try {
      const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
      snapshot = await getDocs(q);
    } catch (e) {
      console.warn("orderBy failed, fallback:", e);
      snapshot = await getDocs(collection(db, "news"));
    }

    snapshot.forEach((document) => {

        const news = document.data();

        table.innerHTML += `

<tr>

<td>

<img src="${news.image}" alt="${news.title}">

</td>

<td class="news-title">

${news.title}

</td>

<td>

${news.category}

</td>

<td>

${news.date}

</td>

<td class="views-count">

<i class="fas fa-eye"></i> ${news.views || 0}

</td>

<td>

<button
class="action-btn edit-btn"
onclick="editNews('${document.id}')">

Edit

</button>

<button
class="action-btn delete-btn"
onclick="deleteNews('${document.id}')">

Delete

</button>

</td>

</tr>

`;

    });

}

window.deleteNews = async function(id){

const ok = confirm("Delete this News?");

if(!ok) return;

await deleteDoc(doc(db,"news",id));

loadNews();

}

window.editNews = function(id){

location.href="edit-news.html?id="+id;

}

