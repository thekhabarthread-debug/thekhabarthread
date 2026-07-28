import { db } from "./firebase.js";
import { auth } from "./auth.js";

import {
collection,
addDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const ADMIN_EMAIL = "thekhabarthread@gmail.com";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Aap login nahi hain. Login page par bhej rahe hain.");
    window.location.href = "login.html";
    return;
  }
  if (user.email !== ADMIN_EMAIL) {
    alert("Access Denied");
    window.location.href = "login.html";
  }
});

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