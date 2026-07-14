/*====================================================

THE KHABAR THREAD
SCRIPT PART 1

Firebase + Hero + Breaking

====================================================*/

import { db } from "./js/firebase.js";

import {

collection,

getDocs,

query,

orderBy

} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/*========================
LOAD NEWS
========================*/

async function loadNews(){

try{

const q=query(

collection(db,"news"),

orderBy("createdAt","desc")

);

const snapshot=await getDocs(q);

const news=[];

snapshot.forEach((doc)=>{

news.push({

id:doc.id,

...doc.data()

});

});

if(news.length===0){

document.getElementById("news-grid").innerHTML=

"<h2>No News Found</h2>";

return;

}

/*========================
HERO
========================*/

const heroNews=

news.find(item=>item.featured===true)

||

news[0];

document.getElementById("hero-category").innerText=

heroNews.category;

document.getElementById("hero-title").innerText=

heroNews.title;

document.getElementById("hero-summary").innerText=

heroNews.summary;

document.getElementById("hero-image").src=

heroNews.image;

document.getElementById("hero-read").href=

`news.html?id=${heroNews.id}`;

/*========================
BREAKING
========================*/

const breaking=

news.find(item=>item.breaking===true);

if(

breaking &&

document.getElementById("breaking-bar")

){

document.getElementById("breaking-bar").innerText=

"🔴 "+breaking.title;

}

/*====================================================

SCRIPT PART 2

Top Stories + Latest News

====================================================*/

/*========================
TOP STORIES
========================*/

const topStories=document.getElementById("top-stories");

if(topStories){

topStories.innerHTML="";

news
.filter(item=>item.id!==heroNews.id)
.slice(0,4)
.forEach(item=>{

topStories.innerHTML+=`

<div class="side-card">

<img src="${item.image}" alt="${item.title}">

<div>

<span>

${item.category}

</span>

<h4>

<a href="news.html?id=${item.id}">

${item.title}

</a>

</h4>

</div>

</div>

`;

});

}

/*========================
LATEST NEWS
========================*/

const grid=document.getElementById("news-grid");

if(grid){

grid.innerHTML="";

news.forEach(item=>{

grid.innerHTML+=`

<div class="card fade-up">

<img

src="${item.image}"

class="card-image"

alt="${item.title}">

<div class="card-content">

<span class="card-category">

${item.category}

</span>

<h3>

${item.title}

</h3>

<p>

${item.summary}

</p>

<a

href="news.html?id=${item.id}"

class="read-btn">

पूरा पढ़ें →

</a>

</div>

</div>

`;

});

}
/*====================================================

SCRIPT PART 3

Category Sections

====================================================*/

/*========================
CATEGORY FUNCTION
========================*/

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

<img src="${item.image}" alt="${item.title}">

<div class="category-content">

<h3>

${item.title}

</h3>

<p>

${item.summary}

</p>

<a

href="news.html?id=${item.id}"

class="view-more">

पूरा पढ़ें →

</a>

</div>

</div>

`;

});

}

/*========================
LOAD CATEGORIES
========================*/

loadCategory("भारत","india-news");

loadCategory("उत्तर प्रदेश","up-news");

loadCategory("दुनिया","world-news");

loadCategory("राजनीति","politics-news");

loadCategory("खेल","sports-news");

loadCategory("टेक","tech-news");

/*========================
END TRY
========================*/

}

catch(error){

console.error("Error Loading News :",error);

}

/*========================
START
========================*/

loadNews();

}