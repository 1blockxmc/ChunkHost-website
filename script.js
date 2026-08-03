// ── Terminal Demo ────────────────────────────────────────────
(() => {
  const body       = document.getElementById('terminalBody');
  const statusDot  = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const btnStart   = document.getElementById('btnStart');
  const btnStop    = document.getElementById('btnStop');
  const btnRestart = document.getElementById('btnRestart');

  const cpuVal  = document.getElementById('metricCpuVal');
  const cpuBar  = document.getElementById('metricCpuBar');
  const ramVal  = document.getElementById('metricRamVal');
  const ramBar  = document.getElementById('metricRamBar');
  const diskVal = document.getElementById('metricDiskVal');
  const diskBar = document.getElementById('metricDiskBar');
  const netVal  = document.getElementById('metricNetVal');
  const netBar  = document.getElementById('metricNetBar');

  if (!body || !btnStart) return;

  const RAM_TOTAL  = 8;    // GB
  const DISK_TOTAL = 80;   // GB
  const DISK_USED_IDLE = 12; // GB (world + jar, always on disk)

  let state = 'offline'; // offline | starting | online | stopping
  let timers = [];
  let metricsTimer = null;
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

  function setMetricBars(idle) {
    [cpuBar, ramBar, diskBar, netBar].forEach(bar => {
      if (!bar) return;
      bar.classList.toggle('is-idle', idle);
    });
  }

  function renderIdleMetrics() {
    clearInterval(metricsTimer);
    metricsTimer = null;
    if (cpuVal)  cpuVal.textContent  = '0%';
    if (cpuBar)  cpuBar.style.width  = '0%';
    if (ramVal)  ramVal.textContent  = `0 / ${RAM_TOTAL} GB`;
    if (ramBar)  ramBar.style.width  = '0%';
    if (diskVal) diskVal.textContent = `${DISK_USED_IDLE} / ${DISK_TOTAL} GB`;
    if (diskBar) diskBar.style.width = `${(DISK_USED_IDLE / DISK_TOTAL) * 100}%`;
    if (netVal)  netVal.textContent  = '↓ 0 KB/s ↑ 0 KB/s';
    if (netBar)  netBar.style.width  = '0%';
    setMetricBars(true);
  }

  function renderBootingMetrics() {
    setMetricBars(false);
    if (cpuVal)  cpuVal.textContent  = '87%';
    if (cpuBar)  cpuBar.style.width  = '87%';
    if (ramVal)  ramVal.textContent  = `${(RAM_TOTAL * 0.55).toFixed(1)} / ${RAM_TOTAL} GB`;
    if (ramBar)  ramBar.style.width  = '55%';
    if (diskVal) diskVal.textContent = `${DISK_USED_IDLE} / ${DISK_TOTAL} GB`;
    if (diskBar) diskBar.style.width = `${(DISK_USED_IDLE / DISK_TOTAL) * 100}%`;
    if (netVal)  netVal.textContent  = '↓ 340 KB/s ↑ 40 KB/s';
    if (netBar)  netBar.style.width  = '60%';
  }

  function startLiveMetrics() {
    setMetricBars(false);
    clearInterval(metricsTimer);
    const tick = () => {
      const cpu   = 18 + Math.random() * 22;                 // 18–40%
      const ramGB = RAM_TOTAL * (0.28 + Math.random() * 0.1); // ~28–38% used
      const diskGB = DISK_USED_IDLE + Math.random() * 3;
      const down  = 20 + Math.random() * 140;                // KB/s
      const up    = 4 + Math.random() * 30;

      if (cpuVal)  cpuVal.textContent  = `${cpu.toFixed(0)}%`;
      if (cpuBar)  cpuBar.style.width  = `${cpu}%`;
      if (ramVal)  ramVal.textContent  = `${ramGB.toFixed(1)} / ${RAM_TOTAL} GB`;
      if (ramBar)  ramBar.style.width  = `${(ramGB / RAM_TOTAL) * 100}%`;
      if (diskVal) diskVal.textContent = `${diskGB.toFixed(1)} / ${DISK_TOTAL} GB`;
      if (diskBar) diskBar.style.width = `${(diskGB / DISK_TOTAL) * 100}%`;
      if (netVal)  netVal.textContent  = `↓ ${down.toFixed(0)} KB/s ↑ ${up.toFixed(0)} KB/s`;
      if (netBar)  netBar.style.width  = `${Math.min(down / 2, 100)}%`;
    };
    tick();
    metricsTimer = setInterval(tick, 1600);
  }

  function stopLiveMetrics() {
    clearInterval(metricsTimer);
    metricsTimer = null;
  }

  renderIdleMetrics();

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
    renderBootingMetrics();
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
      startLiveMetrics();
    });
  }

  function stopSequence(thenStart) {
    state = 'stopping';
    setStatus('stopping');
    setButtons('stopping');
    stopLiveMetrics();
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
      renderIdleMetrics();
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

  // ── Auto-start when the demo scrolls into view ────────────────
  const terminalSection = document.getElementById('live-demo');
  if (terminalSection && 'IntersectionObserver' in window) {
    let hasAutoStarted = false;
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAutoStarted && state === 'offline') {
          hasAutoStarted = true;
          startSequence();
          scrollObserver.disconnect();
        }
      });
    }, { threshold: 0.5 });
    scrollObserver.observe(terminalSection);
  }
})();

// ── Promo Bar Dismiss ────────────────────────────────────────
const promoBar = document.getElementById('promoBar');
const promoClose = document.getElementById('promoClose');
if (promoBar && promoClose) {
  promoClose.addEventListener('click', () => {
    promoBar.classList.add('hidden');
  });
}

// ── Promo Code Copy ───────────────────────────────────────────
const promoCode = document.getElementById('promoCode');
if (promoCode) {
  promoCode.addEventListener('click', async () => {
    const text = promoCode.textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      // clipboard API unavailable — fail silently, still show feedback
    }
    promoCode.classList.add('copied');
    setTimeout(() => promoCode.classList.remove('copied'), 1500);
  });
}

// ── Stats Band Count-Up ───────────────────────────────────────
const statNums = document.querySelectorAll('.stats-band-num');
if (statNums.length && 'IntersectionObserver' in window) {
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.countTo);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const value = target * eased;
        el.textContent = value.toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      statObserver.unobserve(el);
    });
  }, { threshold: 0.6 });
  statNums.forEach(el => statObserver.observe(el));
}

// ── RAM → Price Calculator ─────────────────────────────────────
(() => {
  const slider     = document.getElementById('calcSlider');
  const ramVal     = document.getElementById('calcRamVal');
  const priceVal   = document.getElementById('calcPriceVal');
  const playersEl  = document.getElementById('calcPlayers');
  const ctaEl      = document.getElementById('calcCta');
  if (!slider) return;

  const RATE = 1.5; // $ per GB

  function playerEstimate(gb) {
    if (gb <= 2)  return '5–8 players';
    if (gb <= 4)  return '10–15 players';
    if (gb <= 6)  return '15–25 players';
    if (gb <= 8)  return '25–40 players';
    if (gb <= 10) return '40–60 players';
    if (gb <= 13) return '55–75 players';
    return '60–80+ players';
  }

  function update() {
    const gb = parseInt(slider.value, 10);
    const price = (gb * RATE).toFixed(gb * RATE % 1 === 0 ? 0 : 2);
    ramVal.textContent = gb;
    priceVal.textContent = price;
    playersEl.textContent = `Good for ~${playerEstimate(gb)}`;
    ctaEl.textContent = `Get ${gb} GB for $${price}/mo`;
  }

  slider.addEventListener('input', update);
  update();
})();

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
  '.section-label', '.section-title', '.section-sub', '.cta-title', '.cta-sub',
  '.stats-band-item', '.review-card', '.calc-card'
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
