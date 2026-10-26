// Math Direct app shell: viewport height, sheets, toasts, the install prompt,
// and the search shortcut. Loaded on every page.
(function () {
  "use strict";
  var MD = window.MD = window.MD || {};

  // ── Viewport height for browsers without dvh units ──
  if (!(window.CSS && CSS.supports && CSS.supports("height", "1dvh"))) {
    var setVh = function () { document.documentElement.style.setProperty("--vh", (window.innerHeight / 100) + "px"); };
    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);
  }

  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  MD.esc = esc;

  // ── Sheets: native dialogs that rise from the bottom ──
  function openSheet(dlg, opener) {
    if (!dlg || typeof dlg.showModal !== "function") return;
    dlg._opener = opener || document.activeElement;
    if (!dlg.open) dlg.showModal();
    var first = dlg.querySelector("[autofocus], input, select, textarea, button:not(.sheet__close)");
    if (first) first.focus();
  }
  MD.openSheet = function (id, opener) { openSheet(typeof id === "string" ? document.getElementById(id) : id, opener); };
  MD.closeSheet = function (id, value) {
    var dlg = typeof id === "string" ? document.getElementById(id) : id;
    if (dlg && dlg.open) dlg.close(value);
  };
  document.addEventListener("click", function (e) {
    var open = e.target.closest("[data-sheet-open]");
    if (open) { e.preventDefault(); openSheet(document.getElementById(open.getAttribute("data-sheet-open")), open); return; }
    var close = e.target.closest("[data-sheet-close]");
    if (close) { e.preventDefault(); var d = close.closest("dialog"); if (d) d.close(close.getAttribute("data-sheet-close") || ""); }
  });
  document.addEventListener("close", function (e) {
    var d = e.target;
    if (d && d.tagName === "DIALOG" && d._opener && typeof d._opener.focus === "function" && document.contains(d._opener) && !document.querySelector("dialog[open]")) d._opener.focus();
  }, true);

  // A sheet built on the spot. Both return a promise.
  function buildSheet(title, bodyHtml, buttons) {
    var dlg = document.createElement("dialog");
    dlg.className = "sheet";
    dlg.setAttribute("aria-labelledby", "sheet-title-" + Date.now());
    dlg.innerHTML = '<form method="dialog" class="sheet__form">' +
      '<div class="sheet__head"><h2 class="sheet__title" id="' + dlg.getAttribute("aria-labelledby") + '">' + esc(title) + "</h2></div>" +
      '<div class="sheet__body">' + bodyHtml + "</div>" +
      '<div class="sheet__foot">' + buttons.map(function (b) { return '<button type="submit" class="btn ' + (b.cls || "btn--secondary") + '" value="' + esc(b.value) + '">' + esc(b.label) + "</button>"; }).join("") + "</div></form>";
    document.body.appendChild(dlg);
    return dlg;
  }
  // confirm: { title, text, ok, cancel, danger } -> promise of true/false
  MD.confirm = function (o) {
    return new Promise(function (resolve) {
      var dlg = buildSheet(o.title, "<p>" + esc(o.text) + "</p>", [
        { value: "cancel", label: o.cancel || "Cancel" },
        { value: "ok", label: o.ok || "OK", cls: o.danger ? "btn--danger" : "btn--primary" },
      ]);
      dlg.addEventListener("close", function () { var v = dlg.returnValue === "ok"; dlg.remove(); resolve(v); });
      openSheet(dlg);
    });
  };
  // ask: { title, text, label, value, placeholder, ok } -> promise of the string, or null
  MD.ask = function (o) {
    return new Promise(function (resolve) {
      var id = "ask-" + Date.now();
      var dlg = buildSheet(o.title, (o.text ? "<p>" + esc(o.text) + "</p>" : "") +
        '<div class="field"><label for="' + id + '">' + esc(o.label || "Name") + '</label><input type="text" id="' + id + '" value="' + esc(o.value || "") + '" placeholder="' + esc(o.placeholder || "") + '" autocomplete="off" maxlength="40"><p class="field__error" id="' + id + '-err" hidden></p></div>', [
        { value: "cancel", label: o.cancel || "Cancel" },
        { value: "ok", label: o.ok || "Save", cls: "btn--primary" },
      ]);
      var input = dlg.querySelector("input"), err = dlg.querySelector(".field__error"), form = dlg.querySelector("form");
      form.addEventListener("submit", function (e) {
        if (e.submitter && e.submitter.value === "ok" && !input.value.trim()) {
          e.preventDefault();
          err.textContent = "Type a name first.";
          err.hidden = false;
          input.setAttribute("aria-describedby", err.id);
          input.focus();
        }
      });
      dlg.addEventListener("close", function () { var v = dlg.returnValue === "ok" ? input.value.trim() : null; dlg.remove(); resolve(v); });
      openSheet(dlg);
      input.select();
    });
  };

  // ── Toasts ──
  MD.toast = function (text, o) {
    o = o || {};
    var host = document.getElementById("md-toasts") || document.body;
    var t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    t.innerHTML = "<span>" + esc(text) + "</span>" + (o.action ? '<button type="button" class="btn">' + esc(o.action) + "</button>" : "");
    host.appendChild(t);
    var timer = setTimeout(function () { t.remove(); }, o.ms || 6000);
    if (o.action) t.querySelector("button").addEventListener("click", function () { clearTimeout(timer); t.remove(); if (o.onAction) o.onAction(); });
    return t;
  };

  // ── Install prompt ──
  var installEvent = null;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    installEvent = e;
    var cards = document.querySelectorAll("[data-install-card]");
    for (var i = 0; i < cards.length; i++) {
      var dismissed = false;
      try { dismissed = localStorage.getItem("md-install-dismissed") === "1"; } catch (err) {}
      cards[i].hidden = dismissed;
    }
    var rows = document.querySelectorAll("[data-install]");
    for (var j = 0; j < rows.length; j++) rows[j].hidden = false;
  });
  window.addEventListener("appinstalled", function () {
    var all = document.querySelectorAll("[data-install], [data-install-card]");
    for (var i = 0; i < all.length; i++) all[i].hidden = true;
  });
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-install]");
    if (btn && installEvent) { installEvent.prompt(); return; }
    var dis = e.target.closest("[data-install-dismiss]");
    if (dis) {
      try { localStorage.setItem("md-install-dismissed", "1"); } catch (err) {}
      var card = dis.closest("[data-install-card]");
      if (card) card.hidden = true;
    }
  });

  // ── Search shortcut ──
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (location.pathname !== "/search/") location.href = "/search/";
      else { var s = document.getElementById("search-input"); if (s) s.focus(); }
    }
  });
})();
