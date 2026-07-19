import { db } from "./firebase.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const form = document.getElementById("editAdForm");

let currentImage = "";

async function loadAd() {

    if (!id) {

        alert("Advertisement ID Not Found");

        location.href = "ads.html";

        return;

    }

    try {

        const docRef = doc(db, "ads", id);

        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {

            alert("Advertisement Not Found");

            location.href = "ads.html";

            return;

        }

        const ad = docSnap.data();

        currentImage = ad.image || "";

        document.getElementById("title").value = ad.title || "";
        document.getElementById("link").value = ad.link || "";
        document.getElementById("position").value = ad.position || "homepage";
        document.getElementById("active").checked = ad.active || false;

        document.getElementById("preview").src = currentImage;

    }

    catch (error) {

        console.error(error);

        alert("Unable to Load Advertisement");

    }

}

loadAd();

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

        let image = currentImage;

        const imageFile = document.getElementById("image").files[0];

        if (imageFile) {

            const formData = new FormData();

            formData.append("file", imageFile);

            formData.append("upload_preset", "thekhabarthread");

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

        await updateDoc(doc(db, "ads", id), {

            title: document.getElementById("title").value,

            link: document.getElementById("link").value,

            position: document.getElementById("position").value,

            active: document.getElementById("active").checked,

            image: image

        });

        alert("Advertisement Updated Successfully");

        location.href = "ads.html";

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

});
