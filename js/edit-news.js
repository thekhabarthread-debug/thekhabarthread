import { db } from "./firebase.js";
import { requireAdmin } from "./auth.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

requireAdmin(() => {});

const form = document.getElementById("editForm");
const submitBtn = form.querySelector('button[type="submit"]');
const submitBtnDefaultHTML = submitBtn ? submitBtn.innerHTML : "";

function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    submitBtn.innerHTML = isSubmitting
        ? '<i class="fas fa-spinner fa-spin"></i> Updating...'
        : submitBtnDefaultHTML;
}

let currentImage = "";

async function loadNews() {

    if (!id) {

        alert("News ID Not Found");

        location.href = "all-news.html";

        return;

    }

    try {

        const docRef = doc(db, "news", id);

        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {

            alert("News Not Found");

            location.href = "all-news.html";

            return;

        }

        const news = docSnap.data();

        currentImage = news.image || "";

        document.getElementById("title").value = news.title || "";
        document.getElementById("category").value = news.category || "";
        document.getElementById("summary").value = news.summary || "";
        document.getElementById("content").value = news.content || "";

        document.getElementById("preview").src = currentImage;

        document.getElementById("featured").checked =
            news.featured || false;

        document.getElementById("breaking").checked =
            news.breaking || false;

    }

    catch (error) {

        console.error(error);

        alert("Unable to Load News");

    }

}

loadNews();

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    setSubmitting(true);

    try {

        let image = currentImage;

        const imageFile =
            document.getElementById("image").files[0];

        if (imageFile) {

            if (!imageFile.type.startsWith("image/") || imageFile.size > 5 * 1024 * 1024) {
                alert("कृपया 5 MB से छोटी JPG, PNG या WebP image चुनें।");
                return;
            }

            const formData = new FormData();

            formData.append("file", imageFile);

            formData.append(
                "upload_preset",
                "thekhabarthread"
            );

            const upload = await fetch(
                "https://api.cloudinary.com/v1_1/m9332fjb/image/upload",
                {
                    method: "POST",
                    body: formData
                }
            );

            const imageData = await upload.json();

            if (!imageData.secure_url) {
                console.log(imageData);
                alert("Image upload failed.");
                return;
            }

            image = imageData.secure_url;

        }

        await updateDoc(doc(db, "news", id), {

            title: document.getElementById("title").value,

            category: document.getElementById("category").value,

            summary: document.getElementById("summary").value,

            content: document.getElementById("content").value,

            image: image,

            featured:
                document.getElementById("featured").checked,

            breaking:
                document.getElementById("breaking").checked

        });

        alert("News Updated Successfully");

        location.href = "all-news.html";

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

    finally {

        setSubmitting(false);

    }

});