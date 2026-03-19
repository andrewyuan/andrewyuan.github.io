/* ============================================================
   Andrew Yuan — Personal Site — Scripts
   Typed hero, mousemove tilt, cursor glow, scroll reveals,
   number counter animations.
   ============================================================ */

(function () {
  'use strict';

  // === TYPED HERO TAGLINE ======================================
  var taglineEl = document.getElementById('hero-tagline');
  var phrases = [
    'Building AI systems that reason, not just retrieve.',
    'Turning data into decisions across Asia Pacific.',
    'Patent holder. MIT-credentialed. Economist-featured.',
    'Engineer → Architect → Analyst → Scientist → AI.',
    'Leading 30 data scientists across 12 markets.',
  ];

  function typePhrase(text, el, charDelay) {
    return new Promise(function (resolve) {
      var i = 0;
      (function tick() {
        if (i <= text.length) {
          el.textContent = text.slice(0, i);
          i++;
          setTimeout(tick, charDelay);
        } else {
          resolve();
        }
      })();
    });
  }

  function deletePhrase(el, charDelay) {
    return new Promise(function (resolve) {
      var text = el.textContent;
      var i = text.length;
      (function tick() {
        if (i >= 0) {
          el.textContent = text.slice(0, i);
          i--;
          setTimeout(tick, charDelay);
        } else {
          resolve();
        }
      })();
    });
  }

  async function runTypedLoop() {
    if (!taglineEl) return;
    // Add cursor
    var cursor = document.createElement('span');
    cursor.classList.add('typed-cursor');
    taglineEl.appendChild(cursor);
    var textSpan = document.createElement('span');
    taglineEl.insertBefore(textSpan, cursor);

    var idx = 0;
    while (true) {
      await typePhrase(phrases[idx], textSpan, 45);
      await new Promise(function (r) { setTimeout(r, 2800); });
      await deletePhrase(textSpan, 25);
      await new Promise(function (r) { setTimeout(r, 400); });
      idx = (idx + 1) % phrases.length;
    }
  }

  runTypedLoop();

  // === MOBILE NAV TOGGLE =======================================
  var navToggle = document.getElementById('nav-toggle');
  var navLinks = document.getElementById('nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
      });
    });
  }

  // === NAV HIDE ON SCROLL ======================================
  var nav = document.getElementById('nav');
  var lastScrollY = 0;
  var scrollThreshold = 80;

  window.addEventListener('scroll', function () {
    var currentY = window.scrollY;
    if (currentY > scrollThreshold && currentY > lastScrollY) {
      nav.classList.add('hidden');
    } else {
      nav.classList.remove('hidden');
    }
    lastScrollY = currentY;
  }, { passive: true });

  // === SCROLL REVEAL (Intersection Observer) ===================
  var revealTargets = document.querySelectorAll(
    '.section, .focus-grid, .impact-grid, .project-grid, .project-cinema'
  );

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in', 'visible');
        var children = entry.target.querySelectorAll(
          '.focus-card, .impact-item, .project-card'
        );
        children.forEach(function (child, i) {
          setTimeout(function () {
            child.classList.add('fade-in', 'visible');
          }, i * 100);
        });
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealTargets.forEach(function (el) {
    revealObserver.observe(el);
  });

  // === CURSOR GLOW =============================================
  var glowEl = document.getElementById('cursor-glow');
  var mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;
  var glowActive = false;

  if (glowEl && window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!glowActive) {
        glowActive = true;
        glowEl.style.opacity = '1';
        animateGlow();
      }
    });
  }

  function animateGlow() {
    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;
    glowEl.style.left = glowX + 'px';
    glowEl.style.top = glowY + 'px';
    requestAnimationFrame(animateGlow);
  }

  // === MOUSEMOVE TILT ON PROJECT CARDS =========================
  var tiltEls = document.querySelectorAll('[data-tilt]');

  tiltEls.forEach(function (el) {
    el.addEventListener('mousemove', function (e) {
      var rect = el.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width;
      var y = (e.clientY - rect.top) / rect.height;
      var rotateX = (0.5 - y) * 8;
      var rotateY = (x - 0.5) * 8;
      el.style.transform =
        'perspective(1200px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.01)';
    });

    el.addEventListener('mouseleave', function () {
      el.style.transform =
        'perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  });

  // === NUMBER COUNTER ANIMATION ================================
  var counterEls = document.querySelectorAll('[data-count]');

  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        var duration = 1500;
        var start = performance.now();

        function step(now) {
          var elapsed = now - start;
          var progress = Math.min(elapsed / duration, 1);
          var eased = 1 - (1 - progress) * (1 - progress);
          var current = Math.round(eased * target);
          el.textContent = current + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counterEls.forEach(function (el) {
    counterObserver.observe(el);
  });

})();
