/*=========================================
THE KHABAR THREAD
NEWS PAGE V2
PART 1
=========================================*/

import { db } from "./firebase.js";

import {
doc,
getDoc,
collection,
getDocs,
query,
orderBy
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/*=========================================
GLOBAL
=========================================*/

const params = new URLSearchParams(window.location.search);

const id = params.get("id");

const container = document.getElementById("news-details");

const relatedBox = document.getElementById("related-news");

/*=========================================
LOAD NEWS
=========================================*/

async function loadNews(){

if(!id){

container.innerHTML="<h2>News Not Found</h2>";

return;

}

try{

const docRef = doc(db,"news",id);

const docSnap = await getDoc(docRef);

if(!docSnap.exists()){

container.innerHTML="<h2>News Not Found</h2>";

return;

}

const news = docSnap.data();

/*=========================================
ARTICLE
=========================================*/

container.innerHTML = `

<div class="single-news">

<div class="news-meta">

<span class="category">

${news.category}

</span>

<span class="news-date">

🗓 ${news.date}

</span>

</div>

<h1>

${news.title}

</h1>

<div class="share-buttons">

<button id="copyLink" class="share-btn copy">

<i class="fa-solid fa-link"></i>

</button>

<a
id="shareWhatsapp"
class="share-btn whatsapp"
target="_blank">

<i class="fa-brands fa-whatsapp"></i>

</a>

<a
id="shareFacebook"
class="share-btn facebook"
target="_blank">

<i class="fa-brands fa-facebook-f"></i>

</a>

<a
id="shareTwitter"
class="share-btn twitter"
target="_blank">

<i class="fa-brands fa-x-twitter"></i>

</a>

</div>

<img
src="${news.image}"
alt="${news.title}"
class="single-image">

<div class="summary">

${news.summary}

</div>

<div class="content">

<p>

${String(news.content || "")
.replace(/\n\s*\n/g,"</p><p>")
.replace(/\n/g,"<br>")}

</p>

</div>

<a
href="index.html"
class="read-btn">

← Home

</a>

</div>

`;

/*=========================================
SHARE BUTTONS
=========================================*/

const url = window.location.href;

const title = news.title;

const whatsapp = document.getElementById("shareWhatsapp");
const facebook = document.getElementById("shareFacebook");
const twitter = document.getElementById("shareTwitter");
const copy = document.getElementById("copyLink");

if(whatsapp){

whatsapp.href =
`https://wa.me/?text=${encodeURIComponent(title + "\n" + url)}`;

}

if(facebook){

facebook.href =
`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

}

if(twitter){

twitter.href =
`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;

}

if(copy){

copy.addEventListener("click",async()=>{

try{

await navigator.clipboard.writeText(url);

copy.innerHTML='<i class="fa-solid fa-check"></i>';

setTimeout(()=>{

copy.innerHTML='<i class="fa-solid fa-link"></i>';

},2000);

}catch(e){

alert("Link Copy Failed");

}

});

}

/*=========================================
RELATED NEWS
=========================================*/

const q = query(

collection(db,"news"),

orderBy("createdAt","desc")

);

const snapshot = await getDocs(q);

if(relatedBox){

relatedBox.innerHTML="";

let count = 0;

snapshot.forEach((item)=>{

if(item.id===id) return;

if(count>=5) return;

count++;

const data=item.data();

relatedBox.innerHTML += `

<a
href="news.html?id=${item.id}"
class="related-card">

<img
src="${data.image}"
alt="${data.title}">

<div class="related-info">

<span class="related-category">

${data.category}

</span>

<h4>

${data.title}

</h4>

</div>

</a>

`;

});
}

/*=========================================
PAGE SEO
=========================================*/

document.title = `${news.title} | The Khabar Thread`;

const metaDesc = document.querySelector('meta[name="description"]');

if(metaDesc){

metaDesc.setAttribute(

"content",

news.summary || news.title

);

}

/*=========================================
SCROLL TOP
=========================================*/

window.scrollTo({

top:0,

behavior:"smooth"

});

/*=========================================
END TRY
=========================================*/

}

catch(error){

console.error("News Loading Error :",error);

container.innerHTML = `

<div class="empty-state">

<h2>

Error Loading News

</h2>

<p>

${error.message}

</p>

<a href="index.html" class="read-btn">

← Back to Home

</a>

</div>

`;

}

/*=========================================
END FUNCTION
=========================================*/

}

/*=========================================
START APP
=========================================*/

loadNews();