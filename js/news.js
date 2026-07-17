/*=========================================
THE KHABAR THREAD
NEWS PAGE
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

const docRef=doc(db,"news",id);

const docSnap=await getDoc(docRef);

if(!docSnap.exists()){

container.innerHTML="<h2>News Not Found</h2>";
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
`https://wa.me/?text=${encodeURIComponent(title + " " + url)}`;

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

await navigator.clipboard.writeText(url);

copy.innerText="✅ Link Copied";

setTimeout(()=>{

copy.innerText="🔗 Copy Link";

},2000);

});

}

return;

}

const news=docSnap.data();

/*=========================================
ARTICLE
=========================================*/

container.innerHTML=`

<div class="single-news">

<span class="category">

${news.category}

</span>

<h1>

${news.title}

</h1>

<p class="news-date">

🗓 ${news.date}

</p>

<img
src="${news.image}"
class="single-image"
alt="${news.title}">

<p class="summary">

${news.summary}

</p>

<div class="content">

${news.content}

</div>

<br>

<a href="index.html" class="read-btn">

← Home

</a>

</div>

`;

/*=========================================
RELATED NEWS
=========================================*/

const q=query(

collection(db,"news"),

orderBy("createdAt","desc")

);

const snapshot=await getDocs(q);

if(relatedBox){

relatedBox.innerHTML="";

snapshot.forEach((item)=>{

if(item.id===id) return;

const data=item.data();

relatedBox.innerHTML+=`

<div class="related-card">

<img
src="${data.image}"
alt="${data.title}">

<div>

<h4>

<a href="news.html?id=${item.id}">

${data.title}

</a>

</h4>

</div>

</div>

`;

});

}

/*=========================================
END TRY
=========================================*/

}

catch(error){

console.error("Error Loading News :",error);

container.innerHTML=`

<h2>

Error Loading News

</h2>

<p>

${error.message}

</p>

`;

}

/*=========================================
END FUNCTION
=========================================*/

}

/*=========================================
START
=========================================*/

loadNews();