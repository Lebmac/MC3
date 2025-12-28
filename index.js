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


// ---------------------
// DIAGNOSTICS INDICATOR
// ---------------------

// Update CSS variable on scroll
/* 
window.addEventListener('scroll', () => {
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
      const start = parseFloat(el.data("start-pos")); /* || el.offset().top - windowH; */
      const end = parseFloat(el.data("end-pos")) /* || start + windowH; */
      const startVal = parseFloat(el.data("start-val")); /* || 0; */
      const endVal = parseFloat(el.data("end-val")); /* || 0; */
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

  el.css("--translateY", appBoundValue + 'vh'); 
}

function moveX(el, progress, startVal=0, endVal=100, options="") {
  const lowerAppBound = Math.min(startVal, endVal);
  const upperAppBound = Math.max(startVal, endVal);
  const fctBoundValue = startVal + progress * (endVal - startVal);
  const appBoundValue = clamp(fctBoundValue, lowerAppBound, upperAppBound);

  el.css("--translateX", appBoundValue + 'vw');
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

  el.css("--height", appBoundValue + 'vh');
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
