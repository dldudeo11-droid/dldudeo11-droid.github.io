/* ============================================================
   Daegu Virtuoso Chamber — app logic
   i18n (8 langs) + theme (3) + chrome injection + rendering
   ============================================================ */
(function () {
  "use strict";
  var DATA = window.DVC_DATA;
  var I18N = window.DVC_I18N || {};
  var FALLBACK = "ko";
  var SUP = (DATA.langs || []).map(function (l) { return l[0]; });

  /* ---------- storage ---------- */
  function ls(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }
    catch (e) { return null; }
  }
  function pickLang() {
    var s = ls("dvc_lang"); if (s && SUP.indexOf(s) >= 0) return s;
    var n = (navigator.language || "ko").toLowerCase();
    for (var i = 0; i < SUP.length; i++) { if (n.indexOf(SUP[i]) === 0) return SUP[i]; }
    return "ko";
  }
  function pickTheme() {
    var s = ls("dvc_theme"); if (s && DATA.themes.indexOf(s) >= 0) return s; return "editorial";
  }

  var LANG = pickLang(), THEME = pickTheme();

  /* ---------- i18n lookup ---------- */
  function dict() { return I18N[LANG] || I18N[FALLBACK] || {}; }
  function fromDict(d, path) {
    var cur = d, p = path.split(".");
    for (var i = 0; i < p.length; i++) { if (cur == null) return undefined; cur = cur[p[i]]; }
    return cur;
  }
  function t(path) {
    var v = fromDict(dict(), path);
    if (v === undefined) v = fromDict(I18N[FALLBACK] || {}, path);
    if (v === undefined) v = fromDict(I18N.en || {}, path);
    return v === undefined ? "" : v;
  }
  function member(id) { var m = (dict().memberBios || {})[id]; return m || ((I18N[FALLBACK] || {}).memberBios || {})[id] || { name: id, bio: [] }; }
  function guest(id) { var g = (dict().guestBios || {})[id]; return g || ((I18N[FALLBACK] || {}).guestBios || {})[id] || { name: id, role: "" }; }
  function hist(id) { var h = (dict().historyItems || {})[id]; return h || ((I18N[FALLBACK] || {}).historyItems || {})[id] || { title: id, venue: "" }; }
  function sketch(id) { var s = (dict().sketchItems || {})[id]; return s || ((I18N[FALLBACK] || {}).sketchItems || {})[id] || { title: "", venue: "" }; }

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

  /* ---------- static text application ---------- */
  function applyStatic(root) {
    (root || document).querySelectorAll("[data-i18n]").forEach(function (n) {
      var v = t(n.getAttribute("data-i18n")); if (v !== "") n.textContent = v;
    });
    (root || document).querySelectorAll("[data-i18n-html]").forEach(function (n) {
      var v = t(n.getAttribute("data-i18n-html")); if (v !== "") n.innerHTML = v;
    });
    (root || document).querySelectorAll("[data-i18n-attr]").forEach(function (n) {
      n.getAttribute("data-i18n-attr").split(",").forEach(function (pair) {
        var kv = pair.split(":"); var val = t(kv[1]); if (val !== "") n.setAttribute(kv[0].trim(), val);
      });
    });
  }

  /* ---------- chrome (header / footer / mobile) ---------- */
  var NAV = [
    ["index.html", "nav.home"], ["about.html", "nav.about"],
    ["members.html", "nav.members"], ["history.html", "nav.history"],
    ["sketch.html", "nav.sketch"], ["contact.html", "nav.contact"]
  ];
  function here() { var p = location.pathname.split("/").pop(); return p || "index.html"; }
  function navLinks(mobile) {
    return NAV.map(function (it) {
      var file = it[0].split("#")[0];
      var act = (file === here()) && it[0].indexOf("#") < 0 ? " active" : "";
      return '<a class="' + (mobile ? "" : "nav-a" + act) + '" href="' + it[0] + '" data-i18n="' + it[1] + '">' + esc(t(it[1])) + "</a>";
    }).join("");
  }
  function langSelect(id) {
    var opts = (DATA.langs || []).map(function (l) {
      return '<option value="' + l[0] + '"' + (l[0] === LANG ? " selected" : "") + ">" + esc(l[1]) + "</option>";
    }).join("");
    return '<select class="lang-select" id="' + id + '" aria-label="' + esc(t("ui.language")) + '">' + opts + "</select>";
  }
  function themeToggle(id) {
    var b = DATA.themes.map(function (th) {
      return '<button data-t="' + th + '" aria-pressed="' + (th === THEME) + '" title="' + esc(t("themes." + th)) + '"><span></span></button>';
    }).join("");
    return '<div class="theme-toggle" id="' + id + '">' + b + "</div>";
  }
  var BURGER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
  var CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 5l14 14M19 5L5 19"/></svg>';
  var IG = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true" style="vertical-align:-2px"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none"/></svg>';
  var BLOG = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true" style="vertical-align:-2px"><path d="M4 4.5h16M4 9.5h16M4 14.5h9" stroke-linecap="round"/><path d="M15 20.5l5.4-5.4-2.5-2.5L12.5 18v2.5z" fill="currentColor" stroke="none"/></svg>';

  function igLink() {
    var ig = (DATA.contact && DATA.contact.instagram);
    return ig ? '<a class="ig-link" href="' + ig + '" target="_blank" rel="noopener" aria-label="Instagram">' + IG + "</a>" : "";
  }
  function blogLink() {
    var bl = (DATA.contact && DATA.contact.blog);
    return bl ? '<a class="ig-link" href="' + bl + '" target="_blank" rel="noopener" aria-label="' + esc(t("contact.blog_label") || "Blog") + '" title="' + esc(t("contact.blog_label") || "Blog") + '">' + BLOG + "</a>" : "";
  }
  function buildHeader() {
    var h = document.getElementById("hdr"); if (!h) return;
    h.className = "site-header";
    h.innerHTML =
      '<div class="wrap">' +
        '<a class="brand" href="index.html" aria-label="Daegu Virtuoso Chamber"><span class="brand-logo"></span></a>' +
        '<nav class="nav">' + navLinks(false) + "</nav>" +
        '<div class="header-tools">' + blogLink() + igLink() + langSelect("lang") + themeToggle("themes") +
          '<button class="icon-btn" id="burger" aria-label="' + esc(t("nav.menu")) + '">' + BURGER + "</button>" +
        "</div>" +
      "</div>";
  }
  function buildMobile() {
    var m = document.getElementById("mnav"); if (!m) return;
    m.className = "mobile-nav";
    m.innerHTML =
      '<div class="mhead"><span class="brand-logo"></span>' +
      '<button class="icon-btn" id="mclose" style="display:inline-flex" aria-label="' + esc(t("ui.menu_close")) + '">' + CLOSE + "</button></div>" +
      navLinks(true) +
      '<div class="m-tools">' + langSelect("lang-m") + themeToggle("themes-m") + igLink() + blogLink() + "</div>";
  }
  function buildFooter() {
    var f = document.getElementById("ftr"); if (!f) return;
    f.className = "site-footer";
    var email = (DATA.contact && DATA.contact.email) || "";
    var ig = (DATA.contact && DATA.contact.instagram) || "";
    var igh = (DATA.contact && DATA.contact.instagram_handle) || "Instagram";
    var bl = (DATA.contact && DATA.contact.blog) || "";
    var blh = (DATA.contact && DATA.contact.blog_handle) || "Blog";
    f.innerHTML =
      '<div class="wrap" id="contact">' +
        '<div class="foot-top">' +
          '<div class="foot-brand"><div class="foot-logo"></div>' +
            '<p class="foot-tag">' + esc(t("footer.tagline")) + "</p></div>" +
          '<div class="foot-col"><h4>' + esc(t("footer.nav_title")) + "</h4>" +
            '<a href="about.html">' + esc(t("nav.about")) + "</a>" +
            '<a href="members.html">' + esc(t("nav.members")) + "</a>" +
            '<a href="history.html">' + esc(t("nav.history")) + "</a>" +
            '<a href="contact.html">' + esc(t("nav.contact")) + "</a></div>" +
          '<div class="foot-col"><h4>' + esc(t("contact.title")) + "</h4>" +
            '<a href="mailto:' + esc(email) + '">' + esc(email) + "</a>" +
            (ig ? '<a href="' + esc(ig) + '" target="_blank" rel="noopener">' + IG + " " + esc(igh) + "</a>" : "") +
            (bl ? '<a href="' + esc(bl) + '" target="_blank" rel="noopener">' + BLOG + " " + esc(blh) + "</a>" : "") +
            "<p>" + esc(t("contact.based")) + "</p></div>" +
        "</div>" +
        '<div class="foot-bottom">' +
          "<span>© " + new Date().getFullYear() + " " + esc(t("site.name")) + " · " + esc(t("site.name_en")) + "</span>" +
          '<span class="support">' + esc(t("footer.support")) + "</span>" +
        "</div>" +
      "</div>";
  }

  /* ---------- controls wiring ---------- */
  function setLang(l) {
    if (SUP.indexOf(l) < 0) return; LANG = l; ls("dvc_lang", l);
    var d = dict();
    document.documentElement.lang = (d.meta && d.meta.lang) || l;
    document.documentElement.dir = (d.meta && d.meta.dir) || "ltr";
    rerender();
  }
  function setTheme(th) {
    if (DATA.themes.indexOf(th) < 0) return; THEME = th; ls("dvc_theme", th);
    document.documentElement.setAttribute("data-theme", th);
    document.querySelectorAll(".theme-toggle button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-t") === th);
    });
  }
  function wireControls() {
    document.querySelectorAll(".lang-select").forEach(function (s) {
      s.value = LANG; s.addEventListener("change", function () { setLang(this.value); });
    });
    document.querySelectorAll(".theme-toggle button").forEach(function (b) {
      b.addEventListener("click", function () { setTheme(this.getAttribute("data-t")); });
    });
    var burger = document.getElementById("burger"), mnav = document.getElementById("mnav"), mclose = document.getElementById("mclose");
    if (burger && mnav) burger.addEventListener("click", function () { mnav.classList.add("open"); });
    if (mclose && mnav) mclose.addEventListener("click", function () { mnav.classList.remove("open"); });
    if (mnav) mnav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { mnav.classList.remove("open"); }); });
  }

  /* ---------- renderers ---------- */
  function photoOrMono(m, name) {
    if (m && m.photo) return '<img src="' + m.photo + '" alt="' + esc(name) + '" loading="lazy">';
    var ini = (name || "").trim().charAt(0) || "·";
    return '<div class="mono"><span>' + esc(ini) + "</span></div>";
  }
  function roleLabel(rank) { return t("ranks." + rank); }
  function partLabel(part) { return t("parts." + part); }

  function memberCard(m) {
    var info = member(m.id);
    return '<a class="mcard reveal" href="member.html?id=' + encodeURIComponent(m.id) + '">' +
      '<div class="mcard__ph">' + photoOrMono(m, info.name) +
        '<span class="mcard__view">' + esc(t("ui.view_profile")) + " <span class='ar'>→</span></span></div>" +
      '<div class="mcard__meta"><div class="mcard__role">' + esc(roleLabel(m.rank)) + "</div>" +
        '<div class="mcard__name">' + esc(info.name) + "</div></div></a>";
  }

  function renderMembers(container) {
    var html = "";
    DATA.sectionOrder.forEach(function (sec) {
      var inSec = DATA.members.filter(function (m) { return m.part === sec; });
      if (!inSec.length) return;
      html += '<div class="part-block">' +
        '<div class="part-title reveal"><h3>' + esc(t("parts." + sec)) + "</h3>" +
        '<span class="cnt">' + ("0" + inSec.length).slice(-2) + "</span></div>" +
        '<div class="mgrid">' + inSec.map(memberCard).join("") + "</div></div>";
    });
    container.innerHTML = html;
  }

  function renderMembersPreview(container) {
    var lead = ["concertmaster", "principal_rep", "principal"];
    var leaders = DATA.members.filter(function (m) { return lead.indexOf(m.rank) >= 0; });
    container.innerHTML = '<div class="lead-grid">' + leaders.map(memberCard).join("") + "</div>";
  }

  function renderCollaborators(container) {
    var items = "";
    (DATA.guestPrincipals || []).forEach(function (g) {
      var info = member(g.id);
      items += '<div class="collab-item reveal"><div class="role">' + esc(roleLabel(g.rank)) + " · " + esc(partLabel(g.part)) + "</div>" +
        '<div class="nm">' + esc(info.name) + "</div>" +
        '<a class="lk" href="member.html?id=' + encodeURIComponent(g.id) + '">' + esc(t("ui.view_profile")) + " →</a></div>";
    });
    (DATA.guests || []).forEach(function (g) {
      var info = guest(g.id);
      items += '<div class="collab-item reveal"><div class="role">' + esc(t("parts." + g.kind)) + "</div>" +
        '<div class="nm">' + esc(info.name) + "</div></div>";
    });
    container.innerHTML = '<div class="collab-row">' + items + "</div>";
  }

  function renderHistory(container, limit) {
    var items = DATA.history.slice();
    if (limit) items = items.slice(-limit);
    var years = [];
    items.forEach(function (it) { if (years.indexOf(it.year) < 0) years.push(it.year); });
    years.sort(function (a, b) { return b - a; });
    var html = years.map(function (yr) {
      var rows = items.filter(function (it) { return it.year === yr; })
        .sort(function (a, b) { return b.date.localeCompare(a.date); })
        .map(function (it) {
          var h = hist(it.id);
          return '<div class="tl-item"><div class="d">' + esc(it.date.replace(/\./g, ". ").trim()) + "</div>" +
            '<div class="t">' + esc(h.title) + "</div>" +
            (h.venue ? '<div class="v">' + esc(h.venue) + "</div>" : "") + "</div>";
        }).join("");
      return '<div class="tl-year reveal"><div class="yr">' + esc(yr) + "</div><div>" + rows + "</div></div>";
    }).join("");
    container.innerHTML = html;
  }

  /* ---------- performance sketch (poster gallery + lightbox) ---------- */
  function renderSketches(container) {
    var items = (DATA.sketches || []);
    container.innerHTML = items.map(function (it) {
      var s = sketch(it.id);
      var d = it.date.replace(/\./g, ". ").trim();
      var alt = esc((s.title ? s.title + " · " : "") + d);
      var cap = '<span class="sk-cap"><span class="sk-d">' + esc(d) + "</span>" +
        (s.title ? '<span class="sk-t">' + esc(s.title) + "</span>" : "") +
        (s.venue ? '<span class="sk-v">' + esc(s.venue) + "</span>" : "") + "</span>";
      return '<button type="button" class="sk-card reveal" data-full="' + esc(it.image) + '" data-cap="' + alt + '" aria-label="' + alt + '">' +
        '<span class="sk-ph"><img src="' + esc(it.image) + '" alt="' + alt + '" loading="lazy"></span>' +
        cap + "</button>";
    }).join("");
    container.querySelectorAll(".sk-card").forEach(function (b) {
      b.addEventListener("click", function () { openLightbox(this.getAttribute("data-full"), this.getAttribute("data-cap")); });
    });
  }
  function openLightbox(src, cap) {
    var lb = document.getElementById("dvc-lightbox");
    if (!lb) {
      lb = document.createElement("div");
      lb.id = "dvc-lightbox"; lb.className = "lightbox";
      lb.innerHTML = '<button class="lb-close" aria-label="' + esc(t("ui.menu_close")) + '">&times;</button>' +
        '<figure class="lb-fig" role="dialog" aria-modal="true"><img alt=""><figcaption></figcaption></figure>';
      document.body.appendChild(lb);
      lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lb-close")) closeLightbox(); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLightbox(); });
    }
    lb.querySelector("img").src = src;
    lb.querySelector("figcaption").textContent = cap || "";
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    var lb = document.getElementById("dvc-lightbox");
    if (lb) { lb.classList.remove("open"); document.body.style.overflow = ""; }
  }

  function renderMemberDetail(container) {
    var id = new URLSearchParams(location.search).get("id");
    var m = DATA.members.concat(DATA.guestPrincipals || []).filter(function (x) { return x.id === id; })[0];
    if (!m) { container.innerHTML = '<p class="lead">' + esc(t("memberPage.not_found")) + "</p>"; return; }
    var info = member(m.id);
    document.title = info.name + " · " + t("site.name");
    var bio = (info.bio || []).map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("");
    container.innerHTML =
      '<a class="back-link" href="members.html"><span class="ar" style="transform:rotate(180deg)">→</span> ' + esc(t("memberPage.back")) + "</a>" +
      '<div class="detail">' +
        '<div class="detail__media reveal">' + photoOrMono(m, info.name) + "</div>" +
        '<div class="detail__info reveal d1">' +
          '<div class="eyebrow">' + esc(partLabel(m.part)) + "</div>" +
          '<h1 class="detail__name">' + esc(info.name) + "</h1>" +
          '<div class="detail__sub"><span class="chip chip--accent">' + esc(roleLabel(m.rank)) + "</span>" +
            '<span class="chip">' + esc(partLabel(m.part)) + "</span></div>" +
          '<div class="bio-h">' + esc(t("memberPage.career")) + "</div>" +
          '<ul class="bio-list">' + bio + "</ul>" +
        "</div></div>";
  }

  /* ---------- reveal observer ---------- */
  var io;
  function observeReveals() {
    if (!("IntersectionObserver" in window)) { document.querySelectorAll(".reveal").forEach(function (n) { n.classList.add("in"); }); return; }
    if (io) io.disconnect();
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal:not(.in)").forEach(function (n) { io.observe(n); });
  }

  /* ---------- page render ---------- */
  function renderPage() {
    var page = document.body.getAttribute("data-page");
    var byId = function (i) { return document.getElementById(i); };
    if (byId("members-full")) renderMembers(byId("members-full"));
    if (byId("members-preview")) renderMembersPreview(byId("members-preview"), 8);
    if (byId("collab")) renderCollaborators(byId("collab"));
    if (byId("history-full")) renderHistory(byId("history-full"));
    if (byId("history-preview")) renderHistory(byId("history-preview"), 6);
    if (byId("sketch-full")) renderSketches(byId("sketch-full"));
    if (byId("member-detail")) renderMemberDetail(byId("member-detail"));
    if (byId("about-body")) {
      var paras = t("about.body") || [];
      byId("about-body").innerHTML = paras.map(function (p, i) { return "<p" + (i === 0 ? ' class="reveal"' : "") + ">" + esc(p) + "</p>"; }).join("");
    }
    if (byId("about-stats")) {
      var st = t("about.stats") || [];
      byId("about-stats").innerHTML = st.map(function (s) { return '<div class="stat"><div class="n">' + esc(s.n) + '</div><div class="l">' + esc(s.l) + "</div></div>"; }).join("");
    }
    if (page && page !== "member" && page !== "home") {
      var titleKey = ({ about: "about.title", members: "members.title", history: "history.title", sketch: "sketch.title", contact: "contact.title" })[page];
      if (titleKey) document.title = t(titleKey) + " · " + t("site.name");
    } else if (page === "home") {
      document.title = "대구 비르투오조 챔버 · " + (t("site.name_en") || "Daegu Virtuoso Chamber");
    }
  }

  function rerender() {
    buildHeader(); buildMobile(); buildFooter(); wireControls();
    applyStatic(document);
    renderPage();
    observeReveals();
    markScroll();
  }

  /* ---------- scroll header ---------- */
  function markScroll() {
    var h = document.getElementById("hdr"); if (!h) return;
    if (window.scrollY > 40) h.classList.add("scrolled"); else h.classList.remove("scrolled");
  }

  /* ---------- contact form (Boaz-style mailto) ---------- */
  window.sendMail = function (f) {
    var email = (DATA.contact && DATA.contact.email) || "";
    var L = function (k) { return t("form." + k); };
    var typeSel = (f.type && f.type.selectedIndex >= 0) ? f.type.options[f.type.selectedIndex].text : "";
    var subject = (t("form.subject_prefix") || "") + " " + (f.who ? f.who.value : "");
    var body =
      L("who") + ": " + (f.who ? f.who.value : "") + "\n" +
      L("contact") + ": " + (f.contact ? f.contact.value : "") + "\n" +
      L("type") + ": " + typeSel + "\n" +
      L("when") + ": " + (f.when ? f.when.value : "") + "\n\n" +
      L("msg") + ":\n" + (f.msg ? f.msg.value : "");
    location.href = "mailto:" + email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    return false;
  };

  /* ---------- init ---------- */
  function init() {
    document.documentElement.setAttribute("data-theme", THEME);
    var d = dict();
    document.documentElement.lang = (d.meta && d.meta.lang) || LANG;
    rerender();
    window.addEventListener("scroll", markScroll, { passive: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
