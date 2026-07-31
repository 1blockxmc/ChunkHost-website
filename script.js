// ── Terminal Demo ────────────────────────────────────────────
(() => {
  const body       = document.getElementById('terminalBody');
  const statusDot  = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const btnStart   = document.getElementById('btnStart');
  const btnStop    = document.getElementById('btnStop');
  const btnRestart = document.getElementById('btnRestart');

  if (!body || !btnStart) return;

  let state = 'offline'; // offline | starting | online | stopping
  let timers = [];
  let clock = new Date();
  clock.setHours(12, 0, 0, 0);

  function ts() {
    clock = new Date(clock.getTime() + (1000 + Math.random() * 900));
    const h = String(clock.getHours()).padStart(2, '0');
    const m = String(clock.getMinutes()).padStart(2, '0');
    const s = String(clock.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  function clearTimers() {
    timers.forEach(t => clearTimeout(t));
    timers = [];
  }

  function addLine(text, cls) {
    const line = document.createElement('div');
    line.className = 'terminal-line' + (cls ? ' ' + cls : '');
    line.textContent = text;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
  }

  function setStatus(mode) {
    statusDot.className = 'status-dot';
    if (mode === 'starting' || mode === 'stopping') {
      statusDot.classList.add('is-pending');
      statusText.textContent = mode === 'starting' ? 'Starting…' : 'Stopping…';
    } else if (mode === 'online') {
      statusDot.classList.add('is-online');
      statusText.textContent = 'Online';
    } else {
      statusText.textContent = 'Offline';
    }
  }

  function setButtons(mode) {
    btnStart.disabled   = mode !== 'offline';
    btnStop.disabled    = mode !== 'online';
    btnRestart.disabled = mode !== 'online';
  }

  function run(sequence, onDone) {
    clearTimers();
    let cumulative = 0;
    sequence.forEach(step => {
      cumulative += step.delay;
      const id = setTimeout(() => addLine(step.text, step.cls), cumulative);
      timers.push(id);
    });
    const finalId = setTimeout(onDone, cumulative + 150);
    timers.push(finalId);
  }

  function startSequence() {
    state = 'starting';
    setStatus('starting');
    setButtons('starting');
    run([
      { delay: 100,  text: '$ ./start.sh',                                                          cls: 'terminal-cmd' },
      { delay: 350,  text: `[${ts()}] [Server thread/INFO]: Starting minecraft server version 1.21.4`, cls: 'terminal-info' },
      { delay: 300,  text: `[${ts()}] [Server thread/INFO]: Loading properties`,                       cls: 'terminal-info' },
      { delay: 300,  text: `[${ts()}] [Server thread/INFO]: Default game type: SURVIVAL`,               cls: 'terminal-info' },
      { delay: 350,  text: `[${ts()}] [Server thread/INFO]: Generating keypair`,                        cls: 'terminal-info' },
      { delay: 400,  text: `[${ts()}] [Server thread/INFO]: Preparing level "world"`,                    cls: 'terminal-info' },
      { delay: 500,  text: `[${ts()}] [Server thread/INFO]: Preparing spawn area: 62%`,                  cls: 'terminal-info' },
      { delay: 450,  text: `[${ts()}] [Server thread/INFO]: Preparing spawn area: 100%`,                 cls: 'terminal-ok'   },
      { delay: 400,  text: `[${ts()}] [Server thread/INFO]: Done (3.821s)! For help, type "help"`,       cls: 'terminal-ok'   },
      { delay: 350,  text: `[${ts()}] [Server thread/INFO]: Server listening on *:25565`,                cls: 'terminal-ok'   },
    ], () => {
      state = 'online';
      setStatus('online');
      setButtons('online');
    });
  }

  function stopSequence(thenStart) {
    state = 'stopping';
    setStatus('stopping');
    setButtons('stopping');
    run([
      { delay: 100, text: '$ ./stop.sh',                                                       cls: 'terminal-cmd'  },
      { delay: 300, text: `[${ts()}] [Server thread/INFO]: Stopping the server`,                cls: 'terminal-warn' },
      { delay: 350, text: `[${ts()}] [Server thread/INFO]: Stopping server`,                    cls: 'terminal-warn' },
      { delay: 350, text: `[${ts()}] [Server thread/INFO]: Saving players`,                     cls: 'terminal-info' },
      { delay: 300, text: `[${ts()}] [Server thread/INFO]: Saving worlds`,                      cls: 'terminal-info' },
      { delay: 350, text: `[${ts()}] [Server thread/INFO]: Saving chunks for level 'world'/overworld`, cls: 'terminal-info' },
      { delay: 350, text: `[${ts()}] [Server thread/INFO]: ThreadedAnvilChunkStorage: All chunks are saved`, cls: 'terminal-ok' },
      { delay: 300, text: `[${ts()}] Process finished with exit code 0`,                        cls: 'terminal-muted' },
    ], () => {
      state = 'offline';
      setStatus('offline');
      setButtons('offline');
      addLine('// server offline — press start to boot up', 'terminal-muted');
      if (thenStart) startSequence();
    });
  }

  btnStart.addEventListener('click', () => {
    if (state !== 'offline') return;
    startSequence();
  });

  btnStop.addEventListener('click', () => {
    if (state !== 'online') return;
    stopSequence(false);
  });

  btnRestart.addEventListener('click', () => {
    if (state !== 'online') return;
    addLine('$ ./restart.sh', 'terminal-cmd');
    stopSequence(true);
  });
})();

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
