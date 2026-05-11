'use strict';

/* ==========================================
   CLEANPRO — script.js
   ========================================== */

// ---- Sticky Header ----
const header = document.getElementById('header');
const onScroll = () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
  backTop.classList.toggle('visible', window.scrollY > 400);
  updateActiveNav();
};
window.addEventListener('scroll', onScroll, { passive: true });

// ---- Mobile Nav ----
const hamburger = document.getElementById('hamburger');
const navList   = document.getElementById('navList');

hamburger.addEventListener('click', () => {
  const open = navList.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
});

// Close mobile menu on link click
navList.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    navList.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// ---- Active Nav Link on Scroll ----
const sections = document.querySelectorAll('section[id]');
function updateActiveNav() {
  const scrollY = window.scrollY + 100;
  sections.forEach(sec => {
    const top    = sec.offsetTop;
    const height = sec.offsetHeight;
    const id     = sec.getAttribute('id');
    const link   = document.querySelector(`.nav__link[href="#${id}"]`);
    if (link) {
      link.classList.toggle('active', scrollY >= top && scrollY < top + height);
    }
  });
}

// ---- Scroll Reveal ----
const revealObserver = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); } }),
  { threshold: 0.12 }
);
document.querySelectorAll('.service-card, .about__feature, .process__step, .pricing-card, .testimonial-card, .faq-item, .contact__info-item, .section__header').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// ---- Counter Animation ----
let countersStarted = false;
const counterObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !countersStarted) {
    countersStarted = true;
    document.querySelectorAll('.counter').forEach(animateCounter);
  }
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats');
if (statsSection) counterObserver.observe(statsSection);

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const step = Math.ceil(target / (duration / 16));
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current >= 1000 ? (current / 1000).toFixed(0) + 'K' : current;
    if (current >= target) {
      el.textContent = target >= 1000 ? (target / 1000).toFixed(0) + 'K' : target;
      clearInterval(timer);
    }
  }, 16);
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
      const newVal = yearly ? el.dataset.yearly : el.dataset.monthly;
      el.textContent = newVal;
      el.style.transform = 'scale(1.12)';
      setTimeout(() => { el.style.transform = ''; }, 180);
    });
  });
}

// ---- Testimonials Slider ----
const track    = document.getElementById('testimonialsTrack');
const dotsWrap = document.getElementById('tDots');
const prevBtn  = document.getElementById('tPrev');
const nextBtn  = document.getElementById('tNext');

if (track) {
  const cards      = Array.from(track.children);
  const total      = cards.length;
  let current      = 0;
  let autoTimer;

  // How many cards visible based on viewport
  function visibleCount() {
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1100) return 2;
    return 3;
  }

  // Build dots
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
    const vc  = visibleCount();
    const maxPage = Math.ceil(total / vc) - 1;
    const page = Math.min(Math.max(Math.floor(index / vc), 0), maxPage);
    current = page * vc;
    const cardW = cards[0].offsetWidth + 24; // gap = 24
    track.style.transform = `translateX(-${current * cardW}px)`;
    updateDots();
  }

  function next() { const vc = visibleCount(); const maxPage = Math.ceil(total / vc) - 1; const page = Math.floor(current / vc); goTo((page >= maxPage ? 0 : page + 1) * vc); }
  function prev() { const vc = visibleCount(); const page = Math.floor(current / vc); goTo((page <= 0 ? Math.ceil(total / vc) - 1 : page - 1) * vc); }

  nextBtn.addEventListener('click', () => { clearInterval(autoTimer); next(); startAuto(); });
  prevBtn.addEventListener('click', () => { clearInterval(autoTimer); prev(); startAuto(); });

  function startAuto() { autoTimer = setInterval(next, 5000); }

  // Touch swipe
  let touchX = 0;
  track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
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

    // Close all
    document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
    document.querySelectorAll('.faq-item__q').forEach(b => b.setAttribute('aria-expanded', 'false'));

    // Open clicked if it was closed
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// ---- Booking Form Validation ----
const form = document.getElementById('bookingForm');
const modal        = document.getElementById('successModal');
const modalClose   = document.getElementById('modalClose');
const modalBackdrop = document.getElementById('modalBackdrop');

// Set minimum date to today
const dateInput = document.getElementById('date');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
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

// Live validation
form && form.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => { if (field.classList.contains('invalid')) validateField(field); });
});

form && form.addEventListener('submit', e => {
  e.preventDefault();
  const fields = form.querySelectorAll('input[required], select[required]');
  let valid = true;
  fields.forEach(f => { if (!validateField(f)) valid = false; });
  if (!valid) return;

  // Simulate submission
  const btn = form.querySelector('[type="submit"]');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Request My Free Quote';
    form.reset();
    showModal();
  }, 1400);
});

function showModal() {
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(() => modal.querySelector('.modal__box').focus?.(), 100);
}
function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
}
modalClose    && modalClose.addEventListener('click', closeModal);
modalBackdrop && modalBackdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

// ---- Back to Top ----
const backTop = document.getElementById('backTop');
backTop && backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ---- Smooth internal links ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id  = a.getAttribute('href').slice(1);
    const el  = id ? document.getElementById(id) : null;
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
