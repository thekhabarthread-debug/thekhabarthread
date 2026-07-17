/*=========================================
THE KHABAR THREAD
CATEGORY PAGE
PART 1
=========================================*/

import { db } from "./firebase.js";

import {
collection,
getDocs,
query,
where,
orderBy
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/*=========================================
GLOBAL
=========================================*/

const params = new URLSearchParams(window.location.search);

const category = params.get("name");

const title = document.getElementById("category-title");

const count = document.getElementById("category-count");

const grid = document.getElementById("category-news");

/*=========================================
LOAD CATEGORY
=========================================*/

async function loadCategoryNews(){

if(!category){

grid.innerHTML="<h2>Category Not Found</h2>";

return;

}

title.innerText = category;

try{
    console.log("Category:", category);

const q=query(

collection(db,"news"),

where("category","==",category),

orderBy("createdAt","desc")

);

const snapshot=await getDocs(q);
console.log("Total Docs:", snapshot.size);

grid.innerHTML="";

let total=0;

/*=========================================
CATEGORY CARDS
=========================================*/

if(snapshot.empty){

count.innerText="0 Articles";

grid.innerHTML=`

<div class="empty-state">

<h2>

No News Found

</h2>

<p>

इस Category में अभी कोई News उपलब्ध नहीं है।

</p>

</div>

`;

return;

}

snapshot.forEach((doc)=>{

total++;

const news=doc.data();

grid.innerHTML+=`

<div class="category-card">

<img
src="${news.image}"
alt="${news.title}">

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

<a
href="news.html?id=${doc.id}"
class="read-btn">

पूरा पढ़ें →

</a>

</div>

</div>

`;

});

count.innerText=`${total} Articles`;

/*=========================================
END TRY
=========================================*/

}

catch(error){

console.error("Category Error :",error);

grid.innerHTML=`

<div class="empty-state">

<h2>

Error Loading News

</h2>

<p>

${error.message}

</p>

</div>

`;

}

/*=========================================
END FUNCTION
=========================================*/

}

/*=========================================
START
=========================================*/

loadCategoryNews();