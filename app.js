(function () {
  "use strict";

  var config = window.MJENGOAI_CONFIG || {};
  var embedEl = document.getElementById("calendly-embed");
  var confirmationEl = document.getElementById("confirmation");
  var bookAnotherBtn = document.getElementById("book-another");

  // Calendly styling params so the embedded scheduler matches the
  // MjengoAI palette as closely as Calendly's embed API allows.
  var BRAND = {
    background_color: "12160f",
    text_color: "ecf5ee",
    primary_color: "35e07a"
  };

  function buildEmbedUrl(baseUrl) {
    var url = new URL(baseUrl);
    url.searchParams.set("background_color", BRAND.background_color);
    url.searchParams.set("text_color", BRAND.text_color);
    url.searchParams.set("primary_color", BRAND.primary_color);
    url.searchParams.set("hide_gdpr_banner", "1");
    return url.toString();
  }

  function showLoadError() {
    embedEl.setAttribute("data-error", "true");
    embedEl.innerHTML =
      '<div class="calendly-loading"><p>We couldn\u2019t load the booking calendar.</p></div>';
  }

  function mountCalendly() {
    if (!config.calendlyUrl) {
      showLoadError();
      return;
    }
    if (typeof window.Calendly === "undefined") {
      // widget.js hasn't loaded yet — retry briefly, then give up gracefully.
      window.__mjengoaiRetries = (window.__mjengoaiRetries || 0) + 1;
      if (window.__mjengoaiRetries > 40) {
        showLoadError();
        return;
      }
      setTimeout(mountCalendly, 150);
      return;
    }

    embedEl.innerHTML = "";
    window.Calendly.initInlineWidget({
      url: buildEmbedUrl(config.calendlyUrl),
      parentElement: embedEl,
      prefill: {},
      utm: {
        utmSource: "demo.mjengoai.com",
        utmMedium: "booking-page"
      }
    });
  }

  function isCalendlyEvent(e) {
    return (
      e.origin === "https://calendly.com" &&
      e.data &&
      e.data.event &&
      e.data.event.indexOf("calendly.") === 0
    );
  }

  window.addEventListener("message", function (e) {
    if (!isCalendlyEvent(e)) return;
    if (e.data.event === "calendly.event_scheduled") {
      embedEl.style.display = "none";
      confirmationEl.hidden = false;
      confirmationEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  if (bookAnotherBtn) {
    bookAnotherBtn.addEventListener("click", function () {
      confirmationEl.hidden = true;
      embedEl.style.display = "";
      embedEl.innerHTML =
        '<div class="calendly-loading"><div class="calendly-loading__spinner" aria-hidden="true"></div><p>Loading available times\u2026</p></div>';
      mountCalendly();
    });
  }

  mountCalendly();
})();
