/* Avila's Auto & Truck Repair — site interactions */
(function () {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Shop hours (24h, Pacific time). Edit here if hours change. ---------- */
  const HOURS = {
    0: null,          // Sunday — closed
    1: [9, 18], 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [9, 18],
    6: [9, 15]        // Saturday
  };

  /* ---------- Preloader ---------- */
  const pre = document.querySelector(".preloader");
  if (pre) {
    const done = () => pre.classList.add("is-done");
    window.addEventListener("load", () => setTimeout(done, 350));
    setTimeout(done, 2200); // never block longer than this
  }

  /* ---------- Header shrink + mobile nav ---------- */
  const header = document.querySelector(".header");
  const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 30);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const burger = document.querySelector(".burger");
  if (burger) {
    burger.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", String(open));
    });
    document.querySelectorAll(".nav a").forEach((a) =>
      a.addEventListener("click", () => {
        document.body.classList.remove("nav-open");
        burger.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const dur = 1600; const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); }
    }), { threshold: 0.5 });
    counters.forEach((c) => cio.observe(c));
  } else counters.forEach(runCounter);

  /* ---------- Card spotlight + tilt ---------- */
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty("--mx", x + "px");
      card.style.setProperty("--my", y + "px");
      if (fine && !reduceMotion) {
        const rx = ((y / r.height) - 0.5) * -6, ry = ((x / r.width) - 0.5) * 6;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      }
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });

  /* ---------- Videos: play only when visible, sound toggles ---------- */
  const vids = document.querySelectorAll("video[data-autoplay]");
  if ("IntersectionObserver" in window) {
    const vio = new IntersectionObserver((entries) => entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
      else v.pause();
    }), { threshold: 0.2 });
    vids.forEach((v) => { v.muted = true; vio.observe(v); });
  }
  document.querySelectorAll(".sound-btn").forEach((btn) => {
    const v = document.getElementById(btn.dataset.video);
    if (!v) return;
    btn.addEventListener("click", () => {
      const turnOn = v.muted;
      // only one video with sound at a time
      document.querySelectorAll("video").forEach((o) => { o.muted = true; });
      document.querySelectorAll(".sound-btn").forEach((b) => b.setAttribute("aria-pressed", "false"));
      if (turnOn) { v.muted = false; v.play().catch(() => {}); btn.setAttribute("aria-pressed", "true"); }
    });
  });

  /* ---------- Hero embers (canvas sparks) ---------- */
  const cvs = document.querySelector(".hero__embers");
  if (cvs && !reduceMotion) {
    const ctx = cvs.getContext("2d");
    let w, h, parts = [], dpr = Math.min(window.devicePixelRatio || 1, 2), running = true;
    const size = () => {
      w = cvs.clientWidth; h = cvs.clientHeight;
      cvs.width = w * dpr; cvs.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const spawn = () => ({
      x: Math.random() * w, y: h + 10, r: Math.random() * 1.8 + 0.6,
      vx: (Math.random() - 0.5) * 0.6, vy: -(Math.random() * 1.2 + 0.5), life: 0, max: 160 + Math.random() * 180,
      hue: 30 + Math.random() * 20
    });
    size(); window.addEventListener("resize", size);
    const count = w < 640 ? 28 : 60;
    for (let i = 0; i < count; i++) { const p = spawn(); p.y = Math.random() * h; parts.push(p); }
    const loop = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      parts.forEach((p, i) => {
        p.life++; p.x += p.vx + Math.sin(p.life / 20) * 0.25; p.y += p.vy;
        const a = Math.max(0, 1 - p.life / p.max);
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${a * 0.85})`;
        ctx.shadowColor = `hsla(${p.hue}, 100%, 55%, ${a})`; ctx.shadowBlur = 8;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        if (p.life > p.max || p.y < -10) parts[i] = spawn();
      });
      requestAnimationFrame(loop);
    };
    loop();
    const hio = new IntersectionObserver(([e]) => { const was = running; running = e.isIntersecting; if (running && !was) loop(); });
    hio.observe(cvs);
  }

  /* ---------- Open / closed status + today's hours ---------- */
  const nowPT = () => {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    const days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { day: days[get("weekday")], hour: (parseInt(get("hour"), 10) % 24) + parseInt(get("minute"), 10) / 60 };
  };
  try {
    const { day, hour } = nowPT();
    const today = HOURS[day];
    const open = !!today && hour >= today[0] && hour < today[1];
    const fmt = (hh) => { const h12 = hh % 12 || 12; return h12 + (hh < 12 ? " AM" : " PM"); };
    let label;
    if (open) label = "Open now · until " + fmt(today[1]);
    else {
      let d = day, add = 0;
      if (today && hour < today[0]) label = "Closed · opens " + fmt(today[0]) + " today";
      else {
        do { d = (d + 1) % 7; add++; } while (!HOURS[d] && add < 7);
        const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        label = "Closed · opens " + (add === 1 ? "tomorrow" : names[d]) + " " + fmt(HOURS[d][0]);
      }
    }
    document.querySelectorAll("[data-open-status]").forEach((el) => { el.textContent = label; });
    document.querySelectorAll(".status-dot").forEach((el) => el.classList.toggle("closed", !open));
    document.querySelectorAll(`.hours tr[data-day="${day}"]`).forEach((tr) => tr.classList.add("today"));
  } catch (e) { /* leave defaults */ }

  /* ---------- Service tabs (services page) ---------- */
  const tabs = document.querySelectorAll(".tab[data-filter]");
  if (tabs.length) {
    const cards = document.querySelectorAll(".svc-grid .card");
    tabs.forEach((t) => {
      const f = t.dataset.filter;
      const n = f === "all" ? cards.length : [...cards].filter((c) => c.dataset.cat === f).length;
      const c = t.querySelector(".count"); if (c) c.textContent = n;
    });
    const apply = (filter, push) => {
      tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.filter === filter)));
      cards.forEach((c, i) => {
        const show = filter === "all" || c.dataset.cat === filter;
        c.classList.toggle("is-hidden", !show);
        c.classList.remove("is-entering");
        if (show) { void c.offsetWidth; c.style.animationDelay = (i % 9) * 40 + "ms"; c.classList.add("is-entering"); }
      });
      if (push) history.replaceState(null, "", filter === "all" ? location.pathname : "#" + filter);
    };
    tabs.forEach((t) => t.addEventListener("click", () => apply(t.dataset.filter, true)));
    const initial = location.hash.slice(1);
    if (initial && document.querySelector(`.tab[data-filter="${initial}"]`)) apply(initial, false);
  }

  /* ---------- Estimate form ---------- */
  const form = document.getElementById("estimate-form");
  if (form) {
    // Prefill service from ?service=
    const svc = new URLSearchParams(location.search).get("service");
    const sel = form.querySelector("#service");
    if (svc && sel) {
      const match = [...sel.options].find((o) => o.value.toLowerCase() === svc.toLowerCase());
      if (match) sel.value = match.value;
    }
    const status = form.querySelector(".form-status");
    const btn = form.querySelector("button[type=submit]");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (form.querySelector(".hp").value) return; // bot
      btn.disabled = true; const label = btn.innerHTML; btn.innerHTML = "Sending…";
      status.className = "form-status";
      const data = Object.fromEntries(new FormData(form).entries());
      delete data._honey;
      data._subject = `Free estimate request — ${data.service || "General"} — ${data.name}`;
      data._template = "table";
      try {
        const res = await fetch(form.action, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error("bad status");
        form.reset();
        status.classList.add("ok");
        status.textContent = "Thanks! Your request is in. We'll call or text you back during business hours — usually same day.";
      } catch (err) {
        status.classList.add("err");
        status.innerHTML = 'Something went wrong sending your request. Please call us at <a href="tel:+17753249090"><u>775-324-9090</u></a>.';
      } finally {
        btn.disabled = false; btn.innerHTML = label;
      }
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
