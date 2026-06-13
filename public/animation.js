// Configuration
const TOTAL_FRAMES = 240;
const IMAGES_DIR = 'ezgif';
const FRAME_PREFIX = 'ezgif-frame-';
const FRAME_EXTENSION = 'jpg';

// DOM Elements
const canvas = document.getElementById('robot-canvas');
const ctx = canvas.getContext('2d');
const scrollContainer = document.getElementById('scroll-container');
const heroOverlay = document.getElementById('hero-overlay');
const preloader = document.getElementById('preloader');
const loaderPercentage = document.getElementById('loader-percentage');

// State Variables
const images = [];
let loadedCount = 0;
let scrollRatio = 0;
let currentFrameIndex = 0;
let targetFrameIndex = 0;
let isFirstRender = true;

// Preload Images
function initPreload() {
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
        const img = new Image();
        // Zero-padding the index to 3 digits (e.g. 001, 045, 120)
        const frameNum = String(i).padStart(3, '0');
        img.src = `${IMAGES_DIR}/${FRAME_PREFIX}${frameNum}.${FRAME_EXTENSION}`;
        
        img.onload = handleImageLoad;
        img.onerror = handleImageError;
        images.push(img);
    }
}

function handleImageLoad() {
    loadedCount++;
    updateLoaderUI();
}

function handleImageError(e) {
    console.warn(`Failed to load frame. Path: ${e.target.src}`);
    // Still increment so preloader doesn't hang
    loadedCount++;
    updateLoaderUI();
}

function updateLoaderUI() {
    const percent = Math.floor((loadedCount / TOTAL_FRAMES) * 100);
    loaderPercentage.textContent = `${percent}%`;
    
    if (loadedCount === TOTAL_FRAMES) {
        // Short delay to let animations sync up
        setTimeout(startApplication, 300);
    }
}

// Start Application once preloading finishes
function startApplication() {
    // Hide preloader smoothly
    preloader.classList.add('fade-out');
    
    // Initialize canvas sizing
    resizeCanvas();
    
    // Listen for scroll & resize events
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', () => {
        resizeCanvas();
        // Instant draw on resize to avoid flicker
        drawFrame(Math.round(currentFrameIndex));
    });
    
    // Run the animation loop
    requestAnimationFrame(animationLoop);
}

// Handle Scroll Calculations
function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const maxScroll = scrollContainer.scrollHeight - window.innerHeight;
    
    // Clamp values
    scrollRatio = Math.max(0, Math.min(1, scrollTop / maxScroll));
    
    // Calculate target frame (0-indexed)
    targetFrameIndex = scrollRatio * (TOTAL_FRAMES - 1);
}

// Handle Canvas Sizing (Supporting Retina/High-DPI displays)
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const clientWidth = window.innerWidth;
    const clientHeight = window.innerHeight;
    
    canvas.width = clientWidth * dpr;
    canvas.height = clientHeight * dpr;
    
    // Scale drawings to match the screen's visual dimensions
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// Draw a single image frame onto the canvas using "cover" aspect-ratio math
function drawFrame(frameIndex) {
    const img = images[frameIndex];
    if (!img || !img.complete) return;
    
    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
    
    const imgWidth = img.naturalWidth || img.width;
    const imgHeight = img.naturalHeight || img.height;
    
    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (canvasRatio > imgRatio) {
        // Canvas aspect ratio is wider than image aspect ratio
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgRatio;
        drawX = 0;
        // Center vertically
        drawY = (canvasHeight - drawHeight) / 2;
    } else {
        // Canvas aspect ratio is taller than image aspect ratio
        drawWidth = canvasHeight * imgRatio;
        drawHeight = canvasHeight;
        // Center horizontally
        drawX = (canvasWidth - drawWidth) / 2;
        drawY = 0;
    }
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

// Smooth Animation Loop
function animationLoop() {
    // Linear Interpolation (LERP) for smooth transition of frames
    // 0.12 creates a responsive yet smooth transition feel
    const delta = targetFrameIndex - currentFrameIndex;
    currentFrameIndex += delta * 0.12;
    
    // Snap close values to avoid continuous frame recalculation
    if (Math.abs(currentFrameIndex - targetFrameIndex) < 0.005) {
        currentFrameIndex = targetFrameIndex;
    }
    
    const frameToDraw = Math.round(currentFrameIndex);
    drawFrame(frameToDraw);
    
    // Update Text Opacity and Transform
    // Text fades out slowly as the user scrolls 30% of the section.
    let opacity = 1;
    let translateY = 0;
    
    if (scrollRatio <= 0.3) {
        // Linear fade from 1 to 0
        opacity = 1 - (scrollRatio / 0.3);
        // Premium upward float transition
        translateY = -(scrollRatio / 0.3) * 40; 
    } else {
        opacity = 0;
    }
    
    heroOverlay.style.opacity = opacity;
    heroOverlay.style.transform = `translateY(${translateY}px)`;
    
    // Hide overlay completely when fully transparent to optimize rendering pipeline
    if (opacity <= 0) {
        heroOverlay.style.visibility = 'hidden';
    } else {
        heroOverlay.style.visibility = 'visible';
    }
    
    requestAnimationFrame(animationLoop);
}

// Boot
initPreload();
