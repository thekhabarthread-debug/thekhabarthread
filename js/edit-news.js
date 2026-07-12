import { db } from "./firebase.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const form = document.getElementById("editForm");

let currentImage = "";

document.getElementById("featured").checked =
news.featured || false;

document.getElementById("breaking").checked =
news.breaking || false;

async function loadNews() {

    const docRef = doc(db, "news", id);

    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {

        alert("News Not Found");

        location.href = "all-news.html";

        return;

    }

    const news = docSnap.data();

    currentImage = news.image;

    document.getElementById("title").value = news.title;
    document.getElementById("category").value = news.category;
    document.getElementById("summary").value = news.summary;
    document.getElementById("content").value = news.content;

    document.getElementById("preview").src = news.image;

}

loadNews();

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    let image = currentImage;

    const imageFile = document.getElementById("image").files[0];

    if(imageFile){

        const formData = new FormData();

        formData.append("file", imageFile);

        formData.append("upload_preset", "thekhabarthread");

        const upload = await fetch(
            "https://api.cloudinary.com/v1_1/m9332fjb/image/upload",
            {
                method:"POST",
                body:formData
            }
        );

        const imageData = await upload.json();

        image = imageData.secure_url;

    }

   await updateDoc(doc(db,"news",id),{

title:document.getElementById("title").value,

category:document.getElementById("category").value,

summary:document.getElementById("summary").value,

content:document.getElementById("content").value,

image:image,

featured:document.getElementById("featured").checked,

breaking:document.getElementById("breaking").checked

});