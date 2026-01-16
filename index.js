// Clamp helper
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);


//----------------------------
// NAV BAR DISPLAY ACTIVE PAGE
// ---------------------------

var util = {
  mobileMenu() {
    $("#nav").toggleClass("nav-visible");
  },
  windowResize() {
    if ($(window).width() > 800) {
      $("#nav").removeClass("nav-visible");
    }
  },
  scrollEvent() {
    var scrollPosition = $(document).scrollTop();
    
    $.each(util.scrollMenuIds, function(i) {
      var link = util.scrollMenuIds[i],
          container = $(link).attr("href"),
          containerOffset = $(container).offset().top,
          containerHeight = $(container).outerHeight(),
          containerBottom = containerOffset + containerHeight;

      if (scrollPosition < containerBottom - 20 && scrollPosition >= containerOffset - 20) {
        $(link).addClass("active");
      } else {
        $(link).removeClass("active");
      }
    });
  }
};

util.scrollMenuIds = $("a.nav-link[href]");
$("#menu").on("click", util.mobileMenu);
$(window).on("resize", util.windowResize);
$(document).on("scroll", util.scrollEvent);

// -------------------------
// MOBILE NAV MENU FUNCTIONS
// -------------------------

var navMob = document.getElementById("nav-mob");
var menu = document.getElementById("nav-mob-menu");
var title = document.getElementById("nav-mob-title");
var navBtn = document.getElementById("nav-mob-btn");
var links = document.getElementsByClassName("nav-mob-link");
menu.style.display = "none";

function handleNavClick() {
  if (menu.style.display === "none") {
    menu.style.display = "flex";
    navMob.style.backgroundColor = "#503622";
    title.style.color = "#efefe5";
    navBtn.style.color = "#efefe5";
  } else {
    menu.style.display = "none";
    navMob.style.backgroundColor = "#efefe5";
    title.style.color = "#764e2f";
    navBtn.style.color = "#764e2f";
  }
}

window.onload = function() {
  for (let i=0; i < links.length; i++) {
    links[i].addEventListener("pointerup", () => {
      setTimeout(() => {
        handleNavClick();
      }, 100);  
    });
  }
}

var aboutModal = document.getElementById("about-gallery-modal-bg");
var cafeModal = document.getElementById("cafe-gallery-modal-bg");

window.addEventListener("message", (event) => {
  if (event.data?.type === "gallery-about-click") {
    handleAboutGalleryClick(); 
  } else if (event.data?.type === "gallery-cafe-click") {
    handleCafeGalleryClick(); 
  }
});

document.querySelectorAll(".modal-bg").forEach((modal) => {
  modal.addEventListener("click", (e) => {
    closeModal();
  });
});

function handleAboutGalleryClick() {
  console.log(aboutModal.style.display);
  if (aboutModal.style.display == "none" || aboutModal.style.display == "") {
    aboutModal.style.display = "block";
  }
}

function handleCafeGalleryClick() {
  if (cafeModal.style.display == "none" || cafeModal.style.display == "") {
    cafeModal.style.display = "block";
  }
}

function closeModal() {
  aboutModal.style.display = "none";
  cafeModal.style.display = "none";

}

// ---------------------
// DIAGNOSTICS INDICATOR
// ---------------------

// Update CSS variable on scroll

/* window.addEventListener('scroll', () => {
  const scrollY = window.scrollY || window.pageYOffset;
  document.documentElement.style.setProperty('--scroll-y', scrollY);
  document.getElementById('scrollValue').textContent = Math.round(scrollY);
}); */

// ---------------------
// ANIMATION HANDLER & DEBOUNCING
// ---------------------

$(function() {
  const $elements = $("[data-animate]");
  let ticking = false;

  // Scroll update logic
  function updateAnimations() {
    const scrollY = $(window).scrollTop();
    const scrollYSnap = Math.round($(window).scrollTop() / 100) * 100;
    const windowH = $(window).height();

    $elements.each(function() {
      const el = $(this);
      const start = parseFloat(el.data("start-pos"));
      const end = parseFloat(el.data("end-pos"))
      const startVal = parseFloat(el.data("start-val"));
      const endVal = parseFloat(el.data("end-val"));
      const options = el.data("options");
      const progress = clamp((scrollY - start) / (end - start), 0, 1);
      const progressSnap = clamp((scrollYSnap - start) / (end - start), 0, 1);

      const anims = (el.data("animate") || "").split(/\s+/);

      anims.forEach(anim => {

        option_DisplayOutsideProgressBound(el, progress, options);

        if (el.data("snap") === "snap") {
          window[anim](el, progressSnap, startVal, endVal, options);
        } else {
          window[anim](el, progress, startVal, endVal, options);
        }
      });
    });

    ticking = false;
  }

  // Scroll handler (debounced via rAF)
  $(window).on("scroll", function() {
    if (!ticking) {
      window.requestAnimationFrame(updateAnimations);
      ticking = true;
    }
  });

  // Run once on load
  updateAnimations();
});

// ------------------------------------------------
// Extract options from data-options HTML attribute
// ------------------------------------------------

// function specific options are specified in the 
// HTML attribute data-options.
// They follow the format "attribute: value attribute: value, ... "
function getAttributeValue(options="", attribute="") {
  // Match "attribute: value" pairs, allowing for optional spaces
  const regex = new RegExp(`${attribute}\\s*:\\s*([^\\s]+)`, 'i');
  const attr = options.match(regex);
  return attr ? attr[1] : null;
}

// -----------------
// Run options logic
// -----------------

function option_DisplayOutsideProgressBound(el, progress, options) {
  if (progress === 0 && getAttributeValue(options, "display-start") === "none") {
    el.css("display", "none");
  } else if (progress === 1 && getAttributeValue(options, "display-end") === "none") {
    el.css("display", "none");
  } else {
    el.css("display", "");
  }
}

// -------------------
// Animation functions
// -------------------

function opacity(el, progress, startVal=0, endVal=1, options="") {
  const lowerAppBound = Math.min(startVal, endVal);
  const upperAppBound = Math.max(startVal, endVal);
  const fctBoundValue = clamp(startVal + progress * (endVal - startVal), 0, 1);
  const appBoundValue = clamp(fctBoundValue, lowerAppBound, upperAppBound);

  el.css("--opacity", appBoundValue);  
}

function moveY(el, progress, startVal=0, endVal=100, options="") {
  const lowerAppBound = Math.min(startVal, endVal);
  const upperAppBound = Math.max(startVal, endVal);
  const fctBoundValue = startVal + progress * (endVal - startVal);
  const appBoundValue = clamp(fctBoundValue, lowerAppBound, upperAppBound);

  el.css("--translateY", appBoundValue + 'dvh'); 
}

function moveX(el, progress, startVal=0, endVal=100, options="") {
  const lowerAppBound = Math.min(startVal, endVal);
  const upperAppBound = Math.max(startVal, endVal);
  const fctBoundValue = startVal + progress * (endVal - startVal);
  const appBoundValue = clamp(fctBoundValue, lowerAppBound, upperAppBound);

  el.css("--translateX", appBoundValue + 'dvw');
}

function rotate(el, progress, startVal=0, endVal=360, options="") {
  const lowerAppBound = Math.min(startVal, endVal);
  const upperAppBound = Math.max(startVal, endVal);
  const fctBoundValue = (startVal + progress * (endVal - startVal)) % 360;
  const appBoundValue = clamp(fctBoundValue, lowerAppBound, upperAppBound);

  el.css("--angleDegrees", appBoundValue + 'deg');
}

function scale(el, progress, startVal=1, endVal=1.2, options="") {
  const lowerAppBound = Math.min(startVal, endVal);
  const upperAppBound = Math.max(startVal, endVal);
  const fctBoundValue = Math.max((startVal + progress * (endVal - startVal)), 0);
  const appBoundValue = clamp(fctBoundValue, lowerAppBound, upperAppBound);

  el.css("--scale", appBoundValue);
}

function height(el, progress, startVal=0, endVal=100, options="") {
  const lowerAppBound = Math.min(startVal, endVal);
  const upperAppBound = Math.max(startVal, endVal);
  const fctBoundValue = Math.max((startVal + progress * (endVal - startVal)), 0);
  const appBoundValue = clamp(fctBoundValue, lowerAppBound, upperAppBound);

  el.css("--height", appBoundValue + 'dvh');
}

function visible(el, progress, startVal=0, endVal=1, options="") {
  const lowerAppBound = Math.min(startVal, endVal);
  const upperAppBound = Math.max(startVal, endVal);
  const fctBoundValue = Math.max((startVal + progress * (endVal - startVal)), 0);
  const appBoundValue = clamp(fctBoundValue, lowerAppBound, upperAppBound);

  el.css("--display", appBoundValue);
}

function scrollHiddenContentY(el, progress, startVal=0, endVal=1, options="") {
  const scrollPosition = progress * (el[0].scrollHeight - el.innerHeight()); 

  el.scrollTop(scrollPosition);

}
