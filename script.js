/* ROMEXX — shared interactions */
(function () {
  "use strict";

  /* ---- Mobile nav ---- */
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.classList.remove("open");
        document.body.style.overflow = "";
      })
    );
  }

  /* ---- Nav shadow on scroll ---- */
  const nav = document.querySelector(".nav");
  const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Reveal on scroll ---- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---- Animated counters ---- */
  const counters = document.querySelectorAll("[data-count]");
  const fmt = (n, dec) =>
    Number(n).toLocaleString("en-US", {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec,
    });
  const runCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const dec = (el.dataset.count.split(".")[1] || "").length;
    const dur = 1500;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased, dec);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = fmt(target, dec);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window && counters.length) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            runCount(e.target);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach((el) => (el.textContent = el.dataset.count));
  }

  /* ---- Before/After slider ---- */
  document.querySelectorAll(".ba").forEach((ba) => {
    const range = ba.querySelector("input[type=range]");
    const before = ba.querySelector(".ba-before");
    const handle = ba.querySelector(".ba-handle");
    if (!range) return;
    const set = (v) => {
      const split = 100 - v; // clip from right
      if (before) before.style.clipPath = `inset(0 ${split}% 0 0)`;
      ba.style.setProperty("--split", v + "%");
    };
    set(range.value);
    range.addEventListener("input", () => set(range.value));
  });

  /* ---- FAQ accordion ---- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      // close siblings
      item.parentElement.querySelectorAll(".faq-item.open").forEach((s) => {
        if (s !== item) {
          s.classList.remove("open");
          const sa = s.querySelector(".faq-a");
          if (sa) sa.style.maxHeight = null;
        }
      });
      item.classList.toggle("open", !isOpen);
      a.style.maxHeight = !isOpen ? a.scrollHeight + "px" : null;
    });
  });

  /* ---- Duplicate marquee content for seamless loop ---- */
  document.querySelectorAll(".marquee-track").forEach((track) => {
    track.innerHTML += track.innerHTML;
  });

  /* ---- Current year ---- */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---- Loading screen: reveal site once loaded ---- */
  (function () {
    var pre = document.getElementById("preloader");
    if (!pre) return;
    var hide = function () {
      pre.classList.add("done");
      setTimeout(function () { if (pre && pre.parentNode) pre.parentNode.removeChild(pre); }, 650);
    };
    var start = performance.now();
    window.addEventListener("load", function () {
      var wait = Math.max(0, 700 - (performance.now() - start)); // min show ~0.7s
      setTimeout(hide, wait);
    });
    setTimeout(hide, 4000); // safety fallback
  })();

  /* ---- Contact form → Formspree (AJAX, no redirect) ---- */
  document.querySelectorAll("form[data-formspree]").forEach((form) => {
    const btn = form.querySelector("[type=submit]");
    const success = form.querySelector(".form-success");
    const label = btn ? btn.dataset.label || btn.textContent : "Send";
    const showMsg = (text, ok) => {
      if (!success) return;
      success.textContent = text;
      success.style.color = ok ? "#16a34a" : "#dc2626";
      success.style.display = "block";
    };
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          showMsg("Got it — I'll be in touch within 24 hours. ✓", true);
          form.reset();
          if (btn) btn.textContent = "Sent ✓";
        } else {
          const data = await res.json().catch(() => ({}));
          const msg = data.errors ? data.errors.map((x) => x.message).join(", ")
            : "Something went wrong. Please email romexxlab@gmail.com.";
          showMsg(msg, false);
          if (btn) { btn.disabled = false; btn.textContent = label; }
        }
      } catch (err) {
        showMsg("Network error — please email romexxlab@gmail.com.", false);
        if (btn) { btn.disabled = false; btn.textContent = label; }
      }
    });
  });
})();
