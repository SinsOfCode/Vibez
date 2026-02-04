// ==================== FIREBASE CONFIG ====================

const firebaseConfig = {
    apiKey: "AIzaSyAQGFPXYDkbgwOYtUSOfPWQDFhDXtnA718",
    authDomain: "vibe-social-49d91.firebaseapp.com",
    projectId: "vibe-social-49d91",
    storageBucket: "vibe-social-49d91.firebasestorage.app",
    messagingSenderId: "714691525863",
    appId: "1:714691525863:web:724f81744f210bd91d7642"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Global references
const auth = firebase.auth();
const db = firebase.firestore();

// Constants
const ADMIN_EMAIL = "whatif68c@gmail.com";
