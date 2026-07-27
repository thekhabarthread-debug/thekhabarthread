/*=========================================
THE KHABAR THREAD
NEWS PAGE V2
PART 1
=========================================*/

import { db } from "./firebase.js";
import { escapeHTML } from "./escape-html.js";
import { renderContentWithEmbeds } from "./content-embeds.js";
import { optimizedImageUrl } from "./image-utils.js";

import {
doc,
getDoc,
collection,
getDocs,
query,
where,
limit
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

// Analytics is the source of truth for article views. Firestore
// counters are not writable by public visitors, preventing fake views.
if (typeof window.gtag === "function") {
window.gtag("event","article_view",{article_id:id,article_title:news.title});
}

const schema=document.getElementById("news-schema");

if(schema){

schema.textContent=JSON.stringify({

"@context":"https://schema.org",

"@type":"NewsArticle",

headline:news.title,

image:[optimizedImageUrl(news.image,1200,"social")],

datePublished:new Date(news.createdAt || Date.now()).toISOString(),

dateModified:new Date(news.updatedAt || news.createdAt || Date.now()).toISOString(),

description:news.summary,

author:{

"@type":"Organization",

name:"The Khabar Thread"

},

publisher:{

"@type":"Organization",

name:"The Khabar Thread",

logo:{

"@type":"ImageObject",

url:"https://thekhabarthread.in/assets/logo.png"

}

}

}).replace(/</g,"\\u003c");

}

/*=========================================
DYNAMIC SEO
=========================================*/

document.title = `${news.title} | The Khabar Thread`;

const metaDescription = document.querySelector(
'meta[name="description"]'
);

if(metaDescription){

metaDescription.setAttribute(

"content",

news.summary || ""

);

}

const canonical = document.getElementById("canonical-link");

if(canonical){

canonical.href = `https://thekhabarthread.in/news.html?id=${encodeURIComponent(id)}`;

}

const ogTitle=document.getElementById("og-title");
const ogDescription=document.getElementById("og-description");
const ogImage=document.getElementById("og-image");
const ogUrl=document.getElementById("og-url");

if(ogTitle){

ogTitle.content=news.title;

}

if(ogDescription){

ogDescription.content=news.summary;

}

if(ogImage){

ogImage.content=optimizedImageUrl(news.image,1200,"social");

}

if(ogUrl){

ogUrl.content=`https://thekhabarthread.in/news.html?id=${encodeURIComponent(id)}`;

}

const twitterTitle=document.getElementById("twitter-title");
const twitterDescription=document.getElementById("twitter-description");
const twitterImage=document.getElementById("twitter-image");

if(twitterTitle){

twitterTitle.content=news.title;

}

if(twitterDescription){

twitterDescription.content=news.summary;

}

if(twitterImage){

twitterImage.content=optimizedImageUrl(news.image,1200,"social");

}

/*=========================================
ARTICLE
=========================================*/

container.innerHTML = `

<div class="single-news">

<div class="news-meta">

<span class="category">

${escapeHTML(news.category)}

</span>

<span class="news-date">

🗓 ${escapeHTML(news.date)}

</span>

</div>

<h1>

${escapeHTML(news.title)}

</h1>

<div class="share-buttons">

<button id="copyLink" class="share-btn copy">

<i class="fa-solid fa-link"></i>

</button>

<a
id="shareWhatsapp"
class="share-btn whatsapp"
target="_blank"
rel="noopener noreferrer">

<i class="fa-brands fa-whatsapp"></i>

</a>

<a
id="shareFacebook"
class="share-btn facebook"
target="_blank"
rel="noopener noreferrer">

<i class="fa-brands fa-facebook-f"></i>

</a>

<a
id="shareTwitter"
class="share-btn twitter"
target="_blank"
rel="noopener noreferrer">

<i class="fa-brands fa-x-twitter"></i>

</a>

</div>

<img
src="${escapeHTML(optimizedImageUrl(news.image,1600))}"
alt="${escapeHTML(news.title)}"
class="single-image" width="1200" height="675" fetchpriority="high">

<div class="summary">

${escapeHTML(news.summary)}

</div>

<div class="content">

${renderContentWithEmbeds(news.content)}

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

where("category","==",news.category),

limit(20)

);

const snapshot = await getDocs(q);

if(relatedBox){

relatedBox.innerHTML="";

let count = 0;

const relatedDocuments = [...snapshot.docs].sort(
(a,b)=>(b.data().createdAt || 0)-(a.data().createdAt || 0)
);

relatedDocuments.forEach((item)=>{

if(item.id===id) return;

const data=item.data();
if(count>=5) return;

count++;

relatedBox.innerHTML += `

<a
href="news.html?id=${encodeURIComponent(item.id)}"
class="related-card">

<img
src="${escapeHTML(optimizedImageUrl(data.image,480))}"
alt="${escapeHTML(data.title)}"
loading="lazy"
decoding="async">

<div class="related-info">

<span class="related-category">

${escapeHTML(data.category)}

</span>

<h4>

${escapeHTML(data.title)}

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

${escapeHTML(error.message)}

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
