/* ══════════════════════════════════════════════════════════
   NAVBAR — shadow deepens on scroll + active link indicator
   ══════════════════════════════════════════════════════════ */
(function () {
  const pill = document.querySelector('.nav-pill');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const s = Math.min(window.scrollY / 60, 1);
      pill.style.background = `rgba(20,20,22,${0.4 + s * 0.4})`;
      pill.style.boxShadow  = `
        0 ${12 + s*8}px ${32 + s*16}px rgba(0,0,0,${0.6 + s*0.2}),
        inset 0 1px 0 0 rgba(255,255,255,${0.15 - s*0.05}),
        inset 0 -1px 0 0 rgba(0,0,0,0.4)
      `;
      ticking = false;
    });
  }, { passive: true });
})();

/* ══════════════════════════════════════════════════════════
   ACTIVE NAV LINK HIGHLIGHTING ON SCROLL
   ══════════════════════════════════════════════════════════ */
(function () {
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('.nav-menu li a');

  function highlightNav() {
    const scrollPos = window.scrollY + 200;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNav, { passive: true });
  highlightNav();
})();

/* ══════════════════════════════════════════════════════════
   HERO — 3D tilt on mousemove (chat card)
   ══════════════════════════════════════════════════════════ */
(function () {
  const visual = document.querySelector('.hero-visual-inner');
  if (!visual) return;

  let ox = 0, oy = 0;
  let cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    const hw = window.innerWidth  / 2;
    const hh = window.innerHeight / 2;
    ox = (e.clientX - hw) / hw;
    oy = (e.clientY - hh) / hh;
  }, { passive: true });

  function tilt() {
    cx += (ox - cx) * 0.07;
    cy += (oy - cy) * 0.07;
    visual.style.transform = `perspective(1000px) rotateX(${-cy * 4}deg) rotateY(${cx * 4}deg) translateY(0)`;
    requestAnimationFrame(tilt);
  }
  tilt();
})();

/* ══════════════════════════════════════════════════════════
   INTERSECTION OBSERVER — fade-up feature cards & sections
   ══════════════════════════════════════════════════════════ */
(function () {
  // Legacy feat-card observer (backward compat)
  const cards = document.querySelectorAll('.feat-card');
  cards.forEach((c, i) => {
    c.style.opacity = '0';
    c.style.transform = 'translateY(30px)';
    c.style.transition = `opacity 0.6s ${i * 0.08}s ease, transform 0.6s ${i * 0.08}s cubic-bezier(0.34,1.56,0.64,1)`;
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.style.opacity = '1';
        en.target.style.transform = 'translateY(0)';
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(c => obs.observe(c));
})();

/* ══════════════════════════════════════════════════════════
   NEW: [data-animate] Intersection Observer for all elements
   ══════════════════════════════════════════════════════════ */
(function () {
  const animatedElements = document.querySelectorAll('[data-animate]');

  const animObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add staggered delay based on index among siblings with same animation
        const siblings = Array.from(entry.target.parentElement?.children || []).filter(
          el => el.dataset.animate
        );
        const index = siblings.indexOf(entry.target);
        const delay = index * 0.1;
        entry.target.style.transitionDelay = `${delay}s`;
        entry.target.classList.add('is-visible');
        animObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  animatedElements.forEach(el => animObserver.observe(el));
})();

/* ══════════════════════════════════════════════════════════
   NEW: Input & Output Window Scroll Reveal
   ══════════════════════════════════════════════════════════ */
(function () {
  const inputSection = document.getElementById('inputSection');
  const outputWindow = document.getElementById('outputWindow');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        sectionObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  if (inputSection) sectionObserver.observe(inputSection);
  if (outputWindow) sectionObserver.observe(outputWindow);
})();

/* ══════════════════════════════════════════════════════════
   NEW: Smooth scroll for anchor links
   ══════════════════════════════════════════════════════════ */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
})();

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
    loadedCount++;
    updateLoaderUI();
}

function updateLoaderUI() {
    const percent = Math.floor((loadedCount / TOTAL_FRAMES) * 100);
    loaderPercentage.textContent = `${percent}%`;
    
    if (loadedCount === TOTAL_FRAMES) {
        setTimeout(startApplication, 300);
    }
}

// Start Application once preloading finishes
function startApplication() {
    preloader.classList.add('fade-out');
    resizeCanvas();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', () => {
        resizeCanvas();
        drawFrame(Math.round(currentFrameIndex));
    });
    requestAnimationFrame(animationLoop);
}

// Handle Scroll Calculations
function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const maxScroll = scrollContainer.scrollHeight - window.innerHeight;
    scrollRatio = Math.max(0, Math.min(1, scrollTop / maxScroll));
    targetFrameIndex = scrollRatio * (TOTAL_FRAMES - 1);
}

// Handle Canvas Sizing
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const clientWidth = window.innerWidth;
    const clientHeight = window.innerHeight;
    
    canvas.width = clientWidth * dpr;
    canvas.height = clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// Draw a single image frame
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
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgRatio;
        drawX = 0;
        drawY = (canvasHeight - drawHeight) / 2;
    } else {
        drawWidth = canvasHeight * imgRatio;
        drawHeight = canvasHeight;
        drawX = (canvasWidth - drawWidth) / 2;
        drawY = 0;
    }
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

// Smooth Animation Loop
function animationLoop() {
    const delta = targetFrameIndex - currentFrameIndex;
    currentFrameIndex += delta * 0.12;
    
    if (Math.abs(currentFrameIndex - targetFrameIndex) < 0.005) {
        currentFrameIndex = targetFrameIndex;
    }
    
    const frameToDraw = Math.round(currentFrameIndex);
    drawFrame(frameToDraw);
    
    let opacity = 1;
    let translateY = 0;
    
    if (scrollRatio <= 0.3) {
        opacity = 1 - (scrollRatio / 0.3);
        translateY = -(scrollRatio / 0.3) * 40; 
    } else {
        opacity = 0;
    }
    
    heroOverlay.style.opacity = opacity;
    heroOverlay.style.transform = `translateY(${translateY}px)`;
    
    if (opacity <= 0) {
        heroOverlay.style.visibility = 'hidden';
    } else {
        heroOverlay.style.visibility = 'visible';
    }
    
    requestAnimationFrame(animationLoop);
}

//function for clicking get started
document
  .getElementById("getStartedBtn")
  .addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("inputSection")
      .scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

    setTimeout(() => {
      document.getElementById("promptInput").focus();
    }, 600);
  });

document
  .getElementById("Demo")
  .addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("demoSection")
      .scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
  });

/* ══════════════════════════════════════════════════════════
   NEW: Parallax effect for floating stat chips
   ══════════════════════════════════════════════════════════ */
(function () {
  const statChips = document.querySelectorAll('.stat-chip');
  if (!statChips.length) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      statChips.forEach((chip, i) => {
        const speed = i === 0 ? 0.03 : -0.03;
        const offset = scrollY * speed;
        chip.style.transform = `translateY(${offset}px)`;
      });
      ticking = false;
    });
  }, { passive: true });
})();

/* ══════════════════════════════════════════════════════════
   NEW: Magnetic hover effect for nav links
   ══════════════════════════════════════════════════════════ */
(function () {
  const navLinks = document.querySelectorAll('.nav-menu li a');
  navLinks.forEach(link => {
    link.addEventListener('mousemove', (e) => {
      const rect = link.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      link.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    });
    link.addEventListener('mouseleave', () => {
      link.style.transform = '';
    });
  });
})();
