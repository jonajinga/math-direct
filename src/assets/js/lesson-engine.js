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
    var html = '<div class="math-numberline"><div class="math-numberline__track">';
    for (var i = start; i <= end; i++) {
      var pct = ((i - start) / (end - start)) * 100;
      var isHL = highlight !== undefined && highlight === i;
      html += '<div class="math-numberline__tick" style="left:' + pct + '%"></div>';
      html += '<div class="math-numberline__label' + (isHL ? ' math-numberline__label--active' : '') + '" style="left:' + pct + '%">' + i + '</div>';
    }
    if (highlight !== undefined) {
      var hlPct = ((highlight - start) / (end - start)) * 100;
      html += '<div class="math-numberline__hop" style="left:' + hlPct + '%"></div>';
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
    // Always show remote (for dots toggle); hide play/reset/speed/eye when no animation
    if (visualRemote) visualRemote.style.display = "";
    var hasAnimation = step.visual === "dots" || step.visual === "tally";
    var playBtn = document.getElementById("btn-play-pause");
    var resetBtn = document.getElementById("btn-reset");
    var speedSlider = document.getElementById("speed-slider");
    var toggleVisBtn = document.getElementById("btn-toggle-visual");
    [playBtn, resetBtn, speedSlider, toggleVisBtn].forEach(function (el) {
      if (el) el.style.display = hasAnimation ? "" : "none";
    });

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
  try { var stored = localStorage.getItem("math-direct-show-dots"); if (stored !== null) showAutoDots = stored === "true"; } catch (e) {}

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
  }

  // ─── Clickable ? to reveal answer ───
  // Replace bare ? in display HTML before setting innerHTML
  function wrapQuestionMarksInDisplay(html) {
    // Skip if already has math-symbol-question spans
    if (html.indexOf("math-symbol-question") !== -1) return html;
    // Replace bare ? with the styled clickable span
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

  function injectRevealButtons(step) {
    if (!childText) return;
    var qMarks = childText.querySelectorAll(".math-symbol-question");
    if (!qMarks.length) return;
    // Don't make clickable if this is a compare step (those have their own buttons)
    if (step.visual === "compare") return;
    var answer = computeAnswer(step);
    if (answer === undefined) return;
    qMarks.forEach(function (el) {
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      el.title = "Tap to reveal answer";
      function reveal() {
        if (el.classList.contains("is-revealed")) return;
        el.textContent = answer;
        el.classList.add("is-revealed");
        praiseBox.classList.add("is-visible");
      }
      el.addEventListener("click", reveal);
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); reveal(); }
      });
    });
  }

  function showStep(index) {
    if (index < 0 || index >= steps.length) return;
    currentStep = index;
    var step = steps[currentStep];

    childText.innerHTML = wrapQuestionMarksInDisplay(step.display);
    injectAutoDots();
    injectRevealButtons(step);
    renderVisual(step);

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

  function completeLesson() {
    if (window.mathProgress) window.mathProgress.markComplete(lesson.id);
    window.location.href = "/lessons/";
  }

  function goNext() {
    if (currentStep < steps.length - 1) showStep(currentStep + 1);
    else completeLesson();
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
