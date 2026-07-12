import { googleLogin } from "./auth.js";

const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async () => {

    const user = await googleLogin();

    if (!user) return;

    alert("Welcome " + user.displayName);

    console.log(user);

});