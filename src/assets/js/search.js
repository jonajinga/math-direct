// The search screen. Every word typed must match the title, description, or
// text of a page. Titles count first, then levels, pages, lessons, tests, and
// practice sets.
(function () {
  "use strict";
  var input = document.getElementById("search-input");
  var results = document.getElementById("search-results");
  var countEl = document.getElementById("search-count");
  var form = document.querySelector(".search-form");
  if (!input || !results) return;
  var index = null;
  var typePriority = { level: 1, page: 2, lesson: 3, test: 4, practice: 5 };

  function loadIndex() {
    if (index) return Promise.resolve(index);
    return fetch("/search-index.json").then(function (r) { return r.json(); }).then(function (data) { index = data; return index; });
  }

  function search(query) {
    var q = query.trim().toLowerCase();
    if (!q) { results.innerHTML = ""; if (countEl) countEl.textContent = ""; return; }
    loadIndex().then(function (idx) {
      var terms = q.split(/\s+/);
      var matches = idx.filter(function (item) {
        var hay = (item.title + " " + item.description + " " + item.content).toLowerCase();
        return terms.every(function (t) { return hay.indexOf(t) !== -1; });
      });
      matches.sort(function (a, b) {
        var aTitle = a.title.toLowerCase().indexOf(q) !== -1 ? 0 : 1;
        var bTitle = b.title.toLowerCase().indexOf(q) !== -1 ? 0 : 1;
        if (aTitle !== bTitle) return aTitle - bTitle;
        return (typePriority[a.type] || 9) - (typePriority[b.type] || 9);
      });
      if (countEl) countEl.textContent = matches.length + " result" + (matches.length !== 1 ? "s" : "") + (matches.length > 20 ? ", showing 20" : "");
      if (!matches.length) { results.innerHTML = '<li class="muted">Nothing matched. Try one word, such as a skill or a lesson number.</li>'; return; }
      var html = "";
      matches.slice(0, 20).forEach(function (item) {
        var desc = item.description || firstSentence(item.content);
        html += '<li><a href="' + item.url + '" class="search-result">' +
          '<span class="search-result__type">' + item.type + "</span>" +
          '<span class="search-result__title">' + escapeHtml(item.title) + "</span>" +
          (desc ? '<span class="search-result__desc">' + escapeHtml(desc) + "</span>" : "") +
          "</a></li>";
      });
      results.innerHTML = html;
    });
  }

  // The first whole sentence of a page, or nothing; never a cut-off fragment.
  function firstSentence(text) {
    var m = (text || "").match(/^\s*([^.?!]{1,200}[.?!])(\s|$)/);
    return m ? m[1] : "";
  }
  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  var timer;
  input.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(function () { search(input.value); }, 120); });
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); search(input.value); });
  var q = new URLSearchParams(location.search).get("q");
  if (q) { input.value = q; search(q); }
  input.focus();
})();
