import { googleLogin, isAdminUser, logout } from "./auth.js";

const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async () => {
  loginBtn.disabled = true;
  try {
    const user = await googleLogin();
    if (!isAdminUser(user)) {
      await logout();
      alert("इस Google account को admin access नहीं है।");
      return;
    }
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Login failed", error);
    alert(error.message || "Login नहीं हो पाया।");
  } finally {
    loginBtn.disabled = false;
  }
});
