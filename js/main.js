/* ============================================================
   e-Align — Main JavaScript
   ============================================================ */

// ── Navbar scroll behavior ──────────────────────────────────
const navbar = document.getElementById('navbar');
if (navbar) {
  const onScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── Hamburger menu ──────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    // Animate hamburger lines
    const spans = hamburger.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('open');
      const spans = hamburger.querySelectorAll('span');
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
}

// ── Carousel ───────────────────────────────────────────────
(function initCarousel() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  if (!slides.length) return;

  let current = 0;
  let autoTimer = null;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 6000);
  }

  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.index));
      startAuto();
    });
  });

  // Touch / swipe support
  let touchStartX = 0;
  const carouselEl = document.querySelector('.carousel');
  if (carouselEl) {
    carouselEl.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    carouselEl.addEventListener('touchend', e => {
      const delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 50) {
        goTo(delta < 0 ? current + 1 : current - 1);
        startAuto();
      }
    }, { passive: true });
  }

  startAuto();
})();

// ── Scroll-triggered fade-up animations ────────────────────
(function initFadeUp() {
  const targets = document.querySelectorAll(
    '.problem-card, .pillar, .step, .result-card, .team-card, .value-card, .client-logo, .story-grid > *, .contact-grid > *'
  );

  targets.forEach((el, i) => {
    el.classList.add('fade-up');
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
})();

// ── Smooth scroll for anchor links ─────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      // Close mobile menu if open
      navLinks?.classList.remove('open');
    }
  });
});

// ── Contact form ────────────────────────────────────────────
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnIcon = document.getElementById('btnIcon');

if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // UI: loading state
    submitBtn.classList.add('btn-loading');
    btnText.textContent = 'Sending...';
    if (btnIcon) btnIcon.className = 'fa-solid fa-spinner fa-spin';

    // Gather form data
    const data = new FormData(contactForm);
    const fields = Object.fromEntries(data.entries());

    // Build mailto link as fallback (opens email client)
    const to = 'sales@e-align.com';
    const subject = encodeURIComponent(`e-Align Inquiry from ${fields.firstName} ${fields.lastName} – ${fields.company}`);
    const body = encodeURIComponent(
      `Name: ${fields.firstName} ${fields.lastName}\n` +
      `Email: ${fields.email}\n` +
      `Company: ${fields.company}\n` +
      `Role: ${fields.role || 'N/A'}\n` +
      `Org Size: ${fields.orgSize || 'N/A'}\n\n` +
      `Challenge:\n${fields.challenge}\n\n` +
      `Newsletter opt-in: ${fields.newsletter === 'on' ? 'Yes' : 'No'}`
    );

    // Simulate a short send delay for UX, then open email client
    await new Promise(r => setTimeout(r, 1200));

    // Open the user's mail client with pre-filled message
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;

    // Show success message
    contactForm.style.display = 'none';
    if (formSuccess) {
      formSuccess.style.display = 'block';
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

// ── Active nav link detection on scroll ────────────────────
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href*="#"]');
  if (!sections.length || !navAnchors.length) return;

  const onScroll = () => {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.id;
    });
    navAnchors.forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href').includes(`#${current}`)) {
        a.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
})();

// ── Number counter animation for stats ─────────────────────
(function initCounters() {
  const stats = document.querySelectorAll('.stat-num');
  if (!stats.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const raw = el.textContent.trim();
      const match = raw.match(/^([0-9.]+)/);
      if (!match) return;
      const target = parseFloat(match[1]);
      const suffix = raw.replace(match[1], '');
      let start = 0;
      const duration = 1800;
      const step = target / (duration / 16);
      const timer = setInterval(() => {
        start = Math.min(start + step, target);
        const display = Number.isInteger(target) ? Math.round(start) : start.toFixed(1);
        el.textContent = display + suffix;
        if (start >= target) clearInterval(timer);
      }, 16);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  stats.forEach(s => observer.observe(s));
})();
