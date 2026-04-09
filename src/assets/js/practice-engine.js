(function () {
  "use strict";

  var dataEl = document.getElementById("practice-data");
  if (!dataEl) return;

  var problems;
  try { problems = JSON.parse(dataEl.textContent); } catch (e) { return; }
  if (!problems || !problems.length) return;

  var container = document.getElementById("practice-engine");
  if (!container) return;

  // State
  var queue = [];
  var current = 0;
  var score = 0;
  var streak = 0;
  var bestStreak = 0;
  var totalAnswered = 0;
  var startTime = Date.now();

  // Shuffle
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function startRound() {
    queue = shuffle(problems);
    current = 0;
    score = 0;
    streak = 0;
    bestStreak = 0;
    totalAnswered = 0;
    startTime = Date.now();
    showProblem();
  }

  function showProblem() {
    if (current >= queue.length) { showResults(); return; }
    var p = queue[current];
    var progress = (current + 1) + " / " + queue.length;

    container.innerHTML =
      '<div class="pe-header">' +
        '<span class="pe-progress">' + progress + '</span>' +
        '<div class="pe-stats">' +
          '<span class="pe-score">' + score + ' correct</span>' +
          '<span class="pe-streak' + (streak >= 3 ? ' pe-streak--hot' : '') + '">' + streak + ' streak</span>' +
        '</div>' +
      '</div>' +
      '<div class="pe-problem">' +
        '<span class="pe-problem__text">' + p.problem + '</span>' +
      '</div>' +
      '<div class="pe-input-row">' +
        '<input type="number" id="pe-answer" class="pe-input" inputmode="numeric" autocomplete="off" placeholder="?">' +
        '<button class="pe-submit" id="pe-submit">Check</button>' +
      '</div>' +
      '<div class="pe-feedback" id="pe-feedback"></div>' +
      '<div class="pe-dots-bar">' + buildDotsBar() + '</div>';

    var input = document.getElementById("pe-answer");
    var submitBtn = document.getElementById("pe-submit");
    input.focus();

    function submit() {
      var val = parseInt(input.value, 10);
      if (isNaN(val)) { input.classList.add("pe-input--shake"); setTimeout(function () { input.classList.remove("pe-input--shake"); }, 400); return; }
      checkAnswer(val);
    }

    submitBtn.addEventListener("click", submit);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") submit();
    });
  }

  function checkAnswer(val) {
    var p = queue[current];
    var fb = document.getElementById("pe-feedback");
    var input = document.getElementById("pe-answer");
    var submitBtn = document.getElementById("pe-submit");
    totalAnswered++;

    input.disabled = true;
    submitBtn.disabled = true;

    if (val === p.answer) {
      score++;
      streak++;
      if (streak > bestStreak) bestStreak = streak;
      fb.className = "pe-feedback pe-feedback--correct";
      fb.textContent = "Correct!";
      input.classList.add("pe-input--correct");
    } else {
      streak = 0;
      fb.className = "pe-feedback pe-feedback--wrong";
      fb.textContent = "The answer is " + p.answer;
      input.classList.add("pe-input--wrong");
    }

    setTimeout(function () {
      current++;
      showProblem();
    }, 1200);
  }

  function buildDotsBar() {
    var html = '';
    for (var i = 0; i < queue.length; i++) {
      var cls = 'pe-dot';
      if (i < totalAnswered) cls += ' pe-dot--done';
      if (i === current) cls += ' pe-dot--active';
      html += '<span class="' + cls + '"></span>';
    }
    return html;
  }

  function showResults() {
    var elapsed = Math.round((Date.now() - startTime) / 1000);
    var mins = Math.floor(elapsed / 60);
    var secs = elapsed % 60;
    var timeStr = mins > 0 ? mins + "m " + secs + "s" : secs + "s";
    var pct = Math.round((score / queue.length) * 100);
    var grade = pct === 100 ? "Perfect!" : pct >= 80 ? "Great job!" : pct >= 60 ? "Good effort!" : "Keep practicing!";

    container.innerHTML =
      '<div class="pe-results">' +
        '<h2 class="pe-results__title">' + grade + '</h2>' +
        '<div class="pe-results__stats">' +
          '<div class="pe-results__stat"><span class="pe-results__num">' + score + '/' + queue.length + '</span><span class="pe-results__label">Correct</span></div>' +
          '<div class="pe-results__stat"><span class="pe-results__num">' + pct + '%</span><span class="pe-results__label">Score</span></div>' +
          '<div class="pe-results__stat"><span class="pe-results__num">' + bestStreak + '</span><span class="pe-results__label">Best Streak</span></div>' +
          '<div class="pe-results__stat"><span class="pe-results__num">' + timeStr + '</span><span class="pe-results__label">Time</span></div>' +
        '</div>' +
        '<div class="pe-results__actions">' +
          '<button class="btn btn--cta" id="pe-retry">Try Again</button>' +
          '<a href="/practice/" class="btn btn--outline" style="color:var(--text-primary);border-color:var(--border-color)">All Practice Sets</a>' +
        '</div>' +
      '</div>';

    document.getElementById("pe-retry").addEventListener("click", startRound);
  }

  startRound();
})();
