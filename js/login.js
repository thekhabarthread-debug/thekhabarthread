import { googleLogin } from "./auth.js";

const loginBtn = document.getElementById("loginBtn");

const ADMIN_EMAIL = "thekhabarthread@gmail.com"; // अपना Admin Gmail

loginBtn.addEventListener("click", async () => {

    const user = await googleLogin();

    if (!user) return;

    if (user.email !== ADMIN_EMAIL) {
        alert("Access Denied");
        return;
    }

    alert("Welcome Admin");

    window.location.href = "dashboard.html";

});