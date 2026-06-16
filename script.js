// ── Mobile Nav Toggle ─────────────────────────────────────────
const mobileToggle = document.getElementById('mobileToggle');
const mobileMenu   = document.getElementById('mobileMenu');

mobileToggle.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  mobileToggle.textContent = isOpen ? '✕' : '☰';
  mobileToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});

// Close mobile menu when a link is clicked
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    mobileToggle.textContent = '☰';
  });
});

// ── Scroll-fade animations ────────────────────────────────────
// Adds .fade-up to key elements, then triggers them as they enter viewport
const fadeTargets = [
  '.hero-badge', '.hero-title', '.hero-sub', '.hero-cta-row', '.hero-stats',
  '.feature-card', '.step', '.plan-card', '.spec-item', '.faq-item',
  '.section-label', '.section-title', '.section-sub', '.cta-title', '.cta-sub'
];

fadeTargets.forEach(selector => {
  document.querySelectorAll(selector).forEach(el => {
    el.classList.add('fade-up');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings slightly
      const siblings = [...entry.target.parentElement.children].filter(c => c.classList.contains('fade-up'));
      const idx = siblings.indexOf(entry.target);
      entry.target.style.animationDelay = `${idx * 60}ms`;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ── Sticky nav shadow on scroll ───────────────────────────────
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.style.boxShadow = window.scrollY > 10
    ? '0 1px 32px rgba(0,0,0,0.6)'
    : 'none';
}, { passive: true });

// ── Smooth anchor scroll (for older browsers) ─────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
