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

  // Parse problem text into structured parts
  // "How many dots? •••  ••" → { text: "How many dots?", dots: 5 }
  // "3 + 2" → { text: "3 + 2", dots: 0 }
  function parseProblem(str) {
    var dotCount = 0;
    var text = str;
    // Count and remove bullet characters
    for (var i = 0; i < str.length; i++) {
      if (str.charCodeAt(i) === 0x2022) dotCount++;
    }
    if (dotCount > 0) {
      text = str.replace(/[\u2022\s]+$/g, "").replace(/\u2022/g, "").trim();
      // Remove trailing ? if text ends with "dots?"
      // Keep text clean: "How many dots?"
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
    var parsed = parseProblem(p.problem);
    var progress = (current + 1) + " / " + queue.length;

    var displayHtml;
    if (parsed.dots > 0) {
      // Dot counting problem: question on top, dots below
      displayHtml =
        '<div class="pe-problem">' +
          '<span class="pe-problem__label">' + parsed.text + '</span>' +
          buildDotGrid(parsed.dots) +
        '</div>';
    } else {
      // Math equation or text question
      displayHtml =
        '<div class="pe-problem">' +
          '<span class="pe-problem__text">' + parsed.text + '</span>' +
        '</div>';
    }

    container.innerHTML =
      '<div class="pe-header">' +
        '<span class="pe-progress">' + progress + '</span>' +
        '<div class="pe-stats">' +
          '<span class="pe-score">' + score + ' correct</span>' +
          '<span class="pe-streak' + (streak >= 3 ? ' pe-streak--hot' : '') + '">' + streak + ' streak</span>' +
        '</div>' +
      '</div>' +
      displayHtml +
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

  // Print worksheet with all problems
  window.printPractice = function () {
    var title = document.querySelector("h1");
    var titleText = title ? title.textContent : "Practice";

    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
    html += '<title>' + titleText + ' — Math Direct</title>';
    html += '<style>';
    html += 'body{font-family:Georgia,"Times New Roman",serif;max-width:7in;margin:0.5in auto;color:#000;font-size:11pt;line-height:1.5}';
    html += 'h1{font-family:sans-serif;font-size:16pt;border-bottom:2px solid #000;padding-bottom:4pt;margin-bottom:16pt}';
    html += 'h1 span{font-size:10pt;font-weight:400;color:#555;float:right;margin-top:4pt}';
    html += '.problems{display:grid;grid-template-columns:1fr 1fr;gap:16pt 24pt}';
    html += '.prob{page-break-inside:avoid;padding:8pt;border:1px solid #ddd}';
    html += '.prob-num{font-family:sans-serif;font-size:8pt;font-weight:700;color:#999;margin-bottom:4pt}';
    html += '.prob-text{font-family:"Comic Sans MS",cursive,sans-serif;font-size:14pt;font-weight:700;margin-bottom:4pt}';
    html += '.prob-dots{display:flex;flex-direction:column;gap:3pt;margin:6pt 0}';
    html += '.prob-dots-row{display:flex;gap:4pt}';
    html += '.prob-dot{width:12pt;height:12pt;border-radius:50%;background:#000;display:inline-block}';
    html += '.prob-answer{display:inline-block;min-width:2em;border-bottom:2px solid #000;height:1.5em;margin-left:4pt}';
    html += '.answers{margin-top:24pt;padding-top:12pt;border-top:1px solid #ccc;font-size:9pt;color:#666}';
    html += '@media print{body{margin:0.3in}.prob{border-color:#ccc}}';
    html += '</style></head><body>';

    html += '<h1>' + titleText + '<span>Math Direct \u00B7 ' + problems.length + ' problems</span></h1>';
    html += '<div class="problems">';

    for (var i = 0; i < problems.length; i++) {
      var p = problems[i];
      var parsed = parseProblem(p.problem);
      html += '<div class="prob">';
      html += '<div class="prob-num">' + (i + 1) + '.</div>';
      html += '<div class="prob-text">' + parsed.text + '</div>';
      if (parsed.dots > 0) {
        html += '<div class="prob-dots">';
        var placed = 0;
        while (placed < parsed.dots) {
          var rowSize = Math.min(5, parsed.dots - placed);
          html += '<div class="prob-dots-row">';
          for (var j = 0; j < rowSize; j++) {
            html += '<span class="prob-dot"></span>';
            placed++;
          }
          html += '</div>';
        }
        html += '</div>';
      }
      html += '<div>Answer: <span class="prob-answer"></span></div>';
      html += '</div>';
    }

    html += '</div>';

    // Answer key
    html += '<div class="answers"><strong>Answer Key:</strong> ';
    for (var k = 0; k < problems.length; k++) {
      html += (k + 1) + ') ' + problems[k].answer;
      if (k < problems.length - 1) html += ' &nbsp; ';
    }
    html += '</div>';

    html += '</body></html>';

    var win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(function () { win.print(); }, 300);
    }
  };

  startRound();
})();
