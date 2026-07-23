import { googleLogin, ADMIN_EMAIL, logout } from "./auth.js";

const loginBtn = document.getElementById("loginBtn");
const errorBox = document.getElementById("loginError");

function showError(message) {
    if (!errorBox) {
        alert(message);
        return;
    }
    errorBox.textContent = message;
    errorBox.hidden = false;
}

loginBtn.addEventListener("click", async () => {

    if (errorBox) errorBox.hidden = true;
    loginBtn.disabled = true;

    try {

        const user = await googleLogin();

        if (!user) return;

        if (user.email !== ADMIN_EMAIL) {
            // Don't leave a denied Google account half signed-in —
            // otherwise it can bounce between pages on refresh.
            await logout();
            showError("Access Denied — yeh Google account admin nahi hai.");
            return;
        }

        window.location.href = "dashboard.html";

    } catch (error) {

        console.error(error);

        if (error.code === "auth/popup-closed-by-user") {
            showError("Login popup band ho gaya. Dubara try karein.");
        } else if (error.code === "auth/popup-blocked") {
            showError("Browser ne popup block kar diya. Popups allow karein aur dubara try karein.");
        } else if (error.code === "auth/network-request-failed") {
            showError("Network error. Internet connection check karein.");
        } else {
            showError("Login fail ho gaya: " + (error.message || "Unknown error"));
        }

    } finally {
        loginBtn.disabled = false;
    }

});
