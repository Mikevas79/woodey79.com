/**
 * WOODEY79.COM - Main JavaScript
 * Modern Portfolio Site Scripts
 */

'use strict';

// ============================================
// THEME MANAGEMENT
// ============================================
const ThemeManager = {
  STORAGE_KEY: 'woodey79-theme',
  DARK: 'dark',
  LIGHT: 'light',

  init() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? this.DARK : this.LIGHT);
    this.apply(theme);

    // Watch system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        this.apply(e.matches ? this.DARK : this.LIGHT);
      }
    });
  },

  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme === this.LIGHT ? 'light' : '');
    this.updateToggleIcons(theme);
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? this.DARK : this.LIGHT;
    localStorage.setItem(this.STORAGE_KEY, next);
    this.apply(next);
  },

  updateToggleIcons(theme) {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.textContent = theme === this.LIGHT ? '🌙' : '☀️';
      btn.setAttribute('aria-label', `Switch to ${theme === this.LIGHT ? 'dark' : 'light'} mode`);
    });
  }
};

// ============================================
// NAVIGATION
// ============================================
const Navigation = {
  init() {
    const nav = document.querySelector('.nav');
    const hamburger = document.querySelector('.nav-hamburger');
    const mobileNav = document.querySelector('.mobile-nav');

    // Scroll effect
    if (nav) {
      window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 20);
      }, { passive: true });
    }

    // Mobile menu
    if (hamburger && mobileNav) {
      hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('open');
        mobileNav.classList.toggle('open', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      // Close on link click
      mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('open');
          mobileNav.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    }

    // Mark active link
    this.markActive();
  },

  markActive() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }
};

// ============================================
// PARTICLE ANIMATION (Hero Canvas)
// ============================================
const ParticleSystem = {
  canvas: null,
  ctx: null,
  particles: [],
  animId: null,

  init() {
    this.canvas = document.getElementById('hero-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.createParticles();
    this.animate();

    window.addEventListener('resize', () => this.resize(), { passive: true });
  },

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    if (this.particles.length) this.createParticles();
  },

  createParticles() {
    const count = Math.min(Math.floor(window.innerWidth / 18), 60);
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        r: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.4 + 0.1
      });
    }
  },

  animate() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(p => {
      // Move
      p.x += p.dx;
      p.y += p.dy;

      // Wrap around
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      // Draw dot
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`;
      this.ctx.fill();
    });

    // Draw connections
    this.particles.forEach((a, i) => {
      for (let j = i + 1; j < this.particles.length; j++) {
        const b = this.particles[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 120) {
          this.ctx.beginPath();
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.strokeStyle = `rgba(99, 102, 241, ${0.12 * (1 - dist / 120)})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    });

    this.animId = requestAnimationFrame(() => this.animate());
  }
};

// ============================================
// TYPEWRITER EFFECT
// ============================================
const Typewriter = {
  init() {
    const el = document.querySelector('.hero-typewriter');
    if (!el) return;

    const words = [
      'Developer',
      'Builder',
      'AI Experimenter',
      'Automation Engineer',
      'Problem Solver'
    ];

    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let paused = false;

    const type = () => {
      const current = words[wordIndex];

      if (deleting) {
        el.textContent = current.substring(0, charIndex - 1);
        charIndex--;
      } else {
        el.textContent = current.substring(0, charIndex + 1);
        charIndex++;
      }

      let delay = deleting ? 60 : 100;

      if (!deleting && charIndex === current.length) {
        paused = true;
        delay = 2000;
        deleting = true;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        delay = 500;
      }

      setTimeout(type, delay);
    };

    // Start after a short delay
    setTimeout(type, 800);
  }
};

// ============================================
// SCROLL ANIMATIONS
// ============================================
const ScrollAnimator = {
  init() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (!elements.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      elements.forEach(el => observer.observe(el));
    } else {
      // Fallback: show all
      elements.forEach(el => el.classList.add('visible'));
    }
  }
};

// ============================================
// COUNTER ANIMATION
// ============================================
const CounterAnimation = {
  init() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  },

  animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'));
    const duration = 1500;
    const start = performance.now();

    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + (el.dataset.suffix || '+');
      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  }
};

// ============================================
// FILTER TABS
// ============================================
const FilterTabs = {
  init() {
    document.querySelectorAll('.filter-tabs').forEach(container => {
      const tabs = container.querySelectorAll('.filter-tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.filter(tab.dataset.filter);
        });
      });
    });
  },

  filter(category) {
    const cards = document.querySelectorAll('[data-category]');
    cards.forEach(card => {
      if (category === 'all' || card.dataset.category === category) {
        card.style.display = '';
        card.style.animation = 'fadeInUp 0.4s ease both';
      } else {
        card.style.display = 'none';
      }
    });
  }
};

// ============================================
// CONTACT FORM
// ============================================
const ContactForm = {
  init() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      const originalText = btn.textContent;

      btn.disabled = true;
      btn.textContent = 'Sending...';

      // Simulate send (replace with actual endpoint)
      await new Promise(r => setTimeout(r, 1500));

      Toast.show('Message sent successfully! I\'ll get back to you soon. 🚀', 'success');
      form.reset();
      btn.disabled = false;
      btn.textContent = originalText;
    });
  }
};

// ============================================
// LOGIN FORM
// ============================================
const LoginForm = {
  init() {
    const form = document.getElementById('login-form');
    if (!form) return;

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = btn.previousElementSibling;
        if (input && input.type === 'password') {
          input.type = 'text';
          btn.textContent = '🙈';
        } else if (input) {
          input.type = 'password';
          btn.textContent = '👁️';
        }
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Signing in...';

      await new Promise(r => setTimeout(r, 1000));

      Toast.show('Login functionality coming soon!', 'success');
      btn.disabled = false;
      btn.textContent = 'Sign In';
    });
  }
};

// ============================================
// TOAST NOTIFICATIONS
// ============================================
const Toast = {
  show(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✅' : '❌'}</span>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }
};

// ============================================
// SMOOTH HOVER FOR CARDS (tilt effect)
// ============================================
const CardTilt = {
  init() {
    document.querySelectorAll('.project-card, .experiment-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-5px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
        card.style.transition = 'none';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = '';
      });
    });
  }
};

// ============================================
// COPY CODE BLOCKS
// ============================================
const CodeCopy = {
  init() {
    document.querySelectorAll('.code-block').forEach(block => {
      const btn = document.createElement('button');
      btn.textContent = 'Copy';
      btn.className = 'code-copy-btn';
      btn.style.cssText = `
        position: absolute; top: 0.5rem; right: 0.5rem;
        background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3);
        color: #818cf8; border-radius: 4px; padding: 0.2rem 0.5rem;
        font-size: 0.72rem; cursor: pointer; font-family: inherit;
        transition: all 0.2s ease;
      `;

      block.style.position = 'relative';
      block.appendChild(btn);

      btn.addEventListener('click', async () => {
        const text = block.textContent.replace('Copy', '').trim();
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = 'Copied!';
          setTimeout(() => (btn.textContent = 'Copy'), 2000);
        } catch (err) {
          btn.textContent = 'Failed';
        }
      });
    });
  }
};

// ============================================
// PAGE TRANSITIONS
// ============================================
const PageTransitions = {
  init() {
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      // Only internal .html links
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
      if (!href.endsWith('.html') && !href.match(/^[\w-]+\.html/)) return;

      link.addEventListener('click', (e) => {
        // Let browser handle normally; could add fade transition here
      });
    });
  }
};

// ============================================
// INIT - Run everything on DOM ready
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  Navigation.init();
  ParticleSystem.init();
  Typewriter.init();
  ScrollAnimator.init();
  CounterAnimation.init();
  FilterTabs.init();
  ContactForm.init();
  LoginForm.init();
  CardTilt.init();
  CodeCopy.init();
  PageTransitions.init();

  // Theme toggle buttons
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => ThemeManager.toggle());
  });
});
