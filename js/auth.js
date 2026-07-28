import { app } from "./firebase.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();

export async function googleLogin() {
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.log(error);
    }
}

export async function logout() {
    await signOut(auth);
}