import { db } from "./firebase.js";
import { requireAdmin } from "./auth.js";

import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

requireAdmin(() => {});

const form = document.getElementById("newsForm");
const submitBtn = form.querySelector('button[type="submit"]');
const submitBtnDefaultHTML = submitBtn ? submitBtn.innerHTML : "";

function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    submitBtn.innerHTML = isSubmitting
        ? '<i class="fas fa-spinner fa-spin"></i> Publishing...'
        : submitBtnDefaultHTML;
}

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

    setSubmitting(true);

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

    finally {

        setSubmitting(false);

    }

});
