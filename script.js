/* ============================================================
   UTILITY HELPERS
   (defined first so fillData & book-flip can both reference them)
   ============================================================ */

function capitalizeWords(str = "") {
  return str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, "");
}

function calculateAge(dobStr) {
  if (!dobStr) return "-";
  const [day, month, year] = dobStr.split("/");
  const dob   = new Date(`${year}-${month}-${day}`);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

function maskAfterFullStops(html, stopLimit = 3) {
  if (!html) return { visible: "", masked: "" };
  const text = stripHtml(html);
  let count = 0;
  let splitIndex = -1;

  for (let i = 0; i < text.length; i++) {
    if (/[.!?]/.test(text[i])) {
      count++;
      if (count === stopLimit) { splitIndex = i + 1; break; }
    }
  }

  if (splitIndex === -1) return { visible: text, masked: "" };
  return {
    visible: text.slice(0, splitIndex),
    masked:  text.slice(splitIndex).replace(/[a-zA-Z]/g, "x"),
  };
}

function maskContent(html, visibleChars = 100) {
  if (!html) return { visible: "", masked: "" };
  const text = stripHtml(html);
  return {
    visible: text.slice(0, visibleChars),
    masked:  text.slice(visibleChars).replace(/[a-zA-Z]/g, "x"),
  };
}

/* ============================================================
   DOM HELPERS — write once, re-use everywhere
   ============================================================ */

/**
 * Inject masked (blurred-tail) content into a single element.
 * Replaces repeated maskAfterFullStops + innerHTML blocks.
 */
function setMasked(selector, text, limit) {
  const el = document.querySelector(selector);
  if (!el) return;
  const { visible, masked } = maskAfterFullStops(text, limit);
  el.innerHTML = `${visible}<span class="blurred">${masked}</span>`;
}

/**
 * Set text (or innerHTML) on ALL matching elements.
 * Replaces repeated querySelectorAll + forEach blocks.
 */
function setAll(selector, content, useHTML = false) {
  document.querySelectorAll(selector).forEach(el => {
    if (useHTML) el.innerHTML = content;
    else         el.textContent = content;
  });
}

/* =================== API FETCH ==================== */
async function getData() {
  try {
    const res = await fetch("https://reports.astroprenuers.com/cosmic_code/json/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:             "Vishvnayan",
        gender:           "Male",
        dob:              "21/06/2001",
        tob:              "03:30",
        city:             "Meerut",
        state:            "Uttar Pradesh",
        country:          "India",
        pincode:          "203001",
        lang:             "eng",
        is_json_response: true,
      }),
    });

    const data = await res.json();
    console.log("data->", data);
    fillData(data);
  } catch (err) {
    console.error("API Error:", err);
  }
}

/* ====================== DATA → DOM ============================== */
function fillData(data) {
  const firstName = data.NAME.trim().split(" ")[0];

  /* ── Simple text / HTML fields ─────────────────────────── */
  setAll("#name",      capitalizeWords(data.NAME));
  setAll("#dob",       data.DOB);
  setAll("#tob",       data.TIME_OF_BIRTH + " Hour");
  setAll("#city",      data.CITY);
  setAll("#state",     data.STATE);
  setAll("#country",   data.COUNTRY);
  setAll("#sun-sign",   data.SUN_SIGN_WESTERN);
  setAll("#moon-sign",   data.MOON_RASHI_NAME);

  const sunSignImg = document.getElementById("sun-sign-img");
  if (sunSignImg && data.SUN_SIGN_WESTERN) {
    sunSignImg.src = `./img/rashi/${data.SUN_SIGN_WESTERN.toLowerCase().trim()}.png`;
  }

  const moonSignImg = document.getElementById("moon-sign-img");
  if (moonSignImg && data.MOON_RASHI_NAME) {
    moonSignImg.src = `./img/rashi/${data.MOON_RASHI_NAME.toLowerCase().trim()}.png`;
  }
  
  setAll("#nakshatra", data.NAKSHATRA_CHARAN);
  setAll("#ayanamsa",  data.TITHI_AT_SUNRISE);
  setAll("#gender",    data.GENDER);
  setAll("#day",       data.DAY);
  setAll("#age",       calculateAge(data.DOB));
  setAll("#yog-count",  data.YOG_COUNT,  true);
  setAll("#dosh-count", data.DOSH_COUNT, true);

  /* ─────── Masked text blocks ──────── */
  setMasked("#vaar-desc",     data.VAAR_DESCRIPTION,          6);
  setMasked("#tithi-desc",    data.TITHI_DESCRIPTION,         3);
  setMasked("#karana-desc",   data.KARANA_DESCRIPTION,        3);
  setMasked("#lagna-desc",    data.ASCENDENT_DESCRIPTION,     3);
  setMasked("#pada-desc",     data.NAKSHATRA_DESCRIPTION,     2);
  setMasked("#nakshatra-desc",data.NAKSHATRA_PANCHANG_DESCRIPTION, 3);
  setMasked("#yoga-desc",     data.YOGA_DESCRIPTION,          3);
  setMasked("#gemstone-intro",data.GEMS_INTRO,                3);

  // Rashi desc needs the first name prepended
  const rashiEl = document.querySelector("#rashi-desc");
  if (rashiEl) {
    const { visible, masked } = maskAfterFullStops(data.MOON_SIGN_DESCRIPTION, 3);
    rashiEl.innerHTML = `${firstName}, ${visible}<span class="blurred">${masked}</span>`;
  }

  /* ── Planet placements & aspects (loop replaces 20+ repeated blocks) ── */
  const PLANET_CONFIG = [
    { name: "Sun",     placementLimit: 3, hasAspect: true  },
    { name: "Moon",    placementLimit: 3, hasAspect: true  },
    { name: "Mercury", placementLimit: 3, hasAspect: true  },
    { name: "Saturn",  placementLimit: 1, hasAspect: true  },
    { name: "Rahu",    placementLimit: 1, hasAspect: true  },
    { name: "Ketu",    placementLimit: 1, hasAspect: true  },
    { name: "Venus",   placementLimit: 3, hasAspect: true  },
    { name: "Jupiter", placementLimit: 3, hasAspect: true  },
    { name: "Mars",    placementLimit: 3, hasAspect: true  },
  ];

  PLANET_CONFIG.forEach(({ name, placementLimit, hasAspect }) => {
    const content = data.PLANET_CONTENT?.[name];
    if (!content) return;

    const id = name.toLowerCase();
    setMasked(`#${id}-desc`, content.placement, placementLimit);

    if (hasAspect && content.aspect?.first) {
      setMasked(`#${id}-aspect`, content.aspect.first, 1);
    }
  });

  /* ──────── Mahadasha ────────── */
  setMasked("#mahadasha-intro1", data.FIRST_MAHADASHA_CONTENT, 3);

  const md = data.MAHADASHA_ANTARDASHA_DATA[0];
  const mdTitleEl = document.querySelector("#mahadasha-title1");
  if (mdTitleEl) mdTitleEl.innerHTML = md.planet_name + " Mahadasha";

  // Antardasha entries — loop replaces 9 near-identical blocks
  md.antardasha.slice(0, 9).forEach((ad, i) => {
    const n = i + 1;
    const titleEl = document.querySelector(`#antardasha-title${n}`);
    if (titleEl) titleEl.innerHTML = ad.planet_name + " Antardasha";
    setMasked(`#antardasha-intro${n}`, ad.content, 3);
  });

  /* ────── Mahadasha header table ────── */
  const tbody = document.querySelector(".mahadasha_table tbody");
  if (tbody) {
    // Use DocumentFragment to batch DOM writes into one reflow
    const fragment = document.createDocumentFragment();
    data.MAHADASHA_HEADER.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${item.name}</td><td>${item.start}</td><td>${item.end}</td>`;
      fragment.appendChild(tr);
    });
    tbody.appendChild(fragment);
  }

  renderChart(data);
}

function renderChart(data) {
  const chart = data.SODASHVARGA?.[0]?.chart || [];

  document.querySelectorAll(".house").forEach(houseEl => {
    const item = chart[houseEl.dataset.index];
    if (!item) return;

    const planetEl = houseEl.querySelector(".planet-in-chart");
    if (planetEl) planetEl.innerHTML = item.planets || "";

    const signEl = houseEl.querySelector(".numb");
    if (signEl) signEl.textContent = item.sign ?? "-";
  });
}

/* ============================================================
   SCROLL ANIMATION — fires ONCE, only when user reaches the page
   Removed IntersectionObserver (fires on load before user arrives).
   Hooked into page-flip & mobile goToPage instead.
   ============================================================ */
var scrollAnimDone = false;

function maybePlayScrollAnim(pageEl) {
  if (scrollAnimDone || !pageEl) return;
  var scrollPage = pageEl.querySelector(".scroll-page");
  if (!scrollPage) return;
  // Short delay lets the page-flip CSS transition finish first
  setTimeout(function () { scrollPage.classList.add("animate"); }, 700);
  scrollAnimDone = true;
}

/* ============================================================
   BOOK PAGE FLIP
   Two modes:
     • Desktop (> 768px): classic paired spread flip
     • Mobile  (≤ 768px): single-page navigation with fade
   ============================================================ */
var MOBILE_BREAKPOINT = 768;

// Cache repeated DOM lookups
var pages       = document.getElementsByClassName("page");
var prevBtn     = document.getElementById("mobilePrev");
var nextBtn     = document.getElementById("mobileNext");
var dotsWrap    = document.getElementById("mobileDots");
var pagesEl     = document.getElementById("pages");

var mobileIndex = 0;

/* ── Helper ── */
function isMobile() { return window.innerWidth <= MOBILE_BREAKPOINT; }

/* ── DESKTOP MODE — spread flip ── */
function initDesktop() {
  var i;
  // Set z-index so odd pages stack front-to-back
  for (i = 0; i < pages.length; i++) {
    if (i % 2 === 0) pages[i].style.zIndex = pages.length - i;
  }

  // Assign 1-based page numbers and click handlers
  for (i = 0; i < pages.length; i++) {
    pages[i].pageNum = i + 1;

    // IIFE captures the correct page reference in the closure
    pages[i].onclick = (function (page) {
      return function () {
        if (isMobile()) return;

        if (page.pageNum % 2 === 0) {
          // Even page clicked → flip back
          page.classList.remove("flipped");
          var prevPage = page.previousElementSibling;
          if (prevPage) {
            prevPage.classList.remove("flipped");
            // prevPage (odd) is now newly visible — check for scroll anim
            maybePlayScrollAnim(prevPage);
          }
        } else {
          // Odd page clicked → flip forward
          page.classList.add("flipped");
          var nextPage = page.nextElementSibling;
          if (nextPage) {
            nextPage.classList.add("flipped");
            // The odd page two slots ahead is now the visible right page
            var newOdd = nextPage.nextElementSibling;
            if (newOdd) maybePlayScrollAnim(newOdd);
          }
        }
      };
    })(pages[i]);
  }
}

/* ── MOBILE MODE — single-page with fade ── */
function buildDots() {
  var fragment = document.createDocumentFragment();
  for (var i = 0; i < pages.length; i++) {
    var dot = document.createElement("span");
    dot.className = "mobile-nav__dot" + (i === 0 ? " active" : "");
    dot.dataset.index = i;
    dot.addEventListener("click", (function (idx) {
      return function () { goToPage(idx); };
    })(i));
    fragment.appendChild(dot);
  }
  dotsWrap.innerHTML = "";
  dotsWrap.appendChild(fragment);
}

function updateDots() {
  dotsWrap.querySelectorAll(".mobile-nav__dot").forEach(function (dot, i) {
    dot.classList.toggle("active", i === mobileIndex);
  });
}

function updateButtons() {
  prevBtn.disabled = mobileIndex <= 0;
  nextBtn.disabled = mobileIndex >= pages.length - 1;
}

function goToPage(index) {
  if (index < 0 || index >= pages.length) return;
  pages[mobileIndex].classList.remove("mobile-active");
  mobileIndex = index;
  pages[mobileIndex].classList.add("mobile-active");
  maybePlayScrollAnim(pages[mobileIndex]);
  updateDots();
  updateButtons();
}

function initMobile() {
  for (var i = 0; i < pages.length; i++) {
    pages[i].classList.remove("flipped", "mobile-active");
    pages[i].style.zIndex = "";
  }
  buildDots();
  mobileIndex = 0;
  pages[0].classList.add("mobile-active");
  updateDots();
  updateButtons();
}

/* ── NAV BUTTON EVENTS ── */
prevBtn.addEventListener("click", function () { goToPage(mobileIndex - 1); });
nextBtn.addEventListener("click", function () { goToPage(mobileIndex + 1); });

/* ── SWIPE SUPPORT ── */
var touchStartX = 0;
var touchStartY = 0;
var SWIPE_THRESHOLD = 50;

pagesEl.addEventListener("touchstart", function (e) {
  touchStartX = e.changedTouches[0].clientX;
  touchStartY = e.changedTouches[0].clientY;
}, { passive: true });

pagesEl.addEventListener("touchend", function (e) {
  if (!isMobile()) return;
  var dx = e.changedTouches[0].clientX - touchStartX;
  var dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
    goToPage(dx < 0 ? mobileIndex + 1 : mobileIndex - 1);
  }
}, { passive: true });

/* ── RESIZE — switch modes when crossing the breakpoint ── */
var wasLastMobile = isMobile();

window.addEventListener("resize", function () {
  var nowMobile = isMobile();
  if (nowMobile === wasLastMobile) return;
  wasLastMobile = nowMobile;

  if (nowMobile) {
    initMobile();
  } else {
    for (var i = 0; i < pages.length; i++) {
      pages[i].classList.remove("mobile-active");
      if (i % 2 === 0) pages[i].style.zIndex = pages.length - i;
    }
  }
});

/* ── INIT ── */
document.addEventListener("DOMContentLoaded", function () {
  initDesktop();

  if (isMobile()) {
    initMobile();
  }

  // If the kundli/scroll page is the FIRST visible page (e.g. during development
  // with earlier pages commented out), trigger the animation immediately on load.
  // When all pages are active the kundli page won't be pages[0], so this is a no-op.
  maybePlayScrollAnim(pages[0]);

  // Fetch and render API data
  getData();
});