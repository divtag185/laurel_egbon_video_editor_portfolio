    // ── FOOTER YEAR (auto-updates) ──
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // ── NAV SCROLL BORDER ──
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });

    // ── HAMBURGER ──
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });

    // ── HERO CANVAS — MOTION GRAPHICS BACKGROUND ──
    (function() {
      const canvas = document.getElementById('heroCanvas');
      const ctx = canvas.getContext('2d');
      let W, H, animId;

      function resize() {
        W = canvas.width  = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
      }
      resize();
      window.addEventListener('resize', resize, { passive: true });

      // --- Particles ---
      const PARTICLE_COUNT = 90;
      const particles = [];

      function randBetween(a, b) { return a + Math.random() * (b - a); }

      function makeParticle() {
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          vx: randBetween(-0.35, 0.35),
          vy: randBetween(-0.6, -0.15),
          size: randBetween(1, 2.8),
          alpha: randBetween(0.15, 0.7),
          color: Math.random() < 0.35 ? '#c8a44d' : '#ffffff',
          life: 0,
          maxLife: randBetween(220, 500),
        };
      }

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = makeParticle();
        p.life = Math.random() * p.maxLife; // stagger start
        particles.push(p);
      }

      // --- Lines / stroke tracks ---
      const LINE_COUNT = 22;
      const lines = [];

      function makeLine() {
        const x = Math.random() * W;
        const y = H + 20;
        const angle = randBetween(-0.18, 0.18); // near-vertical
        const speed = randBetween(0.4, 1.1);
        const length = randBetween(40, 160);
        const isGold = Math.random() < 0.3;
        return {
          x, y,
          vx: Math.sin(angle) * speed,
          vy: -Math.cos(angle) * speed,
          length,
          alpha: randBetween(0.08, 0.35),
          color: isGold ? '#c8a44d' : '#ffffff',
          life: 0,
          maxLife: randBetween(300, 700),
          width: randBetween(0.5, 1.5),
        };
      }

      for (let i = 0; i < LINE_COUNT; i++) {
        const l = makeLine();
        l.y = Math.random() * H; // stagger start
        lines.push(l);
      }

      // --- Scanline rings (film-frame aesthetic) ---
      const rings = [];
      function makeRing() {
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          r: randBetween(30, 100),
          alpha: randBetween(0.03, 0.12),
          life: 0,
          maxLife: randBetween(120, 300),
          expand: randBetween(0.15, 0.5),
        };
      }
      for (let i = 0; i < 8; i++) {
        const r = makeRing();
        r.life = Math.random() * r.maxLife;
        rings.push(r);
      }

      function draw(ts) {
        // Clear instead of painting solid bg — video shows through
        ctx.clearRect(0, 0, W, H);

        // Subtle diagonal overlay grid
        ctx.save();
        ctx.strokeStyle = 'rgba(200,164,77,0.04)';
        ctx.lineWidth = 1;
        const GRID = 80;
        for (let gx = -H; gx < W + H; gx += GRID) {
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx + H * 0.3, H);
          ctx.stroke();
        }
        ctx.restore();

        // Rings
        rings.forEach((r, i) => {
          r.life++;
          if (r.life > r.maxLife) { rings[i] = makeRing(); return; }
          const t = r.life / r.maxLife;
          const pulse = Math.sin(t * Math.PI);
          ctx.save();
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.r + r.expand * r.life, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(200,164,77,${r.alpha * pulse})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.restore();
        });

        // Lines (stroke tracks)
        lines.forEach((l, i) => {
          l.life++;
          l.x += l.vx;
          l.y += l.vy;
          if (l.life > l.maxLife || l.y < -l.length - 50) { lines[i] = makeLine(); return; }
          const t = l.life / l.maxLife;
          const fade = t < 0.1 ? t / 0.1 : t > 0.85 ? (1 - t) / 0.15 : 1;
          ctx.save();
          ctx.beginPath();
          // tail
          ctx.moveTo(l.x - l.vx * (l.length / Math.hypot(l.vx, l.vy)), l.y - l.vy * (l.length / Math.hypot(l.vx, l.vy)));
          ctx.lineTo(l.x, l.y);
          const isGold = l.color === '#c8a44d';
          const grad2 = ctx.createLinearGradient(
            l.x - l.vx * l.length, l.y - l.vy * l.length,
            l.x, l.y
          );
          grad2.addColorStop(0, `rgba(${isGold ? '200,164,77' : '255,255,255'},0)`);
          grad2.addColorStop(1, `rgba(${isGold ? '200,164,77' : '255,255,255'},${l.alpha * fade})`);
          ctx.strokeStyle = grad2;
          ctx.lineWidth = l.width;
          ctx.stroke();
          ctx.restore();
        });

        // Particles
        particles.forEach((p, i) => {
          p.life++;
          p.x += p.vx;
          p.y += p.vy;
          if (p.life > p.maxLife || p.y < -10) { particles[i] = makeParticle(); return; }
          const t = p.life / p.maxLife;
          const fade = t < 0.15 ? t / 0.15 : t > 0.8 ? (1 - t) / 0.2 : 1;
          ctx.save();
          ctx.globalAlpha = p.alpha * fade;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        animId = requestAnimationFrame(draw);
      }

      animId = requestAnimationFrame(draw);
    })();

    // ── PROJECT CARD PARALLAX (scroll) ──
    const parallaxCards = document.querySelectorAll('[data-parallax] .project-card-bg');
    function updateCardParallax() {
      parallaxCards.forEach(bg => {
        const card = bg.parentElement;
        const rect = card.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const viewCenter = window.innerHeight / 2;
        const offset = (center - viewCenter) * 0.12;
        bg.style.transform = `translateY(${offset}px) scale(1)`;
      });
    }
    window.addEventListener('scroll', updateCardParallax, { passive: true });
    updateCardParallax();

    // ── SCROLL REVEAL ──
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(el => revealObserver.observe(el));

    // ── TIMELINE EDITOR MOCKUP ──
    (function() {
      const wave = document.getElementById('waveCanvas');
      const playhead = document.getElementById('tlPlayhead');
      const timeEl = document.getElementById('tlTime');
      if (!wave || !playhead) return;

      const wctx = wave.getContext('2d');
      let W, H;

      function resize() {
        W = wave.width = wave.offsetWidth;
        H = wave.height = wave.offsetHeight;
      }
      resize();
      window.addEventListener('resize', resize, { passive: true });

      // Pre-generate waveform bar heights so they stay consistent
      const BAR_COUNT = 120;
      const bars = Array.from({ length: BAR_COUNT }, () => Math.random());

      function drawWave() {
        wctx.clearRect(0, 0, W, H);
        const barW = W / BAR_COUNT;
        for (let i = 0; i < BAR_COUNT; i++) {
          const amp = bars[i] * 0.8 + 0.1;
          const barH = amp * H * 0.8;
          wctx.fillStyle = i % 7 === 0 ? 'rgba(200,164,77,0.55)' : 'rgba(208,208,208,0.35)';
          wctx.fillRect(i * barW, (H - barH) / 2, Math.max(1, barW - 1), barH);
        }
      }
      drawWave();

      // Animate playhead sweeping across the timeline + fake running timecode
      let frame = 0;
      const totalFrames = 25 * 18; // ~18s loop at 25fps
      const startFrame = 14 * 25 + 8; // start near 00:00:14:08

      function formatTimecode(f) {
        const total = (startFrame + f) % totalFrames;
        const ff = total % 25;
        const totalSeconds = Math.floor(total / 25);
        const ss = totalSeconds % 60;
        const mm = Math.floor(totalSeconds / 60);
        const pad = n => String(n).padStart(2, '0');
        return `00:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
      }

      function tick() {
        frame = (frame + 1) % totalFrames;
        const pct = (frame / totalFrames) * 100;
        playhead.style.left = pct + '%';
        if (timeEl) timeEl.textContent = formatTimecode(frame);
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    })();

    // ── CONTACT FORM ──
    document.querySelector('.contact-submit').addEventListener('click', function() {
      this.textContent = 'Sent ✓';
      this.style.background = '#2a2a2a';
      this.style.color = 'var(--off-white)';
      setTimeout(() => {
        this.textContent = 'Send Brief →';
        this.style.background = '';
        this.style.color = '';
      }, 3000);
    });
    // ── VIDEO LIGHTBOX ──
    const lightbox = document.getElementById('lightbox');
    const lightboxVideo = document.getElementById('lightboxVideo');
    const lightboxClose = document.getElementById('lightboxClose');

    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', () => {
        const src = card.dataset.video;
        if (!src) return;
        lightboxVideo.src = src;
        lightboxVideo.load();
        lightboxVideo.play();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('active');
      lightboxVideo.pause();
      lightboxVideo.src = '';
      document.body.style.overflow = '';
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });

