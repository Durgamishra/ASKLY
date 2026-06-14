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
