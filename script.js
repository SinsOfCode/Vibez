// ============================================
// SIMPLE VALENTINE SITE - ACTUALLY WORKS
// ============================================

// Default data
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
    orbitText: "LOVE FOREVER",
    timerLabel: "Together Since",
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
        }
    ]
};

// Get data from storage
function getData() {
    const saved = localStorage.getItem('valentineSiteData');
    return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(defaultData));
}

// Save data to storage
function saveData(data) {
    localStorage.setItem('valentineSiteData', JSON.stringify(data));
}

// Apply colors
function applyColors(colors) {
    const root = document.documentElement;
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--text', colors.text);
    root.style.setProperty('--bg', colors.bg);
}

// ============================================
// LANDING PAGE
// ============================================

function initLandingPage() {
    const data = getData();
    applyColors(data.colors);
    
    // Set text content
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
    
    const successMsg = document.getElementById('successMessage');
    if (successMsg) successMsg.textContent = data.successMessage;
    
    // Setup orbit text
    setupOrbitText(data.orbitText);
    
    // Create floating hearts
    createFloatingHearts();
    
    // Check if already said yes
    if (localStorage.getItem('valentineSaidYes') === 'true') {
        showSuccess();
    }
}

function setupOrbitText(text) {
    const ring = document.getElementById('orbitRing1');
    if (!ring) return;
    
    ring.innerHTML = '';
    const chars = (text || "LOVE FOREVER").split('');
    
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
            font-size: 18px;
            font-weight: bold;
            color: var(--accent);
            text-shadow: 0 0 10px var(--accent);
        `;
        ring.appendChild(span);
    });
}

function createFloatingHearts() {
    const container = document.getElementById('floatingHearts');
    if (!container) return;
    
    const hearts = ['♥', '💖', '💕', '💗'];
    
    setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'heart-particle';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.fontSize = (Math.random() * 20 + 15) + 'px';
        heart.style.animationDuration = (Math.random() * 5 + 8) + 's';
        container.appendChild(heart);
        setTimeout(() => heart.remove(), 13000);
    }, 800);
}

// YES BUTTON - WORKS NOW
function sayYes() {
    console.log('YES clicked!');
    
    // Confetti
    makeConfetti();
    
    // Hide question, show success
    document.getElementById('questionSection').style.display = 'none';
    document.getElementById('successSection').style.display = 'block';
    
    // Save
    localStorage.setItem('valentineSaidYes', 'true');
    
    // Start timer
    updateMiniTimer();
    setInterval(updateMiniTimer, 60000);
}

function showSuccess() {
    document.getElementById('questionSection').style.display = 'none';
    document.getElementById('successSection').style.display = 'block';
    updateMiniTimer();
}

function makeConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    
    const particles = [];
    const colors = ['#ff6b9d', '#ffd93d', '#ffffff', '#c44569'];
    
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15 - 5,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
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
            p.vy += 0.3;
            p.life -= 0.02;
            
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        if (alive) requestAnimationFrame(animate);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    animate();
}

// NO BUTTON - ACTUALLY RUNS AWAY NOW
function moveNoButton() {
    const btn = document.getElementById('noBtn');
    if (!btn) return;
    
    // Get random position
    const x = Math.random() * (window.innerWidth - 200);
    const y = Math.random() * (window.innerHeight - 100);
    
    btn.style.position = 'fixed';
    btn.style.left = x + 'px';
    btn.style.top = y + 'px';
    btn.style.transition = 'all 0.3s ease';
    btn.style.zIndex = '1000';
}

function handleNo() {
    const btn = document.getElementById('noBtn');
    const text = btn.querySelector('.btn-text');
    const original = text.textContent;
    
    text.textContent = "Are you sure? 🥺";
    setTimeout(() => {
        text.textContent = original;
    }, 1500);
}

function updateMiniTimer() {
    const data = getData();
    const start = new Date(data.startDate);
    const now = new Date();
    const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    
    const el = document.getElementById('miniDays');
    if (el) el.textContent = days.toString().padStart(3, '0');
}

function goToStory() {
    window.location.href = 'story.html';
}

// ============================================
// STORY PAGE
// ============================================

function initStoryPage() {
    const data = getData();
    applyColors(data.colors);
    
    // Setup timer
    setupTimer(data);
    
    // Render slides
    renderSlides(data.slides);
    
    // Scroll effects
    setupScrollEffects();
}

function setupTimer(data) {
    const start = new Date(data.startDate);
    
    document.getElementById('timerLabel').textContent = data.timerLabel;
    document.getElementById('startDateDisplay').textContent = 'Since ' + start.toLocaleDateString();
    
    function update() {
        const now = new Date();
        const diff = now - start;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setText('timerDays', days, 3);
        setText('timerHours', hours, 2);
        setText('timerMinutes', minutes, 2);
        setText('timerSeconds', seconds, 2);
    }
    
    update();
    setInterval(update, 1000);
}

function setText(id, val, pad) {
    const el = document.getElementById(id);
    if (el) el.textContent = val.toString().padStart(pad, '0');
}

function toggleTimer() {
    const timer = document.getElementById('floatingTimer');
    timer.classList.toggle('collapsed');
}

function renderSlides(slides) {
    const container = document.getElementById('slidesContainer');
    if (!container) return;
    
    container.innerHTML = slides.map(slide => `
        <section class="story-section slide-section">
            <div class="slide-card">
                <div class="slide-header">
                    ${slide.date ? `<div class="slide-date-badge">${new Date(slide.date).toLocaleDateString()}</div>` : ''}
                    <h2 class="slide-title">${slide.title}</h2>
                </div>
                <p class="slide-content">${slide.content}</p>
                ${slide.image ? `<img src="${slide.image}" class="slide-image" onclick="openLightbox('${slide.image}')" style="max-width:100%;border-radius:15px;margin-top:1rem;">` : ''}
            </div>
        </section>
    `).join('');
}

function setupScrollEffects() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.2 });
    
    document.querySelectorAll('.slide-card').forEach(el => observer.observe(el));
}

function openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    if (lightbox && img) {
        img.src = src;
        lightbox.style.display = 'flex';
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) lightbox.style.display = 'none';
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// EDIT PAGE - SIMPLE AND WORKING
// ============================================

let editingSlideId = null;

function initEditPage() {
    const data = getData();
    
    // Fill in all the forms
    fillForms(data);
    
    // Show first section
    showEditSection('general');
    
    // Render slides list
    renderEditSlides(data.slides);
}

function fillForms(data) {
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
    
    // Colors
    setVal('primaryColor', data.colors.primary);
    setVal('secondaryColor', data.colors.secondary);
    setVal('accentColor', data.colors.accent);
    setVal('textColor', data.colors.text);
    setVal('bgColor', data.colors.bg);
}

function setVal(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
}

function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

function showEditSection(section) {
    // Hide all panels
    document.querySelectorAll('.edit-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-section').forEach(n => n.classList.remove('active'));
    
    // Show selected
    const panel = document.getElementById('panel-' + section);
    const nav = document.querySelector('[onclick="showEditSection(\'' + section + '\')"]');
    
    if (panel) panel.classList.add('active');
    if (nav) nav.classList.add('active');
    
    // Update title
    const titles = {
        general: 'General Settings',
        landing: 'Landing Page',
        story: 'Story Slides',
        timer: 'Love Timer',
        theme: 'Theme & Colors'
    };
    
    const titleEl = document.getElementById('currentSectionTitle');
    if (titleEl) titleEl.textContent = titles[section] || '';
}

// SAVE EVERYTHING - WORKS NOW
function saveAll() {
    const data = getData();
    
    // Update all values
    data.siteTitle = getVal('siteTitle');
    data.partner1 = getVal('partner1Name');
    data.partner2 = getVal('partner2Name');
    data.mainQuestion = getVal('mainQuestion');
    data.landingSubtext = getVal('landingSubtext');
    data.yesBtnText = getVal('yesBtnText');
    data.noBtnText = getVal('noBtnText');
    data.successMessage = getVal('successMessage');
    data.orbitText = getVal('orbitText');
    data.startDate = getVal('startDate');
    data.timerLabel = getVal('timerLabel');
    
    data.colors = {
        primary: getVal('primaryColor'),
        secondary: getVal('secondaryColor'),
        accent: getVal('accentColor'),
        text: getVal('textColor'),
        bg: getVal('bgColor')
    };
    
    saveData(data);
    
    // Show saved message
    alert('Saved! Refresh the site to see changes.');
}

function renderEditSlides(slides) {
    const container = document.getElementById('slidesList');
    if (!container) return;
    
    container.innerHTML = slides.map((slide, index) => `
        <div class="slide-item" onclick="editSlide(${slide.id})" style="display:flex;align-items:center;gap:1rem;padding:1rem;background:rgba(255,255,255,0.05);border-radius:10px;margin-bottom:0.5rem;cursor:pointer;">
            <div style="width:50px;height:50px;background:${slide.color};border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:bold;">${index + 1}</div>
            <div style="flex:1;">
                <div style="font-weight:600;">${slide.title}</div>
                <div style="font-size:0.85rem;opacity:0.6;">${slide.content.substring(0, 50)}...</div>
            </div>
        </div>
    `).join('');
}

function editSlide(id) {
    const data = getData();
    const slide = data.slides.find(s => s.id === id);
    if (!slide) return;
    
    editingSlideId = id;
    
    document.getElementById('slideTitle').value = slide.title;
    document.getElementById('slideContent').value = slide.content;
    document.getElementById('slideDate').value = slide.date;
    document.getElementById('slideColor').value = slide.color;
    
    document.getElementById('slideEditor').style.display = 'block';
    document.getElementById('slidesList').style.display = 'none';
}

function saveSlide() {
    const data = getData();
    const slide = data.slides.find(s => s.id === editingSlideId);
    if (!slide) return;
    
    slide.title = document.getElementById('slideTitle').value;
    slide.content = document.getElementById('slideContent').value;
    slide.date = document.getElementById('slideDate').value;
    slide.color = document.getElementById('slideColor').value;
    
    saveData(data);
    renderEditSlides(data.slides);
    closeSlideEditor();
}

function closeSlideEditor() {
    document.getElementById('slideEditor').style.display = 'none';
    document.getElementById('slidesList').style.display = 'block';
    editingSlideId = null;
}

function deleteSlide() {
    if (!editingSlideId) return;
    if (!confirm('Delete this slide?')) return;
    
    const data = getData();
    data.slides = data.slides.filter(s => s.id !== editingSlideId);
    saveData(data);
    renderEditSlides(data.slides);
    closeSlideEditor();
}

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
    renderEditSlides(data.slides);
    editSlide(newSlide.id);
}

function handleSlideImage(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = getData();
        const slide = data.slides.find(s => s.id === editingSlideId);
        if (slide) {
            slide.image = e.target.result;
            saveData(data);
        }
        
        const preview = document.getElementById('slideImagePreview');
        if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
    };
    reader.readAsDataURL(file);
}

function applyTheme(themeName) {
    const themes = {
        romantic: { primary: "#ff6b9d", secondary: "#c44569", accent: "#ffd93d", bg: "#1a1a2e" },
        ocean: { primary: "#667eea", secondary: "#764ba2", accent: "#f093fb", bg: "#0f0f23" },
        sunset: { primary: "#f093fb", secondary: "#f5576c", accent: "#ffd93d", bg: "#1a0f1f" },
        forest: { primary: "#11998e", secondary: "#38ef7d", accent: "#c4e538", bg: "#0a1f15" },
        gold: { primary: "#f5af19", secondary: "#f12711", accent: "#ffd700", bg: "#1f150a" },
        midnight: { primary: "#232526", secondary: "#414345", accent: "#7f8c8d", bg: "#000000" }
    };
    
    const theme = themes[themeName];
    if (!theme) return;
    
    document.getElementById('primaryColor').value = theme.primary;
    document.getElementById('secondaryColor').value = theme.secondary;
    document.getElementById('accentColor').value = theme.accent;
    document.getElementById('bgColor').value = theme.bg;
    
    applyColors({ ...theme, text: '#ffffff' });
}

function exportData() {
    const data = getData();
    const json = JSON.stringify(data, null, 2);
    prompt('Copy this data:', json);
}

function importData() {
    const json = prompt('Paste your data here:');
    if (!json) return;
    
    try {
        const data = JSON.parse(json);
        saveData(data);
        alert('Imported! Refreshing...');
        location.reload();
    } catch (e) {
        alert('Invalid data!');
    }
}

function resetData() {
    if (!confirm('Reset everything?')) return;
    localStorage.removeItem('valentineSiteData');
    location.reload();
}
