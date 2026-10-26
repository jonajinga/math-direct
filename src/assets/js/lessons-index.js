// Marks finished lessons and tests for the selected child, points the
// Continue buttons at the next lesson, and lets the teacher change a mark by
// hand: finished, to repeat, or reset.
(function () {
  "use strict";
  var P = window.mathProgress;
  if (!P) return;

  function day(iso) {
    try { return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); } catch (e) { return ""; }
  }

  // ── Marks on the chips, the Continue button, and the progress bar ──
  function paint() {
    var profile = P.getActiveProfile();
    if (!profile) return;

    var chips = document.querySelectorAll("[data-lesson-id]");
    var levelOf = {};
    for (var i = 0; i < chips.length; i++) {
      var id = chips[i].getAttribute("data-lesson-id");
      var st = P.lessonStatus(id, profile);
      var m = /^(.+)-(\d{3})$/.exec(id);
      if (m && levelOf[m[1]] === undefined) levelOf[m[1]] = null;
      chips[i].classList.toggle("is-done", st === "done");
      chips[i].classList.toggle("is-repeat", st === "repeat");
      chips[i].classList.remove("is-next");
      chips[i].setAttribute("aria-label", "Lesson " + chips[i].getAttribute("data-n") + (st === "done" ? ", finished" : st === "repeat" ? ", to repeat" : ""));
    }
    // The next lesson of each level on the screen gets a ring.
    Object.keys(levelOf).forEach(function (level) {
      var box = document.querySelector('[data-level-actions][data-level="' + level + '"]');
      var total = box ? Number(box.getAttribute("data-total")) : 999;
      var next = P.nextLesson(level, total);
      var chip = document.querySelector('[data-lesson-id="' + level + "-" + String(next).padStart(3, "0") + '"]');
      if (chip && P.lessonStatus(chip.getAttribute("data-lesson-id"), profile) !== "done") {
        chip.classList.add("is-next");
        chip.setAttribute("aria-label", chip.getAttribute("aria-label") + ", next");
      }
    });

    var tests = document.querySelectorAll("[data-test-id]");
    for (var j = 0; j < tests.length; j++) {
      var ts = P.testStatus(tests[j].getAttribute("data-test-id"), profile);
      tests[j].classList.toggle("is-done", ts === "passed");
      tests[j].classList.toggle("is-repeat", ts === "retake");
      var badge = tests[j].querySelector("[data-test-status]");
      if (badge) {
        badge.textContent = ts === "passed" ? "Passed" : ts === "retake" ? "Give again" : "Not given";
        badge.className = "status " + (ts === "passed" ? "status--done" : ts === "retake" ? "status--repeat" : "status--plain");
      }
    }

    var boxes = document.querySelectorAll("[data-level-actions]");
    for (var k = 0; k < boxes.length; k++) {
      var box = boxes[k];
      var level = box.getAttribute("data-level"), total = Number(box.getAttribute("data-total")), slug = box.getAttribute("data-slug");
      var next = P.nextLesson(level, total);
      var btn = document.querySelector("[data-continue]");
      var anyDone = profile.completed.some(function (c) { return c.indexOf(level + "-") === 0; });
      if (btn && box.closest(".page-level")) {
        if (!btn.hasAttribute("data-start-href")) {
          btn.setAttribute("data-start-href", btn.getAttribute("href"));
          btn.setAttribute("data-start-label", btn.textContent);
        }
        if (anyDone || next > 1) {
          var testsAttr = box.getAttribute("data-tests");
          var step = P.nextStep(level, total, testsAttr ? JSON.parse(testsAttr) : [], slug);
          btn.href = step.url;
          btn.textContent = "Continue: " + step.label;
        } else {
          btn.href = btn.getAttribute("data-start-href");
          btn.textContent = btn.getAttribute("data-start-label");
        }
      }
      var bar = box.querySelector("[data-progress]");
      if (bar) {
        var n = profile.completed.filter(function (c) { return c.indexOf(level + "-") === 0; }).length;
        bar.style.setProperty("--p", Math.min(1, n / total));
        var lbl = box.querySelector("[data-progress-label]");
        if (lbl) lbl.textContent = n ? n + " of " + total + " lessons finished" : "Not started";
      }
    }
  }
  paint();

  // ── Changing a mark by hand ──
  var toggle = document.querySelector("[data-mark-toggle]");
  var dlg = document.getElementById("mark-dialog");
  if (!toggle || !dlg || typeof dlg.showModal !== "function") {
    if (toggle) toggle.hidden = true;
    return;
  }
  var note = document.getElementById("mark-note");
  var marking = false;
  var current = null;

  function setMarking(on) {
    marking = on;
    document.body.classList.toggle("is-marking", on);
    toggle.setAttribute("aria-pressed", on ? "true" : "false");
    toggle.textContent = on ? "Done" : "Change marks";
    if (note) note.hidden = !on;
    var items = document.querySelectorAll("[data-lesson-id], [data-test-id]");
    for (var i = 0; i < items.length; i++) {
      if (on) items[i].setAttribute("role", "button"); else items[i].removeAttribute("role");
    }
  }
  toggle.addEventListener("click", function () { setMarking(!marking); });

  function lessonText(id, name, st) {
    var p = P.getActiveProfile();
    var h = (p && p.lessons[id]) || [];
    var last = h[h.length - 1];
    var now = st === "done" ? "finished" : st === "repeat" ? "to repeat" : "not started";
    var byHand = (st === "done" && (!last || last.repeat)) || (st === "repeat" && p.redo.indexOf(id) !== -1);
    var text = "For " + p.name + ", " + name + " is " + now + (byHand ? ", as you marked it" : "") + ". ";
    if (last) text += "It was last taught on " + day(last.date) + ", with " + last.firm + " firm and " + last.errors + " error" + (last.errors === 1 ? "" : "s") + ".";
    else text += "No teaching of it is recorded.";
    return text;
  }
  function testText(id, name, st) {
    var p = P.getActiveProfile();
    var h = (p && p.tests[id]) || [];
    var last = h[h.length - 1];
    if (!last) return "For " + p.name + ", " + name + " has not been given.";
    var now = st === "passed" ? "passed" : "to give again";
    if (last.manual) return "For " + p.name + ", " + name + " is " + now + ", as you marked it on " + day(last.date) + ".";
    var passed = last.parts.filter(function (x) { return x.passed; }).length;
    return "For " + p.name + ", " + name + " is " + now + ". It was last given on " + day(last.date) + ", and " + passed + " of its " + last.parts.length + " parts were passed.";
  }

  function open(card) {
    var isTest = card.hasAttribute("data-test-id");
    var id = card.getAttribute(isTest ? "data-test-id" : "data-lesson-id");
    var name = isTest ? card.getAttribute("data-name") : "Lesson " + card.getAttribute("data-n");
    var st = isTest ? P.testStatus(id) : P.lessonStatus(id);
    current = { id: id, isTest: isTest, name: name, status: st };
    document.getElementById("mark-title").textContent = name;
    document.getElementById("mark-status").textContent = isTest ? testText(id, name, st) : lessonText(id, name, st);
    var labels = isTest
      ? { done: "Mark passed", repeat: "Mark to give again", "new": "Reset to not given" }
      : { done: "Mark finished", repeat: "Mark to repeat", "new": "Reset to not started" };
    var now = isTest ? { passed: "done", retake: "repeat", "new": "new" }[st] : st;
    ["done", "repeat", "new"].forEach(function (v) {
      var b = document.getElementById("mark-" + v);
      b.textContent = labels[v];
      b.disabled = v === now;
    });
    document.getElementById("mark-help").textContent = isTest
      ? "Resetting erases this test's results for " + P.getActiveProfile().name + "."
      : "Resetting erases this lesson's record for " + P.getActiveProfile().name + ", so it shows as never taught. Rehearse runs the lesson without a child and records nothing.";
    var link = document.getElementById("mark-open");
    link.href = card.getAttribute("href");
    link.textContent = isTest ? "Open the test" : "Open the lesson";
    var reh = document.getElementById("mark-rehearse");
    if (reh) { reh.hidden = isTest; reh.href = card.getAttribute("href") + "?rehearse=1"; }
    dlg.returnValue = "";
    if (window.MD) MD.openSheet(dlg, card); else dlg.showModal();
  }

  document.addEventListener("click", function (e) {
    if (!marking) return;
    var card = e.target.closest("[data-lesson-id], [data-test-id]");
    if (!card) return;
    e.preventDefault();
    open(card);
  });

  dlg.addEventListener("close", function () {
    var v = dlg.returnValue;
    if (!current || !v) return;
    var who = P.getActiveProfile().name;
    var cur = current;
    current = null;
    function apply() {
      if (cur.isTest) P.setTestStatus(cur.id, { done: "passed", repeat: "retake", "new": "new" }[v]);
      else P.setLessonStatus(cur.id, v);
      paint();
    }
    if (v !== "new" || !window.MD) { apply(); return; }
    var hasRecord = cur.isTest ? P.testStatus(cur.id) !== "new" : P.lessonHistory(cur.id).length > 0;
    if (!hasRecord) { apply(); return; }
    MD.confirm({ title: "Reset " + cur.name + " for " + who + "?", text: cur.isTest ? "Its results are erased." : "The record of its teaching is erased.", ok: "Reset", cancel: "Keep", danger: true }).then(function (yes) { if (yes) apply(); });
  });
})();
