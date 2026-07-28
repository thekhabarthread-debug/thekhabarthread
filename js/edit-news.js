import { db } from "./firebase.js";
import { auth } from "./auth.js";
import { attachImagePaste } from "./paste-image-upload.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const ADMIN_EMAIL = "thekhabarthread@gmail.com";

// Make sure Firebase Auth has actually restored the signed-in
// session on this page before we let the user submit an update.
// Without this, add/edit pages had no Auth instance initialized
// at all, so Firestore writes went out with no identity attached
// and were rejected by the security rules ("Missing or
// insufficient permissions"), even for a correctly logged-in admin.
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

const form = document.getElementById("editForm");

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

    try {

        let image = currentImage;

        const imageFile =
            document.getElementById("image").files[0];

        if (imageFile) {

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

});