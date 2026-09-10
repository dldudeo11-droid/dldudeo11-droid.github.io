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
  /* 하위 폴더(members/)에 있는 페이지는 body[data-root="../"] 로 기준 경로를 알려준다 */
  var ROOT = (document.body && document.body.getAttribute("data-root")) || "";

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

  function setMeta(name, content) {
    var el = document.querySelector('meta[name="' + name + '"]');
    if (!el) { el = document.createElement("meta"); el.setAttribute("name", name); document.head.appendChild(el); }
    el.setAttribute("content", String(content).slice(0, 300));
  }

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
  function here() {
    /* 단원 프로필 페이지는 '단원' 메뉴가 활성화되도록 members.html 로 간주 */
    var pg = document.body && document.body.getAttribute("data-page");
    if (pg === "member" || pg === "collab") return "members.html";
    var p = location.pathname.split("/").pop(); return p || "index.html";
  }
  function navLinks(mobile) {
    return NAV.map(function (it) {
      var file = it[0].split("#")[0];
      var act = (file === here()) && it[0].indexOf("#") < 0 ? " active" : "";
      return '<a class="' + (mobile ? "" : "nav-a" + act) + '" href="' + ROOT + it[0] + '" data-i18n="' + it[1] + '">' + esc(t(it[1])) + "</a>";
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
        '<a class="brand" href="' + ROOT + 'index.html" aria-label="Daegu Virtuoso Chamber"><span class="brand-logo"></span></a>' +
        '<nav class="nav">' + navLinks(false) + "</nav>" +
        '<div class="header-tools">' + sndButton() + blogLink() + igLink() + langSelect("lang") +
          '<button class="icon-btn" id="burger" aria-label="' + esc(t("nav.menu")) + '"><span class="burger-ico"><i></i><i></i><i></i></span></button>' +
        "</div>" +
      "</div>";
  }
  var MARK = '<svg class="mk" viewBox="0 0 132 100" fill="currentColor" aria-hidden="true"><g transform="skewX(30)"><rect x="0" y="42" width="13" height="58"/><rect x="26" y="0" width="13" height="76"/><rect x="52" y="12" width="13" height="30"/></g></svg>';
  function sndButton() {
    if (!document.getElementById("bgm")) return "";
    return '<button class="snd-btn" id="sndBtn" type="button" aria-label="Sound" title="Sound"><i></i><i></i><i></i><i></i></button>';
  }
  function buildMobile() {
    var m = document.getElementById("mnav"); if (!m) return;
    var open = m.classList.contains("open");
    m.className = "mobile-nav" + (open ? " open" : "");
    var links = NAV.map(function (it) {
      var act = (it[0] === here()) ? ' class="active"' : "";
      return '<a' + act + ' href="' + ROOT + it[0] + '" data-i18n="' + it[1] + '">' + esc(t(it[1])) + "</a>";
    }).join("");
    m.innerHTML = '<div class="mlist">' + links + "</div>" + MARK;
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
    var burger = document.getElementById("burger"), mnav = document.getElementById("mnav"), hdr = document.getElementById("hdr");
    function setMenu(o) { if (!mnav) return; mnav.classList.toggle("open", o); if (hdr) hdr.classList.toggle("menu-open", o); document.body.style.overflow = o ? "hidden" : ""; }
    if (burger && mnav) burger.addEventListener("click", function () { setMenu(!mnav.classList.contains("open")); });
    if (mnav) mnav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    var sb = document.getElementById("sndBtn");
    if (sb && window.DVC_HOME) sb.addEventListener("click", window.DVC_HOME.toggleSound);
  }

  /* ---------- renderers ---------- */
  function photoOrMono(m, name) {
    if (m && m.photo) return '<img src="' + ROOT + m.photo + '" alt="' + esc(name) + '" loading="lazy">';
    var ini = (name || "").trim().charAt(0) || "·";
    return '<div class="mono"><span>' + esc(ini) + "</span></div>";
  }
  function roleLabel(rank) { return t("ranks." + rank); }
  function partLabel(part) { return t("parts." + part); }
  /* 단원별 개별 페이지 주소 (검색엔진 색인용 정적 페이지) */
  function memberUrl(id) { return ROOT + "members/" + encodeURIComponent(id) + ".html"; }

  function memberCard(m) {
    var info = member(m.id);
    return '<a class="mcard reveal" data-rank="' + esc(m.rank) + '" href="' + memberUrl(m.id) + '">' +
      '<div class="mcard__ph">' + (m.rank !== "member" ? '<div class="mcard__role"><span>' + esc(roleLabel(m.rank)) + "</span></div>" : "") + photoOrMono(m, info.name) +
        '<span class="mcard__view">' + esc(t("ui.view_profile")) + " <span class='ar'>→</span></span></div>" +
      '<div class="mcard__meta"><div class="mcard__name">' + esc(info.name) + "</div>" +
        '<div class="mcard__part">' + esc(partLabel(m.part)) + " · " + esc(roleLabel(m.rank)) + "</div></div></a>";
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

  /* 함께한 연주자 — 전체 목록 페이지 (객원 수석 → 파트별 그룹) */
  var COLLAB_ORDER = ["conductor", "violin", "viola", "cello", "flute", "piano", "soprano", "tenor"];
  function collabTotal() { return (DATA.guestPrincipals || []).length + (DATA.guests || []).length; }
  function collabBlock(title, items) {
    return '<div class="part-block">' +
      '<div class="part-title reveal"><h3>' + esc(title) + "</h3>" +
      '<span class="cnt">' + ("0" + items.length).slice(-2) + "</span></div>" +
      '<div class="collab-grid">' + items.join("") + "</div></div>";
  }
  function renderCollaborators(container) {
    var html = "";
    var gp = (DATA.guestPrincipals || []).map(function (g) {
      var info = member(g.id);
      return '<a class="collab-card reveal" href="' + memberUrl(g.id) + '">' +
        '<span class="role">' + esc(partLabel(g.part)) + " · " + esc(roleLabel(g.rank)) + "</span>" +
        '<span class="nm">' + esc(info.name) + "</span>" +
        '<span class="lk">' + esc(t("ui.view_profile")) + " →</span></a>";
    });
    if (gp.length) html += collabBlock(t("about.guest_principal_title"), gp);
    var kinds = COLLAB_ORDER.slice();
    (DATA.guests || []).forEach(function (g) { if (kinds.indexOf(g.kind) < 0) kinds.push(g.kind); });
    kinds.forEach(function (k) {
      var inK = (DATA.guests || []).filter(function (g) { return g.kind === k; });
      if (!inK.length) return;
      html += collabBlock(partLabel(k), inK.map(function (g) {
        var info = guest(g.id);
        return '<div class="collab-card reveal"><span class="nm">' + esc(info.name) + "</span></div>";
      }));
    });
    container.innerHTML = html;
  }
  /* 단원·소개 페이지 하단의 '함께한 연주자' 안내 단락 (클릭 → collaborators.html) */
  function renderCollabTeaser(container) {
    container.innerHTML = '<a class="collab-cta reveal" href="' + ROOT + 'collaborators.html">' +
      '<span class="collab-cta__n">' + collabTotal() + "<i>" + esc(t("collab.count")) + "</i></span>" +
      '<span class="collab-cta__body"><span class="collab-cta__t">' + esc(t("collab.title")) + "</span>" +
      '<span class="collab-cta__p">' + esc(t("collab.teaser")) + "</span>" +
      '<span class="collab-cta__lk">' + esc(t("collab.view_all")) + " <span class='ar'>→</span></span></span></a>";
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
      var n = items.filter(function (it) { return it.year === yr; }).length;
      return '<div class="tl-year reveal"><div class="yr">' + esc(yr) + "<i>" + n + " " + esc(t("history.stages") || "STAGES") + "</i></div><div>" + rows + "</div></div>";
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
    /* 정적 페이지(members/<id>.html)는 body[data-member-id] 로, 구 주소는 ?id= 로 단원을 지정 */
    var id = (document.body && document.body.getAttribute("data-member-id")) ||
             new URLSearchParams(location.search).get("id");
    var m = DATA.members.concat(DATA.guestPrincipals || []).filter(function (x) { return x.id === id; })[0];
    if (!m) { container.innerHTML = '<p class="lead">' + esc(t("memberPage.not_found")) + "</p>"; return; }
    var info = member(m.id);
    /* 정적 페이지의 한국어 title/description 은 이미 최적화돼 있으므로 한국어일 때는 그대로 둔다.
       다른 언어로 볼 때만 해당 언어에 맞게 바꿔 준다. */
    var isStatic = !!(document.body && document.body.getAttribute("data-member-id"));
    if (!isStatic || LANG !== "ko") {
      document.title = info.name + " · " + t("site.name");
      if (isStatic) {
        setMeta("description", info.name + " — " + t("site.name") + " " +
          partLabel(m.part) + " " + roleLabel(m.rank) + ". " + ((info.bio || [])[0] || ""));
      }
    }
    var bio = (info.bio || []).map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("");
    container.innerHTML =
      '<a class="back-link" href="' + ROOT + 'members.html"><span class="ar" style="transform:rotate(180deg)">→</span> ' + esc(t("memberPage.back")) + "</a>" +
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
    if (byId("collab-teaser")) renderCollabTeaser(byId("collab-teaser"));
    if (byId("history-full")) renderHistory(byId("history-full"));
    if (byId("history-preview")) renderHistory(byId("history-preview"), 6);
    if (byId("sketch-full")) renderSketches(byId("sketch-full"));
    /* member-detail = 구 member.html, member-profile = 단원별 정적 페이지 */
    var mc = byId("member-detail") || byId("member-profile");
    if (mc) renderMemberDetail(mc);
    if (byId("about-body")) {
      var paras = t("about.body") || [];
      byId("about-body").innerHTML = paras.map(function (p, i) { return "<p" + (i === 0 ? ' class="reveal"' : "") + ">" + esc(p) + "</p>"; }).join("");
    }
    if (byId("about-stats")) {
      var st = t("about.stats") || [];
      byId("about-stats").innerHTML = st.map(function (s) { return '<div class="stat"><div class="n">' + esc(s.n) + '</div><div class="l">' + esc(s.l) + "</div></div>"; }).join("");
    }
    if (page && page !== "member" && page !== "home") {
      var titleKey = ({ about: "about.title", members: "members.title", history: "history.title", sketch: "sketch.title", contact: "contact.title", collab: "collab.title" })[page];
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
    var th = document.body.getAttribute("data-hero") === "true" ? Math.max(120, window.innerHeight - 80) : 40;
    if (window.scrollY > th) h.classList.add("scrolled"); else h.classList.remove("scrolled");
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

  /* ---------- home: intro + slideshow + bgm ---------- */
  (function homeModule() {
    var frame = document.getElementById("frame"), intro = document.getElementById("intro"), bgm = document.getElementById("bgm");
    if (!frame && !intro && !bgm) return;
    var imgs = frame ? Array.prototype.slice.call(frame.querySelectorAll("img")) : [], prog = document.getElementById("prog"), cur = 0, tm = null;
    function show(i) {
      if (!imgs.length) return;
      imgs[cur].classList.remove("on"); cur = (i + imgs.length) % imgs.length; imgs[cur].classList.add("on");
      if (prog) { prog.classList.remove("run"); void prog.offsetWidth; prog.classList.add("run"); }
      clearTimeout(tm); tm = setTimeout(function () { show(cur + 1); }, 6000);
    }
    function start() { if (prog) prog.classList.add("run"); clearTimeout(tm); tm = setTimeout(function () { show(1); }, 6000); }
    var fade = null;
    function fadeTo(v, ms, done) { if (!bgm) return; clearInterval(fade); var from = bgm.volume, t0 = performance.now();
      fade = setInterval(function () { var p = Math.min(1, (performance.now() - t0) / ms); bgm.volume = from + (v - from) * p; if (p >= 1) { clearInterval(fade); done && done(); } }, 50); }
    function btn() { return document.getElementById("sndBtn"); }
    function sndOn(quick) { if (!bgm) return; bgm.volume = quick ? 0.08 : 0; var pr = bgm.play(); if (pr && pr.catch) pr.catch(function () { var b = btn(); if (b) b.classList.remove("on"); });
      var b = btn(); if (b) b.classList.add("on"); if (!quick) fadeTo(0.08, 3000); ls("dvc_snd", "on"); }
    function sndSave() { try { sessionStorage.setItem("dvc_t", bgm.paused ? "" : bgm.currentTime); sessionStorage.setItem("dvc_at", Date.now()); } catch (e) {} }
    if (bgm) { bgm.addEventListener("timeupdate", sndSave); window.addEventListener("pagehide", sndSave);
      document.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("a[href]")) sndSave(); }); }
    function sndResume() { if (!bgm || ls("dvc_snd") === "off") return; var t = "", at = 0;
      try { t = sessionStorage.getItem("dvc_t") || ""; at = parseFloat(sessionStorage.getItem("dvc_at")) || 0; } catch (e) {}
      if (t === "") return;
      var gap = at ? Math.min(8, Math.max(0, (Date.now() - at) / 1000)) : 0, tt = (parseFloat(t) || 0) + gap;
      var seek = function () { try { bgm.currentTime = bgm.duration ? tt % bgm.duration : tt; } catch (e) {} };
      if (bgm.readyState >= 1) seek(); else bgm.addEventListener("loadedmetadata", seek, { once: true });
      sndOn(true); }
    function sndOff() { if (!bgm) return; var b = btn(); if (b) b.classList.remove("on"); fadeTo(0, 900, function () { bgm.pause(); }); ls("dvc_snd", "off"); }
    window.DVC_HOME = { toggleSound: function () { if (!bgm) return; (bgm.paused ? sndOn : sndOff)(); } };
    var seen = false; try { seen = sessionStorage.getItem("dvc_intro") === "1"; } catch (e) {}
    if (intro && !seen) {
      var eb = document.getElementById("enterBtn");
      if (eb) eb.addEventListener("click", function () {
        try { sessionStorage.setItem("dvc_intro", "1"); } catch (e) {}
        intro.classList.add("done"); document.body.classList.add("entering"); sndOn(); start(); setTimeout(function () { intro.parentNode && intro.parentNode.removeChild(intro); }, 1800); setTimeout(function () { document.body.classList.remove("entering"); }, 3600);
      });
    } else { if (intro) intro.parentNode.removeChild(intro); start(); sndResume(); }
  })();

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
