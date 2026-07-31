// ── Promo Bar Dismiss ────────────────────────────────────────
const promoBar = document.getElementById('promoBar');
const promoClose = document.getElementById('promoClose');
if (promoBar && promoClose) {
  promoClose.addEventListener('click', () => {
    promoBar.classList.add('hidden');
  });
}
 
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
 
