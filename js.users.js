// js/users.js
import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const usersList = document.getElementById("usersList");

async function loadUsers() {
  usersList.innerHTML = "";

  const snapshot = await getDocs(collection(db, "users"));

  snapshot.forEach(doc => {
    const data = doc.data();

    const div = document.createElement("div");
    div.textContent = data.username;
    div.style.padding = "8px";
    div.style.borderBottom = "1px solid #333";

    usersList.appendChild(div);
  });
}

loadUsers();
