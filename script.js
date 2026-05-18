(function () {
  'use strict';

  // ---------- mobile menu ----------
  var header = document.querySelector('.site_header');
  var burger = document.querySelector('[data-burger]');

  if (header && burger) {
    burger.addEventListener('click', function () {
      var open = header.classList.toggle('menu_open');
      burger.classList.toggle('is_open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    document.querySelectorAll('.main_nav_link').forEach(function (link) {
      link.addEventListener('click', function () {
        header.classList.remove('menu_open');
        burger.classList.remove('is_open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ---------- prefill booking dates with sensible defaults ----------
  var today = new Date();
  var tomorrow = new Date(today.getTime() + 86400000);
  var dayAfter = new Date(today.getTime() + 86400000 * 3);

  function fmt(d) {
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  var inputs = document.querySelectorAll('.booking_input[type="date"]');
  if (inputs.length === 2) {
    inputs[0].value = fmt(tomorrow);
    inputs[1].value = fmt(dayAfter);
    inputs[0].min = fmt(today);
    inputs[1].min = fmt(tomorrow);
  }

  // ---------- hero CTA → wobble the booking form ----------
  var reserveBtn = document.querySelector('.hero_section .btn_primary');
  var bookingCard = document.querySelector('.booking_card');
  if (reserveBtn && bookingCard) {
    reserveBtn.addEventListener('click', function (e) {
      e.preventDefault();
      bookingCard.classList.remove('is_shaking');
      // force reflow so the animation restarts on subsequent clicks
      void bookingCard.offsetWidth;
      bookingCard.classList.add('is_shaking');
    });
    bookingCard.addEventListener('animationend', function (e) {
      if (e.animationName === 'wobble') bookingCard.classList.remove('is_shaking');
    });
  }

  // ---------- reveal sections on scroll (subtle, with safe fallback) ----------
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js_reveal');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          var el = entry.target;
          setTimeout(function () {
            el.classList.add('is_revealed');
          }, i * 60);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll(
      '.section_marker, .lead_heading, .features_heading, .rooms_heading, .contact_heading, .feature_card, .room_card, .collage_item, .booking_card'
    ).forEach(function (el) { io.observe(el); });

    // Failsafe: after 4s reveal anything still hidden
    setTimeout(function () {
      document.querySelectorAll('.js_reveal .section_marker:not(.is_revealed), .js_reveal .feature_card:not(.is_revealed), .js_reveal .room_card:not(.is_revealed), .js_reveal .collage_item:not(.is_revealed), .js_reveal .booking_card:not(.is_revealed)').forEach(function (el) {
        el.classList.add('is_revealed');
      });
    }, 4000);
  }

  // ---------- strip infinite scroll ----------
  var stripTrack = document.querySelector('.strip_track');
  if (stripTrack) {
    var offset = 0;
    var paused = false;
    var dragging = false;
    var dragStartX = 0;
    var wheelTimer = null;
    var speed = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.6;

    function halfWidth() { return stripTrack.scrollWidth / 2; }

    function tick() {
      if (!paused && !dragging) {
        offset += speed;
        var h = halfWidth();
        if (offset >= h) offset -= h;
        stripTrack.style.transform = 'translateX(' + (-offset) + 'px)';
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // Click — toggle pause
    stripTrack.closest('.strip_section').addEventListener('click', function () {
      paused = !paused;
    });

    // Wheel on PC — pause, auto-resume after 1s
    stripTrack.closest('.strip_section').addEventListener('wheel', function () {
      paused = true;
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(function () { paused = false; }, 1000);
    }, { passive: true });

    // Mouse drag
    stripTrack.addEventListener('mousedown', function (e) {
      dragging = true;
      dragStartX = e.clientX;
      stripTrack.classList.add('is_grabbing');
    });
    document.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      var delta = dragStartX - e.clientX;
      dragStartX = e.clientX;
      offset += delta;
      var h = halfWidth();
      if (offset < 0) offset += h;
      if (offset >= h) offset -= h;
      stripTrack.style.transform = 'translateX(' + (-offset) + 'px)';
    });
    document.addEventListener('mouseup', function () {
      dragging = false;
      stripTrack.classList.remove('is_grabbing');
    });

    // Touch swipe
    stripTrack.addEventListener('touchstart', function (e) {
      dragStartX = e.touches[0].clientX;
    }, { passive: true });
    stripTrack.addEventListener('touchmove', function (e) {
      var delta = dragStartX - e.touches[0].clientX;
      dragStartX = e.touches[0].clientX;
      offset += delta;
      var h = halfWidth();
      if (offset < 0) offset += h;
      if (offset >= h) offset -= h;
      stripTrack.style.transform = 'translateX(' + (-offset) + 'px)';
    }, { passive: true });
  }

  // ---------- form validation feedback (visual only) ----------
  document.querySelectorAll('form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var submit = form.querySelector('input[type="submit"]');
      if (!submit) return;
      var original = submit.value;
      submit.value = '✓  Got it ';
      submit.disabled = true;
      submit.style.background = 'var(--accent_dark)';
      setTimeout(function () {
        submit.value = original;
        submit.disabled = false;
        submit.style.background = '';
      }, 2800);
    });
  });
})();
