// ==========================================
// VIBE SOCIAL MEDIA - MAIN JAVASCRIPT
// ==========================================

// Firebase Configuration - REPLACE WITH YOUR CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyB_example_key_here",
    authDomain: "vibe-social-app.firebaseapp.com",
    projectId: "vibe-social-app",
    storageBucket: "vibe-social-app.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456"
};

// Initialize Firebase (uncomment when you have real config)
// firebase.initializeApp(firebaseConfig);
// const auth = firebase.auth();
// const db = firebase.firestore();
// const storage = firebase.storage();

// ==========================================
// STATE MANAGEMENT
// ==========================================

const state = {
    currentUser: null,
    currentPage: 'feed',
    feedFilter: 'all',
    isOffline: false,
    appLocked: false,
    pin: '',
    recording: false,
    darkMode: true,
    dataSaver: false,
    posts: [],
    stories: [],
    conversations: [],
    notifications: []
};

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    setupOfflineDetection();
    setupAutoSave();
    loadTheme();
});

function checkAuthState() {
    // Check localStorage first (mock auth)
    const savedUser = localStorage.getItem('vibe_user');
    if (savedUser) {
        state.currentUser = JSON.parse(savedUser);
        showMainApp();
    } else {
        showAuthScreen();
    }
}

function setupOfflineDetection() {
    window.addEventListener('online', () => {
        state.isOffline = false;
        document.getElementById('offlineIndicator').classList.add('hidden');
        showToast('Back online', 'success');
        syncOfflineData();
    });
    
    window.addEventListener('offline', () => {
        state.isOffline = true;
        document.getElementById('offlineIndicator').classList.remove('hidden');
        showToast('You are offline', 'warning');
    });
}

// ==========================================
// AUTHENTICATION FUNCTIONS
// ==========================================

function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('signupForm').classList.add('hidden');
}

function showSignup() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

let usernameTimeout;
function checkUsername() {
    clearTimeout(usernameTimeout);
    const username = document.getElementById('signupUsername').value;
    const status = document.getElementById('usernameStatus');
    
    if (username.length < 3) {
        status.textContent = '';
        return;
    }
    
    status.textContent = 'Checking...';
    status.className = 'absolute right-4 top-1/2 -translate-y-1/2 text-xs text-yellow-500';
    
    // Simulate API call
    usernameTimeout = setTimeout(() => {
        if (username.length > 3) {
            status.textContent = 'Available';
            status.className = 'absolute right-4 top-1/2 -translate-y-1/2 text-xs text-green-500';
        }
    }, 500);
}

async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    try {
        // Try Firebase first (if configured)
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            await loadUserData(user.uid);
        } else {
            // Mock login
            mockLogin(email);
        }
    } catch (error) {
        showToast(error.message || 'Login failed', 'error');
    }
}

async function signup() {
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    
    if (!username || !email || !password) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    if (password !== confirm) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be 6+ characters', 'error');
        return;
    }
    
    try {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Create user document in Firestore
            await db.collection('users').doc(user.uid).set({
                username: username,
                email: email,
                displayName: username,
                photoURL: `https://ui-avatars.com/api/?name=${username}&background=8B5CF6&color=fff`,
                bio: '',
                followers: 0,
                following: 0,
                posts: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                isAdmin: false
            });
            
            await loadUserData(user.uid);
        } else {
            // Mock signup
            mockSignup(username, email);
        }
    } catch (error) {
        showToast(error.message || 'Signup failed', 'error');
    }
}

function mockLogin(email) {
    const mockUser = {
        uid: 'user123',
        email: email,
        username: 'demo_user',
        displayName: 'Demo User',
        photoURL: 'https://ui-avatars.com/api/?name=Demo+User&background=8B5CF6&color=fff',
        bio: 'This is a demo bio. Welcome to VIBE!',
        followers: 123,
        following: 456,
        posts: 42,
        isAdmin: true
    };
    
    state.currentUser = mockUser;
    localStorage.setItem('vibe_user', JSON.stringify(mockUser));
    showToast('Welcome back!', 'success');
    showMainApp();
}

function mockSignup(username, email) {
    const mockUser = {
        uid: 'user_' + Date.now(),
        email: email,
        username: username,
        displayName: username,
        photoURL: `https://ui-avatars.com/api/?name=${username}&background=8B5CF6&color=fff`,
        bio: '',
        followers: 0,
        following: 0,
        posts: 0,
        isAdmin: false
    };
    
    state.currentUser = mockUser;
    localStorage.setItem('vibe_user', JSON.stringify(mockUser));
    showToast('Account created!', 'success');
    showMainApp();
}

async function loadUserData(uid) {
    if (typeof firebase === 'undefined' || firebase.apps.length === 0) return;
    
    const doc = await db.collection('users').doc(uid).get();
    if (doc.exists) {
        state.currentUser = { uid, ...doc.data() };
        localStorage.setItem('vibe_user', JSON.stringify(state.currentUser));
        showToast('Welcome back!', 'success');
        showMainApp();
    }
}

function logout() {
    if (!confirm('Are you sure you want to log out?')) return;
    
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        auth.signOut();
    }
    
    localStorage.removeItem('vibe_user');
    state.currentUser = null;
    showAuthScreen();
    showToast('Logged out', 'info');
}

// ==========================================
// APP LOCK FUNCTIONS
// ==========================================

function checkAppLock() {
    const lockEnabled = localStorage.getItem('vibe_app_lock') === 'true';
    if (lockEnabled && !state.appLocked) {
        document.getElementById('appLockScreen').classList.remove('hidden');
        state.pin = '';
        updatePinDots();
    }
}

function enterPin(num) {
    if (state.pin.length < 4) {
        state.pin += num;
        updatePinDots();
        if (state.pin.length === 4) {
            validatePin();
        }
    }
}

function deletePin() {
    state.pin = state.pin.slice(0, -1);
    updatePinDots();
}

function updatePinDots() {
    const dots = document.querySelectorAll('.pin-dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('bg-primary', i < state.pin.length);
        dot.classList.toggle('bg-gray-600', i >= state.pin.length);
    });
}

function validatePin() {
    const correctPin = localStorage.getItem('vibe_pin') || '1234';
    if (state.pin === correctPin) {
        document.getElementById('appLockScreen').classList.add('hidden');
        state.appLocked = true;
        showToast('Unlocked', 'success');
    } else {
        state.pin = '';
        updatePinDots();
        showToast('Incorrect PIN', 'error');
        if (navigator.vibrate) navigator.vibrate(200);
    }
}

function useBiometric() {
    if (!window.PublicKeyCredential) {
        showToast('Biometric not supported on this device', 'error');
        return;
    }
    
    // WebAuthn API for biometric authentication
    showToast('Biometric auth coming soon', 'info');
}

// ==========================================
// NAVIGATION FUNCTIONS
// ==========================================

function showAuthScreen() {
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showMainApp() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    
    // Update all profile images
    updateProfileImages();
    
    // Update profile info
    updateProfileInfo();
    
    // Show admin section if admin
    if (state.currentUser && state.currentUser.isAdmin) {
        document.getElementById('adminSection').classList.remove('hidden');
    }
    
    // Check app lock
    checkAppLock();
    
    // Load initial data
    loadFeed();
    loadStories();
    loadConversations();
    loadNotifications();
}

function updateProfileImages() {
    const photoURL = state.currentUser?.photoURL || 'https://ui-avatars.com/api/?name=User&background=8B5CF6&color=fff';
    document.getElementById('navProfilePic').src = photoURL;
    document.getElementById('mobileNavProfilePic').src = photoURL;
    document.getElementById('profilePic').src = photoURL;
}

function updateProfileInfo() {
    if (!state.currentUser) return;
    
    document.getElementById('profileName').textContent = state.currentUser.displayName || state.currentUser.username;
    document.getElementById('profileHandle').textContent = '@' + state.currentUser.username;
    document.getElementById('profileBio').textContent = state.currentUser.bio || 'No bio yet';
    document.getElementById('followerCount').textContent = state.currentUser.followers || 0;
    document.getElementById('followingCount').textContent = state.currentUser.following || 0;
    document.getElementById('postCount').textContent = state.currentUser.posts || 0;
}

function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    
    // Show target page
    const targetPage = document.getElementById(page + 'Page');
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }
    
    // Update navigation states
    updateNavStates(page);
    
    state.currentPage = page;
    
    // Page-specific loading
    if (page === 'feed') loadFeed();
    if (page === 'profile') loadProfilePosts();
    if (page === 'admin' && state.currentUser?.isAdmin) loadAdminData();
    
    window.scrollTo(0, 0);
}

function updateNavStates(activePage) {
    // Desktop nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
        const isActive = btn.dataset.page === activePage;
        btn.classList.toggle('text-white', isActive);
        btn.classList.toggle('text-gray-400', !isActive);
        btn.classList.toggle('bg-white/10', isActive);
    });
    
    // Mobile nav
    document.querySelectorAll('.nav-mobile').forEach(btn => {
        const isActive = btn.dataset.page === activePage;
        btn.classList.toggle('text-primary', isActive);
        btn.classList.toggle('text-gray-400', !isActive);
    });
}

// ==========================================
// FEED FUNCTIONS
// ==========================================

function setFeedFilter(filter) {
    state.feedFilter = filter;
    
    document.querySelectorAll('.feed-filter').forEach(btn => {
        const isActive = btn.dataset.filter === filter;
        btn.classList.toggle('bg-primary', isActive);
        btn.classList.toggle('text-white', isActive);
        btn.classList.toggle('bg-card', !isActive);
        btn.classList.toggle('text-gray-400', !isActive);
    });
    
    loadFeed();
}

async function loadFeed() {
    const container = document.getElementById('postsContainer');
    container.innerHTML = '<div class="skeleton h-96 rounded-2xl"></div><div class="skeleton h-96 rounded-2xl"></div>';
    
    try {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            // Load from Firestore
            const snapshot = await db.collection('posts')
                .orderBy('createdAt', 'desc')
                .limit(20)
                .get();
            
            state.posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } else {
            // Mock data
            await new Promise(r => setTimeout(r, 800));
            state.posts = getMockPosts();
        }
        
        renderPosts();
        setupIntersectionObserver();
    } catch (error) {
        console.error('Error loading feed:', error);
        showToast('Failed to load feed', 'error');
    }
}

function getMockPosts() {
    return [
        {
            id: '1',
            user: { username: 'sarah_designs', photo: 'https://i.pravatar.cc/150?img=1', verified: true },
            image: 'https://picsum.photos/seed/1/600/600',
            caption: 'Just finished this new design! What do you think? 🎨✨',
            likes: 1234,
            comments: 89,
            time: '2h',
            liked: false
        },
        {
            id: '2',
            user: { username: 'travel_mike', photo: 'https://i.pravatar.cc/150?img=3', verified: false },
            image: 'https://picsum.photos/seed/2/600/600',
            caption: 'Paradise found 🌴🌊 #travel #vacation',
            likes: 856,
            comments: 45,
            time: '4h',
            liked: true
        },
        {
            id: '3',
            user: { username: 'foodie_jenny', photo: 'https://i.pravatar.cc/150?img=5', verified: true },
            image: 'https://picsum.photos/seed/3/600/600',
            caption: 'Homemade pasta never fails 🍝❤️',
            likes: 2341,
            comments: 156,
            time: '6h',
            liked: false
        }
    ];
}

function renderPosts() {
    const container = document.getElementById('postsContainer');
    container.innerHTML = state.posts.map(post => createPostHTML(post)).join('');
}

function createPostHTML(post) {
    return `
        <article class="bg-card rounded-2xl overflow-hidden animate-fade-in" data-post-id="${post.id}">
            <div class="flex items-center justify-between p-4">
                <div class="flex items-center gap-3">
                    <div class="story-ring">
                        <img src="${post.user.photo}" class="w-10 h-10 rounded-full border-2 border-darker object-cover">
                    </div>
                    <div>
                        <div class="flex items-center gap-1">
                            <span class="font-semibold">${post.user.username}</span>
                            ${post.user.verified ? '<i class="fas fa-check-circle text-primary text-xs"></i>' : ''}
                        </div>
                        <span class="text-xs text-gray-400">${post.time}</span>
                    </div>
                </div>
                <button class="text-gray-400 hover:text-white p-2"><i class="fas fa-ellipsis-h"></i></button>
            </div>
            
            <div class="relative aspect-square bg-black" ondblclick="likePost('${post.id}')">
                <img src="${post.image}" class="w-full h-full object-cover" loading="lazy">
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none" id="likeAnim-${post.id}">
                    <i class="fas fa-heart text-6xl text-white opacity-0 transform scale-0 transition-all duration-300"></i>
                </div>
            </div>
            
            <div class="p-4">
                <div class="flex gap-4 mb-3">
                    <button onclick="likePost('${post.id}')" class="text-2xl hover:scale-110 transition ${post.liked ? 'text-red-500' : 'text-white'}">
                        <i class="${post.liked ? 'fas' : 'far'} fa-heart" id="likeBtn-${post.id}"></i>
                    </button>
                    <button onclick="openPostModal('${post.id}')" class="text-2xl hover:scale-110 transition">
                        <i class="far fa-comment"></i>
                    </button>
                    <button class="text-2xl hover:scale-110 transition">
                        <i class="far fa-paper-plane"></i>
                    </button>
                    <button class="text-2xl hover:scale-110 transition ml-auto">
                        <i class="far fa-bookmark"></i>
                    </button>
                </div>
                
                <div class="font-semibold mb-2">${post.likes.toLocaleString()} likes</div>
                <div class="mb-2">
                    <span class="font-semibold">${post.user.username}</span>
                    <span class="text-gray-300"> ${post.caption}</span>
                </div>
                <button onclick="openPostModal('${post.id}')" class="text-gray-400 text-sm mb-2 hover:text-gray-300">View all ${post.comments} comments</button>
                <div class="flex gap-2 mt-2">
                    <input type="text" placeholder="Add a comment..." class="flex-1 bg-transparent text-sm focus:outline-none" onkeypress="handleCommentKeypress(event, '${post.id}')">
                    <button onclick="postComment('${post.id}')" class="text-primary font-semibold text-sm opacity-50 hover:opacity-100">Post</button>
                </div>
            </div>
        </article>
    `;
}

async function likePost(postId) {
    const btn = document.getElementById(`likeBtn-${postId}`);
    const isLiked = btn.classList.contains('fas');
    const post = state.posts.find(p => p.id === postId);
    
    if (!isLiked) {
        // Like
        btn.classList.remove('far');
        btn.classList.add('fas', 'text-red-500', 'like-anim');
        
        // Show heart animation
        const anim = document.getElementById(`likeAnim-${postId}`).querySelector('i');
        anim.classList.remove('opacity-0', 'scale-0');
        setTimeout(() => anim.classList.add('opacity-0', 'scale-0'), 800);
        
        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(50);
        
        // Update count
        if (post) post.likes++;
        if (post) post.liked = true;
    } else {
        // Unlike
        btn.classList.remove('fas', 'text-red-500', 'like-anim');
        btn.classList.add('far');
        
        if (post) post.likes--;
        if (post) post.liked = false;
    }
    
    // Update Firebase if connected
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        await db.collection('posts').doc(postId).update({
            likes: firebase.firestore.FieldValue.increment(isLiked ? -1 : 1)
        });
    }
}

function setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('article').forEach(article => observer.observe(article));
}

// ==========================================
// STORIES FUNCTIONS
// ==========================================

function loadStories() {
    const container = document.getElementById('storiesContainer');
    
    const mockStories = [
        { user: 'sarah_designs', photo: 'https://i.pravatar.cc/150?img=1', seen: false },
        { user: 'travel_mike', photo: 'https://i.pravatar.cc/150?img=3', seen: true },
        { user: 'foodie_jenny', photo: 'https://i.pravatar.cc/150?img=5', seen: false },
        { user: 'tech_guru', photo: 'https://i.pravatar.cc/150?img=8', seen: false },
        { user: 'art_lisa', photo: 'https://i.pravatar.cc/150?img=9', seen: true }
    ];
    
    container.innerHTML = mockStories.map(story => `
        <button onclick="viewStory('${story.user}')" class="flex-shrink-0 flex flex-col items-center gap-1">
            <div class="${story.seen ? 'border-2 border-gray-600' : 'story-ring'} rounded-full p-[2px]">
                <img src="${story.photo}" class="w-14 h-14 rounded-full border-2 border-darker object-cover">
            </div>
            <span class="text-xs text-gray-400 truncate w-16">${story.user}</span>
        </button>
    `).join('');
}

function viewStory(user) {
    document.getElementById('storyModal').classList.remove('hidden');
    document.getElementById('storyImage').src = `https://picsum.photos/seed/${user}/400/800`;
    
    // Start progress bar
    setTimeout(() => {
        document.getElementById('storyProgress').style.width = '100%';
    }, 100);
    
    // Auto close after 5 seconds
    setTimeout(() => {
        closeStory();
    }, 5000);
}

function closeStory() {
    document.getElementById('storyModal').classList.add('hidden');
    document.getElementById('storyProgress').style.width = '0';
}

function openCamera(type) {
    showToast('Camera feature coming soon', 'info');
}

// ==========================================
// POST CREATION FUNCTIONS
// ==========================================

function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    const preview = document.getElementById('mediaPreview');
    
    preview.innerHTML = '';
    preview.classList.remove('hidden');
    
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML += `
                <div class="relative aspect-square rounded-xl overflow-hidden">
                    <img src="${e.target.result}" class="w-full h-full object-cover">
                    <button onclick="this.parentElement.remove()" class="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70">
                        <i class="fas fa-times text-xs"></i>
                    </button>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    });
}

function updateCharCount() {
    const caption = document.getElementById('postCaption');
    const count = caption.value.length;
    
    document.getElementById('charCount').textContent = `${count}/500`;
    
    // Auto-save draft
    localStorage.setItem('vibe_draft', caption.value);
    
    const savedIndicator = document.getElementById('draftSaved');
    savedIndicator.classList.remove('hidden');
    setTimeout(() => savedIndicator.classList.add('hidden'), 2000);
}

function setupAutoSave() {
    const draft = localStorage.getItem('vibe_draft');
    const captionInput = document.getElementById('postCaption');
    
    if (draft && captionInput) {
        captionInput.value = draft;
        updateCharCount();
    }
}

function togglePollOptions() {
    document.getElementById('pollOptions').classList.toggle('hidden');
}

async function createPost() {
    const caption = document.getElementById('postCaption').value.trim();
    const privacy = document.getElementById('postPrivacy').value;
    const disableComments = document.getElementById('disableComments').checked;
    
    if (!caption && document.getElementById('mediaPreview').classList.contains('hidden')) {
        showToast('Add a photo or caption', 'error');
        return;
    }
    
    showToast('Posting...', 'info');
    
    try {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            // Upload to Firebase
            await db.collection('posts').add({
                userId: state.currentUser.uid,
                user: {
                    username: state.currentUser.username,
                    photo: state.currentUser.photoURL,
                    verified: false
                },
                caption: caption,
                privacy: privacy,
                commentsDisabled: disableComments,
                likes: 0,
                comments: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        // Reset form
        document.getElementById('postCaption').value = '';
        document.getElementById('mediaPreview').innerHTML = '';
        document.getElementById('mediaPreview').classList.add('hidden');
        localStorage.removeItem('vibe_draft');
        
        showToast('Posted successfully!', 'success');
        navigateTo('feed');
        loadFeed();
    } catch (error) {
        console.error('Error creating post:', error);
        showToast('Failed to post', 'error');
    }
}

// ==========================================
// MESSAGING FUNCTIONS
// ==========================================

function loadConversations() {
    const list = document.getElementById('conversationsList');
    
    const mockConversations = [
        { user: 'sarah_designs', photo: 'https://i.pravatar.cc/150?img=1', lastMsg: 'Thanks! Love your work too', time: '2m', unread: 2 },
        { user: 'travel_mike', photo: 'https://i.pravatar.cc/150?img=3', lastMsg: 'Where was that photo taken?', time: '1h', unread: 0 },
        { user: 'foodie_jenny', photo: 'https://i.pravatar.cc/150?img=5', lastMsg: 'You need to try this recipe!', time: '3h', unread: 1 }
    ];
    
    list.innerHTML = mockConversations.map(conv => `
        <button onclick="openChat('${conv.user}')" class="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition border-b border-border">
            <div class="relative">
                <img src="${conv.photo}" class="w-12 h-12 rounded-full object-cover">
                ${conv.unread > 0 ? `<span class="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-xs flex items-center justify-center font-bold">${conv.unread}</span>` : ''}
            </div>
            <div class="flex-1 text-left">
                <div class="font-semibold">${conv.user}</div>
                <div class="text-sm text-gray-400 truncate">${conv.lastMsg}</div>
            </div>
            <div class="text-xs text-gray-500">${conv.time}</div>
        </button>
    `).join('');
}

function openChat(username) {
    document.getElementById('chatArea').classList.remove('hidden');
    document.getElementById('chatPartnerName').textContent = username;
    document.getElementById('chatPartnerPic').src = `https://i.pravatar.cc/150?u=${username}`;
    document.getElementById('chatPartnerStatus').textContent = 'Active now';
    
    const messagesList = document.getElementById('messagesList');
    messagesList.innerHTML = `
        <div class="flex justify-center mb-4"><span class="text-xs text-gray-500 bg-card px-3 py-1 rounded-full">Today</span></div>
        <div class="flex justify-start mb-4">
            <div class="bg-card rounded-2xl rounded-tl-none px-4 py-2 max-w-[70%]">
                <p>Hey! How are you?</p>
                <span class="text-xs text-gray-500 mt-1 block">10:30 AM</span>
            </div>
        </div>
        <div class="flex justify-end mb-4">
            <div class="bg-primary rounded-2xl rounded-tr-none px-4 py-2 max-w-[70%]">
                <p>I'm good! Just working on some new designs.</p>
                <span class="text-xs text-white/70 mt-1 flex items-center gap-1 justify-end">10:32 AM <i class="fas fa-check-double text-xs"></i></span>
            </div>
        </div>
    `;
    
    messagesList.scrollTop = messagesList.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    const messagesList = document.getElementById('messagesList');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messagesList.innerHTML += `
        <div class="flex justify-end mb-4 animate-slide-up">
            <div class="bg-primary rounded-2xl rounded-tr-none px-4 py-2 max-w-[70%]">
                <p>${escapeHtml(text)}</p>
                <span class="text-xs text-white/70 mt-1 flex items-center gap-1 justify-end">${time} <i class="fas fa-check text-xs"></i></span>
            </div>
        </div>
    `;
    
    input.value = '';
    messagesList.scrollTop = messagesList.scrollHeight;
    
    // Simulate reply
    setTimeout(() => {
        document.getElementById('typingIndicator').classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('typingIndicator').classList.add('hidden');
            messagesList.innerHTML += `
                <div class="flex justify-start mb-4 animate-slide-up">
                    <div class="bg-card rounded-2xl rounded-tl-none px-4 py-2 max-w-[70%]">
                        <p>That sounds awesome! Can't wait to see it.</p>
                        <span class="text-xs text-gray-500 mt-1 block">Just now</span>
                    </div>
                </div>
            `;
            messagesList.scrollTop = messagesList.scrollHeight;
        }, 2000);
    }, 1000);
}

function handleMessageKeypress(e) {
    if (e.key === 'Enter') sendMessage();
}

let recordingInterval;
function startRecording() {
    state.recording = true;
    showToast('Recording...', 'info');
    
    let seconds = 0;
    recordingInterval = setInterval(() => {
        seconds++;
        if (seconds > 60) stopRecording();
    }, 1000);
}

function stopRecording() {
    if (!state.recording) return;
    
    state.recording = false;
    clearInterval(recordingInterval);
    showToast('Voice message sent', 'success');
}

function startNewChat() {
    showToast('New chat feature coming soon', 'info');
}

function startVideoCall() {
    showToast('Video call feature coming soon', 'info');
}

function openChatInfo() {
    showToast('Chat info feature coming soon', 'info');
}

function openGallery() {
    showToast('Gallery feature coming soon', 'info');
}

// ==========================================
// NOTIFICATIONS FUNCTIONS
// ==========================================

function loadNotifications() {
    const list = document.getElementById('notificationsList');
    
    const mockNotifs = [
        { type: 'like', user: 'sarah_designs', photo: 'https://i.pravatar.cc/150?img=1', text: 'liked your post', time: '2m', read: false },
        { type: 'follow', user: 'travel_mike', photo: 'https://i.pravatar.cc/150?img=3', text: 'started following you', time: '1h', read: false },
        { type: 'comment', user: 'foodie_jenny', photo: 'https://i.pravatar.cc/150?img=5', text: 'commented: "Amazing shot!"', time: '3h', read: true },
        { type: 'mention', user: 'tech_guru', photo: 'https://i.pravatar.cc/150?img=8', text: 'mentioned you in a comment', time: '5h', read: true }
    ];
    
    list.innerHTML = mockNotifs.map(notif => {
        const iconMap = {
            like: 'heart',
            follow: 'user-plus',
            comment: 'comment',
            mention: 'at'
        };
        
        return `
            <div class="flex items-center gap-4 p-4 ${notif.read ? '' : 'bg-primary/5'} rounded-xl hover:bg-white/5 transition cursor-pointer">
                <div class="relative">
                    <img src="${notif.photo}" class="w-12 h-12 rounded-full object-cover">
                    <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-xs">
                        <i class="fas fa-${iconMap[notif.type]}"></i>
                    </div>
                </div>
                <div class="flex-1">
                    <span class="font-semibold">${notif.user}</span>
                    <span class="text-gray-400"> ${notif.text}</span>
                    <div class="text-xs text-gray-500 mt-1">${notif.time}</div>
                </div>
                ${notif.type === 'follow' ? '<button class="px-4 py-1.5 bg-primary rounded-full text-sm font-medium hover:bg-primary/80">Follow</button>' : ''}
            </div>
        `;
    }).join('');
    
    // Update badges
    const unread = mockNotifs.filter(n => !n.read).length;
    if (unread > 0) {
        document.getElementById('notifBadge').textContent = unread;
        document.getElementById('notifBadge').classList.remove('hidden');
        document.getElementById('mobileNotifBadge').textContent = unread;
        document.getElementById('mobileNotifBadge').classList.remove('hidden');
    }
}

// ==========================================
// PROFILE FUNCTIONS
// ==========================================

function setProfileTab(tab) {
    document.querySelectorAll('.profile-tab').forEach(t => {
        const isActive = t.dataset.tab === tab;
        t.classList.toggle('border-primary', isActive);
        t.classList.toggle('text-white', isActive);
        t.classList.toggle('border-transparent', !isActive);
        t.classList.toggle('text-gray-400', !isActive);
    });
    
    loadProfilePosts();
}

function loadProfilePosts() {
    const grid = document.getElementById('profilePosts');
    grid.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        grid.innerHTML += `
            <div class="aspect-square bg-card rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition" onclick="openPostModal(${i})">
                <img src="https://picsum.photos/seed/${i + 10}/300/300" class="w-full h-full object-cover">
            </div>
        `;
    }
}

function editProfile() {
    showToast('Edit profile coming soon', 'info');
}

function changeProfilePic() {
    showToast('Change photo coming soon', 'info');
}

function showFollowers() {
    showToast('Followers list coming soon', 'info');
}

function showFollowing() {
    showToast('Following list coming soon', 'info');
}

// ==========================================
// SETTINGS FUNCTIONS
// ==========================================

function toggleAppLock() {
    const enabled = localStorage.getItem('vibe_app_lock') === 'true';
    localStorage.setItem('vibe_app_lock', !enabled);
    document.getElementById('appLockStatus').textContent = !enabled ? 'On' : 'Off';
    showToast(`App lock ${!enabled ? 'enabled' : 'disabled'}`, 'success');
}

function toggleDarkMode() {
    state.darkMode = !state.darkMode;
    document.documentElement.classList.toggle('dark', state.darkMode);
    localStorage.setItem('vibe_dark_mode', state.darkMode);
    updateToggle('darkModeToggle', state.darkMode);
}

function toggleDataSaver() {
    state.dataSaver = !state.dataSaver;
    localStorage.setItem('vibe_data_saver', state.dataSaver);
    updateToggle('dataSaverToggle', state.dataSaver);
    showToast(`Data saver ${state.dataSaver ? 'enabled' : 'disabled'}`, 'info');
}

function updateToggle(id, enabled) {
    const toggle = document.getElementById(id);
    const dot = toggle.querySelector('div');
    
    toggle.classList.toggle('bg-primary', enabled);
    toggle.classList.toggle('bg-gray-600', !enabled);
    
    if (enabled) {
        dot.style.transform = 'translateX(24px)';
    } else {
        dot.style.transform = 'translateX(0)';
    }
}

function loadTheme() {
    const saved = localStorage.getItem('vibe_dark_mode');
    if (saved !== null) {
        state.darkMode = saved === 'true';
        document.documentElement.classList.toggle('dark', state.darkMode);
        updateToggle('darkModeToggle', state.darkMode);
    }
}

function downloadData() {
    showToast('Preparing your data...', 'info');
    
    setTimeout(() => {
        const data = JSON.stringify(state.currentUser, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my_vibe_data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Download started', 'success');
    }, 1500);
}

function deactivateAccount() {
    if (confirm('Deactivate your account? You can reactivate anytime.')) {
        showToast('Account deactivated', 'info');
    }
}

function deleteAccount() {
    if (confirm('PERMANENTLY delete your account? This cannot be undone!')) {
        if (prompt('Type DELETE to confirm:') === 'DELETE') {
            showToast('Account deleted', 'info');
            logout();
        }
    }
}

function changePassword() {
    showToast('Change password coming soon', 'info');
}

function changeUsername() {
    showToast('Change username coming soon', 'info');
}

function manageBlocked() {
    showToast('Blocked users coming soon', 'info');
}

function manageCloseFriends() {
    showToast('Close friends coming soon', 'info');
}

function setFontSize() {
    showToast('Font size settings coming soon', 'info');
}

function setLanguage() {
    showToast('Language settings coming soon', 'info');
}

function togglePushNotifs() {
    const toggle = document.getElementById('pushNotifToggle');
    const isEnabled = toggle.classList.contains('bg-primary');
    updateToggle('pushNotifToggle', !isEnabled);
    showToast(`Push notifications ${!isEnabled ? 'enabled' : 'disabled'}`, 'info');
}

function manageNotifSettings() {
    showToast('Notification settings coming soon', 'info');
}

function openSettings() {
    navigateTo('settings');
}

// ==========================================
// ADMIN FUNCTIONS
// ==========================================

function openAdminDashboard() {
    navigateTo('admin');
}

function loadAdminData() {
    document.getElementById('adminTotalUsers').textContent = '1,234';
    document.getElementById('adminTotalPosts').textContent = '45,678';
    document.getElementById('adminTotalReports').textContent = '12';
    document.getElementById('adminActiveNow').textContent = '89';
    
    const userList = document.getElementById('adminUserList');
    const mockUsers = [
        { username: 'bad_user1', reports: 5, status: 'active' },
        { username: 'spam_account', reports: 12, status: 'shadowban' },
        { username: 'normal_user', reports: 0, status: 'active' }
    ];
    
    userList.innerHTML = mockUsers.map(user => `
        <div class="flex items-center justify-between p-3 bg-darker rounded-lg">
            <div class="flex items-center gap-3">
                <img src="https://ui-avatars.com/api/?name=${user.username}&background=random" class="w-10 h-10 rounded-full">
                <div>
                    <div class="font-medium">${user.username}</div>
                    <div class="text-xs ${user.reports > 5 ? 'text-red-500' : 'text-gray-500'}">${user.reports} reports</div>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="adminAction('restrict', '${user.username}')" class="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded text-xs hover:bg-yellow-500/30">Restrict</button>
                <button onclick="adminAction('ban', '${user.username}')" class="px-3 py-1 bg-red-500/20 text-red-500 rounded text-xs hover:bg-red-500/30">Ban</button>
                <button onclick="adminAction('shadowban', '${user.username}')" class="px-3 py-1 bg-purple-500/20 text-purple-500 rounded text-xs hover:bg-purple-500/30">Shadow</button>
            </div>
        </div>
    `).join('');
}

function adminAction(action, username) {
    showToast(`${action} applied to ${username}`, 'success');
}

function sendGlobalAnnouncement() {
    const msg = document.getElementById('adminAnnouncement').value.trim();
    if (!msg) {
        showToast('Please enter a message', 'error');
        return;
    }
    
    showToast('Announcement sent to all users!', 'success');
    document.getElementById('adminAnnouncement').value = '';
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-primary'
    };
    
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    toast.className = `${colors[type]} text-white px-6 py-3 rounded-full shadow-lg transform transition-all duration-300 translate-y-[-100%] opacity-0 flex items-center gap-2 pointer-events-auto`;
    toast.innerHTML = `<i class="fas fa-${icons[type]}"></i><span class="font-medium">${message}</span>`;
    
    container.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-[-100%]', 'opacity-0');
    });
    
    setTimeout(() => {
        toast.classList.add('translate-y-[-100%]', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function openPostModal(postId) {
    document.getElementById('postModal').classList.remove('hidden');
    document.getElementById('modalPostImage').src = `https://picsum.photos/seed/${postId}/600/600`;
}

function closePostModal() {
    document.getElementById('postModal').classList.add('hidden');
}

function handleSearch() {
    const query = document.getElementById('searchInput').value.trim();
    const results = document.getElementById('searchResults');
    
    if (query.length < 2) {
        results.innerHTML = '<div class="text-center text-gray-500 py-12"><i class="fas fa-search text-4xl mb-4 opacity-50"></i><p>Search for users, posts, or tags</p></div>';
        return;
    }
    
    results.innerHTML = '<div class="skeleton h-20 rounded-xl mb-2"></div><div class="skeleton h-20 rounded-xl"></div>';
    
    setTimeout(() => {
        results.innerHTML = `
            <div class="space-y-4">
                <div class="flex items-center gap-4 p-4 bg-card rounded-xl cursor-pointer hover:bg-white/5 transition">
                    <img src="https://i.pravatar.cc/150?img=1" class="w-12 h-12 rounded-full">
                    <div>
                        <div class="font-semibold">${query}_user</div>
                        <div class="text-sm text-gray-400">@${query}</div>
                    </div>
                    <button class="ml-auto px-4 py-1.5 bg-primary rounded-full text-sm font-medium hover:bg-primary/80">Follow</button>
                </div>
            </div>
        `;
    }, 500);
}

function handleCommentKeypress(e, postId) {
    if (e.key === 'Enter') postComment(postId);
}

function postComment(postId) {
    showToast('Comment posted', 'success');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function syncOfflineData() {
    showToast('Syncing offline data...', 'info');
}

// Screenshot protection in DMs
document.addEventListener('keyup', (e) => {
    if (e.key === 'PrintScreen' && state.currentPage === 'messages') {
        showToast('Screenshots blocked in DMs', 'error');
        navigator.clipboard.writeText('');
    }
});

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {
        console.log('Service Worker registration failed');
    });
}
