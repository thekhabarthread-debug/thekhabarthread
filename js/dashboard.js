import { auth, logout } from "./auth.js";
import { db } from "./firebase.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const ADMIN_EMAIL = "thekhabarthread@gmail.com";

const logoutBtn = document.getElementById("logoutBtn");

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    if (user.email !== ADMIN_EMAIL) {
        alert("Access Denied");
        window.location.href = "login.html";
        return;
    }

    console.log("Admin Login Successful");

    loadStats();

});

async function loadStats(){

const snapshot = await getDocs(collection(db,"news"));

let total = 0;
let featured = 0;
let breaking = 0;

const categories = new Set();

snapshot.forEach((doc)=>{

const news = doc.data();

total++;

if(news.featured === true){

featured++;

}

if(news.breaking === true){

breaking++;

}

if(news.category){

categories.add(news.category);

}

});

document.getElementById("totalNews").innerText = total;
document.getElementById("featuredNews").innerText = featured;
document.getElementById("breakingNews").innerText = breaking;
document.getElementById("totalCategory").innerText = categories.size;

}

logoutBtn.addEventListener("click", async () => {

    await logout();

    window.location.href = "login.html";

});