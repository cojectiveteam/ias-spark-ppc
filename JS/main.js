/* ============================================================
   IAS SPARK — main.js (Global JavaScript)
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   2. STICKY COUNTDOWN BAR
───────────────────────────────────────── */
(function initStickyBar() {
  var bar    = document.getElementById('stickyBar');
  var hero   = document.querySelector('.hero-section');
  var footer = document.querySelector('footer');
  if (!bar || !hero || !footer) return;

  var shown = false;

  function syncBarValues() {
    /* Sync all displayed countdown values (hero + sticky bar share same target) */
    var padFn = function(n){ return String(Math.max(0,n)).padStart(2,'0'); };
    var diff  = Math.max(0, window._cdTarget - Date.now());

    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);

    /* Sticky bar new elements */
    var sbD = document.getElementById('sb-days');
    var sbH = document.getElementById('sb-hours');
    var sbM = document.getElementById('sb-mins');
    var sbS = document.getElementById('sb-secs');
    if (sbD) sbD.textContent = padFn(d);
    if (sbH) sbH.textContent = padFn(h);
    if (sbM) sbM.textContent = padFn(m);
    if (sbS) sbS.textContent = padFn(s);
  }

  function onScroll() {
    var heroBottom  = hero.getBoundingClientRect().bottom;
    var footerTop   = footer.getBoundingClientRect().top;
    var winH        = window.innerHeight;
    var shouldShow  = heroBottom < 0 && footerTop > winH;

    if (shouldShow && !shown) {
      shown = true;
      bar.style.pointerEvents = 'auto';
      bar.style.opacity       = '1';
      bar.style.transform     = 'translateY(0)';
    } else if (!shouldShow && shown) {
      shown = false;
      bar.style.pointerEvents = 'none';
      bar.style.opacity       = '0';
      bar.style.transform     = 'translateY(100%)';
    }
    syncBarValues();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  /* Keep sticky bar numbers live */
  setInterval(syncBarValues, 1000);
})();


/* ─────────────────────────────────────────
   3. HERO WAVE CANVAS ANIMATION
───────────────────────────────────────── */
(function initHeroWave() {
  var canvas = document.getElementById('heroWaveCanvas');
  if (!canvas) return;
  var ctx    = canvas.getContext('2d');

  var NUM_RINGS = 5;
  var SPEED     = 0.00015;
  var rings     = [];
  for (var i = 0; i < NUM_RINGS; i++) {
    rings.push({ phase: i / NUM_RINGS });
  }
  var animStart = null;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function draw(ts) {
    if (!animStart) animStart = ts;
    var elapsed = ts - animStart;
    resize();
    var W = canvas.width, H = canvas.height;
    var ox = W / 2, oy = 0;
    var maxR = Math.sqrt((W / 2) * (W / 2) + H * H) * 1.05;

    ctx.fillStyle = '#1D3E9E';
    ctx.fillRect(0, 0, W, H);

    for (var ri = NUM_RINGS - 1; ri >= 0; ri--) {
      var ring  = rings[ri];
      var t     = ((elapsed * SPEED) + ring.phase) % 1;
      var r     = t * maxR;
      var thickness = maxR * 0.26;
      var alpha;

      if (t < 0.12)      alpha = t / 0.12;
      else if (t > 0.78) alpha = (1 - t) / 0.22;
      else               alpha = 1.0;
      alpha *= 0.52;

      if (r < 1) continue;

      var innerR = Math.max(0, r - thickness / 2);
      var outerR = r + thickness / 2;
      var grad = ctx.createRadialGradient(ox, oy, innerR, ox, oy, outerR);
      grad.addColorStop(0,    'rgba(29,62,158,0)');
      grad.addColorStop(0.25, 'rgba(80,120,210,' + (alpha * 0.55).toFixed(3) + ')');
      grad.addColorStop(0.5,  'rgba(110,155,235,' + alpha.toFixed(3) + ')');
      grad.addColorStop(0.75, 'rgba(80,120,210,' + (alpha * 0.55).toFixed(3) + ')');
      grad.addColorStop(1,    'rgba(29,62,158,0)');

      ctx.beginPath();
      ctx.arc(ox, oy, outerR, 0, Math.PI * 2);
      ctx.arc(ox, oy, Math.max(0, innerR), 0, Math.PI * 2, true);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    /* Centre glow */
    var glowR    = maxR * 0.28;
    var glowGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, glowR);
    glowGrad.addColorStop(0,   'rgba(100,145,230,0.45)');
    glowGrad.addColorStop(0.4, 'rgba(60,105,200,0.2)');
    glowGrad.addColorStop(1,   'rgba(29,62,158,0)');
    ctx.beginPath();
    ctx.arc(ox, oy, glowR, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
})();


/* ─────────────────────────────────────────
   4. TESTIMONIAL SLIDER
───────────────────────────────────────── */
(function initTestimonialSlider() {
  var wrapper = document.getElementById('tsWrapper');
  var track   = document.getElementById('tsTrack');
  var dots    = document.querySelectorAll('.ts-dot');
  var cursor  = document.getElementById('tsCursor');
  if (!wrapper || !track) return;

  var TOTAL          = 5;
  var current        = 1;
  var isTransitioning= false;
  var isPaused       = false;
  var timer;

  function setWidths() {
    var w = wrapper.offsetWidth;
    var slides = track.querySelectorAll('.ts-slide');
    slides.forEach(function (s) { s.style.width = w + 'px'; });
    track.style.transition = 'none';
    track.style.transform  = 'translateX(-' + (current * w) + 'px)';
  }

  function goTo(idx, animate) {
    var w = wrapper.offsetWidth;
    track.style.transition = (animate === false)
      ? 'none'
      : 'transform 0.52s cubic-bezier(0.4,0,0.2,1)';
    track.style.transform  = 'translateX(-' + (idx * w) + 'px)';
    current = idx;

    var dotIdx = idx - 1;
    if (dotIdx < 0)      dotIdx = TOTAL - 1;
    if (dotIdx >= TOTAL) dotIdx = 0;
    dots.forEach(function (d, i) {
      d.classList.toggle('ts-dot-active', i === dotIdx);
    });
  }

  track.addEventListener('transitionend', function () {
    isTransitioning = false;
    if (current === 0)         goTo(TOTAL, false);
    else if (current === TOTAL + 1) goTo(1, false);
  });

  function next() {
    if (isTransitioning) return;
    isTransitioning = true;
    goTo(current + 1, true);
  }

  function prev() {
    if (isTransitioning) return;
    isTransitioning = true;
    goTo(current - 1, true);
  }

  function startAuto() {
    clearInterval(timer);
    timer = setInterval(function () { if (!isPaused) next(); }, 4000);
  }

  /* Pause on hover */
  wrapper.addEventListener('mouseenter', function () { isPaused = true; });
  wrapper.addEventListener('mouseleave', function () {
    isPaused = false;
    if (cursor) cursor.classList.remove('visible');
  });

  /* Custom cursor */
  if (cursor) {
    wrapper.addEventListener('mousemove', function (e) {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top  = e.clientY + 'px';
      cursor.classList.add('visible');
      var rect  = wrapper.getBoundingClientRect();
      var relX  = e.clientX - rect.left;
      var isLeft= relX < rect.width / 2;
      cursor.textContent       = isLeft ? '‹' : '›';
      cursor.style.background  = isLeft ? '#1D3E9E' : '#e8722a';
    });
  }

  wrapper.addEventListener('click', function (e) {
    var rect  = wrapper.getBoundingClientRect();
    var relX  = e.clientX - rect.left;
    if (relX < rect.width / 2) prev(); else next();
  });

  /* Public dot click handler */
  window.tsGoTo = function (realIdx) {
    clearInterval(timer);
    goTo(realIdx + 1, true);
    startAuto();
  };

  setWidths();
  goTo(1, false);
  startAuto();

  window.addEventListener('resize', function () {
    clearInterval(timer);
    setWidths();
    startAuto();
  });
})();


/* ─────────────────────────────────────────
   5. PROBLEM SECTION — SVG DRAW + REVEAL
───────────────────────────────────────── */
(function initProbSection() {
  var svgWrap = document.getElementById('probSvgWrap');
  var section = document.getElementById('probSection');
  if (!section) return;

  var feats = section.querySelectorAll('.prob-feat');
  var drawn = false;

  function check() {
    if (drawn) return;
    var rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.82) {
      drawn = true;
      if (svgWrap) svgWrap.classList.add('prob-drawn');
      feats.forEach(function (f) { f.classList.add('prob-visible'); });
    }
  }

  window.addEventListener('scroll', check, { passive: true });
  check();
})();


/* ─────────────────────────────────────────
   6. OPPORTUNITY SECTION — SCROLL REVEAL
───────────────────────────────────────── */
(function initOppSection() {
  var section  = document.getElementById('oppSection');
  if (!section) return;

  var targets  = section.querySelectorAll('.opp-img-left, .opp-img-right, .opp-row, .opp-heading');
  var revealed = false;

  function reveal() {
    if (revealed) return;
    var rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      revealed = true;
      targets.forEach(function (el) { el.classList.add('opp-in'); });
    }
  }

  window.addEventListener('scroll', reveal, { passive: true });
  reveal();
})();


/* ─────────────────────────────────────────
   7. DISCOVER SECTION — SCROLL-DRIVEN CANVAS
───────────────────────────────────────── */
(function initDiscoverSection() {
  var section  = document.getElementById('discoverSection');
  var sticky   = document.getElementById('discoverSticky');
  var canvas   = document.getElementById('discCanvas');
  if (!section || !sticky || !canvas) return;

  var ctx = canvas.getContext('2d');

  var cardEls = [
    document.getElementById('disc2Card1'),
    document.getElementById('disc2Card2'),
    document.getElementById('disc2Card3'),
    document.getElementById('disc2Card4'),
    document.getElementById('disc2Card5')
  ];
  var dotEls = [
    document.getElementById('disc2Dot1'),
    document.getElementById('disc2Dot2'),
    document.getElementById('disc2Dot3'),
    document.getElementById('disc2Dot4'),
    document.getElementById('disc2Dot5')
  ];

  var cardThresholds = [0.04, 0.22, 0.42, 0.60, 0.78];

  function getAnchor(el) {
    var r  = el.getBoundingClientRect();
    var sr = sticky.getBoundingClientRect();
    var cx = r.left - sr.left + r.width / 2;
    var cy = (r.top - sr.top) < sticky.offsetHeight * 0.5
      ? r.bottom - sr.top
      : r.top - sr.top;
    return { x: cx, y: cy };
  }

  function positionDot(dot, anchor) {
    dot.style.left = (anchor.x - 6) + 'px';
    dot.style.top  = (anchor.y - 6) + 'px';
  }

  function resizeCanvas() {
    canvas.width  = sticky.offsetWidth;
    canvas.height = sticky.offsetHeight;
  }

  function drawPath(progress) {
    resizeCanvas();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var pts = cardEls.map(function (el) { return getAnchor(el); });
    pts.forEach(function (pt, i) { positionDot(dotEls[i], pt); });

    /* Build zigzag segments */
    var segments = [];
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1];
      var midY = (a.y + b.y) / 2;
      segments.push([
        { x: a.x, y: a.y },
        { x: a.x, y: midY },
        { x: b.x, y: midY },
        { x: b.x, y: b.y }
      ]);
    }

    var allPts = [segments[0][0]];
    segments.forEach(function (seg) {
      seg.slice(1).forEach(function (p) { allPts.push(p); });
    });

    /* Cumulative lengths */
    var lengths = [0];
    for (var j = 1; j < allPts.length; j++) {
      var dx = allPts[j].x - allPts[j - 1].x;
      var dy = allPts[j].y - allPts[j - 1].y;
      lengths.push(lengths[j - 1] + Math.sqrt(dx * dx + dy * dy));
    }
    var totalLen = lengths[lengths.length - 1];
    var drawLen  = totalLen * progress;

    /* Ghost path */
    ctx.beginPath();
    ctx.moveTo(allPts[0].x, allPts[0].y);
    for (var k = 1; k < allPts.length; k++) ctx.lineTo(allPts[k].x, allPts[k].y);
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = 'rgba(232,114,42,0.18)';
    ctx.lineWidth   = 3;
    ctx.lineCap     = 'round';
    ctx.stroke();

    /* Animated path */
    ctx.beginPath();
    ctx.moveTo(allPts[0].x, allPts[0].y);
    var remaining = drawLen;
    for (var m = 1; m < allPts.length; m++) {
      var segLen = lengths[m] - lengths[m - 1];
      if (remaining <= 0) break;
      if (remaining >= segLen) {
        ctx.lineTo(allPts[m].x, allPts[m].y);
        remaining -= segLen;
      } else {
        var tRatio = remaining / segLen;
        ctx.lineTo(
          allPts[m - 1].x + (allPts[m].x - allPts[m - 1].x) * tRatio,
          allPts[m - 1].y + (allPts[m].y - allPts[m - 1].y) * tRatio
        );
        remaining = 0;
      }
    }
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = '#e8722a';
    ctx.lineWidth   = 3;
    ctx.lineCap     = 'round';
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function onScroll() {
    var rect     = section.getBoundingClientRect();
    var winH     = window.innerHeight;
    var progress = 0;

    if (rect.top <= 0 && rect.bottom >= winH) {
      progress = Math.abs(rect.top) / (rect.height - winH);
    } else if (rect.bottom < winH) {
      progress = 1;
    }
    progress = Math.min(1, Math.max(0, progress));

    drawPath(progress);

    cardEls.forEach(function (card, i) {
      var dot = dotEls[i];
      if (progress >= cardThresholds[i]) {
        card.classList.add('active');
        dot.classList.add('active');
      } else {
        card.classList.remove('active');
        dot.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { resizeCanvas(); onScroll(); });

  if (document.readyState === 'complete') {
    resizeCanvas(); onScroll();
  } else {
    window.addEventListener('load', function () { resizeCanvas(); onScroll(); });
  }
})();


/* ─────────────────────────────────────────
   8. ABOUT SECTION — SCROLL REVEAL
───────────────────────────────────────── */
(function initAboutSection() {
  var section  = document.getElementById('aboutSection');
  var head     = document.getElementById('aboutHead');
  var cards    = document.querySelectorAll('.about-sc');
  var quote    = document.getElementById('aboutQuote');
  if (!section) return;

  var revealed = false;

  function revealOnScroll() {
    var rect = section.getBoundingClientRect();
    if (!revealed && rect.top < window.innerHeight * 0.85) {
      revealed = true;
      if (head)  head.classList.add('av');
      cards.forEach(function (c, i) {
        setTimeout(function () { c.classList.add('av'); }, i * 120);
      });
      if (quote) quote.classList.add('av');
    }
  }

  window.addEventListener('scroll', revealOnScroll, { passive: true });
  revealOnScroll();
})();


/* ─────────────────────────────────────────
   9. HOST SECTION — STARS + COUNTERS + REVEAL
───────────────────────────────────────── */
(function initHostSection() {
  /* Twinkling star dots */
  var starsContainer = document.getElementById('hsStarsBg');
  if (starsContainer) {
    for (var i = 0; i < 55; i++) {
      var d  = document.createElement('div');
      d.className = 'hs-star-dot';
      var sz = Math.random() * 3 + 1.5;
      d.style.cssText = 'width:' + sz + 'px;height:' + sz + 'px;'
        + 'left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 100) + '%;'
        + '--dur:' + (2.5 + Math.random() * 3) + 's;--delay:' + (Math.random() * 3) + 's;';
      starsContainer.appendChild(d);
    }
  }

  var section    = document.getElementById('hostSection');
  var lbl        = document.getElementById('hsLbl');
  var h2         = document.getElementById('hsH2');
  var imgCol     = document.getElementById('hsImgCol');
  var awardBadge = document.getElementById('hsAwardBadge');
  var trust      = document.getElementById('hsTrust');
  var right      = document.getElementById('hsRight');
  var awardsRow  = document.getElementById('hsAwardsRow');
  var stats1     = document.getElementById('hsStats1');
  var stats2     = document.getElementById('hsStats2');
  var counters   = section ? section.querySelectorAll('[data-target]') : [];
  var triggered  = false;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1600, t0 = performance.now();
    (function step(now) {
      var p = Math.min((now - t0) / dur, 1);
      var v = Math.floor(easeOut(p) * target);
      el.textContent = (v >= 1000 ? v.toLocaleString() : v) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  function onScroll() {
    if (triggered || !section) return;
    if (section.getBoundingClientRect().top < window.innerHeight * 0.82) {
      triggered = true;
      if (lbl)       lbl.classList.add('hv');
      if (h2)        h2.classList.add('hv');
      setTimeout(function () { if (imgCol) imgCol.classList.add('hv'); }, 80);
      setTimeout(function () { if (awardBadge) awardBadge.classList.add('hv'); }, 700);
      setTimeout(function () { if (trust) trust.classList.add('hv'); }, 950);
      setTimeout(function () { if (right) right.classList.add('hv'); }, 180);
      setTimeout(function () { if (awardsRow) awardsRow.classList.add('hv'); }, 380);
      setTimeout(function () {
        if (stats1) stats1.classList.add('hv');
        setTimeout(function () {
          if (stats2) stats2.classList.add('hv');
          setTimeout(function () {
            counters.forEach(function (c) { animateCounter(c); });
          }, 200);
        }, 140);
      }, 480);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ─────────────────────────────────────────
   10. WHO SECTION — SCROLL REVEAL
───────────────────────────────────────── */
(function initWhoSection() {
  var section = document.getElementById('whoSection');
  var head    = document.getElementById('wsaHead');
  var cards   = document.querySelectorAll('.wsa-card');
  if (!section) return;

  var done = false;

  function check() {
    if (done) return;
    if (section.getBoundingClientRect().top < window.innerHeight * 0.85) {
      done = true;
      if (head) head.classList.add('wv');
      cards.forEach(function (c) { c.classList.add('wv'); });
    }
  }

  window.addEventListener('scroll', check, { passive: true });
  check();
})();


/* ─────────────────────────────────────────
   11. WEBINAR DETAILS — SCROLL REVEAL
───────────────────────────────────────── */
(function initWebinarDetails() {
  var section = document.getElementById('webinarDetails');
  var title   = document.getElementById('wdTitle');
  var cards   = [
    document.getElementById('wdCard1'),
    document.getElementById('wdCard2'),
    document.getElementById('wdCard3'),
    document.getElementById('wdCard4')
  ];
  var notice  = document.getElementById('wdNotice');
  if (!section) return;

  var done = false;

  function check() {
    if (done) return;
    if (section.getBoundingClientRect().top < window.innerHeight * 0.85) {
      done = true;
      if (title) title.classList.add('wdv');
      cards.forEach(function (c) { if (c) c.classList.add('wdv'); });
      if (notice) notice.classList.add('wdv');
    }
  }

  window.addEventListener('scroll', check, { passive: true });
  check();
})();


/* ─────────────────────────────────────────
   12. FAQ SECTION — ACCORDION + SCROLL REVEAL
───────────────────────────────────────── */
const faqs = [
  { q: "Is this webinar free?", a: "Yes, <strong>100% free!</strong> There is absolutely no cost to attend. No hidden charges, no upsells — just pure value for parents." },
  { q: "Should children attend the webinar?", a: "This session is designed <strong>specifically for parents.</strong> However, if your child is curious and wants to listen in, they're more than welcome — it's inspiring for them too!" },
  { q: "Will the webinar be recorded?", a: "We highly recommend attending <strong>live</strong> for the full interactive Q&A experience. A limited replay may be shared with registered attendees at our discretion." },
  { q: "Is this related to IAS exam coaching?", a: "Not at all! IAS Spark focuses on <strong>leadership thinking, critical awareness, and communication</strong> for Grade 5–10 students — not exam prep." }
];

const list = document.getElementById('faq-list');
list.style.display = 'flex';
list.style.flexDirection = 'column';
list.style.gap = '12px';

faqs.forEach((f, i) => {
  const item = document.createElement('div');
  item.className = 'faq-item' + (i === 0 ? ' open' : '');
  item.innerHTML = `
    <div class="faq-q">
      <div class="faq-q-left">
        <div class="faq-num">0${i+1}</div>
        <div class="faq-qtext">${f.q}</div>
      </div>
      <div class="faq-toggle">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
    </div>
    <div class="faq-body">
      <div class="faq-body-inner">${f.a}</div>
    </div>
  `;
  item.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
  list.appendChild(item);
});
