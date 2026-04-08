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

  function dotSpan(index, animated) {
    if (animated) {
      return '<span class="math-dot math-dot--animated" style="animation-delay:' + (index * 150) + 'ms"></span>';
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

  function renderVisual(step) {
    if (!visualContainer) return;
    if (visualHidden || !step.visual || step.visual === "none") {
      visualContainer.innerHTML = "";
      if (visualRemote) visualRemote.style.display = "none";
      return;
    }
    if (visualRemote) visualRemote.style.display = step.visual === "compare" ? "none" : "";

    switch (step.visual) {
      case "dots":
        renderDots(step.dotCount || 0, false);
        break;
      case "tally":
        renderTally(step.dotCount || step.tallyCount || 0);
        break;
      case "compare":
        renderCompare(step);
        break;
      case "equation":
        visualContainer.innerHTML = "";
        break;
      case "numberline":
        visualContainer.innerHTML = '<div class="math-numberline"><div class="math-numberline__track"></div></div>';
        break;
      case "placevalue":
        visualContainer.innerHTML = "";
        break;
      default:
        visualContainer.innerHTML = "";
    }
  }

  function showStep(index) {
    if (index < 0 || index >= steps.length) return;
    currentStep = index;
    var step = steps[currentStep];

    childText.innerHTML = step.display;
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
