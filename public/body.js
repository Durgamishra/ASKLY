/* ══════════════════════════════════════════════════════════
   PARTICLE SYSTEM — Realistic dust that Dodges the Mouse
   ══════════════════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('particle-canvas');
  const ctx    = canvas.getContext('2d');
  let   W, H, dpr, raf;
  const PARTICLE_COUNT = 700;
  const particles      = [];
  const mouse          = { x: -9999, y: -9999 };
  const MOUSE_RADIUS   = 150;  // Area of interaction
  
  /* Strictly White and soft Ice-Blue dust colors (NO PURPLE) */
  const COLS = [
    [255, 255, 255],
    [220, 230, 255],
    [160, 190, 255]
  ];

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function resize() {
    dpr    = window.devicePixelRatio || 1;
    W      = window.innerWidth;
    H      = window.innerHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
  }

  class Particle {
    constructor() { this.reset(true); }

    reset(init) {
      this.col   = pick(COLS);
      this.r     = Math.random() * 2.5 + 0.5;
      this.x     = Math.random() * W;
      this.y     = init ? Math.random() * H : H + 10;
      this.vx    = (Math.random() - 0.5) * 0.2;
      this.vy    = -(Math.random() * 0.3 + 0.1);
      
      this.baseAlpha = (3 - this.r) * 0.15 + 0.1; 
      this.currentAlpha = this.baseAlpha;
      this.targetAlpha = this.baseAlpha;

      this.life  = Math.random() * 0.002 + 0.0005;
      this.age   = init ? Math.random() : 0;
      this.twinkle = Math.random() * Math.PI * 2;
      this.twinkleSpeed = Math.random() * 0.02 + 0.01;
    }

    update() {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      // Dynamic Mouse Interaction
      if (dist < MOUSE_RADIUS && dist > 1) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
        
        // 1. Physically push particles away (Dodge Effect)
        this.vx += (dx / dist) * force * 0.75;
        this.vy += (dy / dist) * force * 0.75;
        
        // 2. Brighten particles when mouse gets close (Glow Effect)
        this.targetAlpha = Math.min(1, this.baseAlpha + (force * 0.1));
      } else {
        this.targetAlpha = this.baseAlpha;
      }

      // Smooth opacity transition
      this.currentAlpha += (this.targetAlpha - this.currentAlpha) * 0.1;

      // Friction to slow down after being pushed
      this.vx *= 0.96;
      this.vy *= 0.96;
      
      // Regular ambient drifting
      this.x += this.vx;
      this.y += this.vy;

      this.twinkle += this.twinkleSpeed;
      this.age += this.life;

      // Wrap around screen
      if (this.x < -50) this.x = W + 20;
      if (this.x > W + 50) this.x = -20;
      if (this.y < -50) this.reset(true);
      if (this.y > H + 50) this.y = -20;
    }

    draw() {
      const tw   = Math.sin(this.twinkle) * 0.2 + 0.8;
      const fade = this.age < 0.1 ? this.age / 0.1 : this.age > 0.85 ? (1 - this.age) / 0.15 : 1;
      const a = this.currentAlpha * tw * fade;
      if (a <= 0.01) return;

      const [r,g,b] = this.col;
      ctx.save();
      ctx.globalAlpha = a;

      // Realistic bokeh/blur rendering
      const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 2);
      grd.addColorStop(0, `rgba(${r},${g},${b},0.9)`);
      grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 2, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      ctx.restore();
    }
  }

  function init() {
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  // Reset mouse position when cursor leaves window so particles return to normal
  window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    resize();
    init();
    loop();
  });

  resize();
  init();
  loop();
})();

/* ══════════════════════════════════════════════════════════
   NAVBAR — shadow deepens on scroll
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
   INTERSECTION OBSERVER — fade-up feature cards
   ══════════════════════════════════════════════════════════ */
(function () {
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
