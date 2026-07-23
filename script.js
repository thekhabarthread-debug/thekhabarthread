/*==================================================
THE KHABAR THREAD
SCRIPT V3
PART 1
==================================================*/

import { db } from "./js/firebase.js";
import { escapeHTML } from "./js/escape-html.js";

import {
collection,
getDocs,
query,
orderBy,
where,
limit
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/*====================================
GLOBAL
====================================*/

let news = [];

const heroImage = document.getElementById("hero-image");
const heroTitle = document.getElementById("hero-title");
const heroSummary = document.getElementById("hero-summary");
const heroCategory = document.getElementById("hero-category");
const heroRead = document.getElementById("hero-read");
const breakingBar = document.getElementById("breaking-bar");

/*====================================
LOAD NEWS
====================================*/

async function loadNews(){

try{

const q=query(

collection(db,"news"),

orderBy("createdAt","desc"),
limit(50)

);

const snapshot=await getDocs(q);

news=[];

snapshot.forEach((doc)=>{

news.push({

id:doc.id,

...doc.data()

});

});

if(news.length===0){

const grid=document.getElementById("news-grid");

if(grid){

grid.innerHTML="<h2>No News Found</h2>";

}

return;

}

/*====================================
HERO
====================================*/

const hero=news.find(item=>item.featured===true) || news[0];

heroImage.onload=()=>{
    heroImage.classList.remove("hero-loading");
};

heroImage.src=hero.image;

heroImage.alt=hero.title;

heroTitle.innerText=hero.title;

heroSummary.innerText=hero.summary;

heroCategory.innerText=hero.category;

heroRead.href=`news.html?id=${hero.id}`;

/*====================================
BREAKING
====================================*/

const breaking=news.find(item=>item.breaking===true);

if(breaking && breakingBar){

breakingBar.textContent="🔴 "+breaking.title;

}

/*====================================
TOP STORIES
====================================*/

const topStories=document.getElementById("top-stories");

if(topStories){

topStories.innerHTML="";

news
.filter(item=>item.id!==hero.id)
.slice(0,4)
.forEach(item=>{

topStories.innerHTML+=`

<div class="side-card">

<img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.title)}" loading="lazy" decoding="async">

<div>

<span>

${escapeHTML(item.category)}

</span>

<h4>

<a href="news.html?id=${encodeURIComponent(item.id)}">

${escapeHTML(item.title)}

</a>

</h4>

</div>

</div>

`;

});

}

/*====================================
LATEST NEWS
====================================*/

const newsGrid=document.getElementById("news-grid");

if(newsGrid){

newsGrid.innerHTML="";

news.slice(0,12).forEach(item=>{

newsGrid.innerHTML+=`

<div class="card fade-up">

<img
src="${escapeHTML(item.image)}"
class="card-image"
alt="${escapeHTML(item.title)}"
loading="lazy"
decoding="async">

<div class="card-content">

<span class="card-category">

${escapeHTML(item.category)}

</span>

<h3>

${escapeHTML(item.title)}

</h3>

<p>

${escapeHTML(item.summary)}

</p>

<a
href="news.html?id=${encodeURIComponent(item.id)}"
class="read-btn">

पूरा पढ़ें →

</a>

</div>

</div>

`;

});

}

/*====================================
CATEGORY FUNCTION
====================================*/

function loadCategory(category,id){

const box=document.getElementById(id);

if(!box) return;

box.innerHTML="";

news
.filter(item=>item.category===category)
.slice(0,4)
.forEach(item=>{

box.innerHTML+=`

<div class="category-card fade-up">

<img
src="${escapeHTML(item.image)}"
alt="${escapeHTML(item.title)}"
loading="lazy"
decoding="async">

<div class="category-content">

<h3>

${escapeHTML(item.title)}

</h3>

<p>

${escapeHTML(item.summary)}

</p>

<a
href="news.html?id=${encodeURIComponent(item.id)}"
class="view-more">

पूरा पढ़ें →

</a>

</div>

</div>

`;

});

}

/*====================================
LOAD ALL CATEGORIES
====================================*/

loadCategory("भारत","india-news");

loadCategory("उत्तर प्रदेश","up-news");

loadCategory("दुनिया","world-news");

loadCategory("राजनीति","politics-news");

loadCategory("खेल","sports-news");

loadCategory("टेक","tech-news");

/*====================================
HOMEPAGE AD
====================================*/

const adBox=document.getElementById("homepage-ad");

if(adBox){

const adQuery=query(

collection(db,"ads"),

where("active","==",true),

where("position","==","homepage")

);

const adSnap=await getDocs(adQuery);

if(!adSnap.empty){

const ad=adSnap.docs[0].data();

adBox.innerHTML=`

<a
href="${escapeHTML(ad.link)}"
target="_blank"
rel="noopener noreferrer sponsored"
class="homepage-ad">

<img
src="${escapeHTML(ad.image)}"
alt="${escapeHTML(ad.title)}"
loading="lazy"
decoding="async">

</a>

`;

}

}

/*====================================
END TRY
====================================*/

}

catch(error){

console.error("Error Loading News :",error);

}

} // <-- loadNews() function ends here

/*====================================
START APP
====================================*/

loadNews();
/*====================================
LIVE SEARCH
====================================*/

const searchBox=document.getElementById("searchInput");

if(searchBox){

searchBox.addEventListener("input",()=>{

const value=searchBox.value.toLowerCase();

const cards=document.querySelectorAll("#news-grid .card");

let found=0;

cards.forEach(card=>{

const title=card.querySelector("h3").innerText.toLowerCase();

const text=card.innerText.toLowerCase();

if(title.includes(value) || text.includes(value)){

card.style.display="block";

found++;

}else{

card.style.display="none";

}

});

const old=document.getElementById("no-search-result");

if(old) old.remove();

if(found===0){

const div=document.createElement("div");

div.id="no-search-result";

div.className="empty-state";

div.innerHTML=`

<h2>No News Found</h2>

<p>कोई समाचार नहीं मिला।</p>

`;

document.getElementById("news-grid").appendChild(div);

}

});

}
