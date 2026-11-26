/* Lilyz Design Studio — small behaviours: menu, header line, scroll reveal, inquiry form. */

// Set Lily's email address here to make the inquiry form open a ready-written email.
// While it is empty, the form copies the message so it can be pasted into an Instagram DM.
var CONTACT_EMAIL = "";
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

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var data = new FormData(form);
      var needs = data.getAll("needs").join(", ") || "Not sure yet";
      var message =
        "Hello Lily,\n\n" +
        "Name: " + data.get("name") + "\n" +
        "Email: " + data.get("email") + "\n" +
        "Business: " + (data.get("business") || "-") + "\n" +
        "Looking for: " + needs + "\n\n" +
        data.get("message") + "\n";

      if (CONTACT_EMAIL) {
        window.location.href =
          "mailto:" + CONTACT_EMAIL +
          "?subject=" + encodeURIComponent("Project inquiry from " + data.get("name")) +
          "&body=" + encodeURIComponent(message);
        resultText.textContent = "Your email app should now be open with your message ready to send.";
        result.hidden = false;
        return;
      }

      function show(copied) {
        resultText.textContent = copied
          ? "Your message has been copied. Open Instagram and paste it into a message to @lilyzdesign."
          : "Copy the message below and send it to @lilyzdesign on Instagram.";
        var pre = result.querySelector("pre");
        if (!copied) {
          if (!pre) {
            pre = document.createElement("pre");
            pre.style.whiteSpace = "pre-wrap";
            pre.style.font = "inherit";
            result.insertBefore(pre, result.querySelector("a"));
          }
          pre.textContent = message;
        } else if (pre) {
          pre.remove();
        }
        result.hidden = false;
        result.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(message).then(
          function () { show(true); },
          function () { show(false); }
        );
      } else {
        show(false);
      }
    });
  }
})();
