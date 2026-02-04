// ==================== MAIN APP CONTROLLER ====================

const app = {
    // Initialize app
    async init() {
        // Listen for auth state changes
        auth.onAuthStateChanged(async (user) => {
            // Hide splash after delay
            setTimeout(() => {
                const splash = document.getElementById('splash');
                if (splash) {
                    splash.style.opacity = '0';
                    setTimeout(() => splash.classList.add('hidden'), 700);
                }
            }, 2000);

            if (user) {
                // User is signed in
                currentUser = user;
                await this.loadUserData();
                this.showMain();
                this.setupRealtimeListeners();
            } else {
                // User is signed out
                this.showAuth();
            }
        });

        // Setup global event listeners
        this.setupEventListeners();
    },

    // Load user data from Firestore
    async loadUserData() {
        try {
            const doc = await db.collection('users').doc(currentUser.uid).get();
            
            if (doc.exists) {
                userData = doc.data();
            } else {
                // Shouldn't happen if auth.js worked, but just in case
                console.error('User document not found');
                await auth.signOut();
                return;
            }

            // Update last active
            await db.collection('users').doc(currentUser.uid).update({
                lastActive: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Update UI with user data
            this.updateUI();

        } catch (err) {
            console.error('Error loading user data:', err);
            toast.show('Error loading profile', 'error');
        }
    },

    // Update all UI elements with user data
    updateUI() {
        if (!userData) return;

        // Set theme
        this.setTheme(userData.theme || 'purple');

        // Update profile images
        const avatar = userData.avatar || `https://ui-avatars.com/api/?name=${userData.username[0]}&background=random&color=fff&size=128`;
        
        const imgElements = {
            'nav-profile-img': avatar,
            'profile-avatar-large': avatar,
            'sidebar-avatar': avatar,
            'my-story-img': avatar,
            'comment-avatar': avatar
        };

        Object.entries(imgElements).forEach(([id, src]) => {
            const el = document.getElementById(id);
            if (el) el.src = src;
        });

        // Update text elements
        const textElements = {
            'profile-name': userData.displayName || userData.username,
            'profile-username': '@' + userData.username,
            'sidebar-name': userData.displayName || userData.username,
            'sidebar-username': '@' + userData.username,
            'profile-bio': userData.bio || 'No bio yet'
        };

        Object.entries(textElements).forEach(([id, text]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        });

        // Show admin section if admin
        if (userData.isAdmin) {
            const adminSection = document.getElementById('admin-section');
            const profileBadge = document.getElementById('profile-badge');
            if (adminSection) adminSection.classList.remove('hidden');
            if (profileBadge) profileBadge.classList.remove('hidden');
        }

        // Update story ring if has story
        if (userData.hasStory) {
            const ring = document.getElementById('my-story-ring');
            const img = document.getElementById('my-story-img');
            const icon = document.getElementById('my-story-icon');
            
            if (ring) ring.classList.add('story-ring');
            if (img) img.classList.remove('hidden');
            if (icon) icon.classList.add('hidden');
        }

        // Update settings
        this.updateSettingsUI();
    },

    // Update settings panel UI
    updateSettingsUI() {
        // Privacy toggles
        const privateToggle = document.getElementById('privacy-private');
        const activeToggle = document.getElementById('privacy-active');
        
        if (privateToggle) privateToggle.checked = userData.isPrivate || false;
        if (activeToggle) activeToggle.checked = userData.showActive !== false;

        // Notification toggles
        if (userData.notifications) {
            Object.entries(userData.notifications).forEach(([key, value]) => {
                const el = document.getElementById('notif-' + key);
                if (el) el.checked = value;
            });
        }

        // Username changes left
        const changesLeft = 3 - (userData.usernameChanges || 0);
        const changesEl = document.getElementById('username-changes-left');
        if (changesEl) changesEl.textContent = Math.max(0, changesLeft) + ' left';
    },

    // Set theme color
    setTheme(theme) {
        currentTheme = theme;
        document.body.className = `bg-black text-white overflow-hidden theme-${theme}`;
        
        // Update CSS variables
        const colors = {
            purple: { main: '#8b5cf6', light: '#a78bfa' },
            blue: { main: '#3b82f6', light: '#60a5fa' },
            red: { main: '#ef4444', light: '#f87171' },
            green: { main: '#10b981', light: '#34d399' },
            pink: { main: '#ec4899', light: '#f472b6' },
            yellow: { main: '#f59e0b', light: '#fbbf24' },
            orange: { main: '#f97316', light: '#fb923c' }
        };
        
        const color = colors[theme] || colors.purple;
        document.documentElement.style.setProperty('--theme-color', color.main);
        document.documentElement.style.setProperty('--theme-light', color.light);
    },

    // Show auth screen
    showAuth() {
        const splash = document.getElementById('splash');
        const authScreen = document.getElementById('auth-screen');
        const mainApp = document.getElementById('main-app');
        
        if (splash) splash.classList.add('hidden');
        if (authScreen) authScreen.classList.remove('hidden');
        if (mainApp) mainApp.classList.add('hidden');
    },

    // Show main app
    showMain() {
        const authScreen = document.getElementById('auth-screen');
        const mainApp = document.getElementById('main-app');
        
        if (authScreen) authScreen.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');
        
        // Load initial data
        feed.load();
        stories.load();
        activity.load();
    },

    // Setup global event listeners
    setupEventListeners() {
        // Pull to refresh
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            let touchStartY = 0;
            
            contentArea.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
            }, { passive: true });
            
            contentArea.addEventListener('touchmove', (e) => {
                if (contentArea.scrollTop === 0) {
                    const touchY = e.touches[0].clientY;
                    const diff = touchY - touchStartY;
                    if (diff > 0 && diff < 100) {
                        // Visual feedback for pull
                    }
                }
            }, { passive: true });
        }

        // Handle visibility change (app background/foreground)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // App went to background
                if (currentUser) {
                    db.collection('users').doc(currentUser.uid).update({
                        lastActive: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            } else {
                // App came to foreground
                if (currentUser) {
                    db.collection('users').doc(currentUser.uid).update({
                        lastActive: firebase.firestore.FieldValue.serverTimestamp(),
                        showActive: true
                    });
                }
            }
        });

        // Handle before unload
        window.addEventListener('beforeunload', () => {
            if (currentUser) {
                db.collection('users').doc(currentUser.uid).update({
                    lastActive: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        });
    },

    // Setup realtime listeners
    setupRealtimeListeners() {
        // Listen for new notifications
        db.collection('notifications')
            .where('to', '==', currentUser.uid)
            .where('read', '==', false)
            .onSnapshot((snap) => {
                const count = snap.size;
                const badge = document.getElementById('msg-badge');
                
                if (badge) {
                    if (count > 0) {
                        badge.textContent = count > 99 ? '99+' : count;
                        badge.classList.remove('hidden');
                    } else {
                        badge.classList.add('hidden');
                    }
                }
            });

        // Listen for friend requests
        db.collection('friendRequests')
            .where('to', '==', currentUser.uid)
            .where('status', '==', 'pending')
            .onSnapshot((snap) => {
                // Update friend request count
                const count = snap.size;
                // Could show badge somewhere
            });
    },

    // Toggle sidebar
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const content = document.getElementById('sidebar-content');
        
        if (!sidebar || !content) return;
        
        if (sidebar.classList.contains('hidden')) {
            sidebar.classList.remove('hidden');
            // Small delay for animation
            setTimeout(() => {
                content.classList.remove('-translate-x-full');
            }, 10);
        } else {
            content.classList.add('-translate-x-full');
            setTimeout(() => {
                sidebar.classList.add('hidden');
            }, 300);
        }
    },

    // Show toast notification
    showToast(message, type = 'info') {
        toast.show(message, type);
    },

    // Show loading overlay
    showLoading(text = 'Loading...') {
        loader.show(text);
    },

    // Hide loading overlay
    hideLoading() {
        loader.hide();
    },

    // Handle scroll (hide/show header)
    handleScroll(element) {
        const header = document.getElementById('top-nav');
        if (!header) return;
        
        if (element.scrollTop > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
    },

    // Refresh all data
    async refresh() {
        loader.show('Refreshing...');
        
        await Promise.all([
            feed.load(),
            stories.load(),
            activity.load()
        ]);
        
        loader.hide();
        toast.show('Refreshed', 'success');
    },

    // Check if user is admin
    isAdmin() {
        return userData?.isAdmin || false;
    },

    // Get current user ID
    getCurrentUserId() {
        return currentUser?.uid || null;
    },

    // Get current user data
    getCurrentUserData() {
        return userData || null;
    }
};

// Expose to window
window.app = app;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
