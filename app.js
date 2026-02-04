// ==========================================
// APP.JS - FULL SOCIAL APP WITH REAL USERS
// ==========================================

// 🔐 FIREBASE CONFIG - REPLACE WITH YOUR INFO
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "XXXXXXX",
  appId: "XXXXXXX"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ==========================================
// GLOBALS
// ==========================================
let currentUser = null;

// ==========================================
// AUTH STATE LISTENER
// ==========================================
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const userDoc = await db.collection("users").doc(user.uid).get();
    currentUser = { uid: user.uid, ...userDoc.data() };
    showMainApp();
    subscribeFeed();
  } else {
    showAuthScreen();
  }
});

// ==========================================
// AUTH FUNCTIONS
// ==========================================
async function signup() {
  const email = signupEmail.value.trim();
  const password = signupPassword.value;
  const username = signupUsername.value.trim();

  if (!email || !password || !username) return showToast("Fill all fields");

  const cred = await auth.createUserWithEmailAndPassword(email, password);
  await db.collection("users").doc(cred.user.uid).set({
    username,
    email,
    photoURL: `https://ui-avatars.com/api/?name=${username}`,
    bio: "",
    followers: [],
    following: [],
    posts: 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function login() {
  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  if (!email || !password) return showToast("Fill all fields");

  await auth.signInWithEmailAndPassword(email, password);
}

function logout() {
  auth.signOut();
}

// ==========================================
// CREATE POST
// ==========================================
async function createPost() {
  const caption = postCaption.value.trim();
  if (!caption) return showToast("Write something");

  const postRef = await db.collection("posts").add({
    userId: currentUser.uid,
    username: currentUser.username,
    userPhoto: currentUser.photoURL,
    caption,
    likes: 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  // increment user's post count
  await db.collection("users").doc(currentUser.uid).update({
    posts: firebase.firestore.FieldValue.increment(1)
  });

  postCaption.value = "";
}

// ==========================================
// REAL-TIME FEED SUBSCRIPTION
// ==========================================
function subscribeFeed() {
  db.collection("posts").orderBy("createdAt", "desc").limit(50)
    .onSnapshot(snapshot => {
      postsContainer.innerHTML = "";
      snapshot.forEach(doc => renderPost({ id: doc.id, ...doc.data() }));
    });
}

// ==========================================
// RENDER POST
// ==========================================
function renderPost(post) {
  const div = document.createElement("article");
  div.className = "bg-card rounded-xl p-4 mb-4";
  div.innerHTML = `
    <div class="flex items-center gap-3 mb-2">
      <img src="${post.userPhoto}" class="w-10 h-10 rounded-full">
      <b>${post.username}</b>
      ${post.userId !== currentUser.uid ? `<button onclick="toggleFollow('${post.userId}')">Follow</button>` : ''}
    </div>
    <p class="mb-3">${escapeHtml(post.caption)}</p>
    <div class="flex gap-4 items-center">
      <button onclick="toggleLike('${post.id}')">❤️</button>
      <span id="likes-${post.id}">${post.likes}</span>
      <button onclick="openComments('${post.id}')">💬</button>
    </div>
    <div id="comments-${post.id}" class="mt-3 hidden"></div>
  `;
  postsContainer.appendChild(div);
}

// ==========================================
// LIKES
// ==========================================
async function toggleLike(postId) {
  const postRef = db.collection("posts").doc(postId);
  const likeRef = postRef.collection("likes").doc(currentUser.uid);
  const doc = await likeRef.get();

  if (doc.exists) {
    await likeRef.delete();
    await postRef.update({ likes: firebase.firestore.FieldValue.increment(-1) });
  } else {
    await likeRef.set({ likedAt: Date.now() });
    await postRef.update({ likes: firebase.firestore.FieldValue.increment(1) });
  }
}

// ==========================================
// COMMENTS
// ==========================================
async function openComments(postId) {
  const box = document.getElementById(`comments-${postId}`);
  box.classList.toggle("hidden");
  box.innerHTML = `
    <input id="comment-input-${postId}" placeholder="Write a comment..." class="w-full p-2 bg-transparent border rounded mb-2">
    <button onclick="addComment('${postId}')">Post</button>
    <div id="comment-list-${postId}" class="mt-2"></div>
  `;

  const snap = await db.collection("posts").doc(postId).collection("comments").orderBy("createdAt").get();
  snap.forEach(doc => {
    const c = doc.data();
    document.getElementById(`comment-list-${postId}`).innerHTML += `<div class="text-sm"><b>${c.username}</b> ${escapeHtml(c.text)}</div>`;
  });
}

async function addComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  if (!input.value.trim()) return;

  await db.collection("posts").doc(postId).collection("comments").add({
    userId: currentUser.uid,
    username: currentUser.username,
    text: input.value,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  openComments(postId);
}

// ==========================================
// FOLLOW / UNFOLLOW
// ==========================================
async function toggleFollow(targetUserId) {
  const userRef = db.collection("users").doc(currentUser.uid);
  const targetRef = db.collection("users").doc(targetUserId);

  const userDoc = await userRef.get();
  const following = userDoc.data().following || [];

  if (following.includes(targetUserId)) {
    // Unfollow
    await userRef.update({
      following: firebase.firestore.FieldValue.arrayRemove(targetUserId)
    });
    await targetRef.update({
      followers: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
    });
  } else {
    // Follow
    await userRef.update({
      following: firebase.firestore.FieldValue.arrayUnion(targetUserId)
    });
    await targetRef.update({
      followers: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
    });
  }
}

// ==========================================
// UI HELPERS
// ==========================================
function showAuthScreen() {
  authScreen.classList.remove("hidden");
  mainApp.classList.add("hidden");
}

function showMainApp() {
  authScreen.classList.add("hidden");
  mainApp.classList.remove("hidden");
}

function showToast(msg) {
  alert(msg);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
