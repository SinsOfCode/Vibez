// ==================== APP BOOTSTRAP ====================

function setScreenVisibility({ showAuth }) {
    const splash = document.getElementById('splash');
    const authScreen = document.getElementById('auth-screen');
    const mainApp = document.getElementById('main-app');

    if (splash) splash.classList.add('hidden');

    if (showAuth) {
        authScreen?.classList.remove('hidden');
        mainApp?.classList.add('hidden');
    } else {
        authScreen?.classList.add('hidden');
        mainApp?.classList.remove('hidden');
    }
}

function safelyRunAuthListener() {
    if (typeof auth === 'undefined' || !auth?.onAuthStateChanged) {
        setScreenVisibility({ showAuth: true });
        return;
    }

    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            setScreenVisibility({ showAuth: false });
        } else {
            setScreenVisibility({ showAuth: true });
        }
    }, () => {
        setScreenVisibility({ showAuth: true });
    });
}

function registerFallbacks() {
    window.app = window.app || {
        toggleSidebar() {
            toast?.show('Sidebar coming soon', 'info');
        }
    };

    window.nav = window.nav || {
        openMessages() {
            toast?.show('Messages coming soon', 'info');
        }
    };

    window.camera = window.camera || {
        open() {
            toast?.show('Camera coming soon', 'info');
        }
    };

    window.story = window.story || {
        add() {
            toast?.show('Stories coming soon', 'info');
        }
    };
}

function hideSplashAfterDelay() {
    const splash = document.getElementById('splash');
    if (!splash) return;

    setTimeout(() => {
        splash.classList.add('hidden');
    }, 1200);
}

window.addEventListener('DOMContentLoaded', () => {
    registerFallbacks();
    hideSplashAfterDelay();
});

window.addEventListener('load', () => {
    safelyRunAuthListener();
});
