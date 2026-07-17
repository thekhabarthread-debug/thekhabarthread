import { db } from "./firebase.js";

import {
collection,
addDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

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

const formData=new FormData();

formData.append("file",imageFile);

formData.append("upload_preset","thekhabarthread");

const uploadResponse = await fetch(

"https://api.cloudinary.com/v1_1/m9332fjb/image/upload",

{

method:"POST",

body:formData

}

);

const imageData = await uploadResponse.json();

if(!imageData.secure_url){

alert("Image Upload Failed");

console.log(imageData);

return;

}

const image=imageData.secure_url;

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