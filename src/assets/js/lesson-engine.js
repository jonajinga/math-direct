(function () {
  var lessonDataEl = document.getElementById("lesson-data");
  if (!lessonDataEl) return;

  var lesson = JSON.parse(lessonDataEl.textContent);
  var steps = lesson.steps;
  var currentStep = 0;
  var visualHidden = false;

  // DOM
  var childText = document.getElementById("child-text");
  var visualContainer = document.getElementById("visual-container");
  var stepDots = document.querySelectorAll(".step-dot");
  var stepNumber = document.getElementById("step-number");
  var stepSay = document.getElementById("step-say");
  var stepDo = document.getElementById("step-do");
  var praiseBox = document.getElementById("praise-box");
  var praiseText = document.getElementById("praise-text");
  var correctBox = document.getElementById("correct-box");
  var correctText = document.getElementById("correct-text");
  var prevBtn = document.getElementById("prev-btn");
  var nextBtn = document.getElementById("next-btn");
  var visualRemote = document.getElementById("visual-remote");

  // ─── Auto-fit: shrink child text to fit on one line ───
  function fitChildText() {
    if (!childText) return;
    // Reset to CSS default
    childText.style.fontSize = "";
    // Allow a frame for layout
    requestAnimationFrame(function () {
      var parent = childText.parentElement;
      if (!parent) return;
      var maxW = parent.clientWidth - 16; // small padding
      var tries = 0;
      while (childText.scrollWidth > maxW && tries < 20) {
        var current = parseFloat(window.getComputedStyle(childText).fontSize);
        childText.style.fontSize = (current * 0.9) + "px";
        tries++;
      }
    });
  }

  // ─── Dot rendering: rows of 5, separator after 10 ───
  function renderDots(count, animated) {
    if (!count || visualHidden) { visualContainer.innerHTML = ""; return; }
    var html = '<div class="math-dots">';
    var placed = 0;
    // If count > 10, show a tens block (two rows of 5) then a separator
    var tens = Math.floor(count / 10);
    var remainder = count % 10;

    for (var t = 0; t < tens; t++) {
      // Two rows of 5 for each ten
      html += '<div class="math-dots__row">';
      for (var i = 0; i < 5; i++) { html += dotSpan(placed++, animated); }
      html += '</div>';
      html += '<div class="math-dots__row">';
      for (var i = 0; i < 5; i++) { html += dotSpan(placed++, animated); }
      html += '</div>';
      if (remainder > 0 || t < tens - 1) html += '<div class="math-dots__separator"></div>';
    }
    // Remaining dots in rows of 5
    while (placed < count) {
      var rowSize = Math.min(5, count - placed);
      html += '<div class="math-dots__row">';
      for (var i = 0; i < rowSize; i++) { html += dotSpan(placed++, animated); }
      html += '</div>';
    }
    html += '</div>';
    visualContainer.innerHTML = html;
  }

  function getAnimDelay() {
    var slider = document.getElementById("speed-slider");
    var val = slider ? parseInt(slider.value, 10) : 50;
    // At 0: 800ms per dot (very slow). At 50: 400ms. At 100: 150ms (fast).
    return 800 - (val / 100) * 650;
  }

  function dotSpan(index, animated) {
    if (animated) {
      var delay = index * getAnimDelay();
      return '<span class="math-dot math-dot--animated" style="animation-delay:' + delay + 'ms"></span>';
    }
    return '<span class="math-dot"></span>';
  }

  // ─── Tally rendering: groups of 5 (four marks + diagonal slash) ───
  function renderTally(count) {
    if (!count || visualHidden) { visualContainer.innerHTML = ""; return; }
    var fullGroups = Math.floor(count / 5);
    var leftover = count % 5;
    var html = '<div class="math-tally">';
    for (var g = 0; g < fullGroups; g++) {
      html += '<div class="math-tally__group">';
      for (var m = 0; m < 4; m++) html += '<div class="math-tally__mark"></div>';
      html += '<div class="math-tally__slash"></div>';
      html += '</div>';
    }
    if (leftover > 0) {
      html += '<div class="math-tally__group">';
      for (var m = 0; m < leftover; m++) html += '<div class="math-tally__mark"></div>';
      html += '</div>';
    }
    html += '</div>';
    visualContainer.innerHTML = html;
  }

  // ─── Interactive comparison buttons ───
  function renderCompare(step) {
    if (visualHidden) { visualContainer.innerHTML = ""; return; }
    var answer = step.compareAnswer; // ">", "<", or "="
    var html = '<div class="math-compare">';
    ["<", "=", ">"].forEach(function (sym) {
      html += '<button class="math-compare__btn" data-answer="' + sym + '" type="button" aria-label="' + sym + '">' + sym + '</button>';
    });
    html += '</div>';
    visualContainer.innerHTML = html;

    // Attach click handlers
    var btns = visualContainer.querySelectorAll(".math-compare__btn");
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (btn.disabled) return;
        var picked = btn.getAttribute("data-answer");
        btns.forEach(function (b) { b.disabled = true; });
        if (picked === answer) {
          btn.classList.add("is-correct");
          // Show praise, hide correct
          praiseBox.classList.add("is-visible");
          correctBox.classList.remove("is-visible");
        } else {
          btn.classList.add("is-wrong");
          // Highlight the right answer after a short delay
          setTimeout(function () {
            btns.forEach(function (b) {
              if (b.getAttribute("data-answer") === answer) b.classList.add("is-correct");
            });
          }, 600);
          // Show correct, hide praise
          correctBox.classList.add("is-visible");
          praiseBox.classList.remove("is-visible");
        }
      });
    });
  }

  // ─── Dot groups: side-by-side blocks for equations/comparisons ───
  function renderDotGroups(groups, symbols) {
    if (!groups || !groups.length || visualHidden) { visualContainer.innerHTML = ""; return; }
    var html = '<div class="math-dot-groups">';
    for (var g = 0; g < groups.length; g++) {
      if (g > 0 && symbols && symbols[g - 1]) {
        html += '<span class="math-dot-groups__symbol">' + symbols[g - 1] + '</span>';
      }
      html += buildDotGroup(groups[g]);
    }
    html += '</div>';
    visualContainer.innerHTML = html;
  }

  function buildDotGroup(count) {
    var html = '<div class="math-dot-group">';
    var placed = 0;
    var tens = Math.floor(count / 10);
    var remainder = count % 10;
    for (var t = 0; t < tens; t++) {
      html += '<div class="math-dot-group__row">';
      for (var i = 0; i < 5; i++) { html += '<span class="math-dot"></span>'; placed++; }
      html += '</div><div class="math-dot-group__row">';
      for (var i = 0; i < 5; i++) { html += '<span class="math-dot"></span>'; placed++; }
      html += '</div>';
      if (remainder > 0 || t < tens - 1) html += '<div class="math-dot-group__separator"></div>';
    }
    while (placed < count) {
      var rowSize = Math.min(5, count - placed);
      html += '<div class="math-dot-group__row">';
      for (var i = 0; i < rowSize; i++) { html += '<span class="math-dot"></span>'; placed++; }
      html += '</div>';
    }
    html += '<div class="math-dot-group__label">' + count + '</div>';
    html += '</div>';
    return html;
  }

  // ─── Number line renderer ───
  function renderNumberLine(start, end, highlight) {
    if (visualHidden) { visualContainer.innerHTML = ""; return; }
    var count = end - start + 1;
    var dense = count > 11;
    var html = '<div class="math-numberline-wrap"><div class="math-numberline' + (dense ? ' math-numberline--dense' : '') + '">';
    for (var i = start; i <= end; i++) {
      var isHL = highlight !== undefined && highlight === i;
      html += '<div class="math-numberline__item">';
      if (isHL) html += '<div class="math-numberline__hop-dot"></div>';
      html += '<div class="math-numberline__tick"></div>';
      html += '<div class="math-numberline__label' + (isHL ? ' math-numberline__label--active' : '') + '">' + i + '</div>';
      html += '</div>';
    }
    html += '</div></div>';
    visualContainer.innerHTML = html;
  }

  function renderVisual(step) {
    if (!visualContainer) return;
    if (visualHidden || !step.visual || step.visual === "none") {
      visualContainer.innerHTML = "";
      if (visualRemote) visualRemote.style.display = "none";
      return;
    }
    // Show/hide visual remote: play/reset/speed/eye only for animated visuals
    // Dots toggle is always visible (it's in the remote bar but never hidden)
    var hasAnimation = step.visual === "dots" || step.visual === "tally";
    var playBtn = document.getElementById("btn-play-pause");
    var resetBtn = document.getElementById("btn-reset");
    var speedSlider = document.getElementById("speed-slider");
    var toggleVisBtn = document.getElementById("btn-toggle-visual");
    [playBtn, resetBtn, speedSlider, toggleVisBtn].forEach(function (el) {
      if (el) el.style.display = hasAnimation ? "" : "none";
    });
    // Always show the remote bar (dots toggle is there)
    if (visualRemote) visualRemote.style.display = "";

    switch (step.visual) {
      case "dots":
        renderDots(step.dotCount || 0, false);
        break;
      case "dot-groups":
        renderDotGroups(step.dotGroups, step.groupSymbols);
        break;
      case "tally":
        renderTally(step.dotCount || step.tallyCount || 0);
        break;
      case "compare":
        renderCompare(step);
        break;
      case "equation":
        // If dotGroups provided, show them; otherwise empty
        if (step.dotGroups) renderDotGroups(step.dotGroups, step.groupSymbols);
        else visualContainer.innerHTML = "";
        break;
      case "numberline":
        renderNumberLine(step.nlStart || 0, step.nlEnd || 10, step.nlHighlight);
        break;
      case "placevalue":
        visualContainer.innerHTML = "";
        break;
      default:
        visualContainer.innerHTML = "";
    }
  }

  // ─── Auto-dots: inject dot patterns beneath .math-num elements ───
  var showAutoDots = true;
  try {
    var stored = localStorage.getItem("math-direct-show-dots");
    if (stored === "false") showAutoDots = false;
  } catch (e) {}

  // ─── Convert inline bullet spans to proper dot grids (rows of 5) ───
  function convertInlineDots() {
    if (!childText) return;
    var spans = childText.querySelectorAll(".math-dots");
    spans.forEach(function (span) {
      // Count bullet characters (•) in text
      var text = span.textContent;
      var count = 0;
      for (var i = 0; i < text.length; i++) {
        if (text[i] === "\u2022") count++;
      }
      if (count === 0) return;
      // Build dot grid with rows of 5
      var grid = document.createElement("span");
      grid.className = "math-dots-inline";
      var placed = 0;
      while (placed < count) {
        var rowSize = Math.min(5, count - placed);
        var row = document.createElement("span");
        row.className = "math-dots-inline__row";
        for (var j = 0; j < rowSize; j++) {
          var dot = document.createElement("span");
          dot.className = "math-dot";
          row.appendChild(dot);
          placed++;
        }
        grid.appendChild(row);
      }
      span.textContent = "";
      span.appendChild(grid);
    });
  }

  function injectAutoDots() {
    if (!childText) return;
    childText.setAttribute("data-show-dots", showAutoDots ? "true" : "false");
    var nums = childText.querySelectorAll(".math-num");
    nums.forEach(function (el) {
      if (el.parentNode.classList && el.parentNode.classList.contains("math-num-with-dots")) return;
      var val = parseInt(el.textContent, 10);
      if (isNaN(val) || val < 0 || val > 20) return;
      var wrapper = document.createElement("span");
      wrapper.className = "math-num-with-dots";
      el.parentNode.insertBefore(wrapper, el);
      wrapper.appendChild(el);
      if (val > 0) {
        var dotsDiv = document.createElement("span");
        dotsDiv.className = "math-num-autodots";
        var placed = 0;
        while (placed < val) {
          var rowSize = Math.min(5, val - placed);
          var row = document.createElement("span");
          row.className = "math-num-autodots__row";
          for (var i = 0; i < rowSize; i++) {
            var dot = document.createElement("span");
            dot.className = "math-dot";
            row.appendChild(dot);
            placed++;
          }
          dotsDiv.appendChild(row);
        }
        wrapper.appendChild(dotsDiv);
      }
    });
  }

  function toggleAutoDots() {
    showAutoDots = !showAutoDots;
    try { localStorage.setItem("math-direct-show-dots", showAutoDots ? "true" : "false"); } catch (e) {}
    var btn = document.getElementById("btn-toggle-dots");
    if (btn) btn.classList.toggle("is-active", showAutoDots);
    if (childText) childText.setAttribute("data-show-dots", showAutoDots ? "true" : "false");
    // Re-render current step to add/remove dots
    if (steps[currentStep]) showStep(currentStep);
  }

  // ─── Clickable ? to reveal answer ───
  // Replace bare ? in display HTML before setting innerHTML
  function wrapQuestionMarksInDisplay(html) {
    if (html.indexOf("math-symbol-question") !== -1) return html;
    return html.replace(/\?/g, "<span class='math-symbol-question'>?</span>");
  }

  function computeAnswer(step) {
    if (step.answer !== undefined) return step.answer;
    var text = (step.display || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    var m;
    // a + b = ?
    m = text.match(/(\d+)\s*\+\s*(\d+)\s*=\s*\?/);
    if (m) return parseInt(m[1], 10) + parseInt(m[2], 10);
    // a − b = ?
    m = text.match(/(\d+)\s*[−\u2212\-]\s*(\d+)\s*=\s*\?/);
    if (m) return parseInt(m[1], 10) - parseInt(m[2], 10);
    // N = a + ? (missing addend: answer = N - a)
    m = text.match(/(\d+)\s*=\s*(\d+)\s*\+\s*\?/);
    if (m) return parseInt(m[1], 10) - parseInt(m[2], 10);
    // N = ? + b (missing addend: answer = N - b)
    m = text.match(/(\d+)\s*=\s*\?\s*\+\s*(\d+)/);
    if (m) return parseInt(m[1], 10) - parseInt(m[2], 10);
    // a + ? = N (missing addend: answer = N - a)
    m = text.match(/(\d+)\s*\+\s*\?\s*=\s*(\d+)/);
    if (m) return parseInt(m[2], 10) - parseInt(m[1], 10);
    // ? + b = N (missing addend: answer = N - b)
    m = text.match(/\?\s*\+\s*(\d+)\s*=\s*(\d+)/);
    if (m) return parseInt(m[2], 10) - parseInt(m[1], 10);
    // a − ? = N (answer = a - N)
    m = text.match(/(\d+)\s*[−\u2212\-]\s*\?\s*=\s*(\d+)/);
    if (m) return parseInt(m[1], 10) - parseInt(m[2], 10);
    // ? − b = N (answer = N + b)
    m = text.match(/\?\s*[−\u2212\-]\s*(\d+)\s*=\s*(\d+)/);
    if (m) return parseInt(m[2], 10) + parseInt(m[1], 10);
    // N − a = ?
    m = text.match(/(\d+)\s*[−\u2212\-]\s*(\d+)\s*=\s*\?/);
    if (m) return parseInt(m[1], 10) - parseInt(m[2], 10);
    return undefined;
  }

  // Store current answer for the active step
  var currentAnswer = undefined;
  var currentStepHasReveal = false;

  function prepareReveal(step) {
    if (step.visual === "compare") { currentAnswer = undefined; currentStepHasReveal = false; return; }
    currentAnswer = computeAnswer(step);
    currentStepHasReveal = currentAnswer !== undefined;
  }

  function buildInlineDots(count) {
    var dotsDiv = document.createElement("span");
    dotsDiv.className = "math-num-autodots";
    var placed = 0;
    while (placed < count) {
      var rowSize = Math.min(5, count - placed);
      var row = document.createElement("span");
      row.className = "math-num-autodots__row";
      for (var i = 0; i < rowSize; i++) {
        var dot = document.createElement("span");
        dot.className = "math-dot";
        row.appendChild(dot);
        placed++;
      }
      dotsDiv.appendChild(row);
    }
    return dotsDiv;
  }

  // Move number line highlight dot to the answer position
  function moveNumberLineToAnswer(answer) {
    if (!visualContainer) return;
    var items = visualContainer.querySelectorAll(".math-numberline__item");
    if (!items.length) return;
    // Remove existing hop dot and active label
    items.forEach(function (item) {
      var hop = item.querySelector(".math-numberline__hop-dot");
      if (hop) hop.remove();
      var label = item.querySelector(".math-numberline__label");
      if (label) label.classList.remove("math-numberline__label--active");
    });
    // Find the item matching the answer and add hop dot + active label
    items.forEach(function (item) {
      var label = item.querySelector(".math-numberline__label");
      if (label && parseInt(label.textContent, 10) === answer) {
        label.classList.add("math-numberline__label--active");
        var dot = document.createElement("div");
        dot.className = "math-numberline__hop-dot";
        dot.style.animation = "correctPop 0.4s ease";
        item.insertBefore(dot, item.firstChild);
      }
    });
  }

  // Restore number line to original highlight (from step data)
  function restoreNumberLineHighlight() {
    if (!visualContainer) return;
    var step = steps[currentStep];
    if (!step || step.visual !== "numberline") return;
    var items = visualContainer.querySelectorAll(".math-numberline__item");
    items.forEach(function (item) {
      var hop = item.querySelector(".math-numberline__hop-dot");
      if (hop) hop.remove();
      var label = item.querySelector(".math-numberline__label");
      if (label) {
        label.classList.remove("math-numberline__label--active");
        if (step.nlHighlight !== undefined && parseInt(label.textContent, 10) === step.nlHighlight) {
          label.classList.add("math-numberline__label--active");
          var dot = document.createElement("div");
          dot.className = "math-numberline__hop-dot";
          item.insertBefore(dot, item.firstChild);
        }
      }
    });
  }

  // Event delegation: single click listener on childText — toggle reveal
  if (childText) {
    childText.addEventListener("click", function (e) {
      var el = e.target.closest(".math-symbol-question");
      if (!el || currentAnswer === undefined) return;
      if (el.classList.contains("is-revealed")) {
        // Hide answer — restore ?
        el.textContent = "?";
        el.classList.remove("is-revealed", "math-num-with-dots");
        if (praiseBox) praiseBox.classList.remove("is-visible");
        restoreNumberLineHighlight();
        return;
      }
      // Reveal answer
      el.textContent = currentAnswer;
      el.classList.add("is-revealed", "math-num-with-dots");
      if (currentAnswer > 0 && currentAnswer <= 20) {
        el.appendChild(buildInlineDots(currentAnswer));
      }
      if (childText) childText.setAttribute("data-show-dots", showAutoDots ? "true" : "false");
      if (praiseBox) praiseBox.classList.add("is-visible");
      // Move number line dot to the answer
      moveNumberLineToAnswer(currentAnswer);
    });
  }

  function showStep(index) {
    if (index < 0 || index >= steps.length) return;
    currentStep = index;
    var step = steps[currentStep];

    // Hide child text only when number line IS the display (e.g. "Count: 0 to 10")
    // Keep it visible when there's a real equation alongside the number line
    var isNumberLineOnly = step.visual === "numberline" && /^(Count|Find|Number Line)/.test(step.display);
    if (isNumberLineOnly) {
      childText.innerHTML = "";
      childText.style.display = "none";
    } else {
      childText.style.display = "";
      childText.innerHTML = wrapQuestionMarksInDisplay(step.display);
      childText.style.fontSize = "";
      convertInlineDots();
      injectAutoDots();
      fitChildText();
    }
    prepareReveal(step);
    // If step has a ? AND uses dots visual, hide the visual (wrong count).
    // But keep number lines, compare buttons, etc.
    var suppressVisual = currentStepHasReveal && (step.visual === "dots" || step.visual === "tally");
    if (suppressVisual) {
      if (visualContainer) visualContainer.innerHTML = "";
      if (visualRemote) visualRemote.style.display = "";
      var playBtn = document.getElementById("btn-play-pause");
      var resetBtn = document.getElementById("btn-reset");
      var speedSlider = document.getElementById("speed-slider");
      var toggleVisBtn = document.getElementById("btn-toggle-visual");
      [playBtn, resetBtn, speedSlider, toggleVisBtn].forEach(function (el) {
        if (el) el.style.display = "none";
      });
    } else {
      renderVisual(step);
    }

    stepNumber.textContent = "Step " + (currentStep + 1);
    stepSay.innerHTML = step.say || "";
    stepDo.innerHTML = step.do || "";

    if (step.praise) { praiseBox.classList.add("is-visible"); praiseText.innerHTML = step.praise; }
    else praiseBox.classList.remove("is-visible");
    if (step.correct) { correctBox.classList.add("is-visible"); correctText.innerHTML = step.correct; }
    else correctBox.classList.remove("is-visible");

    stepDots.forEach(function (dot, i) {
      dot.classList.remove("is-active", "is-done");
      if (i === currentStep) dot.classList.add("is-active");
      else if (i < currentStep) dot.classList.add("is-done");
    });

    prevBtn.disabled = currentStep === 0;

    if (currentStep === steps.length - 1) {
      nextBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
      nextBtn.title = "Complete lesson";
      nextBtn.setAttribute("aria-label", "Complete lesson");
    } else {
      nextBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
      nextBtn.title = "Next step";
      nextBtn.setAttribute("aria-label", "Next step");
    }
  }

  function padId(id) {
    var s = String(id);
    while (s.length < 2) s = "0" + s;
    return s;
  }

  var nextLessonId = lesson.id < 150 ? lesson.id + 1 : null;
  var nextLessonUrl = nextLessonId ? "/lessons/lesson-" + padId(nextLessonId) + "/" : null;

  function completeLesson() {
    if (window.mathProgress) window.mathProgress.markComplete(lesson.id);
    if (nextLessonUrl) {
      window.location.href = nextLessonUrl;
    } else {
      window.location.href = "/lessons/";
    }
  }

  function showCompletionScreen() {
    if (window.mathProgress) window.mathProgress.markComplete(lesson.id);
    var shell = document.querySelector(".lesson-shell");
    if (shell) shell.classList.add("hidden");
    var screen = document.getElementById("practice-round");
    if (screen) {
      var html = '<div class="practice-round__inner">' +
        '<h2 class="practice-round__title">Lesson ' + lesson.id + ' Complete!</h2>' +
        '<p class="practice-round__instruction">Great work!</p>' +
        '<div class="practice-round__actions" style="display:flex;flex-direction:column;align-items:center;gap:var(--space-md)">';
      if (nextLessonUrl) {
        html += '<a href="' + nextLessonUrl + '" class="btn btn--cta">Next Lesson &rarr;</a>';
      }
      html += '<a href="/lessons/" class="btn btn--outline" style="color:var(--text-primary);border-color:var(--border-color)">Back to Dashboard</a>';
      html += '</div></div>';
      screen.innerHTML = html;
      screen.classList.remove("hidden");
    }
  }

  function goNext() {
    if (currentStep < steps.length - 1) showStep(currentStep + 1);
    else showCompletionScreen();
  }

  function goPrev() { if (currentStep > 0) showStep(currentStep - 1); }

  function playPause() {
    var step = steps[currentStep];
    if (visualHidden) return;
    if (step.visual === "dots" && step.dotCount) {
      renderDots(step.dotCount, true);
    } else if (step.visual === "tally" && (step.dotCount || step.tallyCount)) {
      renderTally(step.dotCount || step.tallyCount);
    }
  }

  function resetVisual() {
    renderVisual(steps[currentStep]);
  }

  function toggleVisual() {
    visualHidden = !visualHidden;
    var eyeOpen = document.getElementById("icon-eye-open");
    var eyeClosed = document.getElementById("icon-eye-closed");
    if (visualHidden) {
      visualContainer.innerHTML = "";
      if (eyeOpen) eyeOpen.classList.add("hidden");
      if (eyeClosed) eyeClosed.classList.remove("hidden");
    } else {
      renderVisual(steps[currentStep]);
      if (eyeOpen) eyeOpen.classList.remove("hidden");
      if (eyeClosed) eyeClosed.classList.add("hidden");
    }
  }

  // Expose to inline onclick
  window.playPause = playPause;
  window.resetVisual = resetVisual;
  window.toggleVisual = toggleVisual;
  window.toggleAutoDots = toggleAutoDots;
  window.nextStep = goNext;
  window.prevStep = goPrev;
  window.completeLesson = completeLesson;

  // Keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.key >= "1" && e.key <= "9" && !e.ctrlKey && !e.metaKey) {
      var stepIndex = parseInt(e.key, 10) - 1;
      if (stepIndex < steps.length) { e.preventDefault(); showStep(stepIndex); }
      return;
    }
    switch (e.key) {
      case "ArrowRight": e.preventDefault(); goNext(); break;
      case "ArrowLeft": e.preventDefault(); goPrev(); break;
      case " ": e.preventDefault(); playPause(); break;
      case "Escape": e.preventDefault(); window.location.href = "/lessons/"; break;
      case "r": if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); resetVisual(); } break;
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    // Init dot toggle button state
    var dotBtn = document.getElementById("btn-toggle-dots");
    if (dotBtn) dotBtn.classList.toggle("is-active", showAutoDots);

    showStep(0);

    // Auto-hide header on lesson pages
    var header = document.querySelector(".site-header");
    if (header && document.body.classList.contains("page-lesson")) {
      var hideTimer = null;
      document.addEventListener("mousemove", function (e) {
        if (e.clientY < 20) {
          header.classList.add("is-visible");
          clearTimeout(hideTimer);
          hideTimer = setTimeout(function () { header.classList.remove("is-visible"); }, 3000);
        }
      });
      var touchStartY = 0;
      document.addEventListener("touchstart", function (e) { touchStartY = e.touches[0].clientY; });
      document.addEventListener("touchmove", function (e) {
        if (touchStartY < 30 && e.touches[0].clientY - touchStartY > 20) {
          header.classList.add("is-visible");
          clearTimeout(hideTimer);
          hideTimer = setTimeout(function () { header.classList.remove("is-visible"); }, 3000);
        }
      });
    }
  });
})();
