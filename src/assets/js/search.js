(function () {
  "use strict";

  var overlay = document.getElementById("search-overlay");
  var input = document.getElementById("search-input");
  var results = document.getElementById("search-results");
  var countEl = document.getElementById("search-count");
  if (!overlay || !input || !results) return;

  var index = null;
  var isOpen = false;

  // Fetch index on first open
  function loadIndex() {
    if (index) return Promise.resolve(index);
    return fetch("/search-index.json")
      .then(function (r) { return r.json(); })
      .then(function (data) { index = data; return data; });
  }

  function openSearch() {
    isOpen = true;
    overlay.classList.add("is-open");
    input.value = "";
    results.innerHTML = "";
    if (countEl) countEl.textContent = "";
    loadIndex();
    setTimeout(function () { input.focus(); }, 100);
  }

  function closeSearch() {
    isOpen = false;
    overlay.classList.remove("is-open");
  }

  // Search logic
  function search(query) {
    if (!index || !query || query.length < 2) {
      results.innerHTML = "";
      if (countEl) countEl.textContent = "";
      return;
    }
    var q = query.toLowerCase();
    var terms = q.split(/\s+/).filter(function (t) { return t.length > 1; });

    var matches = index.filter(function (item) {
      var haystack = (item.title + " " + item.description + " " + item.content).toLowerCase();
      return terms.every(function (term) { return haystack.indexOf(term) !== -1; });
    });

    // Sort: title matches first, then by type priority
    var typePriority = { lesson: 1, phase: 2, practice: 3, page: 4 };
    matches.sort(function (a, b) {
      var aTitle = a.title.toLowerCase().indexOf(q) !== -1 ? 0 : 1;
      var bTitle = b.title.toLowerCase().indexOf(q) !== -1 ? 0 : 1;
      if (aTitle !== bTitle) return aTitle - bTitle;
      return (typePriority[a.type] || 9) - (typePriority[b.type] || 9);
    });

    if (countEl) countEl.textContent = matches.length + " result" + (matches.length !== 1 ? "s" : "");

    if (matches.length === 0) {
      results.innerHTML = '<p class="search-empty">No results found.</p>';
      return;
    }

    var html = "";
    var shown = matches.slice(0, 20);
    for (var i = 0; i < shown.length; i++) {
      var item = shown[i];
      var desc = item.description || item.content.substring(0, 120);
      html += '<a href="' + item.url + '" class="search-result">' +
        '<span class="search-result__type">' + item.type + '</span>' +
        '<span class="search-result__title">' + escapeHtml(item.title) + '</span>' +
        '<span class="search-result__desc">' + escapeHtml(desc) + '</span>' +
        '</a>';
    }
    if (matches.length > 20) {
      html += '<p class="search-more">' + (matches.length - 20) + ' more results...</p>';
    }
    results.innerHTML = html;
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // Event listeners
  input.addEventListener("input", function () { search(this.value); });

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeSearch();
  });

  document.addEventListener("keydown", function (e) {
    // Ctrl/Cmd + K to open search
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      if (isOpen) closeSearch(); else openSearch();
    }
    if (e.key === "Escape" && isOpen) closeSearch();
  });

  // Global function for onclick handlers
  window.openSearch = openSearch;
  window.closeSearch = closeSearch;
})();
