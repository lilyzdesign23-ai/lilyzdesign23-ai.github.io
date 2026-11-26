/* Lilyz Design Studio — small behaviours: menu, header line, scroll reveal, inquiry form. */

// The inquiry form posts into Lily's Google Form (the address is the form's action in inquire.html),
// so every inquiry appears in that form's Responses tab.
var INSTAGRAM_URL = "https://www.instagram.com/lilyzdesign/";

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

    function show(text, withInstagram) {
      resultText.textContent = text;
      resultLink.style.display = withInstagram ? "" : "none";
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
          show("Sorry, your message could not be sent just now. Please try again in a moment, or message @lilyzdesign on Instagram.", true);
        })
        .then(function () {
          sending = false;
          submit.disabled = false;
          submit.firstChild.textContent = label;
        });
    });
  }
})();
