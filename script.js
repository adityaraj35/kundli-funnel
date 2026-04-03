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

function innerClick(e) {
  e.stopPropagation(); // ✅ prevents outer click
  console.log("Link clicked");
}

function setMasked(selector, text, limit) {
  const el = document.querySelector(selector);
  if (!el) return;
  const { visible, masked } = maskAfterFullStops(text, limit);
  el.innerHTML = `
  ${visible}<span class="blurred">${masked}</span>
  <span class="text_buy_link">
    <a class="shine-text" href="https://astroarunpandit.org/the-premium-personalized-kundli/#package" target="_blank" rel="noopener noreferrer">
    Unlock Full Kundli to Read More
    <div><img style="height: 100%;" src="./svg/lock-icon-2.svg" alt=""></div>
    </a>
    
  </span>
  `;
}

function genderInitials(name, gender){
  if (gender == "Male" || gender == "male"){ return `Mr. ${name}`; }
  else if (gender == "Female" || gender == "female"){ return `Mrs/Ms. ${name}`; }
  else return name;
}

function setAll(selector, content, useHTML = false) {
  document.querySelectorAll(selector).forEach(el => {
    if (useHTML) el.innerHTML = content;
    else         el.textContent = content;
  });
}

/* ============================================================
   API FETCH
   ============================================================ */
async function getData() {
  try {
    const res = await fetch("https://reports.astroprenuers.com/cosmic_code/json/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:             "Aditya Raj Lodhi",
        gender:           "Male",
        dob:              "03/06/2003",
        tob:              "18:14",
        city:             "Bulandshahr",
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

/* ============================================================
   DATA -> DOM
   ============================================================ */
function fillData(data) {
  const firstName = data.NAME.trim().split(" ")[0];
  const sunSignImg = document.getElementById("sun-sign-img");
  if (sunSignImg && data.SUN_SIGN_WESTERN) {
    sunSignImg.src = `./img/rashi/${data.SUN_SIGN_WESTERN.toLowerCase().trim()}.png`;
  }
  const moonSignImg = document.getElementById("moon-sign-img");
  if (moonSignImg && data.MOON_RASHI_NAME) {
    moonSignImg.src = `./img/rashi/${data.MOON_RASHI_NAME.toLowerCase().trim()}.png`;
  }

  setAll("#name",      capitalizeWords(data.NAME));
  setAll("#cover-name", genderInitials(data.NAME, data.GENDER));
  setAll("#dob",       data.DOB);
  setAll("#tob",       data.TIME_OF_BIRTH + " Hour");
  setAll("#city",      data.CITY);
  setAll("#state",     data.STATE);
  setAll("#country",   data.COUNTRY);
  setAll("#sun-sign",   data.SUN_SIGN_WESTERN);
  setAll("#moon-sign",   data.MOON_RASHI_NAME);
  setAll("#nakshatra", data.NAKSHATRA_CHARAN);
  setAll("#ayanamsa",  data.TITHI_AT_SUNRISE);
  setAll("#gender",    data.GENDER);
  setAll("#day",       data.DAY);
  setAll("#age",       calculateAge(data.DOB));
  setAll("#yog-count",  data.YOG_COUNT,  true);
  setAll("#dosh-count", data.DOSH_COUNT, true);

  setMasked("#vaar-desc",      data.VAAR_DESCRIPTION,                 6);
  setMasked("#tithi-desc",     data.TITHI_DESCRIPTION,                3);
  setMasked("#karana-desc",    data.KARANA_DESCRIPTION,               3);
  setMasked("#lagna-desc",     data.ASCENDENT_DESCRIPTION,            3);
  setMasked("#pada-desc",      data.NAKSHATRA_DESCRIPTION,            3);
  setMasked("#nakshatra-desc", data.NAKSHATRA_PANCHANG_DESCRIPTION,   3);
  setMasked("#yoga-desc",      data.YOGA_DESCRIPTION,                 3);
  setMasked("#gemstone-intro", data.GEMS_INTRO,                       3);
  setMasked("#ishta-dev",      data.ISHT_DEV,                         1);

  const rashiEl = document.querySelector("#rashi-desc");
  if (rashiEl) {
    const { visible, masked } = maskAfterFullStops(data.MOON_SIGN_DESCRIPTION, 3);
    rashiEl.innerHTML = `${firstName}, ${visible}<span class="blurred">${masked}</span>`;
  }

  const PLANET_CONFIG = [
    { name: "Sun",     placementLimit: 3 },
    { name: "Moon",    placementLimit: 3 },
    { name: "Mercury", placementLimit: 3 },
    { name: "Saturn",  placementLimit: 1 },
    { name: "Rahu",    placementLimit: 1 },
    { name: "Ketu",    placementLimit: 1 },
    { name: "Venus",   placementLimit: 3 },
    { name: "Jupiter", placementLimit: 3 },
    { name: "Mars",    placementLimit: 3 },
  ];

  PLANET_CONFIG.forEach(({ name, placementLimit }) => {
    const content = data.PLANET_CONTENT?.[name];
    if (!content) return;
    const id = name.toLowerCase();
    setMasked(`#${id}-desc`,   content.placement,    placementLimit);
    if (content.aspect?.first) {
      setMasked(`#${id}-aspect`, content.aspect.first, 1);
    }
  });

  setMasked("#mahadasha-intro1", data.FIRST_MAHADASHA_CONTENT, 3);

  const md = data.MAHADASHA_ANTARDASHA_DATA[0];
  const mdTitleEl = document.querySelector("#mahadasha-title1");
  if (mdTitleEl) mdTitleEl.innerHTML = md.planet_name + " Mahadasha";

  md.antardasha.slice(0, 9).forEach((ad, i) => {
    const n = i + 1;
    const titleEl = document.querySelector(`#antardasha-title${n}`);
    if (titleEl) titleEl.innerHTML = ad.planet_name + " Antardasha";
    setMasked(`#antardasha-intro${n}`, ad.content, 3);
  });

  /* ── Mahadasha header table ─────────────────────────────── */
  const tbody = document.querySelector(".mahadasha_table tbody");
  if (tbody) {
    const fragment = document.createDocumentFragment();
    data.MAHADASHA_HEADER.forEach((item, index) => {   // ← add index param
      const tr = document.createElement("tr");
      tr.style.setProperty("--row-i", index);          // ← stagger index
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
   ============================================================ */
var scrollAnimDone = false;

function maybePlayScrollAnim(pageEl) {
  if (scrollAnimDone || !pageEl) return;
  var scrollPage = pageEl.querySelector(".scroll-page");
  if (!scrollPage) return;
  setTimeout(function () { scrollPage.classList.add("animate"); }, 700);
  scrollAnimDone = true;
}

/* ============================================================
   CHAPTER PAGE ANIMATION — replays on every visit
   ─────────────────────────────────────────────────────────────
   Animation sequence (all driven by CSS, triggered by JS class):
     1. [0 s]       Banner hero starts TALL (68 %) — initial state
     2. [0 s → 1 s] Hero collapses to var(--ch-hero-h) ≈ 35 %
                    Frame image zooms in (scale + cover) so the ornate
                    border is pushed outside the overflow-hidden clip
     3. [0.7 s → 1.7 s] Content block fades in (opacity 0 → 1)

   .ch-has-hero — added once (permanent), scopes the CSS rules to
                  chapter pages that have a hero image.
   .ch-resetting — disables ALL transitions for one frame so the
                   element snaps back to the start state instantly.
   .ch-loaded    — the "end" state; added after the reset so the
                   browser animates FROM start TO end.
   ============================================================ */
function playChapterAnim(pageEl) {
  if (!pageEl) return;
  var cp = pageEl.querySelector(".chapter-page");
  if (!cp) return;
  if (!cp.querySelector(".chapter-page__hero")) return;  /* cover pages only */

  /* Mark permanently so the CSS animation rules engage */
  cp.classList.add("ch-has-hero");

  /* Instant reset: kill all transitions, remove the loaded state */
  cp.classList.add("ch-resetting");
  cp.classList.remove("ch-loaded");
  void cp.offsetHeight;               /* force reflow — browser must register the snap */
  cp.classList.remove("ch-resetting");

  /* Two rAFs guarantee the browser paints the reset state before animating */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      cp.classList.add("ch-loaded");
    });
  });
}

/* ============================================================
   MAHADASHA TABLE ANIMATION — rows cascade in, fires only once
   ============================================================ */
var mahadashaAnimDone = false;

function maybePlayMahadashaAnim(pageEl) {
  if (mahadashaAnimDone || !pageEl) return;
  var tbody = pageEl.querySelector(".mahadasha_table tbody");
  if (!tbody) return;

  /* Small delay so the mobile fade-in of the page itself finishes first */
  setTimeout(function () {
    var rows = tbody.querySelectorAll("tr");
    rows.forEach(function (tr, i) {
      tr.style.setProperty("--row-i", i);   /* stagger index for CSS */
      tr.classList.add("maha-row--animate");
    });
  }, 400);

  mahadashaAnimDone = true;
}

/* ============================================================
   SUN PLANET REVEAL — fires once per unique .sun-reveal element
   (global flag removed — the element itself gets marked instead)
   ============================================================ */
function maybePlaySunAnim(pageEl) {
  if (!pageEl) return;
  var reveal = pageEl.querySelector(".sun-reveal");
  if (!reveal) return;

  /* Already played on this specific element — skip */
  if (reveal.dataset.animDone === "1") return;
  reveal.dataset.animDone = "1";           /* mark before timeout to prevent double-fire */

  setTimeout(function () {
    reveal.classList.add("sun-reveal--loaded");
  }, 500);
}

/* ============================================================
   BOOK PAGE FLIP
   Two modes:
     * Desktop (> 768 px): classic paired spread flip
     * Mobile  (<= 768 px): single-page navigation with fade
   ============================================================ */
var MOBILE_BREAKPOINT = 768;

var pages    = document.getElementsByClassName("page");
var prevBtn  = document.getElementById("mobilePrev");
var nextBtn  = document.getElementById("mobileNext");
var dotsWrap = document.getElementById("mobileDots");
var pagesEl  = document.getElementById("pages");

var mobileIndex = 0;

function isMobile() { return window.innerWidth <= MOBILE_BREAKPOINT; }

/* ── DESKTOP MODE — spread flip ── */
function initDesktop() {
  var i;
  for (i = 0; i < pages.length; i++) {
    if (i % 2 === 0) pages[i].style.zIndex = pages.length - i;
  }

  for (i = 0; i < pages.length; i++) {
    pages[i].pageNum = i + 1;

    pages[i].onclick = (function (page) {
      return function () {
        if (isMobile()) return;

        if (page.pageNum % 2 === 0) {
          /* Even page → flip back */
          page.classList.remove("flipped");
          var prevPage = page.previousElementSibling;
          if (prevPage) {
            prevPage.classList.remove("flipped");
            maybePlayScrollAnim(prevPage);
            playChapterAnim(prevPage);        /* newly visible odd (right) page */
            maybePlayMahadashaAnim(prevPage);
            maybePlaySunAnim(prevPage);
          }
        } else {
          /* Odd page → flip forward */
          page.classList.add("flipped");
          var nextPage = page.nextElementSibling;
          if (nextPage) {
            nextPage.classList.add("flipped");
            playChapterAnim(nextPage);        /* newly visible even (left) page */
            maybePlayMahadashaAnim(nextPage);
            maybePlaySunAnim(nextPage);
            var newOdd = nextPage.nextElementSibling;
            if (newOdd) {
              maybePlayScrollAnim(newOdd);
              playChapterAnim(newOdd);        /* newly visible odd (right) page */
              maybePlayMahadashaAnim(newOdd);
              maybePlaySunAnim(newOdd);
            }
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
  playChapterAnim(pages[mobileIndex]);      /* replays every time */
  maybePlayMahadashaAnim(pages[mobileIndex]); /* fires only once */
  maybePlaySunAnim(pages[mobileIndex]);

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
  if (isMobile()) initMobile();

  /* Fire for the first visible page. Both guards safely no-op if the
     page doesn't contain the relevant element.                        */
  maybePlayScrollAnim(pages[0]);
  playChapterAnim(pages[0]);
  maybePlayMahadashaAnim(pages[0]);
  maybePlaySunAnim(pages[0]);

  getData();

  /* ── ANCHOR → BOOK NAVIGATION ── */
  function getPageIndexById(id) {
    var target = document.getElementById(id);
    if (!target) return -1;
    var pageEl = target.closest(".page") || target;
    return Array.from(pages).indexOf(pageEl);
  }

  function navigateToHash(hash) {
    if (!hash || hash === "#") return;
    var index = getPageIndexById(hash.replace("#", ""));
    if (index === -1) return;

    if (isMobile()) {
      goToPage(index);
    } else {
      /* Reset all flipped states first */
      Array.from(pages).forEach(function (p) { p.classList.remove("flipped"); });

      /* Flip every page before the target spread */
      var spreadStart = index % 2 === 0 ? index : index - 1;
      for (var i = 0; i < spreadStart; i++) {
        pages[i].classList.add("flipped");
      }

      /* Fire animations for the newly visible spread */
      var leftPage  = pages[spreadStart - 1] || null;
      var rightPage = pages[spreadStart]     || null;
      if (leftPage)  { playChapterAnim(leftPage);  maybePlayMahadashaAnim(leftPage);  maybePlaySunAnim(leftPage); }
      if (rightPage) { maybePlayScrollAnim(rightPage); playChapterAnim(rightPage); maybePlayMahadashaAnim(rightPage); maybePlaySunAnim(rightPage); }
    }
  }

  /* Intercept all hash-link clicks */
  document.addEventListener("click", function (e) {
    var anchor = e.target.closest("a[href^='#']");
    if (!anchor) return;
    var hash = anchor.getAttribute("href");
    if (!hash || hash === "#") return;
    e.preventDefault();
    history.pushState(null, "", hash);
    navigateToHash(hash);
  });

  /* Handle page load with a hash already in the URL */
  if (window.location.hash) {
    setTimeout(function () { navigateToHash(window.location.hash); }, 100);
  }
});

setInterval(() => {
  document.querySelectorAll('.toc-footer').forEach(el => {
    el.classList.remove('animate');
    void el.offsetWidth; // reflow
    el.classList.add('animate');
  });
}, 5000);