// Marks finished lessons and tests for the selected child, and points the
// Continue buttons at the next lesson.
(function () {
  "use strict";
  var P = window.mathProgress;
  if (!P) return;
  var profile = P.getActiveProfile();
  if (!profile) return;
  var done = new Set(profile.completed);

  var cards = document.querySelectorAll("[data-lesson-id]");
  for (var i = 0; i < cards.length; i++) {
    var id = cards[i].getAttribute("data-lesson-id");
    var hist = profile.lessons && profile.lessons[id];
    var last = hist && hist.length ? hist[hist.length - 1] : null;
    if (done.has(id)) { cards[i].classList.add("is-done"); cards[i].title = "Finished"; }
    else if (last && last.repeat) { cards[i].classList.add("is-repeat"); cards[i].title = "Taught once; repeat it"; }
  }

  var tests = document.querySelectorAll("[data-test-id]");
  for (var j = 0; j < tests.length; j++) {
    var tid = tests[j].getAttribute("data-test-id");
    var th = profile.tests && profile.tests[tid];
    var tl = th && th.length ? th[th.length - 1] : null;
    if (tl) tests[j].classList.add(tl.passed ? "is-done" : "is-repeat");
  }

  var boxes = document.querySelectorAll("[data-level-actions]");
  for (var k = 0; k < boxes.length; k++) {
    var box = boxes[k];
    var level = box.getAttribute("data-level"), total = Number(box.getAttribute("data-total")), slug = box.getAttribute("data-slug");
    var next = P.nextLesson(level, total);
    var btn = box.querySelector("[data-continue]");
    var anyDone = profile.completed.some(function (c) { return c.indexOf(level + "-") === 0; });
    if (btn && (anyDone || next > 1)) {
      var testsAttr = box.getAttribute("data-tests");
      var step = P.nextStep(level, total, testsAttr ? JSON.parse(testsAttr) : [], slug);
      btn.href = step.url;
      btn.textContent = "Continue: " + step.label;
    }
    var bar = box.querySelector("[data-progress]");
    if (bar) {
      var n = profile.completed.filter(function (c) { return c.indexOf(level + "-") === 0; }).length;
      bar.style.setProperty("--p", Math.min(1, n / total));
      var lbl = box.querySelector("[data-progress-label]");
      if (lbl) lbl.textContent = n + " of " + total + " lessons finished";
    }
  }
})();
