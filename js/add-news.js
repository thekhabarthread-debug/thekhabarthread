import { db } from "./firebase.js";
import { auth } from "./auth.js";
import { attachImagePaste } from "./paste-image-upload.js";

import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const ADMIN_EMAIL = "thekhabarthread@gmail.com";

// Same fix as edit-news.js: this page never initialized Firebase
// Auth before, so writes had no identity attached and were
// rejected by the security rules.
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

attachImagePaste(document.getElementById("content"));

const form = document.getElementById("newsForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const title = document.getElementById("title").value;
    const category = document.getElementById("category").value;
    const summary = document.getElementById("summary").value;
    const content = document.getElementById("content").value;

    const imageFile = document.getElementById("image").files[0];

    if (!imageFile) {
        alert("Please select an image.");
        return;
    }

    if (!imageFile.type.startsWith("image/") || imageFile.size > 5 * 1024 * 1024) {
        alert("कृपया 5 MB से छोटी JPG, PNG या WebP image चुनें।");
        return;
    }

    try {

        // Upload Image to Cloudinary
        const formData = new FormData();

        formData.append("file", imageFile);
        formData.append("upload_preset", "thekhabarthread");

        const uploadResponse = await fetch(
            "https://api.cloudinary.com/v1_1/m9332fjb/image/upload",
            {
                method: "POST",
                body: formData
            }
        );

        const imageData = await uploadResponse.json();

        if (!imageData.secure_url) {
            console.log(imageData);
            alert("Image upload failed.");
            return;
        }

        const image = imageData.secure_url;

        // Save News to Firestore
        await addDoc(collection(db, "news"), {

    title,
    category,
    summary,
    content,
    image,

    featured: false,

    breaking: false,

    date: new Date().toLocaleDateString(),

    createdAt: Date.now()

});
        alert("News Published Successfully ✅");

        form.reset();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

});
