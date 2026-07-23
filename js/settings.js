import { requireAdmin, logout } from "./auth.js";
import { app } from "./firebase.js";

const logoutBtn = document.getElementById("logoutBtn");
const logoutBtn2 = document.getElementById("logoutBtn2");

requireAdmin((user) => {

    document.getElementById("profileName").textContent =
        user.displayName || "Admin";

    document.getElementById("profileEmail").textContent = user.email;

    document.getElementById("firebaseProjectId").textContent =
        app.options.projectId || "—";

    const photo = document.getElementById("profilePhoto");
    const fallback = document.getElementById("profilePhotoFallback");

    if (user.photoURL) {
        photo.src = user.photoURL;
        photo.hidden = false;
        fallback.hidden = true;
    }

});

async function doLogout() {
    await logout();
    window.location.href = "login.html";
}

if (logoutBtn) logoutBtn.addEventListener("click", doLogout);
if (logoutBtn2) logoutBtn2.addEventListener("click", doLogout);
