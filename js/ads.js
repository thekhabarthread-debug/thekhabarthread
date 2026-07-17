import { db } from "./firebase.js";

import {
collection,
getDocs,
query,
orderBy
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/*=========================================
LOAD ADS
=========================================*/

const table=document.getElementById("adsTable");

async function loadAds(){

try{

const q=query(

collection(db,"ads"),

orderBy("createdAt","desc")

);

const snapshot=await getDocs(q);

table.innerHTML="";

if(snapshot.empty){

table.innerHTML=`

<tr>

<td colspan="5">

No Advertisements Found

</td>

</tr>

`;

return;

}

snapshot.forEach((doc)=>{

const ad=doc.data();

table.innerHTML+=`

<tr>

<td>

<img
src="${ad.image}"
style="width:120px;border-radius:8px;">

</td>

<td>

${ad.title}

</td>

<td>

${ad.position}

</td>

<td>

${ad.active ? "🟢 Active" : "🔴 Inactive"}

</td>

<td>

<button
class="read-btn edit-btn"
data-id="${doc.id}">

Edit

</button>

<button
class="delete-btn"
data-id="${doc.id}">

Delete

</button>

</td>

</tr>

`;

});

}

catch(error){

console.error(error);

table.innerHTML=`

<tr>

<td colspan="5">

${error.message}

</td>

</tr>

`;

}

}

/*=========================================
START
=========================================*/

loadAds();

