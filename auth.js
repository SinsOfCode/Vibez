// ==================== AUTHENTICATION CONTROLLER ====================

const authCtrl = {
    mode: 'login',
    usernameTimeout: null,

    // Toggle between login and signup
    toggleMode(mode) {
        this.mode = mode;
        
        // Update toggle buttons
        const loginBtn = document.getElementById('login-toggle');
        const signupBtn = document.getElementById('signup-toggle');
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        
        if (mode === 'login') {
            loginBtn.className = 'flex-1 py-2 rounded-full text-sm font-semibold transition bg-purple-600 text-white';
            signupBtn.className = 'flex-1 py-2 rounded-full text-sm font-semibold transition text-gray-400';
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
        } else {
            loginBtn.className = 'flex-1 py-2 rounded-full text-sm font-semibold transition text-gray-400';
            signupBtn.className = 'flex-1 py-2 rounded-full text-sm font-semibold transition bg-purple-600 text-white';
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
        }
        
        // Clear errors
        document.getElementById('login-error').classList.add('hidden');
        document.getElementById('signup-error').classList.add('hidden');
    },

    // Toggle password visibility
    togglePassword(form) {
        const input = document.getElementById(`${form}-password`);
        const icon = document.getElementById(`${form}-eye`);
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    },

    // Check username availability
    checkUsername(username) {
        clearTimeout(this.usernameTimeout);
        const status = document.getElementById('username-status');
        
        if (username.length < 3) {
            status.textContent = 'Too short';
            status.className = 'absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-red-500';
            return;
        }
        
        if (!isValidUsername(username)) {
            status.textContent = 'Invalid';
            status.className = 'absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-red-500';
            return;
        }
        
        status.textContent = 'Checking...';
        status.className = 'absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-yellow-500';
        
        this.usernameTimeout = setTimeout(async () => {
            try {
                const snap = await db.collection('users')
                    .where('username', '==', username.toLowerCase())
                    .get();
                
                if (snap.empty) {
                    status.textContent = '✓ Available';
                    status.className = 'absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-green-500';
                } else {
                    status.textContent = 'Taken';
                    status.className = 'absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-red-500';
                }
            } catch (err) {
                status.textContent = '';
            }
        }, 500);
    },

    // Handle login
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');
        const btn = document.getElementById('login-btn');
        const btnText = btn.querySelector('span');
        const spinner = btn.querySelector('.loading-spinner');
        
        // Validate
        if (!email || !password) {
            errorDiv.textContent = 'Please fill in all fields';
            errorDiv.classList.remove('hidden');
            return;
        }
        
        // Show loading
        btn.disabled = true;
        btnText.textContent = 'Signing in...';
        spinner.classList.remove('hidden');
        errorDiv.classList.add('hidden');
        
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            
            // Update last active
            await db.collection('users').doc(userCredential.user.uid).update({
                lastActive: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            toast.show('Welcome back!', 'success');
            
        } catch (err) {
            console.error('Login error:', err);
            
            let errorMsg = 'Login failed';
            switch (err.code) {
                case 'auth/user-not-found':
                    errorMsg = 'No account found with this email';
                    break;
                case 'auth/wrong-password':
                    errorMsg = 'Incorrect password';
                    break;
                case 'auth/invalid-email':
                    errorMsg = 'Invalid email address';
                    break;
                case 'auth/user-disabled':
                    errorMsg = 'This account has been disabled';
                    break;
                case 'auth/too-many-requests':
                    errorMsg = 'Too many attempts. Try again later';
                    break;
                default:
                    errorMsg = err.message;
            }
            
            errorDiv.textContent = errorMsg;
            errorDiv.classList.remove('hidden');
            
            // Reset button
            btn.disabled = false;
            btnText.textContent = 'Log In';
            spinner.classList.add('hidden');
        }
    },

    // Handle signup
    async handleSignup(e) {
        e.preventDefault();
        
        const username = document.getElementById('signup-username').value.toLowerCase().trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const errorDiv = document.getElementById('signup-error');
        const btn = document.getElementById('signup-btn');
        const btnText = btn.querySelector('span');
        const spinner = btn.querySelector('.loading-spinner');
        
        // Validate
        if (!username || !email || !password) {
            errorDiv.textContent = 'Please fill in all fields';
            errorDiv.classList.remove('hidden');
            return;
        }
        
        if (!isValidUsername(username)) {
            errorDiv.textContent = 'Username: 3-20 chars, letters/numbers/underscores only';
            errorDiv.classList.remove('hidden');
            return;
        }
        
        if (!isValidEmail(email)) {
            errorDiv.textContent = 'Please enter a valid email';
            errorDiv.classList.remove('hidden');
            return;
        }
        
        if (password.length < 6) {
            errorDiv.textContent = 'Password must be at least 6 characters';
            errorDiv.classList.remove('hidden');
            return;
        }
        
        // Show loading
        btn.disabled = true;
        btnText.textContent = 'Creating account...';
        spinner.classList.remove('hidden');
        errorDiv.classList.add('hidden');
        
        try {
            // Double-check username
            const usernameCheck = await db.collection('users')
                .where('username', '==', username)
                .get();
            
            if (!usernameCheck.empty) {
                throw new Error('Username already taken');
            }
            
            // Create auth user
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Update profile
            await user.updateProfile({
                displayName: username,
                photoURL: `https://ui-avatars.com/api/?name=${username[0]}&background=random&color=fff&size=128`
            });
            
            // Create user document
            const userData = {
                uid: user.uid,
                email: email,
                username: username,
                displayName: username,
                bio: '',
                avatar: `https://ui-avatars.com/api/?name=${username[0]}&background=random&color=fff&size=128`,
                theme: 'purple',
                isAdmin: email === ADMIN_EMAIL,
                isPrivate: false,
                showActive: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastActive: firebase.firestore.FieldValue.serverTimestamp(),
                postCount: 0,
                friendCount: 0,
                usernameChanges: 0,
                lastUsernameChange: null,
                notifications: {
                    push: true,
                    likes: true,
                    comments: true,
                    messages: true,
                    requests: true,
                    stories: true
                },
                blockedUsers: [],
                closeFriends: [],
                savedPosts: [],
                searchHistory: []
            };
            
            await db.collection('users').doc(user.uid).set(userData);
            
            // Send welcome notification
            await db.collection('notifications').add({
                to: user.uid,
                from: 'system',
                fromName: 'VIBE',
                fromAvatar: '/icon.png',
                type: 'welcome',
                text: 'Welcome to VIBE! Start by adding friends or creating your first post.',
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            });
            
            toast.show('Account created! Welcome!', 'success');
            
        } catch (err) {
            console.error('Signup error:', err);
            
            let errorMsg = 'Failed to create account';
            switch (err.code || err.message) {
                case 'auth/email-already-in-use':
                    errorMsg = 'Email already registered';
                    break;
                case 'auth/invalid-email':
                    errorMsg = 'Invalid email address';
                    break;
                case 'auth/weak-password':
                    errorMsg = 'Password is too weak';
                    break;
                case 'Username already taken':
                    errorMsg = 'Username already taken';
                    break;
                default:
                    errorMsg = err.message;
            }
            
            errorDiv.textContent = errorMsg;
            errorDiv.classList.remove('hidden');
            
            // Reset button
            btn.disabled = false;
            btnText.textContent = 'Create Account';
            spinner.classList.add('hidden');
        }
    },

    // Logout
    async logout() {
        try {
            // Update last active
            if (currentUser) {
                await db.collection('users').doc(currentUser.uid).update({
                    lastActive: firebase.firestore.FieldValue.serverTimestamp(),
                    showActive: false
                });
            }
            
            await auth.signOut();
            toast.show('Logged out', 'info');
            
            // Clear local state
            currentUser = null;
            userData = null;
            
            // Reload page
            setTimeout(() => location.reload(), 500);
            
        } catch (err) {
            console.error('Logout error:', err);
            toast.show('Error logging out', 'error');
        }
    },

    // Reset password
    async resetPassword(email) {
        try {
            await auth.sendPasswordResetEmail(email);
            toast.show('Password reset email sent', 'success');
        } catch (err) {
            toast.show('Failed to send reset email', 'error');
        }
    },

    // Change email
    async changeEmail(newEmail) {
        try {
            await currentUser.updateEmail(newEmail);
            await db.collection('users').doc(currentUser.uid).update({ email: newEmail });
            toast.show('Email updated', 'success');
        } catch (err) {
            toast.show('Failed to update email', 'error');
        }
    },

    // Change password
    async changePassword(currentPassword, newPassword) {
        try {
            // Re-authenticate
            const credential = firebase.auth.EmailAuthProvider.credential(
                currentUser.email,
                currentPassword
            );
            await currentUser.reauthenticateWithCredential(credential);
            
            // Update password
            await currentUser.updatePassword(newPassword);
            toast.show('Password updated', 'success');
        } catch (err) {
            toast.show('Failed to update password', 'error');
        }
    },

    // Delete account
    async deleteAccount() {
        try {
            // Delete user data
            await db.collection('users').doc(currentUser.uid).delete();
            
            // Delete auth account
            await currentUser.delete();
            
            toast.show('Account deleted', 'success');
            setTimeout(() => location.reload(), 1000);
            
        } catch (err) {
            toast.show('Failed to delete account', 'error');
        }
    },

    // Check if username can be changed
    canChangeUsername() {
        if (!userData.lastUsernameChange) return true;
        
        const lastChange = userData.lastUsernameChange.toDate();
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const changesLeft = 3 - (userData.usernameChanges || 0);
        
        return lastChange < weekAgo || changesLeft > 0;
    }
};

// Expose to window
window.auth = authCtrl;
