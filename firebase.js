// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDsqaoDlN8-XyHCsGrhaHQkMQBiEwmgk8o",
  authDomain: "vibez-7c71e.firebaseapp.com",
  projectId: "vibez-7c71e",
  storageBucket: "vibez-7c71e.appspot.com",
  messagingSenderId: "544032234117",
  appId: "1:544032234117:web:9200a924e920c99221e7ec",
  measurementId: "G-DQ4GMVLTL7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
