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

  function renderDots(count) {
    if (!count || visualHidden) { visualContainer.innerHTML = ""; return; }
    var html = '<div class="math-dots">';
    for (var i = 0; i < count; i++) {
      html += '<span class="math-dot"></span>';
    }
    html += '</div>';
    visualContainer.innerHTML = html;
  }

  function renderVisual(step) {
    if (!visualContainer) return;
    if (visualHidden || !step.visual || step.visual === "none") {
      visualContainer.innerHTML = "";
      if (visualRemote) visualRemote.style.display = "none";
      return;
    }
    if (visualRemote) visualRemote.style.display = "";

    switch (step.visual) {
      case "dots":
        renderDots(step.dotCount || 0);
        break;
      case "equation":
        visualContainer.innerHTML = "";
        break;
      case "numberline":
        visualContainer.innerHTML = '<div class="math-numberline"><div class="math-numberline__track"></div></div>';
        break;
      case "tally":
        visualContainer.innerHTML = "";
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
    // Animate dots appearing one by one
    var step = steps[currentStep];
    if (step.visual === "dots" && step.dotCount && !visualHidden) {
      visualContainer.innerHTML = '<div class="math-dots"></div>';
      var dotsContainer = visualContainer.querySelector(".math-dots");
      var count = step.dotCount;
      var speed = parseInt(document.getElementById("speed-slider").value, 10);
      var delay = 200 + (100 - speed) * 5;
      for (var i = 0; i < count; i++) {
        (function (idx) {
          setTimeout(function () {
            var dot = document.createElement("span");
            dot.className = "math-dot math-dot--animated";
            dot.style.animationDelay = "0ms";
            dotsContainer.appendChild(dot);
          }, idx * delay);
        })(i);
      }
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
