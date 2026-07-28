import { app } from "./firebase.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

const ADMIN_EMAIL = "thekhabarthread@gmail.com";

/** True if this Firebase user is the site admin. */
export function isAdminUser(user) {
  if (!user || !user.email) return false;
  return user.email === ADMIN_EMAIL;
}

export async function googleLogin() {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google login error:", error);
    const code = error && error.code ? error.code : "";
    const msg = error && error.message ? error.message : String(error);

    if (code === "auth/popup-blocked") {
      alert("Popup block ho gaya. Browser mein popups allow karo, phir try karo.");
    } else if (code === "auth/popup-closed-by-user") {
      alert("Login window band kar diya gaya. Dobara try karo.");
    } else if (code === "auth/unauthorized-domain") {
      alert(
        "Domain Firebase mein authorized nahi hai.\nAuthentication → Settings → Authorized domains mein thekhabarthread.in add karo."
      );
    } else if (code === "auth/operation-not-allowed") {
      alert(
        "Google sign-in enable nahi hai.\nAuthentication → Sign-in method → Google → Enable."
      );
    } else {
      alert("Login fail: " + (code || msg));
    }
    return null;
  }
}


import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

/**
 * Ensures the visitor is the admin. Redirects to login otherwise.
 * Calls callback(user) when admin is confirmed.
 */
export function requireAdmin(callback) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    if (!isAdminUser(user)) {
      alert("Access Denied");
      window.location.href = "login.html";
      return;
    }
    if (typeof callback === "function") callback(user);
  });
}

export async function logout() {
  await signOut(auth);
}
