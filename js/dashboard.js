import { auth, logout } from "./auth.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const ADMIN_EMAIL = "thekhabarthread@gmail.com";   // अपना Admin Gmail

const logoutBtn = document.getElementById("logoutBtn");

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    if (user.email !== ADMIN_EMAIL) {
        alert("Access Denied");
        window.location.href = "login.html";
        return;
    }

    console.log("Admin Login Successful");

});

logoutBtn.addEventListener("click", async () => {

    await logout();

    window.location.href = "login.html";

});