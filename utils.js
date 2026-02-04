// ==================== UTILITY FUNCTIONS ====================

// Global state
let currentUser = null;
let userData = null;
let currentTheme = 'purple';

// Toast notifications
const toast = {
    show(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-gray-800',
            warning: 'bg-yellow-500'
        };
        const icons = {
            success: 'fa-check',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };
        
        toast.className = `${colors[type]} px-6 py-3 rounded-full shadow-lg text-sm font-semibold fade-in flex items-center gap-2 pointer-events-auto`;
        toast.innerHTML = `<i class="fas ${icons[type]}"></i> ${message}`;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            toast.style.transition = 'all 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Loading overlay
const loader = {
    show(text = 'Loading...') {
        const overlay = document.getElementById('loading-overlay');
        const textEl = document.getElementById('loading-text');
        if (overlay && textEl) {
            textEl.textContent = text;
            overlay.classList.remove('hidden');
        }
    },
    
    hide() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.add('hidden');
    }
};

// Format time ago
function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'y ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'mo ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm ago';
    
    return 'Just now';
}

// Format number (1.2K, 3M)
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// File to Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Compress image
function compressImage(base64, maxWidth = 1080, quality = 0.8) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = Math.min(maxWidth / img.width, 1);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
    });
}

// Generate video thumbnail
function generateThumbnail(videoUrl) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.src = videoUrl;
        video.currentTime = 1;
        video.onloadeddata = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            resolve(canvas.toDataURL('image/jpeg'));
        };
        video.onerror = () => resolve(null);
    });
}

// Check if user is online
function isUserOnline(lastActive) {
    if (!lastActive) return false;
    const last = lastActive.toDate ? lastActive.toDate() : new Date(lastActive);
    return (new Date() - last) < 5 * 60 * 1000; // 5 minutes
}

// Validate username
function isValidUsername(username) {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

// Validate email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Deep clone object
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Local storage helpers
const storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage error:', e);
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },
    
    remove(key) {
        localStorage.removeItem(key);
    }
};

// Copy to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        toast.show('Copied to clipboard', 'success');
    } catch (err) {
        toast.show('Failed to copy', 'error');
    }
}

// Share content
async function shareContent(data) {
    if (navigator.share) {
        try {
            await navigator.share(data);
        } catch (err) {
            console.log('Share cancelled');
        }
    } else {
        copyToClipboard(data.url || data.text);
    }
}

// Request notification permission
async function requestNotificationPermission() {
    if (!('Notification' in window)) return false;
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
}

// Send push notification
function sendNotification(title, options = {}) {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            icon: '/icon.png',
            badge: '/badge.png',
            ...options
        });
    }
}

// Detect mobile device
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Detect iOS
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

// Get device info
function getDeviceInfo() {
    return {
        isMobile: isMobile(),
        isIOS: isIOS(),
        isAndroid: /Android/.test(navigator.userAgent),
        isStandalone: window.matchMedia('(display-mode: standalone)').matches
    };
}

// Prevent zoom on iOS
if (isIOS()) {
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
    document.addEventListener('gestureend', (e) => e.preventDefault());
}

// Handle online/offline
window.addEventListener('online', () => toast.show('Back online', 'success'));
window.addEventListener('offline', () => toast.show('You are offline', 'warning'));

// Error handler
window.onerror = (msg, url, line) => {
    console.error('Error:', msg, 'at', url, ':', line);
    // Don't show toast for every error in production
    return false;
};

// Expose utilities
window.toast = toast;
window.loader = loader;
window.timeAgo = timeAgo;
window.formatNumber = formatNumber;
window.debounce = debounce;
window.throttle = throttle;
window.fileToBase64 = fileToBase64;
window.compressImage = compressImage;
window.generateThumbnail = generateThumbnail;
window.isUserOnline = isUserOnline;
window.isValidUsername = isValidUsername;
window.isValidEmail = isValidEmail;
window.deepClone = deepClone;
window.storage = storage;
window.copyToClipboard = copyToClipboard;
window.shareContent = shareContent;
window.requestNotificationPermission = requestNotificationPermission;
window.sendNotification = sendNotification;
window.isMobile = isMobile;
window.isIOS = isIOS;
window.getDeviceInfo = getDeviceInfo;
