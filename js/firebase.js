import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyDX-1DUOIoKEUUw_Nwj_A4N54Q48Aec2EQ",
  authDomain: "the-khabar-thread.firebaseapp.com",
  projectId: "the-khabar-thread",
  storageBucket: "the-khabar-thread.firebasestorage.app",
  messagingSenderId: "1035108939429",
  appId: "1:1035108939429:web:e1192a467fd69e58f2ff4c"
};

export const app = initializeApp(firebaseConfig);