async function getData() {
  try {
    const res = await fetch("https://reports.astroprenuers.com/cosmic_code/json/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "Aditya Raj Lodhi",
        gender: "Male",
        dob: "03/06/2003",
        tob: "18:14",
        city: "Bulandshahr",
        state: "Uttar Pradesh",
        country: "India",
        pincode: "203001",
        lang: "eng",
        is_json_response: true
      })
    });

    const data = await res.json();
    console.log("data->", data);
    
    fillData(data);

  } catch (err) {
    console.error("API Error:", err);
  }
}

function fillData(data) {
  const capitalizeWords = (str = "") =>
  str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
    
  document.querySelectorAll("#name").forEach(el => { el.textContent = capitalizeWords(data.NAME); });
  document.querySelectorAll("#dob").forEach(el => { el.textContent = data.DOB; });
  document.querySelectorAll("#tob").forEach(el => { el.textContent = data.TIME_OF_BIRTH + " Hour"; });
  document.querySelectorAll("#city").forEach(el => { el.textContent = data.CITY; });
  document.querySelectorAll("#state").forEach(el => { el.textContent = data.STATE; });
  document.querySelectorAll("#country").forEach(el => { el.textContent = data.COUNTRY; });
  document.querySelectorAll("#nakshatra").forEach(el => { el.textContent = data.NAKSHATRA_CHARAN; });
  document.querySelectorAll("#ayanamsa").forEach(el => { el.textContent = data.TITHI_AT_SUNRISE; });
  document.querySelectorAll("#gender").forEach(el => { el.textContent = data.GENDER; });
  document.querySelectorAll("#day").forEach(el => { el.textContent = data.DAY; });
  
  document.querySelector('#yog-count').innerHTML = data.YOG_COUNT;
  document.querySelector('#dosh-count').innerHTML = data.DOSH_COUNT;

  // 🧠 Calculate age from DOB
  const calculateAge = (dobStr) => {
    if (!dobStr) return "-";

    // convert DD/MM/YYYY → YYYY-MM-DD
    const [day, month, year] = dobStr.split("/");
    const dob = new Date(`${year}-${month}-${day}`);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();

    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  };

  const age = calculateAge(data.DOB);
  document.querySelectorAll('#age').forEach(el => { el.textContent = age; });

  // const { visible, masked } = maskAfterFullStops(data.VAAR_DESCRIPTION, 6);

  // document.querySelector("#vaar-desc").innerHTML = `
  //   ${visible}
  //   <span class="blurred">${masked}</span>
  // `;

  const { visible: visible2, masked: masked2 } = maskAfterFullStops(data.TITHI_DESCRIPTION, 3);

  document.querySelector("#tithi-desc").innerHTML = `
    ${visible2}
    <span class="blurred">${masked2}</span>
  `;

  const { visible: visible3, masked: masked3 } = maskAfterFullStops(data.PLANET_CONTENT.Sun.placement, 3);
  document.querySelector("#sun-desc").innerHTML = `
    ${visible3}
    <span class="blurred">${masked3}</span>
  `;

  const { visible: visible7, masked: masked7 } = maskAfterFullStops(data.PLANET_CONTENT.Moon.placement, 3);
  document.querySelector("#moon-desc").innerHTML = `
    ${visible7}
    <span class="blurred">${masked7}</span>
  `;

  const { visible: visible8, masked: masked8 } = maskAfterFullStops(data.PLANET_CONTENT.Mercury.placement, 3);
  document.querySelector("#mercury-desc").innerHTML = `
    ${visible8}
    <span class="blurred">${masked8}</span>
  `;

  const { visible: visible9, masked: masked9 } = maskAfterFullStops(data.PLANET_CONTENT.Sun.aspect.first, 1);
  document.querySelector("#sun-aspect").innerHTML = `
    ${visible9}
    <span class="blurred">${masked9}</span>
  `;

  const { visible: visible10, masked: masked10 } = maskAfterFullStops(data.PLANET_CONTENT.Moon.aspect.first, 1);
  document.querySelector("#moon-aspect").innerHTML = `
    ${visible10}
    <span class="blurred">${masked10}</span>
  `;

  const { visible: visible11, masked: masked11 } = maskAfterFullStops(data.PLANET_CONTENT.Mercury.aspect.first, 1);
  document.querySelector("#mercury-aspect").innerHTML = `
    ${visible11}
    <span class="blurred">${masked11}</span>
  `;

  
  const { visible: visible4, masked: masked4 } = maskAfterFullStops(data.NAKSHATRA_PANCHANG_DESCRIPTION, 3);
  document.querySelector("#nakshatra-desc").innerHTML = `
    ${visible4}
    <span class="blurred">${masked4}</span>
  `;

  const { visible: visible5, masked: masked5 } = maskAfterFullStops(data.YOGA_DESCRIPTION, 3);
  document.querySelector("#yoga-desc").innerHTML = `
    ${visible5}
    <span class="blurred">${masked5}</span>
  `;

  const { visible: visible6, masked: masked6 } = maskAfterFullStops(data.MOON_SIGN_DESCRIPTION, 3);
  const first_name = data.NAME.trim().split(" ")[0]
  
  document.querySelector("#rashi-desc").innerHTML = `
    ${first_name}, ${visible6}
    <span class="blurred">${masked6}</span>
  `;
  

  
  

  renderChart(data);
}

function renderChart(data) {
  const chart = data.SODASHVARGA?.[0]?.chart || [];

  document.querySelectorAll(".house").forEach(houseEl => {
    const index = houseEl.dataset.index;
    const item = chart[index];

    if (!item) return;

    // inject planets (HTML safe)
    const planetEl = houseEl.querySelector(".planet-in-chart");
    if (planetEl) {
      planetEl.innerHTML = item.planets || "";
    }

    // inject sign
    const signEl = houseEl.querySelector(".numb");
    if (signEl) {
      signEl.textContent = item.sign ?? "-";
    }
  });
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, "");
}

function maskAfterFullStops(html, stopLimit = 3) {
  if (!html) return { visible: "", masked: "" };

  const text = stripHtml(html);
  let count = 0;
  let splitIndex = -1;

  for (let i = 0; i < text.length; i++) {
    if (/[.!?]/.test(text[i])) {
      count++;
      if (count === stopLimit) {
        splitIndex = i + 1;
        break;
      }
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

getData();



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


const scrollPage = document.querySelector(".scroll-page");

const observer = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        scrollPage.classList.add("animate");

        // run only once
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.5 // trigger when 50% visible
  }
);

observer.observe(scrollPage);



