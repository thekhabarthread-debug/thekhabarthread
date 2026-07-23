import { db } from "./firebase.js";
import { requireAdmin } from "./auth.js";
import { escapeHTML } from "./escape-html.js";

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

    const q = query(
        collection(db, "news"),
        orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    snapshot.forEach((document) => {

        const news = document.data();

        table.innerHTML += `

<tr>

<td>

<img src="${escapeHTML(news.image)}" alt="${escapeHTML(news.title)}">

</td>

<td class="news-title">

${escapeHTML(news.title)}

</td>

<td>

${escapeHTML(news.category)}

</td>

<td>

${escapeHTML(news.date)}

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