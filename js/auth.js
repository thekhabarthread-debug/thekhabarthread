import { app } from "./firebase.js";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const ADMIN_EMAIL = "thekhabarthread@gmail.com";

provider.setCustomParameters({ prompt: "select_account" });

export async function googleLogin() {
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function logout() {
  await signOut(auth);
}

export function isAdminUser(user) {
  return Boolean(
    user &&
    user.email === ADMIN_EMAIL &&
    user.emailVerified === true &&
    user.providerData.some((identity) => identity.providerId === "google.com"),
  );
}

export function requireAdmin(onReady) {
  return onAuthStateChanged(auth, async (user) => {
    if (!isAdminUser(user)) {
      if (user) await signOut(auth);
      window.location.replace("login.html");
      return;
    }
    if (typeof onReady === "function") onReady(user);
  });
}
