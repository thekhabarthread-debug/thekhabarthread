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

// Single source of truth for the admin account, so it's not
// hardcoded separately (and easy to typo) in every admin page.
export const ADMIN_EMAIL = "thekhabarthread@gmail.com";

export async function googleLogin() {
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function logout() {
    await signOut(auth);
}

// Shared guard for every admin page: redirects to login if signed
// out, and — unlike the old per-page checks — actually signs a
// denied (non-admin) account out instead of leaving it half
// authenticated. onReady(user) runs only once access is confirmed.
export function requireAdmin(onReady) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    if (user.email !== ADMIN_EMAIL) {
      alert("Access Denied");
      await signOut(auth);
      window.location.href = "login.html";
      return;
    }

    onReady(user);
  });
}