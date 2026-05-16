'use strict';

/* ==========================================
   OASIS CLEANING — script.js
   ========================================== */

// ---- Scroll Progress Bar ----
const progressBar = document.getElementById('scrollProgress');
function updateProgress() {
  const scrolled = window.scrollY;
  const total    = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
}

// ---- Sticky Header + Back to Top ----
const header  = document.getElementById('header');
const backTop = document.getElementById('backTop');

function onScroll() {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 20);
  backTop.classList.toggle('visible', y > 400);
  updateActiveNav();
  updateProgress();
  parallaxHero();
}
window.addEventListener('scroll', onScroll, { passive: true });

// ---- Mobile Nav ----
const hamburger = document.getElementById('hamburger');
const navList   = document.getElementById('navList');

hamburger.addEventListener('click', () => {
  const open = navList.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
});

navList.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    navList.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

document.addEventListener('click', e => {
  if (navList.classList.contains('open') && !navList.contains(e.target) && !hamburger.contains(e.target)) {
    navList.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});

// ---- Active Nav on Scroll ----
const sections = document.querySelectorAll('section[id]');
function updateActiveNav() {
  const scrollY = window.scrollY + 100;
  sections.forEach(sec => {
    const link = document.querySelector(`.nav__link[href="#${sec.id}"]`);
    if (link) link.classList.toggle('active', scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight);
  });
}

// ---- Hero Parallax ----
const heroImage = document.getElementById('heroImage');
function parallaxHero() {
  if (!heroImage || window.innerWidth < 960) return;
  heroImage.style.transform = `translateY(${window.scrollY * 0.12}px)`;
}

// ---- Scroll Reveal ----
const revealObs = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  }),
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));

// ---- Counter Animation ----
let countersStarted = false;
const counterObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !countersStarted) {
    countersStarted = true;
    document.querySelectorAll('.counter').forEach(animateCounter);
  }
}, { threshold: 0.4 });

const statsSection = document.querySelector('.stats');
if (statsSection) counterObs.observe(statsSection);

function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 2200;
  const start    = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.round(easeOutQuart(progress) * target);
    el.textContent = value >= 1000 ? (value / 1000).toFixed(0) + 'K' : value;
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target >= 1000 ? (target / 1000).toFixed(0) + 'K' : target;
  }
  requestAnimationFrame(tick);
}

// ---- Pricing Toggle ----
const pricingToggle = document.getElementById('pricingToggle');
const labelMonthly  = document.getElementById('labelMonthly');
const labelYearly   = document.getElementById('labelYearly');

if (pricingToggle) {
  pricingToggle.addEventListener('change', () => {
    const yearly = pricingToggle.checked;
    labelMonthly.classList.toggle('active', !yearly);
    labelYearly.classList.toggle('active', yearly);
    document.querySelectorAll('.price-num').forEach(el => {
      const from = parseInt(el.textContent, 10);
      const to   = parseInt(yearly ? el.dataset.yearly : el.dataset.monthly, 10);
      animatePriceFlip(el, from, to);
    });
  });
}

function animatePriceFlip(el, from, to) {
  const start    = performance.now();
  const duration = 320;
  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(from + (to - from) * easeOutQuart(t));
    el.style.transform = t < 0.5 ? `scale(${1 + 0.12 * Math.sin(t * Math.PI)})` : `scale(${1 + 0.12 * Math.sin(t * Math.PI)})`;
    if (t < 1) requestAnimationFrame(tick);
    else { el.textContent = to; el.style.transform = ''; }
  }
  requestAnimationFrame(tick);
}

// ---- Testimonials Slider ----
const track    = document.getElementById('testimonialsTrack');
const dotsWrap = document.getElementById('tDots');
const prevBtn  = document.getElementById('tPrev');
const nextBtn  = document.getElementById('tNext');

if (track) {
  const cards = Array.from(track.children);
  const total = cards.length;
  let current = 0;
  let autoTimer;

  function visibleCount() {
    if (window.innerWidth < 768)  return 1;
    if (window.innerWidth < 1100) return 2;
    return 3;
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    const pages = Math.ceil(total / visibleCount());
    for (let i = 0; i < pages; i++) {
      const btn = document.createElement('button');
      btn.className = 't-dot' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-label', `Go to page ${i + 1}`);
      btn.addEventListener('click', () => goTo(i * visibleCount()));
      dotsWrap.appendChild(btn);
    }
  }

  function updateDots() {
    const page = Math.floor(current / visibleCount());
    dotsWrap.querySelectorAll('.t-dot').forEach((d, i) => d.classList.toggle('active', i === page));
  }

  function goTo(index) {
    const vc      = visibleCount();
    const maxPage = Math.ceil(total / vc) - 1;
    const page    = Math.min(Math.max(Math.floor(index / vc), 0), maxPage);
    current = page * vc;
    const cardW = cards[0].offsetWidth + 24;
    track.style.transform = `translateX(-${current * cardW}px)`;
    updateDots();
  }

  function next() {
    const vc = visibleCount();
    const page = Math.floor(current / vc);
    goTo((page >= Math.ceil(total / vc) - 1 ? 0 : page + 1) * vc);
  }
  function prev() {
    const vc = visibleCount();
    const page = Math.floor(current / vc);
    goTo((page <= 0 ? Math.ceil(total / vc) - 1 : page - 1) * vc);
  }

  nextBtn.addEventListener('click', () => { clearInterval(autoTimer); next(); startAuto(); });
  prevBtn.addEventListener('click', () => { clearInterval(autoTimer); prev(); startAuto(); });

  function startAuto() { autoTimer = setInterval(next, 5000); }

  let touchX = 0;
  track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { clearInterval(autoTimer); diff > 0 ? next() : prev(); startAuto(); }
  });

  buildDots();
  startAuto();
  window.addEventListener('resize', () => { buildDots(); goTo(0); });
}

// ---- FAQ Accordion ----
document.querySelectorAll('.faq-item__q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item   = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(el => {
      el.classList.remove('open');
      el.querySelector('.faq-item__q').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// ---- 3D Card Tilt ----
function initTilt(cards) {
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width  / 2;
      const cy = rect.height / 2;
      const rotX = ((y - cy) / cy) * -7;
      const rotY = ((x - cx) / cx) *  7;
      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
initTilt(document.querySelectorAll('[data-tilt]'));

// ---- Button Ripple Effect ----
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const rect   = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top  = (e.clientY - rect.top)  + 'px';
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});

// ---- Magnetic Button Effect ----
document.querySelectorAll('[data-magnetic]').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width  / 2;
    const y = e.clientY - rect.top  - rect.height / 2;
    btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
  btn.addEventListener('mouseenter', () => {
    btn.style.transition = 'transform .15s ease-out, box-shadow .3s ease, background .3s ease';
  });
});

// ---- Booking Form ----
const form          = document.getElementById('bookingForm');
const modal         = document.getElementById('successModal');
const modalClose    = document.getElementById('modalClose');
const modalBackdrop = document.getElementById('modalBackdrop');

const dateInput = document.getElementById('date');
if (dateInput) {
  dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
}

function validateField(input) {
  const group = input.closest('.form-group');
  const err   = group.querySelector('.form-error');
  let msg = '';
  if (input.required && !input.value.trim()) {
    msg = 'This field is required.';
  } else if (input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
    msg = 'Please enter a valid email address.';
  } else if (input.type === 'tel' && input.value && !/^[\d\s\-\+\(\)]{7,}$/.test(input.value)) {
    msg = 'Please enter a valid phone number.';
  } else if (input.id === 'date' && input.value) {
    const chosen = new Date(input.value);
    const today  = new Date(); today.setHours(0,0,0,0);
    if (chosen < today) msg = 'Please choose a future date.';
  }
  input.classList.toggle('invalid', !!msg);
  if (err) err.textContent = msg;
  return !msg;
}

form && form.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => { if (field.classList.contains('invalid')) validateField(field); });
});

form && form.addEventListener('submit', e => {
  e.preventDefault();
  let valid = true;
  form.querySelectorAll('input[required], select[required]').forEach(f => { if (!validateField(f)) valid = false; });
  if (!valid) return;

  const btn = form.querySelector('[type="submit"]');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

  const templateParams = {
    firstName : form.firstName.value.trim(),
    lastName  : form.lastName.value.trim(),
    email     : form.email.value.trim(),
    phone     : form.phone.value.trim(),
    service   : form.service.value,
    date      : form.date.value,
    message   : form.message.value.trim() || 'None',
  };

  emailjs.send('service_l0j3r1b', 'template_ndkr66r', templateParams)
    .then(() => {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Request My Free Quote';
      form.reset();
      showModal();
    })
    .catch(() => {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Request My Free Quote';
      alert('Something went wrong. Please try again or call us directly.');
    });
});

function showModal() {
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
}
modalClose    && modalClose.addEventListener('click', closeModal);
modalBackdrop && modalBackdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

// ---- Back to Top ----
backTop && backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ---- Smooth Internal Links ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = id ? document.getElementById(id) : null;
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});
