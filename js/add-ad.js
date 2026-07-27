import { db } from "./firebase.js";
import { requireAdmin } from "./auth.js";
import { uploadImage } from "./cloudinary-upload.js";

import {
collection,
addDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

requireAdmin();

const form=document.getElementById("adForm");

form.addEventListener("submit",async(e)=>{

e.preventDefault();

const title=document.getElementById("title").value;

const link=document.getElementById("link").value;

const position=document.getElementById("position").value;

const active=document.getElementById("active").checked;

const imageFile=document.getElementById("image").files[0];

if(!imageFile){

alert("Select Advertisement Image");

return;

}

try{

const image = await uploadImage(imageFile);

/*====================================
SAVE AD
====================================*/

await addDoc(

collection(db,"ads"),

{

title,

image,

link,

position,

active,

createdAt:Date.now()

}

);

alert("Advertisement Added Successfully ✅");

form.reset();

}

catch(error){

console.error(error);

alert(error.message);

}

});
