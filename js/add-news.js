import { db } from "./firebase.js";
import { requireAdmin } from "./auth.js";
import { attachImagePaste } from "./paste-image-upload.js";
import { uploadImage } from "./cloudinary-upload.js";

import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

requireAdmin();

attachImagePaste(document.getElementById("content"));

const form = document.getElementById("newsForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const title = document.getElementById("title").value;
    const category = document.getElementById("category").value;
    const summary = document.getElementById("summary").value;
    const content = document.getElementById("content").value;

    const imageFile = document.getElementById("image").files[0];

    try {
        const image = await uploadImage(imageFile);
        const now = Date.now();
        const isoNow = new Date(now).toISOString();

        // Save News to Firestore
        await addDoc(collection(db, "news"), {

    title,
    category,
    summary,
    content,
    image,

    featured: false,

    breaking: false,

    date: new Date(now).toLocaleDateString("hi-IN"),
    publishedAt: isoNow,
    createdAt: now,
    updatedAt: now

});
        alert("News Published Successfully ✅");

        form.reset();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

});
