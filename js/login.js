import { googleLogin, isAdminUser } from "./auth.js";

const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async () => {
  const user = await googleLogin();

  if (!user) return;

  if (!isAdminUser(user)) {
    alert("Access Denied — sirf admin account se login karein.");
    return;
  }

  window.location.href = "dashboard.html";
});
