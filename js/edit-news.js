import { db } from "./firebase.js";
import { requireAdmin } from "./auth.js";
import { attachImagePaste } from "./paste-image-upload.js";
import { uploadImage } from "./cloudinary-upload.js";

import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  writeBatch
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

requireAdmin();

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
            image = await uploadImage(imageFile);

        }

        const featured = document.getElementById("featured").checked;
        const breaking = document.getElementById("breaking").checked;

        await updateDoc(doc(db, "news", id), {

            title: document.getElementById("title").value,

            category: document.getElementById("category").value,

            summary: document.getElementById("summary").value,

            content: document.getElementById("content").value,

            image: image,

            featured,

            breaking,

            updatedAt: Date.now()

        });

        if (featured) await keepOnlyOneFlag("featured", id);
        if (breaking) await keepOnlyOneFlag("breaking", id);

        alert("News Updated Successfully");

        location.href = "all-news.html";

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

});

async function keepOnlyOneFlag(field, keepId) {
    const snapshot = await getDocs(query(collection(db, "news"), where(field, "==", true)));
    const batch = writeBatch(db);
    let changes = 0;
    snapshot.forEach((item) => {
        if (item.id === keepId) return;
        batch.update(item.ref, { [field]: false, updatedAt: Date.now() });
        changes++;
    });
    if (changes) await batch.commit();
}
