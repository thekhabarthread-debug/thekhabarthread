import { db } from "./firebase.js";
import { requireAdmin } from "./auth.js";

import {
collection,
addDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

requireAdmin(() => {});

const form=document.getElementById("adForm");
const submitBtn = form.querySelector('button[type="submit"]');
const submitBtnDefaultHTML = submitBtn ? submitBtn.innerHTML : "";

function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    submitBtn.innerHTML = isSubmitting ? "Saving..." : submitBtnDefaultHTML;
}

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

if(!imageFile.type.startsWith("image/") || imageFile.size > 5 * 1024 * 1024){

alert("Please select an image under 5 MB.");

return;

}

setSubmitting(true);

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

finally{

setSubmitting(false);

}

});