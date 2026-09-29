/* Daegu Virtuoso Chamber - seamless page swap (Boaz v34 style).
   Internal link click -> fetch next page -> replace body content only (#bgm kept, so the music never stops)
   -> pushState -> re-run app.js. Falls back to a normal navigation on any error. */
(function () {
  if (!window.fetch || !window.DOMParser || !history.pushState || !window.URL) return;
  var s = document.querySelector('script[src*="js/app.js"]');
  var APP = s ? s.src : null;
  if (!APP) return;
  var busy = false, cur = location.pathname;
  function load(src) {
    return new Promise(function (ok, no) { var e = document.createElement("script"); e.src = src; e.onload = ok; e.onerror = no; document.body.appendChild(e); });
  }
  function go(url, push) {
    if (busy) return; busy = true;
    fetch(url, { credentials: "same-origin" })
      .then(function (r) { if (!r.ok) throw 0; return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var bgm = document.getElementById("bgm"), body = document.body;
        if (bgm && bgm.parentNode !== body) body.appendChild(bgm);   /* must be a direct body child to survive the swap */
        if (window.__dvcAC) { window.__dvcAC.abort(); window.__dvcAC = null; }
        if (push) history.pushState({ dvc: 1 }, "", url);   /* before insert: relative src/href resolve against the new path */
        cur = location.pathname;
        document.title = doc.title;
        Array.prototype.slice.call(body.attributes).forEach(function (a) { body.removeAttribute(a.name); });
        Array.prototype.slice.call(doc.body.attributes).forEach(function (a) { body.setAttribute(a.name, a.value); });
        Array.prototype.slice.call(body.children).forEach(function (c) { if (c !== bgm) c.remove(); });
        var frag = document.createDocumentFragment();
        Array.prototype.slice.call(doc.body.children).forEach(function (c) { if (c.id === "bgm" || c.tagName === "SCRIPT") return; frag.appendChild(document.adoptNode(c)); });
        if (bgm) body.insertBefore(frag, bgm); else body.appendChild(frag);
        window.scrollTo(0, 0);
        return load(APP);
      })
      .then(function () { busy = false; })
      .catch(function (err) { if (window.console) console.warn("dvc nav: fallback to full load", err); location.href = url; });
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === "_blank" || a.hasAttribute("download")) return;
    var h = a.getAttribute("href");
    if (!h || /^(#|mailto:|tel:|javascript:)/.test(h)) return;
    var u = new URL(h, location.href);
    if (u.origin !== location.origin || !/(\.html?|\/)$/.test(u.pathname)) return;
    e.preventDefault(); go(u.href, true);
  });
  window.addEventListener("popstate", function () { if (location.pathname !== cur) go(location.href, false); });
  history.replaceState({ dvc: 1 }, "", location.href);
})();
