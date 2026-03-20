/* ============================================================
   Book Page Flip — script.js
   Two modes:
     • Desktop (> 768px): classic paired spread flip
     • Mobile  (≤ 768px): single-page navigation with fade
   ============================================================ */

var MOBILE_BREAKPOINT = 768;

var pages      = document.getElementsByClassName('page');
var prevBtn    = document.getElementById('mobilePrev');
var nextBtn    = document.getElementById('mobileNext');
var dotsWrap   = document.getElementById('mobileDots');

/* Current index for mobile mode (0-based, all pages) */
var mobileIndex = 0;

/* ──────────────────────────────────────────────────────────
   Helpers
────────────────────────────────────────────────────────── */
function isMobile() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

/* ──────────────────────────────────────────────────────────
   DESKTOP MODE — spread flip
────────────────────────────────────────────────────────── */
function initDesktop() {
  /* Set z-index so odd pages stack front-to-back */
  for (var i = 0; i < pages.length; i++) {
    if (i % 2 === 0) {
      pages[i].style.zIndex = pages.length - i;
    }
  }

  /* Assign 1-based page numbers and click handlers */
  for (var i = 0; i < pages.length; i++) {
    pages[i].pageNum = i + 1;

    pages[i].onclick = function () {
      /* Skip clicks while in mobile mode */
      if (isMobile()) return;

      if (this.pageNum % 2 === 0) {
        /* Even page clicked → flip back */
        this.classList.remove('flipped');
        if (this.previousElementSibling) {
          this.previousElementSibling.classList.remove('flipped');
        }
      } else {
        /* Odd page clicked → flip forward */
        this.classList.add('flipped');
        if (this.nextElementSibling) {
          this.nextElementSibling.classList.add('flipped');
        }
      }
    };
  }
}

/* ──────────────────────────────────────────────────────────
   MOBILE MODE — single-page with fade
────────────────────────────────────────────────────────── */
function buildDots() {
  dotsWrap.innerHTML = '';
  for (var i = 0; i < pages.length; i++) {
    var dot = document.createElement('span');
    dot.className = 'mobile-nav__dot' + (i === 0 ? ' active' : '');
    dot.dataset.index = i;
    /* Tap a dot to jump directly to that page */
    dot.addEventListener('click', function () {
      goToPage(parseInt(this.dataset.index));
    });
    dotsWrap.appendChild(dot);
  }
}

function updateDots() {
  var dots = dotsWrap.querySelectorAll('.mobile-nav__dot');
  dots.forEach(function (dot, i) {
    dot.classList.toggle('active', i === mobileIndex);
  });
}

function updateButtons() {
  prevBtn.disabled = mobileIndex <= 0;
  nextBtn.disabled = mobileIndex >= pages.length - 1;
}

function goToPage(index) {
  if (index < 0 || index >= pages.length) return;

  /* Hide current */
  pages[mobileIndex].classList.remove('mobile-active');
  mobileIndex = index;
  /* Show next */
  pages[mobileIndex].classList.add('mobile-active');

  updateDots();
  updateButtons();
}

function initMobile() {
  /* Remove any desktop flipped states */
  for (var i = 0; i < pages.length; i++) {
    pages[i].classList.remove('flipped');
    pages[i].classList.remove('mobile-active');
    /* Let CSS handle z-index in mobile mode */
    pages[i].style.zIndex = '';
  }

  buildDots();
  mobileIndex = 0;
  pages[0].classList.add('mobile-active');
  updateDots();
  updateButtons();
}

/* ──────────────────────────────────────────────────────────
   NAV BUTTON EVENTS
────────────────────────────────────────────────────────── */
prevBtn.addEventListener('click', function () {
  goToPage(mobileIndex - 1);
});

nextBtn.addEventListener('click', function () {
  goToPage(mobileIndex + 1);
});

/* ──────────────────────────────────────────────────────────
   SWIPE SUPPORT (mobile touch)
────────────────────────────────────────────────────────── */
var touchStartX = 0;
var touchStartY = 0;
var SWIPE_THRESHOLD = 50; /* px */

document.getElementById('pages').addEventListener('touchstart', function (e) {
  touchStartX = e.changedTouches[0].clientX;
  touchStartY = e.changedTouches[0].clientY;
}, { passive: true });

document.getElementById('pages').addEventListener('touchend', function (e) {
  if (!isMobile()) return;

  var dx = e.changedTouches[0].clientX - touchStartX;
  var dy = e.changedTouches[0].clientY - touchStartY;

  /* Only treat as horizontal swipe if horizontal movement dominates */
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
    if (dx < 0) {
      goToPage(mobileIndex + 1); /* swipe left → next */
    } else {
      goToPage(mobileIndex - 1); /* swipe right → prev */
    }
  }
}, { passive: true });

/* ──────────────────────────────────────────────────────────
   RESIZE — switch modes when crossing the breakpoint
────────────────────────────────────────────────────────── */
var wasLastMobile = isMobile();

window.addEventListener('resize', function () {
  var nowMobile = isMobile();
  if (nowMobile === wasLastMobile) return; /* same mode, do nothing */
  wasLastMobile = nowMobile;

  if (nowMobile) {
    initMobile();
  } else {
    /* Returning to desktop: clean up mobile state */
    for (var i = 0; i < pages.length; i++) {
      pages[i].classList.remove('mobile-active');
      /* Restore z-index for spread mode */
      if (i % 2 === 0) {
        pages[i].style.zIndex = pages.length - i;
      }
    }
  }
});

/* ──────────────────────────────────────────────────────────
   INIT
────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  initDesktop(); /* always set up desktop handlers */

  if (isMobile()) {
    initMobile();
  }
});