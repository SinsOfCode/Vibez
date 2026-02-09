<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Our Love Story</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
</head>
<body class="story-page">
    <div class="story-bg-layer" id="storyBg"></div>
    <div class="ambient-particles" id="ambientParticles"></div>
    <div class="light-leaks"></div>

    <div class="scroll-progress">
        <div class="progress-bar" id="progressBar"></div>
    </div>

    <div class="floating-timer" id="floatingTimer">
        <div class="timer-toggle" onclick="toggleTimer()">⏱</div>
        <div class="timer-content" id="timerContent">
            <div class="timer-label" id="timerLabel">Together Since</div>
            <div class="timer-display">
                <div class="time-unit">
                    <span class="time-value" id="timerDays">000</span>
                    <span class="time-label">Days</span>
                </div>
                <span class="time-separator">:</span>
                <div class="time-unit">
                    <span class="time-value" id="timerHours">00</span>
                    <span class="time-label">Hours</span>
                </div>
                <span class="time-separator">:</span>
                <div class="time-unit">
                    <span class="time-value" id="timerMinutes">00</span>
                    <span class="time-label">Mins</span>
                </div>
                <span class="time-separator">:</span>
                <div class="time-unit">
                    <span class="time-value" id="timerSeconds">00</span>
                    <span class="time-label">Secs</span>
                </div>
            </div>
            <div class="start-date" id="startDateDisplay">Since April 6, 2024</div>
        </div>
    </div>

    <!-- Nav - NO EDIT LINK -->
    <nav class="story-nav">
        <a href="index.html" class="back-btn">
            <span class="arrow">←</span>
            <span class="text">Back</span>
        </a>
        <div class="story-title-sm">Our Story</div>
    </nav>

    <main class="story-container" id="storyContainer">
        <section class="story-section intro-section">
            <div class="section-content">
                <div class="intro-badge">Est. 2024</div>
                <h1 class="intro-title">
                    <span class="title-line">Our</span>
                    <span class="title-line highlight">Journey</span>
                </h1>
                <div class="intro-divider"><span class="heart-icon">♥</span></div>
                <p class="intro-text">Every love story is beautiful, but ours is my favorite...</p>
                <div class="scroll-hint">
                    <div class="mouse-icon"><div class="wheel"></div></div>
                    <span>Scroll to explore</span>
                </div>
            </div>
        </section>

        <div id="slidesContainer"></div>

        <section class="story-section closing-section">
            <div class="section-content">
                <div class="closing-hearts">💕💖💗</div>
                <h2 class="closing-title">To Be Continued...</h2>
                <p class="closing-text">Forever isn't long enough when I'm with you.</p>
                
                <div class="love-meter">
                    <div class="meter-label">My Love For You</div>
                    <div class="meter-bar">
                        <div class="meter-fill" id="meterFill"></div>
                    </div>
                    <div class="meter-value">∞%</div>
                </div>

                <div class="closing-actions">
                    <button class="magic-btn btn-replay" onclick="scrollToTop()">↻ Watch Again</button>
                    <a href="index.html" class="magic-btn btn-home">← Back Home</a>
                </div>
            </div>
        </section>
    </main>

    <div class="lightbox" id="lightbox" onclick="closeLightbox()">
        <div class="lightbox-content">
            <img id="lightboxImg" src="" alt="">
            <div class="lightbox-caption" id="lightboxCaption"></div>
        </div>
    </div>

    <!-- Nav - NO EDIT LINK -->
    <nav class="fixed-nav">
        <div class="nav-bg"></div>
        <a href="index.html" class="nav-item">
            <span class="nav-icon">🏠</span>
            <span class="nav-label">Home</span>
        </a>
        <a href="story.html" class="nav-item active">
            <span class="nav-icon">📖</span>
            <span class="nav-label">Story</span>
        </a>
    </nav>

    <script src="script.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', initStoryPage);
    </script>
</body>
</html>
