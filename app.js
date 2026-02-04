// ------------------ FIREBASE SETUP ------------------
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut
} from "firebase/auth";
import {
  getFirestore, collection, addDoc, getDocs, query, where,
  doc, updateDoc, onSnapshot, orderBy, limit
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDsqaoDlN8-XyHCsGrhaHQkMQBiEwmgk8o",
  authDomain: "vibez-7c71e.firebaseapp.com",
  projectId: "vibez-7c71e",
  storageBucket: "vibez-7c71e.firebasestorage.app",
  messagingSenderId: "544032234117",
  appId: "1:544032234117:web:9200a924e920c99221e7ec",
  measurementId: "G-DQ4GMVLTL7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ------------------ AUTH ------------------
export async function register(email, password, username) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await addDoc(collection(db, "users"), {
    uid: user.uid,
    email,
    username,
    createdAt: new Date(),
  });
  return user;
}

export async function login(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export function logout() {
  return signOut(auth);
}

// Monitor auth state
let currentUser = null;
onAuthStateChanged(auth, user => {
  currentUser = user;
  if (user) renderUI();
  else renderLogin();
});

// ------------------ POSTS ------------------
export async function createPost(content, imageFile) {
  if (!currentUser) return;
  let imageUrl = "";
  if (imageFile) {
    const storageRef = ref(storage, `posts/${currentUser.uid}/${Date.now()}_${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    imageUrl = await getDownloadURL(storageRef);
  }
  await addDoc(collection(db, "posts"), {
    uid: currentUser.uid,
    content,
    imageUrl,
    likes: [],
    comments: [],
    createdAt: new Date(),
  });
}

export function onPostsUpdate(callback) {
  const postsRef = collection(db, "posts");
  return onSnapshot(postsRef, snapshot => {
    const posts = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
    callback(posts);
  });
}

export async function likePost(postId) {
  if (!currentUser) return;
  const postRef = doc(db, "posts", postId);
  const postSnap = await getDocs(query(collection(db, "posts"), where("id", "==", postId)));
  const postData = postSnap.docs[0].data();
  const uid = currentUser.uid;
  const updatedLikes = postData.likes.includes(uid)
    ? postData.likes.filter(u => u !== uid)
    : [...postData.likes, uid];
  await updateDoc(postRef, { likes: updatedLikes });
}

export async function commentPost(postId, text) {
  if (!currentUser) return;
  const postRef = doc(db, "posts", postId);
  const postSnap = await getDocs(query(collection(db, "posts"), where("id", "==", postId)));
  const postData = postSnap.docs[0].data();
  await updateDoc(postRef, {
    comments: [...postData.comments, { uid: currentUser.uid, text, createdAt: new Date() }]
  });
}

// ------------------ SUGGESTED USERS ------------------
export async function getSuggestedUsers(limitCount = 5) {
  if (!currentUser) return [];
  const q = query(collection(db, "users"), where("uid", "!=", currentUser.uid), limit(limitCount));
  const querySnap = await getDocs(q);
  return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ------------------ SEARCH ------------------
export async function searchUsersByName(username) {
  const q = query(collection(db, "users"), where("username", "==", username));
  const querySnap = await getDocs(q);
  return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ------------------ MESSAGING ------------------
export async function sendMessage(receiverUid, text) {
  if (!currentUser) return;
  await addDoc(collection(db, "messages"), {
    senderUid: currentUser.uid,
    receiverUid,
    text,
    createdAt: new Date(),
  });
}

export function onMessagesUpdate(user1, user2, callback) {
  const messagesRef = collection(db, "messages");
  const q = query(messagesRef, orderBy("createdAt"));
  return onSnapshot(q, snapshot => {
    const messages = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(msg =>
        (msg.senderUid === user1 && msg.receiverUid === user2) ||
        (msg.senderUid === user2 && msg.receiverUid === user1)
      );
    callback(messages);
  });
}

// ------------------ CAMERA / PROFILE PICS ------------------
export async function uploadProfilePicture(file) {
  if (!currentUser) return "";
  const storageRef = ref(storage, `profile_pics/${currentUser.uid}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// ------------------ REAL-TIME ACTION TRACKING ------------------
export function trackUserActions(callback) {
  if (!currentUser) return;
  const postsRef = collection(db, "posts");
  const messagesRef = collection(db, "messages");
  const userRef = doc(db, "users", currentUser.uid);

  const unsubscribePosts = onSnapshot(postsRef, snapshot => {
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback({ type: "posts", data: posts });
  });

  const unsubscribeMessages = onSnapshot(messagesRef, snapshot => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback({ type: "messages", data: messages });
  });

  const unsubscribeUser = onSnapshot(userRef, docSnap => {
    callback({ type: "user", data: { id: docSnap.id, ...docSnap.data() } });
  });

  return () => {
    unsubscribePosts();
    unsubscribeMessages();
    unsubscribeUser();
  };
}

// ------------------ UI RENDER FUNCTIONS ------------------
function renderLogin() {
  document.body.innerHTML = `
    <div class="login-container">
      <h2>Login</h2>
      <input id="email" placeholder="Email" />
      <input id="password" type="password" placeholder="Password" />
      <button id="loginBtn">Login</button>
    </div>
  `;
  document.getElementById("loginBtn").onclick = async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    await login(email, password);
  };
}

async function renderUI() {
  document.body.innerHTML = `
    <div class="app-container">
      <h2>Vibez</h2>
      <div id="suggestedUsers"></div>
      <div id="postForm">
        <textarea id="postContent" placeholder="What's up?"></textarea>
        <input type="file" id="postImage" />
        <button id="postBtn">Post</button>
      </div>
      <div id="posts"></div>
      <div id="messages"></div>
      <div>
        <button id="logoutBtn">Logout</button>
      </div>
    </div>
  `;

  document.getElementById("logoutBtn").onclick = logout;
  document.getElementById("postBtn").onclick = async () => {
    const content = document.getElementById("postContent").value;
    const imageFile = document.getElementById("postImage").files[0];
    await createPost(content, imageFile);
    document.getElementById("postContent").value = "";
    document.getElementById("postImage").value = "";
  };

  // Render suggested users
  const suggested = await getSuggestedUsers();
  const suggestedDiv = document.getElementById("suggestedUsers");
  suggestedDiv.innerHTML = "<h3>Suggested Users</h3>" + suggested.map(u =>
    `<div>${u.username}</div>`
  ).join("");

  // Real-time posts rendering
  onPostsUpdate(posts => {
    const postsDiv = document.getElementById("posts");
    postsDiv.innerHTML = posts.map(p =>
      `<div class="post">
        <p>${p.content}</p>
        ${p.imageUrl ? `<img src="${p.imageUrl}" width="200"/>` : ""}
        <p>Likes: ${p.likes.length}</p>
        <button onclick="likePost('${p.id}')">Like</button>
        <div>
          <input id="comment-${p.id}" placeholder="Comment..." />
          <button onclick="commentPost('${p.id}', document.getElementById('comment-${p.id}').value)">Comment</button>
        </div>
        <div>Comments: ${p.comments.map(c => c.text).join(", ")}</div>
      </div>`
    ).join("");
  });
}

// Make functions global for UI buttons
window.likePost = likePost;
window.commentPost = commentPost;
