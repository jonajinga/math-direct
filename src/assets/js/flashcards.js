(function () {
  "use strict";

  var dataEl = document.getElementById("flashcard-data");
  if (!dataEl) return;

  var allProblems;
  try { allProblems = JSON.parse(dataEl.textContent); } catch (e) { return; }
  if (!allProblems || !allProblems.length) return;

  // DOM refs
  var filtersPanel = document.getElementById("fc-filters");
  var areaEl = document.getElementById("fc-area");
  var summaryEl = document.getElementById("fc-summary");
  var counterEl = document.getElementById("fc-counter");
  var scoreEl = document.getElementById("fc-score");
  var progressFill = document.getElementById("fc-progress-fill");
  var cardContainer = document.getElementById("fc-card-container");
  var cardEl = document.getElementById("fc-card");
  var frontText = document.getElementById("fc-front-text");
  var backText = document.getElementById("fc-back-text");
  var hintEl = document.getElementById("fc-hint");
  var actionsEl = document.getElementById("fc-actions");
  var summaryTitle = document.getElementById("fc-summary-title");
  var summaryStats = document.getElementById("fc-summary-stats");

  // State
  var deck = [];
  var currentIndex = 0;
  var correctCount = 0;
  var totalSeen = 0;
  var flipped = false;
  var firstTrySet = {}; // track cards correct on first try by original index

  var STORAGE_KEY = "fc-filters";

  // Shuffle helper
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Parse problem for dot counting (same logic as practice engine)
  function parseProblem(str) {
    var dotCount = 0;
    for (var i = 0; i < str.length; i++) {
      if (str.charCodeAt(i) === 0x2022) dotCount++;
    }
    var text = str;
    if (dotCount > 0) {
      text = str.replace(/[\u2022\s]+$/g, "").replace(/\u2022/g, "").trim();
    }
    return { text: text, dots: dotCount };
  }

  // Build dot grid HTML (rows of 5)
  function buildDotGrid(count) {
    if (count <= 0) return "";
    var html = '<div class="pe-dots">';
    var placed = 0;
    while (placed < count) {
      var rowSize = Math.min(5, count - placed);
      html += '<div class="pe-dots__row">';
      for (var i = 0; i < rowSize; i++) {
        html += '<span class="pe-dots__dot"></span>';
        placed++;
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  // Read filter values from checkboxes
  function getFilters() {
    var phases = [];
    var types = [];
    var diffs = [];
    var phaseBoxes = document.querySelectorAll('input[name="fc-phase"]:checked');
    var typeBoxes = document.querySelectorAll('input[name="fc-type"]:checked');
    var diffBoxes = document.querySelectorAll('input[name="fc-diff"]:checked');
    for (var i = 0; i < phaseBoxes.length; i++) phases.push(parseInt(phaseBoxes[i].value, 10));
    for (var i = 0; i < typeBoxes.length; i++) types.push(typeBoxes[i].value);
    for (var i = 0; i < diffBoxes.length; i++) diffs.push(parseInt(diffBoxes[i].value, 10));
    return { phases: phases, types: types, diffs: diffs };
  }

  // Save filters to localStorage
  function saveFilters() {
    try {
      var f = getFilters();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(f));
    } catch (e) { /* ignore */ }
  }

  // Restore filters from localStorage
  function restoreFilters() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var f = JSON.parse(raw);

      // Uncheck all first
      var allBoxes = document.querySelectorAll('input[name="fc-phase"], input[name="fc-type"], input[name="fc-diff"]');
      for (var i = 0; i < allBoxes.length; i++) allBoxes[i].checked = false;

      // Re-check saved values
      if (f.phases) {
        for (var i = 0; i < f.phases.length; i++) {
          var cb = document.querySelector('input[name="fc-phase"][value="' + f.phases[i] + '"]');
          if (cb) cb.checked = true;
        }
      }
      if (f.types) {
        for (var i = 0; i < f.types.length; i++) {
          var cb = document.querySelector('input[name="fc-type"][value="' + f.types[i] + '"]');
          if (cb) cb.checked = true;
        }
      }
      if (f.diffs) {
        for (var i = 0; i < f.diffs.length; i++) {
          var cb = document.querySelector('input[name="fc-diff"][value="' + f.diffs[i] + '"]');
          if (cb) cb.checked = true;
        }
      }
    } catch (e) { /* ignore */ }
  }

  // Filter problems
  function filterProblems() {
    var f = getFilters();
    return allProblems.filter(function (p) {
      var phaseMatch = f.phases.length === 0 || f.phases.indexOf(p.phase) !== -1;
      // Match type: also match subtypes like "addition-regrouping" if "addition" is selected,
      // but only if the specific subtype isn't in the type list
      var typeMatch = f.types.length === 0 || f.types.indexOf(p.type) !== -1;
      var diffMatch = f.diffs.length === 0 || f.diffs.indexOf(p.difficulty) !== -1;
      return phaseMatch && typeMatch && diffMatch;
    });
  }

  // Start
  window.fcStart = function () {
    saveFilters();
    var filtered = filterProblems();
    if (filtered.length === 0) {
      alert("No problems match your filters. Please adjust and try again.");
      return;
    }

    // Tag each with original index for first-try tracking
    deck = shuffle(filtered).map(function (p, i) {
      return { problem: p.problem, answer: p.answer, phase: p.phase, type: p.type, difficulty: p.difficulty, _id: i };
    });

    currentIndex = 0;
    correctCount = 0;
    totalSeen = 0;
    firstTrySet = {};
    flipped = false;

    filtersPanel.style.display = "none";
    summaryEl.style.display = "none";
    areaEl.style.display = "block";
    showCard();
  };

  function showCard() {
    if (currentIndex >= deck.length) {
      showSummary();
      return;
    }

    flipped = false;
    cardEl.classList.remove("fc-card--flipped");
    hintEl.style.display = "block";
    actionsEl.style.display = "none";

    var p = deck[currentIndex];
    var parsed = parseProblem(p.problem);

    // Front content
    if (parsed.dots > 0) {
      frontText.innerHTML = '<span class="pe-problem__label">' + parsed.text + '</span>' + buildDotGrid(parsed.dots);
    } else {
      frontText.innerHTML = '<span class="fc-card__problem">' + parsed.text + '</span>';
    }

    // Back content
    backText.textContent = p.answer;

    // Update counter and progress
    counterEl.textContent = (currentIndex + 1) + " / " + deck.length;
    scoreEl.textContent = correctCount + " correct";
    var pct = deck.length > 0 ? Math.round((currentIndex / deck.length) * 100) : 0;
    progressFill.style.width = pct + "%";

    cardContainer.focus();
  }

  // Flip
  window.fcFlip = function () {
    if (flipped) return;
    flipped = true;
    cardEl.classList.add("fc-card--flipped");
    hintEl.style.display = "none";
    actionsEl.style.display = "flex";
    if (firstTrySet[deck[currentIndex]._id] === undefined) {
      totalSeen++;
    }
  };

  // Got it
  window.fcGotIt = function () {
    var card = deck[currentIndex];
    if (firstTrySet[card._id] === undefined) {
      firstTrySet[card._id] = true;
      correctCount++;
    }
    currentIndex++;
    showCard();
  };

  // Try again — put card back in deck at a random later position
  window.fcTryAgain = function () {
    var card = deck[currentIndex];
    if (firstTrySet[card._id] === undefined) {
      firstTrySet[card._id] = false;
    }
    // Remove current card and re-insert later
    deck.splice(currentIndex, 1);
    var insertAt = currentIndex + Math.floor(Math.random() * Math.max(1, deck.length - currentIndex));
    if (insertAt >= deck.length) insertAt = deck.length;
    deck.splice(insertAt, 0, card);
    // Don't increment currentIndex since we removed the current card
    showCard();
  };

  function showSummary() {
    areaEl.style.display = "none";
    summaryEl.style.display = "block";

    var firstTryCorrect = 0;
    var totalUnique = 0;
    for (var key in firstTrySet) {
      totalUnique++;
      if (firstTrySet[key]) firstTryCorrect++;
    }

    var pct = totalUnique > 0 ? Math.round((firstTryCorrect / totalUnique) * 100) : 0;
    var grade = pct === 100 ? "Perfect!" : pct >= 80 ? "Great job!" : pct >= 60 ? "Good effort!" : "Keep practicing!";

    summaryTitle.textContent = grade;
    summaryStats.innerHTML =
      '<div class="curriculum-stat"><span class="curriculum-stat__number">' + firstTryCorrect + '/' + totalUnique + '</span><span class="curriculum-stat__label">Correct (1st try)</span></div>' +
      '<div class="curriculum-stat"><span class="curriculum-stat__number">' + pct + '%</span><span class="curriculum-stat__label">Score</span></div>' +
      '<div class="curriculum-stat"><span class="curriculum-stat__number">' + totalUnique + '</span><span class="curriculum-stat__label">Cards Seen</span></div>';
  }

  // Play again — go back to filters
  window.fcPlayAgain = function () {
    summaryEl.style.display = "none";
    areaEl.style.display = "none";
    filtersPanel.style.display = "block";
  };

  // Restore saved filters on load
  restoreFilters();
})();
