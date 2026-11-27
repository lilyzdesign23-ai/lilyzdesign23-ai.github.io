/* Lilyz Design Studio — small behaviours: menu, header line, scroll reveal, inquiry form. */

// The inquiry form posts into Lily's Google Form (the address is the form's action in inquire.html),
// so every inquiry appears in that form's Responses tab.

(function () {
  var doc = document.documentElement;
  doc.classList.add("js");

  // Mobile menu
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Hairline under the header once the page has scrolled
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Scroll reveal
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-in"); });
  }

  // "Email me" links open a blank email addressed to Lily. The address is put together here,
  // in the browser, so it is not written out anywhere in the pages for spam robots to collect.
  var mailTo = ["lilyz.design23", "gmail.com"].join("@");
  document.querySelectorAll("[data-mail]").forEach(function (link) {
    link.setAttribute("href", "mailto:" + mailTo);
    link.removeAttribute("target");
  });

  // Homepage showcase: a fan of project cards that turns on its own.
  // A click on a side card, or a swipe, also brings the next one forward.
  var deck = document.querySelector("[data-deck]");
  if (deck) {
    var cards = Array.prototype.slice.call(deck.querySelectorAll(".deck__card"));
    var count = cards.length;
    var active = 0;
    var timer = null;
    var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function layout() {
      cards.forEach(function (card, i) {
        var pos = ((i - active) % count + count) % count;
        if (pos > count / 2) pos -= count;
        card.setAttribute("data-pos", pos);
        card.tabIndex = pos === 0 ? 0 : -1;
      });
      var caption = deck.querySelector(".deck__caption");
      if (caption) {
        var front = cards[active];
        caption.href = front.href;
        caption.querySelector(".deck__meta").textContent = front.getAttribute("data-meta");
        caption.querySelector(".deck__name").textContent = front.getAttribute("data-name");
      }
    }
    function go(index) { active = ((index % count) + count) % count; layout(); }
    function play() {
      if (timer) { clearInterval(timer); timer = null; }
      if (!calm && !document.hidden) timer = setInterval(function () { go(active + 1); }, 3800);
    }

    cards.forEach(function (card, i) {
      card.addEventListener("click", function (e) {
        // A side card comes to the front first; only the front card opens its project.
        if (i !== active) { e.preventDefault(); go(i); play(); }
      });
    });
    document.addEventListener("visibilitychange", play);

    var startX = null;
    deck.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    deck.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) { go(active + (dx < 0 ? 1 : -1)); play(); }
    }, { passive: true });

    layout();
    play();
  }

  // Inquiry form
  var form = document.querySelector("#inquiry-form");
  if (form) {
    var result = form.querySelector(".form__result");
    var resultText = form.querySelector(".form__result-text");
    var resultLink = result.querySelector("a");
    var submit = form.querySelector('button[type="submit"]');
    var sending = false;

    // "Other" choices reveal a text box, which is then required.
    function syncOther(radio) {
      var group = form.querySelectorAll('input[name="' + radio.name + '"]');
      group.forEach(function (r) {
        var id = r.getAttribute("data-other");
        if (!id) return;
        var box = document.getElementById(id);
        box.hidden = !r.checked;
        box.required = r.checked;
        if (r.checked && document.activeElement === r) box.focus();
      });
    }
    form.addEventListener("change", function (e) {
      if (e.target.type === "radio") syncOther(e.target);
    });

    function show(text, withEmail) {
      resultText.textContent = text;
      resultLink.style.display = withEmail ? "" : "none";
      result.hidden = false;
      result.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sending || !form.reportValidity()) return;

      var data = new FormData(form);
      // Only bots fill in the hidden field: accept quietly and send nothing.
      if (data.get("company_website")) {
        form.reset();
        show("Thank you. Your inquiry has been sent.", false);
        return;
      }
      data.delete("company_website");

      var body = new URLSearchParams();
      data.forEach(function (value, key) {
        // Leave out an "Other" text box that is not in use.
        if (/\.other_option_response$/.test(key) && !String(value).trim()) return;
        body.append(key, value);
      });

      sending = true;
      submit.disabled = true;
      var label = submit.firstChild.textContent;
      submit.firstChild.textContent = "Sending… ";

      // Google Forms does not let another site read its reply, so a completed
      // request is treated as sent and only a network failure as an error.
      fetch(form.action, { method: "POST", mode: "no-cors", body: body })
        .then(function () {
          form.reset();
          form.querySelectorAll(".other-input").forEach(function (box) { box.hidden = true; box.required = false; });
          show("Thanks for submitting your enquiry! I will be in touch with you shortly.", false);
        })
        .catch(function () {
          show("Sorry, your message could not be sent just now. Please try again in a moment, or use the Email me button below.", true);
        })
        .then(function () {
          sending = false;
          submit.disabled = false;
          submit.firstChild.textContent = label;
        });
    });
  }
})();
