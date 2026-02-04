// ==========================================
// VIBE SOCIAL MEDIA - MAIN APP
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged, 
    updateProfile,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    orderBy, 
    limit, 
    where, 
    onSnapshot, 
    serverTimestamp, 
    increment,
    arrayUnion,
    arrayRemove,
    startAfter
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// ==========================================
// FIREBASE CONFIG
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyDsqaoDlN8-XyHCsGrhaHQkMQBiEwmgk8o",
    authDomain: "vibez-7c71e.firebaseapp.com",
    projectId: "vibez-7c71e",
    storageBucket: "vibez-7c71e.firebasestorage.app",
    messagingSenderId: "544032234117",
    appId: "1:544032234117:web:9200a924e920c99221e7ec",
    measurementId: "G-DQ4GMVLTL7"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ==========================================
// GLOBAL STATE
// ==========================================

const state = {
    currentUser: null,
    currentPage: 'feed',
    feedFilter: 'all',
    lastPostDoc: null,
    loading: false,
    unsubscribers: []
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

const utils = {
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        const colors = { success: 'bg-green-500', error: 'bg-red-500', warning: 'bg-yellow-500', info: 'bg-purple-500' };
        const icons = { success: 'check-circle', error: 'exclamation-circle', warning: 'exclamation-triangle', info: 'info-circle' };
        
        toast.className = `${colors[type]} text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transform transition-all duration-300 translate-y-[-100%] opacity-0`;
        toast.innerHTML = `<i class="fas fa-${icons[type]}"></i><span class="font-medium">${message}</span>`;
        
        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.remove('translate-y-[-100%]', 'opacity-0'));
        
        setTimeout(() => {
            toast.classList.add('translate-y-[-100%]', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    getTimeAgo(timestamp) {
        if (!timestamp) return 'now';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const seconds = Math.floor((new Date() - date) / 1000);
        
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        return `${days}d`;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    clearUnsubscribers() {
        state.unsubscribers.forEach(unsub => unsub());
        state.unsubscribers = [];
    }
};

// ==========================================
// AUTHENTICATION MODULE
// ==========================================

const authModule = {
    togglePassword(inputId) {
        const input = document.getElementById(inputId);
        const icon = input.nextElementSibling.querySelector('i');
        input.type = input.type === 'password' ? 'text' : 'password';
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    },

    async checkUsername() {
        const username = document.getElementById('signupUsername').value.trim().toLowerCase();
        const status = document.getElementById('usernameStatus');
        
        if (username.length < 3) {
            status.textContent = '';
            return;
        }
        
        status.textContent = 'Checking...';
        status.className = 'text-yellow-500 text-xs';
        
        try {
            const q = query(collection(db, 'users'), where('username', '==', username));
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                status.textContent = 'Available';
                status.className = 'text-green-500 text-xs';
            } else {
                status.textContent = 'Taken';
                status.className = 'text-red-500 text-xs';
            }
        } catch (error) {
            console.error(error);
        }
    },

    async login() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            utils.showToast('Fill all fields', 'error');
            return;
        }
        
        try {
            utils.showToast('Logging in...', 'info');
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            let msg = 'Login failed';
            if (error.code === 'auth/user-not-found') msg = 'User not found';
            if (error.code === 'auth/wrong-password') msg = 'Wrong password';
            utils.showToast(msg, 'error');
        }
    },

    async signup() {
        const username = document.getElementById('signupUsername').value.trim().toLowerCase();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirm = document.getElementById('signupConfirm').value;
        
        if (!username || !email || !password) {
            utils.showToast('Fill all fields', 'error');
            return;
        }
        
        if (password !== confirm) {
            utils.showToast('Passwords do not match', 'error');
            return;
        }
        
        if (password.length < 6) {
            utils.showToast('Password must be 6+ characters', 'error');
            return;
        }
        
        // Check username availability
        const q = query(collection(db, 'users'), where('username', '==', username));
        const check = await getDocs(q);
        if (!check.empty) {
            utils.showToast('Username taken', 'error');
            return;
        }
        
        try {
            utils.showToast('Creating account...', 'info');
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            const photoURL = `https://ui-avatars.com/api/?name=${username}&background=8B5CF6&color=fff`;
            
            await updateProfile(user, { displayName: username, photoURL });
            
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                username,
                email,
                displayName: username,
                photoURL,
                bio: '',
                followers: [],
                following: [],
                posts: 0,
                isAdmin: false,
                createdAt: serverTimestamp(),
                lastActive: serverTimestamp()
            });
            
            utils.showToast('Account created!', 'success');
        } catch (error) {
            let msg = 'Signup failed';
            if (error.code === 'auth/email-already-in-use') msg = 'Email already in use';
            utils.showToast(msg, 'error');
        }
    },

    async logout() {
        if (!confirm('Log out?')) return;
        
        try {
            if (state.currentUser) {
                await updateDoc(doc(db, 'users', state.currentUser.uid), {
                    lastActive: serverTimestamp()
                });
            }
            
            utils.clearUnsubscribers();
            await signOut(auth);
            utils.showToast('Logged out', 'info');
        } catch (error) {
            utils.showToast('Logout failed', 'error');
        }
    }
};

// ==========================================
// UI MODULE
// ==========================================

const ui = {
    showLogin() {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('signupForm').classList.add('hidden');
    },

    showSignup() {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('signupForm').classList.remove('hidden');
    },

    showAuthScreen() {
        document.getElementById('authScreen').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
    },

    showMainApp() {
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        this.updateProfileUI();
        
        if (state.currentUser?.isAdmin) {
            document.getElementById('adminSection').classList.remove('hidden');
        }
        
        appLock.check();
        feed.load();
        stories.load();
        messages.loadConversations();
        notifications.load();
    },

    updateProfileUI() {
        if (!state.currentUser) return;
        
        const photo = state.currentUser.photoURL;
        document.getElementById('navProfilePic').src = photo;
        document.getElementById('mobileNavProfilePic').src = photo;
        document.getElementById('profilePic').src = photo;
        
        document.getElementById('profileName').textContent = state.currentUser.displayName || state.currentUser.username;
        document.getElementById('profileHandle').textContent = '@' + state.currentUser.username;
        document.getElementById('profileBio').textContent = state.currentUser.bio || 'No bio yet';
        document.getElementById('followerCount').textContent = state.currentUser.followers?.length || 0;
        document.getElementById('followingCount').textContent = state.currentUser.following?.length || 0;
        document.getElementById('postCount').textContent = state.currentUser.posts || 0;
    },

    navigate(page) {
        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
        document.getElementById(page + 'Page').classList.remove('hidden');
        
        document.querySelectorAll('.nav-btn, .nav-mobile').forEach(btn => {
            const isActive = btn.dataset.page === page;
            btn.classList.toggle('text-purple-500', isActive);
            btn.classList.toggle('text-gray-400', !isActive);
            if (btn.classList.contains('nav-btn')) {
                btn.classList.toggle('bg-white/10', isActive);
            }
        });
        
        state.currentPage = page;
        
        if (page === 'feed') feed.load();
        if (page === 'profile') profile.loadPosts();
        if (page === 'admin' && state.currentUser?.isAdmin) admin.load();
        
        window.scrollTo(0, 0);
    }
};

// ==========================================
// APP LOCK MODULE
// ==========================================

const appLock = {
    pin: '',
    
    check() {
        if (localStorage.getItem('vibe_app_lock') === 'true') {
            this.pin = '';
            this.updateDots();
            document.getElementById('appLockScreen').classList.remove('hidden');
        }
    },

    enterPin(num) {
        if (this.pin.length < 4) {
            this.pin += num;
            this.updateDots();
            if (this.pin.length === 4) this.validate();
        }
    },

    deletePin() {
        this.pin = this.pin.slice(0, -1);
        this.updateDots();
    },

    updateDots() {
        const dots = document.querySelectorAll('#pinDots div');
        dots.forEach((dot, i) => {
            dot.classList.toggle('bg-purple-500', i < this.pin.length);
            dot.classList.toggle('bg-gray-600', i >= this.pin.length);
        });
    },

    validate() {
        const correct = localStorage.getItem('vibe_pin') || '1234';
        if (this.pin === correct) {
            document.getElementById('appLockScreen').classList.add('hidden');
            utils.showToast('Unlocked', 'success');
        } else {
            this.pin = '';
            this.updateDots();
            utils.showToast('Wrong PIN', 'error');
            if (navigator.vibrate) navigator.vibrate(200);
        }
    }
};

// ==========================================
// FEED MODULE
// ==========================================

const feed = {
    setFilter(filter) {
        state.feedFilter = filter;
        
        document.querySelectorAll('.feed-filter').forEach(btn => {
            const isActive = btn.dataset.filter === filter;
            btn.classList.toggle('bg-purple-500', isActive);
            btn.classList.toggle('text-white', isActive);
            btn.classList.toggle('bg-gray-800', !isActive);
            btn.classList.toggle('text-gray-400', !isActive);
        });
        
        this.load();
    },

    async load() {
        const container = document.getElementById('postsContainer');
        container.innerHTML = '<div class="skeleton h-96 rounded-2xl"></div><div class="skeleton h-96 rounded-2xl"></div>';
        
        let q;
        
        if (state.feedFilter === 'following' && state.currentUser?.following?.length > 0) {
            q = query(
                collection(db, 'posts'),
                where('userId', 'in', state.currentUser.following.slice(0, 10)),
                orderBy('createdAt', 'desc'),
                limit(20)
            );
        } else {
            q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(20));
        }
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            container.innerHTML = '';
            snapshot.forEach(doc => {
                const post = { id: doc.id, ...doc.data() };
                container.innerHTML += this.createPostHTML(post);
            });
        }, error => {
            console.error(error);
            utils.showToast('Failed to load feed', 'error');
        });
        
        state.unsubscribers.push(unsubscribe);
    },

    createPostHTML(post) {
        const liked = post.likes?.includes(state.currentUser?.uid);
        
        return `
            <article class="bg-gray-900 rounded-2xl overflow-hidden mb-6">
                <div class="flex items-center justify-between p-4">
                    <div class="flex items-center gap-3">
                        <div class="story-ring">
                            <img src="${post.user.photo}" class="w-10 h-10 rounded-full border-2 border-black object-cover">
                        </div>
                        <div>
                            <div class="font-semibold">${post.user.username}</div>
                            <div class="text-xs text-gray-400">${utils.getTimeAgo(post.createdAt)}</div>
                        </div>
                    </div>
                    <button class="text-gray-400"><i class="fas fa-ellipsis-h"></i></button>
                </div>
                
                <div class="relative aspect-square bg-black" ondblclick="posts.like('${post.id}')">
                    <img src="${post.image}" class="w-full h-full object-cover" loading="lazy">
                </div>
                
                <div class="p-4">
                    <div class="flex gap-4 mb-3">
                        <button onclick="posts.like('${post.id}')" class="text-2xl ${liked ? 'text-red-500' : 'text-white'}">
                            <i class="${liked ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                        <button class="text-2xl text-white"><i class="far fa-comment"></i></button>
                        <button class="text-2xl text-white"><i class="far fa-paper-plane"></i></button>
                    </div>
                    <div class="font-semibold mb-2">${post.likes?.length || 0} likes</div>
                    <div class="mb-2">
                        <span class="font-semibold">${post.user.username}</span>
                        <span class="text-gray-300"> ${utils.escapeHtml(post.caption)}</span>
                    </div>
                </div>
            </article>
        `;
    }
};

// ==========================================
// POSTS MODULE
// ==========================================

const posts = {
    selectedFile: null,

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        this.selectedFile = file;
        const preview = document.getElementById('mediaPreview');
        const reader = new FileReader();
        
        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" class="w-full h-32 object-cover rounded-xl">`;
            preview.classList.remove('hidden');
        };
        
        reader.readAsDataURL(file);
    },

    updateCharCount() {
        const count = document.getElementById('postCaption').value.length;
        document.getElementById('charCount').textContent = `${count}/500`;
    },

    async create() {
        if (!state.currentUser) {
            utils.showToast('Please log in', 'error');
            return;
        }
        
        const caption = document.getElementById('postCaption').value.trim();
        const privacy = document.getElementById('postPrivacy').value;
        
        if (!caption && !this.selectedFile) {
            utils.showToast('Add photo or caption', 'error');
            return;
        }
        
        utils.showToast('Posting...', 'info');
        
        try {
            let imageUrl = 'https://picsum.photos/seed/' + Date.now() + '/600/600';
            
            if (this.selectedFile) {
                const storageRef = ref(storage, `posts/${state.currentUser.uid}/${Date.now()}_${this.selectedFile.name}`);
                await uploadBytes(storageRef, this.selectedFile);
                imageUrl = await getDownloadURL(storageRef);
            }
            
            await addDoc(collection(db, 'posts'), {
                userId: state.currentUser.uid,
                user: {
                    username: state.currentUser.username,
                    photo: state.currentUser.photoURL
                },
                image: imageUrl,
                caption,
                privacy,
                likes: [],
                comments: [],
                createdAt: serverTimestamp()
            });
            
            await updateDoc(doc(db, 'users', state.currentUser.uid), {
                posts: increment(1)
            });
            
            document.getElementById('postCaption').value = '';
            document.getElementById('mediaPreview').innerHTML = '';
            document.getElementById('mediaPreview').classList.add('hidden');
            this.selectedFile = null;
            
            utils.showToast('Posted!', 'success');
            ui.navigate('feed');
        } catch (error) {
            console.error(error);
            utils.showToast('Failed to post', 'error');
        }
    },

    async like(postId) {
        if (!state.currentUser) return;
        
        const postRef = doc(db, 'posts', postId);
        const postDoc = await getDoc(postRef);
        
        if (!postDoc.exists()) return;
        
        const post = postDoc.data();
        const liked = post.likes?.includes(state.currentUser.uid);
        
        if (liked) {
            await updateDoc(postRef, {
                likes: arrayRemove(state.currentUser.uid)
            });
        } else {
            await updateDoc(postRef, {
                likes: arrayUnion(state.currentUser.uid)
            });
            
            // Create notification
            if (post.userId !== state.currentUser.uid) {
                await addDoc(collection(db, 'notifications'), {
                    userId: post.userId,
                    type: 'like',
                    senderId: state.currentUser.uid,
                    senderName: state.currentUser.username,
                    senderPhoto: state.currentUser.photoURL,
                    postId,
                    read: false,
                    createdAt: serverTimestamp()
                });
            }
        }
    }
};

// ==========================================
// STORIES MODULE
// ==========================================

const stories = {
    async load() {
        const now = new Date();
        const q = query(
            collection(db, 'stories'),
            where('expiresAt', '>', now),
            orderBy('expiresAt', 'desc'),
            limit(20)
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const container = document.getElementById('storiesContainer');
            container.innerHTML = '';
            
            snapshot.forEach(doc => {
                const story = { id: doc.id, ...doc.data() };
                const viewed = story.viewedBy?.includes(state.currentUser?.uid);
                
                container.innerHTML += `
                    <button onclick="stories.view('${doc.id}')" class="flex-shrink-0 flex flex-col items-center gap-1">
                        <div class="${viewed ? 'border-2 border-gray-600' : 'story-ring'} rounded-full p-[2px]">
                            <img src="${story.user.photo}" class="w-14 h-14 rounded-full border-2 border-black object-cover">
                        </div>
                        <span class="text-xs text-gray-400 truncate w-16">${story.user.username}</span>
                    </button>
                `;
            });
        });
        
        state.unsubscribers.push(unsubscribe);
    },

    async view(storyId) {
        const storyDoc = await getDoc(doc(db, 'stories', storyId));
        if (!storyDoc.exists()) return;
        
        const story = storyDoc.data();
        document.getElementById('storyModal').classList.remove('hidden');
        document.getElementById('storyImage').src = story.image;
        
        // Mark as viewed
        if (state.currentUser) {
            await updateDoc(doc(db, 'stories', storyId), {
                viewedBy: arrayUnion(state.currentUser.uid)
            });
        }
        
        setTimeout(() => {
            document.getElementById('storyProgress').style.width = '100%';
        }, 100);
        
        setTimeout(() => this.close(), 5000);
    },

    close() {
        document.getElementById('storyModal').classList.add('hidden');
        document.getElementById('storyProgress').style.width = '0';
    },

    create() {
        utils.showToast('Story creation coming soon', 'info');
    }
};

// ==========================================
// PROFILE MODULE
// ==========================================

const profile = {
    setTab(tab) {
        document.querySelectorAll('.profile-tab').forEach(t => {
            const isActive = t.dataset.tab === tab;
            t.classList.toggle('border-purple-500', isActive);
            t.classList.toggle('text-white', isActive);
            t.classList.toggle('border-transparent', !isActive);
            t.classList.toggle('text-gray-400', !isActive);
        });
        
        this.loadPosts();
    },

    async loadPosts() {
        if (!state.currentUser) return;
        
        const q = query(
            collection(db, 'posts'),
            where('userId', '==', state.currentUser.uid),
            orderBy('createdAt', 'desc')
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const grid = document.getElementById('profilePosts');
            grid.innerHTML = '';
            
            snapshot.forEach(doc => {
                const post = doc.data();
                grid.innerHTML += `
                    <div class="aspect-square bg-gray-900 rounded-lg overflow-hidden cursor-pointer">
                        <img src="${post.image}" class="w-full h-full object-cover">
                    </div>
                `;
            });
        });
        
        state.unsubscribers.push(unsubscribe);
    },

    edit() { utils.showToast('Edit profile coming soon', 'info'); },
    changePic() { utils.showToast('Change photo coming soon', 'info'); },
    showFollowers() { utils.showToast('Followers coming soon', 'info'); },
    showFollowing() { utils.showToast('Following coming soon', 'info'); }
};

// ==========================================
// MESSAGES MODULE
// ==========================================

const messages = {
    loadConversations() {
        if (!state.currentUser) return;
        
        const q = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', state.currentUser.uid),
            orderBy('lastMessageTime', 'desc')
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = document.getElementById('conversationsList');
            list.innerHTML = '';
            
            if (snapshot.empty) {
                list.innerHTML = '<div class="text-center text-gray-500 py-8">No messages yet</div>';
                return;
            }
            
            snapshot.forEach(doc => {
                const conv = doc.data();
                const otherUser = conv.participantsData?.find(p => p.uid !== state.currentUser.uid);
                
                list.innerHTML += `
                    <button onclick="messages.open('${doc.id}')" class="w-full p-4 flex items-center gap-3 hover:bg-white/5 border-b border-gray-800 text-left">
                        <img src="${otherUser?.photo}" class="w-12 h-12 rounded-full object-cover">
                        <div class="flex-1">
                            <div class="font-semibold">${otherUser?.username}</div>
                            <div class="text-sm text-gray-400 truncate">${conv.lastMessage || 'No messages'}</div>
                        </div>
                    </button>
                `;
            });
        });
        
        state.unsubscribers.push(unsubscribe);
    },

    open(conversationId) {
        document.getElementById('chatArea').classList.remove('hidden');
        
        const q = query(
            collection(db, 'conversations', conversationId, 'messages'),
            orderBy('timestamp', 'asc')
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = document.getElementById('messagesList');
            list.innerHTML = '';
            
            snapshot.forEach(doc => {
                const msg = doc.data();
                const isMe = msg.senderId === state.currentUser?.uid;
                
                list.innerHTML += `
                    <div class="flex justify-${isMe ? 'end' : 'start'} mb-4">
                        <div class="${isMe ? 'bg-purple-500 rounded-tr-none' : 'bg-gray-900 rounded-tl-none'} rounded-2xl px-4 py-2 max-w-[70%]">
                            <p>${utils.escapeHtml(msg.text)}</p>
                            <span class="text-xs ${isMe ? 'text-white/70' : 'text-gray-500'}">${utils.getTimeAgo(msg.timestamp)}</span>
                        </div>
                    </div>
                `;
            });
            
            list.scrollTop = list.scrollHeight;
        });
        
        state.unsubscribers.push(unsubscribe);
    },

    send() {
        const input = document.getElementById('messageInput');
        const text = input.value.trim();
        if (!text) return;
        
        // Implementation depends on conversation structure
        input.value = '';
    },

    handleKeypress(e) {
        if (e.key === 'Enter') this.send();
    }
};

// ==========================================
// NOTIFICATIONS MODULE
// ==========================================

const notifications = {
    load() {
        if (!state.currentUser) return;
        
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', state.currentUser.uid),
            orderBy('createdAt', 'desc'),
            limit(20)
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = document.getElementById('notificationsList');
            list.innerHTML = '';
            
            let unread = 0;
            
            snapshot.forEach(doc => {
                const notif = doc.data();
                if (!notif.read) unread++;
                
                const icons = { like: 'heart', follow: 'user-plus', comment: 'comment' };
                
                list.innerHTML += `
                    <div class="flex items-center gap-4 p-4 ${notif.read ? '' : 'bg-purple-500/10'} rounded-xl hover:bg-white/5 cursor-pointer" onclick="notifications.markRead('${doc.id}')">
                        <img src="${notif.senderPhoto}" class="w-12 h-12 rounded-full">
                        <div class="flex-1">
                            <span class="font-semibold">${notif.senderName}</span>
                            <span class="text-gray-400"> ${notif.type}ed your post</span>
                            <div class="text-xs text-gray-500">${utils.getTimeAgo(notif.createdAt)}</div>
                        </div>
                    </div>
                `;
            });
            
            if (unread > 0) {
                document.getElementById('notifBadge').textContent = unread;
                document.getElementById('notifBadge').classList.remove('hidden');
                document.getElementById('mobileNotifBadge').textContent = unread;
                document.getElementById('mobileNotifBadge').classList.remove('hidden');
            }
        });
        
        state.unsubscribers.push(unsubscribe);
    },

    async markRead(id) {
        await updateDoc(doc(db, 'notifications', id), { read: true });
    }
};

// ==========================================
// SEARCH MODULE
// ==========================================

const search = {
    async handle() {
        const query_text = document.getElementById('searchInput').value.trim().toLowerCase();
        const results = document.getElementById('searchResults');
        
        if (query_text.length < 2) {
            results.innerHTML = '';
            return;
        }
        
        const q = query(
            collection(db, 'users'),
            where('username', '>=', query_text),
            where('username', '<=', query_text + '\uf8ff'),
            limit(10)
        );
        
        const snapshot = await getDocs(q);
        
        results.innerHTML = '';
        snapshot.forEach(doc => {
            const user = doc.data();
            results.innerHTML += `
                <div class="flex items-center gap-4 p-4 bg-gray-900 rounded-xl">
                    <img src="${user.photoURL}" class="w-12 h-12 rounded-full">
                    <div class="flex-1">
                        <div class="font-semibold">${user.username}</div>
                        <div class="text-sm text-gray-400">${user.displayName}</div>
                    </div>
                    <button onclick="profile.follow('${doc.id}')" class="px-4 py-1.5 bg-purple-500 rounded-full text-sm">Follow</button>
                </div>
            `;
        });
    }
};

// ==========================================
// SETTINGS MODULE
// ==========================================

const settings = {
    toggleAppLock() {
        const enabled = localStorage.getItem('vibe_app_lock') === 'true';
        localStorage.setItem('vibe_app_lock', !enabled);
        document.getElementById('appLockStatus').textContent = !enabled ? 'On' : 'Off';
        utils.showToast(`App lock ${!enabled ? 'enabled' : 'disabled'}`, 'success');
    },

    toggleDarkMode() {
        const enabled = document.getElementById('darkModeToggle').classList.contains('bg-purple-500');
        document.getElementById('darkModeToggle').classList.toggle('bg-purple-500');
        document.getElementById('darkModeToggle').classList.toggle('bg-gray-600');
        utils.showToast('Dark mode ' + (enabled ? 'disabled' : 'enabled'), 'info');
    },

    changePassword() {
        const email = prompt('Enter your email:');
        if (email) {
            sendPasswordResetEmail(auth, email)
                .then(() => utils.showToast('Reset email sent', 'success'))
                .catch(() => utils.showToast('Failed to send reset', 'error'));
        }
    },

    downloadData() {
        const data = JSON.stringify(state.currentUser, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my_vibe_data.json';
        a.click();
        URL.revokeObjectURL(url);
    }
};

// ==========================================
// ADMIN MODULE
// ==========================================

const admin = {
    load() {
        // Stats listeners
        const usersUnsub = onSnapshot(collection(db, 'users'), snap => {
            document.getElementById('adminTotalUsers').textContent = snap.size;
        });
        
        const postsUnsub = onSnapshot(collection(db, 'posts'), snap => {
            document.getElementById('adminTotalPosts').textContent = snap.size;
        });
        
        state.unsubscribers.push(usersUnsub, postsUnsub);
        
        // Load users
        getDocs(query(collection(db, 'users'), limit(50))).then(snapshot => {
            const list = document.getElementById('adminUserList');
            list.innerHTML = '';
            
            snapshot.forEach(doc => {
                const user = doc.data();
                list.innerHTML += `
                    <div class="flex items-center justify-between p-3 bg-black rounded-lg">
                        <div class="flex items-center gap-3">
                            <img src="${user.photoURL}" class="w-10 h-10 rounded-full">
                            <div>
                                <div class="font-medium">${user.username}</div>
                                <div class="text-xs text-gray-500">${user.email}</div>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="admin.ban('${doc.id}')" class="px-3 py-1 bg-red-500/20 text-red-500 rounded text-xs">Ban</button>
                        </div>
                    </div>
                `;
            });
        });
    },

    async ban(userId) {
        await updateDoc(doc(db, 'users', userId), { banned: true });
        utils.showToast('User banned', 'success');
    }
};

// ==========================================
// INITIALIZATION
// ==========================================

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            state.currentUser = userDoc.data();
            ui.showMainApp();
        }
    } else {
        state.currentUser = null;
        ui.showAuthScreen();
    }
});

// Make functions globally available
window.auth = authModule;
window.ui = ui;
window.appLock = appLock;
window.feed = feed;
window.posts = posts;
window.stories = stories;
window.profile = profile;
window.messages = messages;
window.notifications = notifications;
window.search = search;
window.settings = settings;
window.admin = admin;
window.nav = ui;
