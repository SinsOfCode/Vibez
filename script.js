// ============================================
// VALENTINE SITE - FIXED JAVASCRIPT
// Buttons actually work now lol
// ============================================

// Default Data
const defaultData = {
    siteTitle: "Our Love Story",
    partner1: "You",
    partner2: "Her",
    startDate: "2024-04-06T00:00",
    mainQuestion: "Will You Be My Valentine?",
    landingSubtext: "My heart has been waiting for this moment...",
    yesBtnText: "YES! ♥",
    noBtnText: "No...",
    successMessage: "You Made Me The Happiest Person Alive!",
    orbitText: "LOVE♥FOREVER",
    timerLabel: "Together Since",
    timerPosition: "floating",
    theme: "romantic",
    animIntensity: 80,
    colors: {
        primary: "#ff6b9d",
        secondary: "#c44569",
        accent: "#ffd93d",
        text: "#ffffff",
        bg: "#1a1a2e"
    },
    slides: [
        {
            id: 1,
            title: "The Beginning",
            content: "Every great love story starts with a single moment. Ours began on April 6th, 2024...",
            date: "2024-04-06",
            image: null,
            color: "#ff6b9d"
        },
        {
            id: 2,
            title: "Our First Date",
            content: "Remember how nervous we were? Now look at us, inseparable and stronger every day.",
            date: "",
            image: null,
            color: "#c44569"
        },
        {
            id: 3,
            title: "Countless Memories",
            content: "From laughter to tears, we've shared it all. Every moment with you is a treasure.",
            date: "",
            image: null,
            color: "#667eea"
        }
    ],
    images: []
};

// Theme Presets
const themes = {
    romantic: { primary: "#ff6b9d", secondary: "#c44569", accent: "#ffd93d", bg: "#1a1a2e" },
    ocean: { primary: "#667eea", secondary: "#764ba2", accent: "#f093fb", bg: "#0f0f23" },
    sunset: { primary: "#f093fb", secondary: "#f5576c", accent: "#ffd93d", bg: "#1a0f1f" },
    forest: { primary: "#11998e", secondary: "#38ef7d", accent: "#c4e538", bg: "#0a1f15" },
    gold: { primary: "#f5af19", secondary: "#f12711", accent: "#ffd700", bg: "#1f150a" },
    midnight: { primary: "#232526", secondary: "#414345", accent: "#7f8c8d", bg: "#000000" }
};

// Data Management
function getData() {
    const saved = localStorage.getItem('valentineSiteData');
    return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(defaultData));
}

function saveData(data) {
    localStorage.setItem('valentineSiteData', JSON.stringify(data));
}

// Apply Colors
function applyThemeColors(colors) {
    const root = document.documentElement;
    if (colors.primary) root.style.setProperty('--primary', colors.primary);
    if (colors.secondary) root.style.setProperty('--secondary', colors.secondary);
    if (colors.accent) root.style.setProperty('--accent', colors.accent);
    if (colors.text) root.style.setProperty('--text', colors.text);
    if (colors.bg) root.style.setProperty('--bg', colors.bg);
}

// ============================================
// LANDING PAGE - index.html
// ============================================

function initLandingPage() {
    const data = getData();
    applyThemeColors(data.colors);
    
    // Set content
    const mainQ = document.getElementById('mainQuestion');
    if (mainQ) {
        mainQ.textContent = data.mainQuestion;
        mainQ.setAttribute('data-text', data.mainQuestion);
    }
    
    const subMsg = document.getElementById('subMessage');
    if (subMsg) subMsg.textContent = data.landingSubtext;
    
    const yesBtn = document.getElementById('yesBtn');
    if (yesBtn) yesBtn.querySelector('.btn-text').textContent = data.yesBtnText;
    
    const noBtn = document.getElementById('noBtn');
    if (noBtn) noBtn.querySelector('.btn-text').textContent = data.noBtnText;
    
    // Setup orbit text
    setupOrbitText(data.orbitText);
    
    // Create effects
    createFloatingHearts();
    createSparkles();
    
    // Check if already said yes
    if (localStorage.getItem('valentineResponse') === 'yes') {
        showSuccess();
    }
}

function setupOrbitText(text) {
    const ring1 = document.getElementById('orbitRing1');
    const ring2 = document.getElementById('orbitRing2');
    if (!ring1) return;
    
    const chars = (text || "LOVE♥FOREVER").split('');
    
    // Clear existing
    ring1.innerHTML = '';
    if (ring2) ring2.innerHTML = '';
    
    // Ring 1
    chars.forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char;
        const angle = (i / chars.length) * 360;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * 140;
        const y = Math.sin(rad) * 140;
        
        span.style.cssText = `
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(calc(-50% + ${x}px), calc(-50% + ${y}px));
            font-size: 16px;
            font-weight: bold;
            color: var(--accent);
            text-shadow: 0 0 10px var(--accent);
        `;
        ring1.appendChild(span);
    });
    
    // Ring 2 (if exists)
    if (ring2) {
        chars.reverse().forEach((char, i) => {
            const span = document.createElement('span');
            span.textContent = char;
            const angle = (i / chars.length) * 360;
            const rad = (angle * Math.PI) / 180;
            const x = Math.cos(rad) * 170;
            const y = Math.sin(rad) * 170;
            
            span.style.cssText = `
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(calc(-50% + ${x}px), calc(-50% + ${y}px));
                font-size: 14px;
                opacity: 0.7;
                color: var(--accent);
            `;
            ring2.appendChild(span);
        });
    }
}

function createFloatingHearts() {
    const container = document.getElementById('floatingHearts');
    if (!container) return;
    
    const hearts = ['♥', '💖', '💕', '💗', '💓'];
    
    setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'heart-particle';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.fontSize = (Math.random() * 20 + 15) + 'px';
        heart.style.animationDuration = (Math.random() * 5 + 8) + 's';
        heart.style.opacity = Math.random() * 0.4 + 0.3;
        
        container.appendChild(heart);
        setTimeout(() => heart.remove(), 13000);
    }, 800);
}

function createSparkles() {
    const container = document.getElementById('heartSparkles');
    if (!container) return;
    
    for (let i = 0; i < 6; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        const angle = (i / 6) * 360;
        const rad = (angle * Math.PI) / 180;
        
        sparkle.style.cssText = `
            position: absolute;
            left: ${50 + Math.cos(rad) * 40}%;
            top: ${50 + Math.sin(rad) * 40}%;
            width: 4px;
            height: 4px;
            background: var(--accent);
            border-radius: 50%;
            animation: sparkleAnim 2s ease-in-out infinite;
            animation-delay: ${i * 0.3}s;
        `;
        container.appendChild(sparkle);
    }
}

// YES BUTTON - ACTUALLY WORKS NOW
function handleYes() {
    console.log('YES clicked!'); // Debug
    
    // Flash effect
    const flash = document.getElementById('flashOverlay');
    if (flash) {
        flash.style.opacity = '0.8';
        setTimeout(() => flash.style.opacity = '0', 300);
    }
    
    // Confetti
    fireConfetti();
    
    // Hide question, show success
    const questionBox = document.getElementById('questionSection');
    const successBox = document.getElementById('successSection');
    
    if (questionBox) questionBox.style.display = 'none';
    if (successBox) successBox.style.display = 'block';
    
    // Save response
    localStorage.setItem('valentineResponse', 'yes');
    
    // Start mini timer
    startMiniTimer();
}

function showSuccess() {
    const questionBox = document.getElementById('questionSection');
    const successBox = document.getElementById('successSection');
    
    if (questionBox) questionBox.style.display = 'none';
    if (successBox) {
        successBox.style.display = 'block';
        startMiniTimer();
    }
}

// CONFETTI THAT ACTUALLY WORKS
function fireConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    
    const particles = [];
    const colors = ['#ff6b9d', '#ffd93d', '#ffffff', '#c44569', '#ff9ff3'];
    
    // Create particles
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15 - 5,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            life: 1
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        
        particles.forEach(p => {
            if (p.life <= 0) return;
            alive = true;
            
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.3; // gravity
            p.rotation += p.rotationSpeed;
            p.life -= 0.015;
            
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            
            // Draw heart
            const s = p.size;
            ctx.beginPath();
            ctx.moveTo(0, -s/2);
            ctx.bezierCurveTo(s/2, -s, s, -s/3, 0, s);
            ctx.bezierCurveTo(-s, -s/3, -s/2, -s, 0, -s/2);
            ctx.fill();
            
            ctx.restore();
        });
        
        if (alive) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    animate();
}

// NO BUTTON RUNS AWAY
function handleNo() {
    const btn = document.getElementById('noBtn');
    if (!btn) return;
    
    const messages = ["Are you sure? 🥺", "Think again! 💭", "Pretty please? 🙏", "My heart 💔", "Wrong answer! 😤"];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    
    const btnText = btn.querySelector('.btn-text');
    if (btnText) btnText.textContent = msg;
    
    setTimeout(() => {
        if (btnText) btnText.textContent = getData().noBtnText;
    }, 2000);
}

function escapeButton() {
    if (window.innerWidth < 768) return; // Don't run on mobile
    
    const btn = document.getElementById('noBtn');
    if (!btn) return;
    
    // Only move sometimes, not every time
    if (Math.random() > 0.7) return;
    
    const maxX = window.innerWidth - 150;
    const maxY = window.innerHeight - 100;
    
    const newX = Math.random() * maxX;
    const newY = Math.random() * maxY;
    
    btn.style.position = 'fixed';
    btn.style.left = newX + 'px';
    btn.style.top = newY + 'px';
    btn.style.transition = 'all 0.4s ease';
    btn.style.zIndex = '1000';
}

// MINI TIMER
function startMiniTimer() {
    const data = getData();
    const start = new Date(data.startDate);
    
    function update() {
        const now = new Date();
        const diff = now - start;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        const el = document.getElementById('miniDays');
        if (el) el.textContent = days.toString().padStart(3, '0');
    }
    
    update();
    setInterval(update, 60000);
}

function goToStory() {
    window.location.href = 'story.html';
}

// ============================================
// STORY PAGE - story.html
// ============================================

function initStoryPage() {
    const data = getData();
    applyThemeColors(data.colors);
    
    // Setup timer
    setupTimer(data);
    
    // Render slides
    renderSlides(data.slides);
    
    // Setup scroll effects
    setupScrollEffects();
    
    // Create effects
    createAmbientParticles();
    
    // Setup nav
    setupStoryNav();
}

function setupTimer(data) {
    const start = new Date(data.startDate);
    
    const labelEl = document.getElementById('timerLabel');
    const dateEl = document.getElementById('startDateDisplay');
    
    if (labelEl) labelEl.textContent = data.timerLabel;
    if (dateEl) dateEl.textContent = 'Since ' + start.toLocaleDateString('en-US', { 
        month: 'long', day: 'numeric', year: 'numeric' 
    });
    
    // Position timer
    const timer = document.getElementById('floatingTimer');
    if (timer && data.timerPosition === 'hidden') {
        timer.style.display = 'none';
    }
    
    function update() {
        const now = new Date();
        const diff = now - start;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        updateEl('timerDays', days, 3);
        updateEl('timerHours', hours, 2);
        updateEl('timerMinutes', minutes, 2);
        updateEl('timerSeconds', seconds, 2);
    }
    
    update();
    setInterval(update, 1000);
}

function updateEl(id, val, pad) {
    const el = document.getElementById(id);
    if (el) el.textContent = val.toString().padStart(pad, '0');
}

function toggleTimer() {
    const timer = document.getElementById('floatingTimer');
    if (timer) timer.classList.toggle('collapsed');
}

function renderSlides(slides) {
    const container = document.getElementById('slidesContainer');
    if (!container) return;
    
    if (slides.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:3rem;opacity:0.5;">No slides yet. Go to /edit to add some!</div>';
        return;
    }
    
    container.innerHTML = slides.map((slide, index) => `
        <section class="story-section slide-section" id="slide-${slide.id}">
            <div class="slide-card" data-slide="${index}">
                <div class="slide-header">
                    ${slide.date ? `<div class="slide-date-badge">${formatDate(slide.date)}</div>` : ''}
                    <h2 class="slide-title">${slide.title || 'Untitled'}</h2>
                </div>
                <p class="slide-content">${slide.content || ''}</p>
                ${slide.image ? `
                    <div class="slide-image-container">
                        <img src="${slide.image}" class="slide-image" onclick="openLightbox('${slide.image}', '${slide.title}')" alt="${slide.title}">
                    </div>
                ` : ''}
            </div>
        </section>
    `).join('');
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function setupScrollEffects() {
    // Simple intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.2 });
    
    document.querySelectorAll('.slide-card').forEach(el => observer.observe(el));
    
    // Progress bar
    window.addEventListener('scroll', () => {
        const bar = document.getElementById('progressBar');
        if (bar) {
            const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
            bar.style.width = (scrolled * 100) + '%';
        }
    });
}

function createAmbientParticles() {
    const container = document.getElementById('ambientParticles');
    if (!container) return;
    
    for (let i = 0; i < 15; i++) {
        const p = document.createElement('div');
        p.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3 + 1}px;
            height: ${Math.random() * 3 + 1}px;
            background: rgba(255,255,255,${Math.random() * 0.3 + 0.1});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: floatParticle ${Math.random() * 10 + 10}s linear infinite;
        `;
        container.appendChild(p);
    }
}

function setupStoryNav() {
    // Hide edit button on story page (only show if accessed via /edit)
    const editBtn = document.querySelector('.edit-btn');
    if (editBtn) {
        // Check if we came from edit page
        if (!document.referrer.includes('edit.html')) {
            editBtn.style.display = 'none';
        }
    }
}

function openLightbox(src, caption) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const cap = document.getElementById('lightboxCaption');
    
    if (lightbox && img) {
        img.src = src;
        if (cap) cap.textContent = caption;
        lightbox.style.display = 'flex';
        setTimeout(() => lightbox.classList.add('active'), 10);
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        setTimeout(() => lightbox.style.display = 'none', 300);
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// EDIT PAGE - edit.html
// ============================================

let currentEditingSlide = null;

function initEditPage() {
    const data = getData();
    
    // Load values into form
    loadEditValues(data);
    
    // Setup navigation
    setupEditNav();
    
    // Render slides list
    renderSlidesList(data.slides);
    
    // Setup event listeners
    setupEditListeners();
    
    // Initial preview
    refreshPreview();
}

function loadEditValues(data) {
    // General
    setVal('siteTitle', data.siteTitle);
    setVal('partner1Name', data.partner1);
    setVal('partner2Name', data.partner2);
    
    // Landing
    setVal('mainQuestion', data.mainQuestion);
    setVal('landingSubtext', data.landingSubtext);
    setVal('yesBtnText', data.yesBtnText);
    setVal('noBtnText', data.noBtnText);
    setVal('successMessage', data.successMessage);
    setVal('orbitText', data.orbitText);
    
    // Timer
    setVal('startDate', data.startDate);
    setVal('timerLabel', data.timerLabel);
    setVal('timerPosition', data.timerPosition);
    
    // Colors
    if (data.colors) {
        setVal('primaryColor', data.colors.primary);
        setVal('secondaryColor', data.colors.secondary);
        setVal('accentColor', data.colors.accent);
        setVal('textColor', data.colors.text);
        setVal('bgColor', data.colors.bg);
    }
    
    // Animation
    setVal('animIntensity', data.animIntensity || 80);
    
    updateNamesPreview();
    updateCharCount();
    updateTimerPreview(data.startDate);
}

function setVal(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
}

function setupEditNav() {
    // Show first section by default
    showSection('general');
}

function showSection(section) {
    // Update buttons
    document.querySelectorAll('.nav-section').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === section);
    });
    
    // Update panels
    document.querySelectorAll('.edit-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === `panel-${section}`);
    });
    
    // Update header text
    const titles = {
        general: 'General Settings',
        landing: 'Landing Page',
        story: 'Story Slides',
        timer: 'Love Timer',
        theme: 'Theme & Colors',
        images: 'Images'
    };
    
    const titleEl = document.getElementById('currentSectionTitle');
    if (titleEl) titleEl.textContent = titles[section] || '';
}

function renderSlidesList(slides) {
    const container = document.getElementById('slidesList');
    if (!container) return;
    
    if (slides.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:2rem;opacity:0.5;">No slides yet. Click "Add Slide" to create your story!</div>';
        return;
    }
    
    container.innerHTML = slides.map((slide, index) => `
        <div class="slide-item" onclick="editSlide(${slide.id})">
            <div class="slide-thumb" style="background: ${slide.color || 'var(--primary)'}">${index + 1}</div>
            <div class="slide-info">
                <h4>${slide.title || 'Untitled'}</h4>
                <p>${slide.content ? slide.content.substring(0, 50) + '...' : 'No content'}</p>
            </div>
            <div class="slide-actions" onclick="event.stopPropagation()">
                <button onclick="moveSlide(${slide.id}, -1)" ${index === 0 ? 'disabled' : ''}>↑</button>
                <button onclick="moveSlide(${slide.id}, 1)" ${index === slides.length - 1 ? 'disabled' : ''}>↓</button>
            </div>
        </div>
    `).join('');
}

function setupEditListeners() {
    // Auto-save on change
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('change', saveAllData);
    });
    
    // Color inputs update preview
    document.querySelectorAll('input[type="color"]').forEach(input => {
        input.addEventListener('input', (e) => {
            const val = e.target.value;
            const display = e.target.nextElementSibling;
            if (display) display.textContent = val;
            applyThemeFromInputs();
        });
    });
    
    // Character counter
    const qInput = document.getElementById('mainQuestion');
    if (qInput) {
        qInput.addEventListener('input', updateCharCount);
    }
    
    // Names preview
    ['partner1Name', 'partner2Name'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateNamesPreview);
    });
    
    // Timer preview
    const dateInput = document.getElementById('startDate');
    if (dateInput) {
        dateInput.addEventListener('change', (e) => updateTimerPreview(e.target.value));
    }
}

function saveAllData() {
    const data = getData();
    
    // Collect all values
    data.siteTitle = getVal('siteTitle') || data.siteTitle;
    data.partner1 = getVal('partner1Name') || data.partner1;
    data.partner2 = getVal('partner2Name') || data.partner2;
    data.mainQuestion = getVal('mainQuestion') || data.mainQuestion;
    data.landingSubtext = getVal('landingSubtext') || data.landingSubtext;
    data.yesBtnText = getVal('yesBtnText') || data.yesBtnText;
    data.noBtnText = getVal('noBtnText') || data.noBtnText;
    data.successMessage = getVal('successMessage') || data.successMessage;
    data.orbitText = getVal('orbitText') || data.orbitText;
    data.startDate = getVal('startDate') || data.startDate;
    data.timerLabel = getVal('timerLabel') || data.timerLabel;
    data.timerPosition = getVal('timerPosition') || data.timerPosition;
    data.animIntensity = getVal('animIntensity') || data.animIntensity;
    
    data.colors = {
        primary: getVal('primaryColor') || data.colors.primary,
        secondary: getVal('secondaryColor') || data.colors.secondary,
        accent: getVal('accentColor') || data.colors.accent,
        text: getVal('textColor') || data.colors.text,
        bg: getVal('bgColor') || data.colors.bg
    };
    
    saveData(data);
    updateSaveStatus();
    
    // Refresh preview
    setTimeout(refreshPreview, 100);
}

function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : null;
}

function updateSaveStatus() {
    const dot = document.querySelector('.status-dot');
    const text = document.querySelector('.save-status .status-text');
    
    if (dot) {
        dot.style.background = '#4ade80';
        setTimeout(() => {
            dot.style.background = '#4ade80';
        }, 100);
    }
    if (text) text.textContent = 'All changes saved';
}

function updateNamesPreview() {
    const p1 = getVal('partner1Name') || 'You';
    const p2 = getVal('partner2Name') || 'Her';
    
    const preview = document.querySelector('.names-preview');
    if (preview) {
        const n1 = preview.querySelector('.name-1');
        const n2 = preview.querySelector('.name-2');
        if (n1) n1.textContent = p1;
        if (n2) n2.textContent = p2;
    }
}

function updateCharCount() {
    const input = document.getElementById('mainQuestion');
    const count = document.getElementById('qCount');
    if (input && count) {
        count.textContent = input.value.length;
    }
}

function updateTimerPreview(dateStr) {
    if (!dateStr) return;
    
    const start = new Date(dateStr);
    const now = new Date();
    const diff = now - start;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    updateEl('prevDays', days, 3);
    updateEl('prevHours', hours, 2);
    updateEl('prevMinutes', minutes, 2);
    updateEl('prevSeconds', seconds, 2);
    
    // Update formatted display
    const display = document.querySelector('.date-preview p');
    if (display) {
        display.textContent = start.toLocaleDateString('en-US', { 
            month: 'long', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit'
        });
    }
}

function applyThemeFromInputs() {
    const colors = {
        primary: getVal('primaryColor'),
        secondary: getVal('secondaryColor'),
        accent: getVal('accentColor'),
        text: getVal('textColor'),
        bg: getVal('bgColor')
    };
    applyThemeColors(colors);
}

// Slide Management
function addNewSlide() {
    const data = getData();
    const newSlide = {
        id: Date.now(),
        title: "New Slide",
        content: "Your story here...",
        date: "",
        image: null,
        color: data.colors.primary
    };
    data.slides.push(newSlide);
    saveData(data);
    renderSlidesList(data.slides);
    editSlide(newSlide.id);
}

function editSlide(id) {
    const data = getData();
    const slide = data.slides.find(s => s.id === id);
    if (!slide) return;
    
    currentEditingSlide = id;
    
    const numEl = document.getElementById('editingSlideNum');
    if (numEl) numEl.textContent = data.slides.indexOf(slide) + 1;
    
    setVal('slideTitle', slide.title);
    setVal('slideContent', slide.content);
    setVal('slideDate', slide.date);
    setVal('slideColor', slide.color);
    
    const preview = document.getElementById('slideImagePreview');
    if (preview) {
        if (slide.image) {
            preview.src = slide.image;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    }
    
    const editor = document.getElementById('slideEditor');
    const list = document.getElementById('slidesList');
    if (editor) editor.style.display = 'block';
    if (list) list.style.display = 'none';
}

function saveSlide() {
    const data = getData();
    const slide = data.slides.find(s => s.id === currentEditingSlide);
    if (!slide) return;
    
    slide.title = getVal('slideTitle');
    slide.content = getVal('slideContent');
    slide.date = getVal('slideDate');
    slide.color = getVal('slideColor');
    
    saveData(data);
    renderSlidesList(data.slides);
    closeSlideEditor();
}

function closeSlideEditor() {
    const editor = document.getElementById('slideEditor');
    const list = document.getElementById('slidesList');
    if (editor) editor.style.display = 'none';
    if (list) list.style.display = 'flex';
    currentEditingSlide = null;
}

function deleteCurrentSlide() {
    if (!currentEditingSlide) return;
    if (!confirm('Delete this slide?')) return;
    
    const data = getData();
    data.slides = data.slides.filter(s => s.id !== currentEditingSlide);
    saveData(data);
    renderSlidesList(data.slides);
    closeSlideEditor();
}

function moveSlide(id, direction) {
    const data = getData();
    const index = data.slides.findIndex(s => s.id === id);
    if (index === -1) return;
    
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= data.slides.length) return;
    
    // Swap
    [data.slides[index], data.slides[newIndex]] = [data.slides[newIndex], data.slides[index]];
    saveData(data);
    renderSlidesList(data.slides);
}

function handleSlideImage(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('slideImagePreview');
        if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        
        const data = getData();
        const slide = data.slides.find(s => s.id === currentEditingSlide);
        if (slide) {
            slide.image = e.target.result;
            saveData(data);
        }
    };
    reader.readAsDataURL(file);
}

// Theme Functions
function applyTheme(themeName) {
    const theme = themes[themeName];
    if (!theme) return;
    
    setVal('primaryColor', theme.primary);
    setVal('secondaryColor', theme.secondary);
    setVal('accentColor', theme.accent);
    setVal('bgColor', theme.bg);
    
    // Update displays
    document.querySelectorAll('.color-input-wrapper .color-value').forEach((el, i) => {
        const vals = [theme.primary, theme.secondary, theme.accent, '#ffffff', theme.bg];
        if (vals[i]) el.textContent = vals[i];
    });
    
    applyThemeColors({ ...theme, text: '#ffffff' });
    saveAllData();
}

// Image Upload
function handleBulkUpload(input) {
    const files = Array.from(input.files);
    const data = getData();
    
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            data.images.push({
                id: Date.now() + Math.random(),
                src: e.target.result,
                name: file.name
            });
            saveData(data);
            renderImageLibrary();
        };
        reader.readAsDataURL(file);
    });
}

function renderImageLibrary() {
    const data = getData();
    const container = document.getElementById('imagesGrid');
    if (!container) return;
    
    if (data.images.length === 0) {
        container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;opacity:0.5;">No images uploaded yet</div>';
        return;
    }
    
    container.innerHTML = data.images.map(img => `
        <div class="image-item" style="position:relative;border-radius:12px;overflow:hidden;aspect-ratio:1;">
            <img src="${img.src}" style="width:100%;height:100%;object-fit:cover;">
            <button onclick="deleteImage('${img.id}')" style="position:absolute;top:5px;right:5px;width:30px;height:30px;background:rgba(0,0,0,0.5);border:none;border-radius:50%;color:white;cursor:pointer;">×</button>
        </div>
    `).join('');
}

function deleteImage(id) {
    const data = getData();
    data.images = data.images.filter(img => img.id != id);
    saveData(data);
    renderImageLibrary();
}

// Export/Import
function exportData() {
    const data = getData();
    const json = JSON.stringify(data, null, 2);
    
    const modal = document.getElementById('dataModal');
    const title = document.getElementById('modalTitle');
    const textarea = document.getElementById('dataTextarea');
    
    if (title) title.textContent = 'Export Data';
    if (textarea) {
        textarea.value = json;
        textarea.readOnly = true;
    }
    if (modal) modal.style.display = 'flex';
}

function importData() {
    const modal = document.getElementById('dataModal');
    const title = document.getElementById('modalTitle');
    const textarea = document.getElementById('dataTextarea');
    
    if (title) title.textContent = 'Import Data';
    if (textarea) {
        textarea.value = '';
        textarea.readOnly = false;
        textarea.placeholder = 'Paste your JSON data here...';
    }
    if (modal) modal.style.display = 'flex';
    
    // Change button
    const btn = document.querySelector('#dataModal .btn-primary');
    if (btn) {
        btn.textContent = 'Import';
        btn.onclick = doImport;
    }
}

function doImport() {
    const textarea = document.getElementById('dataTextarea');
    if (!textarea) return;
    
    try {
        const data = JSON.parse(textarea.value);
        saveData(data);
        location.reload();
    } catch (e) {
        alert('Invalid JSON! Check your data.');
    }
}

function copyData() {
    const textarea = document.getElementById('dataTextarea');
    if (!textarea) return;
    
    textarea.select();
    document.execCommand('copy');
    
    const btn = document.querySelector('#dataModal .btn-primary');
    if (btn) {
        const original = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = original, 2000);
    }
}

function closeDataModal() {
    const modal = document.getElementById('dataModal');
    if (modal) modal.style.display = 'none';
}

function resetData() {
    if (!confirm('Reset ALL data to default? This cannot be undone!')) return;
    localStorage.removeItem('valentineSiteData');
    location.reload();
}

// Preview
function refreshPreview() {
    const frame = document.getElementById('previewFrame');
    if (frame) {
        // Force refresh by updating src
        const src = frame.src;
        frame.src = '';
        setTimeout(() => frame.src = src, 10);
    }
}

function previewSite() {
    window.open('index.html', '_blank');
}

function setPreviewDevice(device) {
    const wrapper = document.getElementById('previewWrapper');
    const buttons = document.querySelectorAll('.device-toggle button');
    
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const sizes = { desktop: '100%', tablet: '768px', mobile: '375px' };
    if (wrapper) wrapper.style.width = sizes[device];
}

// Utility styles
document.head.insertAdjacentHTML('beforeend', `
<style>
@keyframes floatParticle {
    0%, 100% { transform: translate(0, 0); }
    25% { transform: translate(10px, -10px); }
    50% { transform: translate(-5px, 5px); }
    75% { transform: translate(5px, 10px); }
}
@keyframes sparkleAnim {
    0%, 100% { opacity: 0; transform: scale(0); }
    50% { opacity: 1; transform: scale(1); }
}
</style>
`);
