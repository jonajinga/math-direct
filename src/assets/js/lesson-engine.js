// Math Direct lesson engine.
// Runs a lesson, a mastery test, the placement test, or a practice set. The
// child's screen shows only the visual; the parent's panel shows what to say,
// what the child should answer, and the correction. The parent marks each
// test step Firm or Error. Missed items return at the end of a lesson.
(function () {
  "use strict";

  var dataEl = document.getElementById("runner-data");
  if (!dataEl) return;
  var DATA = JSON.parse(dataEl.textContent);
  var MODE = DATA.mode;

  // ── DOM ──
  var $ = function (id) { return document.getElementById(id); };
  var stage = $("child-stage");
  var el = {
    whereLevel: $("tp-where-level"), whereName: $("tp-where-name"), exTitle: $("tp-ex-title"), exMeta: $("tp-ex-meta"), stepNo: $("tp-step-no"),
    progress: $("tp-progress"), cue: $("tp-cue"), say: $("tp-say"), doBox: $("tp-do"), doText: $("tp-do-text"),
    answerBox: $("tp-answer"), answerText: $("tp-answer-text"), confirmBox: $("tp-confirm"), confirmText: $("tp-confirm-text"),
    correctBox: $("tp-correct"), correctText: $("tp-correct-text"), testNote: $("tp-test-note"),
    btnBack: $("btn-back"), btnNext: $("btn-next"), btnFirm: $("btn-firm"), btnError: $("btn-error"),
    btnOver: $("btn-over"), btnGoOn: $("btn-goon"), btnShow: $("btn-show"), btnClear: $("btn-clear"),
    outline: $("tp-outline"), outlineList: $("tp-outline-list"), btnOutline: $("btn-outline"),
    shell: $("runner-shell"), finish: $("runner-finish"), teacher: $("tp-body"),
  };

  // ── Script: a list of segments (exercises, test parts, sections) ──
  var segments = [];
  var pos = { seg: 0, step: 0 };
  var results = {}; // "seg:step" -> "firm" | "error"
  var errorState = false; // showing a correction after an Error
  var delayedAdded = false;
  var flashTimer = null;
  var startTime = Date.now();

  function key(s, i) { return s + ":" + i; }

  function currentSeg() { return segments[pos.seg]; }
  function currentStep() { var s = currentSeg(); return s ? s.steps[pos.step] : null; }

  // ── Building scripts for each mode ──
  function initLesson() {
    var lesson = DATA.lesson;
    lesson.exercises.forEach(function (ex) {
      segments.push({ title: ex.title, meta: ex.trackName + " · " + kindName(ex.kind), kind: ex.kind, track: ex.track, n: ex.n, materials: ex.materials, steps: ex.steps });
    });
    setWhere(lesson.levelName, "Lesson " + lesson.number);
    // Worksheet and level links in the outline.
    var keys = el.outline && el.outline.querySelector(".tp-outline__keys");
    if (keys) {
      var links = document.createElement("p");
      links.className = "tp-outline__links";
      links.innerHTML = (lesson.worksheet && lesson.worksheet.length ? '<a href="' + lesson.worksheetUrl + '">' + (lesson.worksheetOptional ? "Worksheet (optional)" : "Worksheet") + "</a> · " : "") +
        '<a href="/' + lesson.levelSlug + '/">All ' + escapeHtml(lesson.levelName) + " lessons</a>";
      keys.parentNode.insertBefore(links, keys);
    }
  }

  // The header names the level on a small line and the lesson, test, or set
  // below it in full.
  function setWhere(level, name) {
    el.whereLevel.textContent = level;
    el.whereName.textContent = name;
  }

  function kindName(k) {
    return { "new": "new teaching", firm: "firming", review: "review", delayed: "delayed test", test: "test", practice: "practice", placement: "placement" }[k] || k;
  }

  function initTest() {
    var t = DATA.test;
    t.parts.forEach(function (p, i) {
      segments.push({ title: p.trackName, meta: "Part " + (i + 1) + " of " + t.parts.length, kind: "test", part: i, steps: p.items.map(function (s) { return asTestStep(s); }) });
    });
    setWhere(t.levelName + (t.final ? ", end of level" : ""), "Mastery Test " + t.number);
  }

  function asTestStep(s) {
    var c = {};
    for (var k in s) c[k] = s[k];
    c.cue = "test";
    return c;
  }

  // Placement: sections are run one at a time.
  var placement = { order: [], idx: 0, startIdx: 0, passed: {}, failed: {}, direction: 1 };
  function initPlacement(startIdx) {
    placement.startIdx = startIdx;
    placement.idx = startIdx;
    loadPlacementSection();
  }
  function loadPlacementSection() {
    var sec = DATA.sections[placement.idx];
    segments = [{ title: sec.title, meta: "Placement section", kind: "placement", section: placement.idx, steps: sec.items.map(asTestStep) }];
    pos = { seg: 0, step: 0 };
    results = {};
    setWhere("Placement test", sec.title);
  }

  function initPractice() {
    var set = DATA.set;
    var limit = DATA.limitLesson || 9999;
    // Use only what the selected child has been taught, unless ?upto= says otherwise.
    var upto = Number(new URLSearchParams(window.location.search).get("upto"));
    if (upto) limit = upto;
    else if (DATA.useProgress && window.mathProgress && set.total) {
      limit = Math.max(set.startsAt, window.mathProgress.nextLesson(set.level, set.total) - 1);
    }
    var pool = set.items.filter(function (it) { return it.lesson <= limit; });
    if (!pool.length) pool = set.items.slice(0, 10);
    // Prefer recent items, avoid repeats.
    var chosen = [];
    var seen = {};
    var tries = 0;
    var count = Math.min(DATA.count || 10, pool.length);
    while (chosen.length < count && tries < 500) {
      tries++;
      var recent = pool.filter(function (it) { return it.lesson >= limit - 15; });
      var src = recent.length && Math.random() < 0.6 ? recent : pool;
      var it = src[Math.floor(Math.random() * src.length)];
      var k2 = (it.item || "") + "|" + it.say + "|" + JSON.stringify(it.screen);
      if (seen[k2]) continue;
      seen[k2] = 1;
      chosen.push(asTestStep(it));
    }
    segments = [{ title: set.title, meta: set.levelName + " practice", kind: "practice", steps: chosen }];
    setWhere(set.levelName + " practice", set.title);
  }

  // ── Rendering a step ──
  function cueLabel(c) {
    if (MODE === "test" || MODE === "placement") return "Test item";
    return { model: "My turn", lead: "Together", test: "Your turn", note: "Set up" }[c] || "";
  }

  function render() {
    clearTimeout(flashTimer);
    var seg = currentSeg(), st = currentStep();
    if (!seg || !st) return;
    errorState = false;

    stage.classList.remove("is-flashed");
    stage.innerHTML = window.MDV.render(st.screen || []);
    fitStage();
    window.MDV.bind(stage, onChoose);
    if (st.flash) startFlash(st.flash);

    el.exTitle.textContent = seg.title;
    var meta = seg.meta || "";
    if (MODE === "lesson") meta = "Exercise " + (pos.seg + 1) + " of " + segments.length + " · " + meta;
    el.exMeta.textContent = meta;
    el.stepNo.textContent = (pos.step + 1) + " of " + seg.steps.length;
    el.stepNo.title = "Step " + (pos.step + 1) + " of " + seg.steps.length;
    el.exTitle.title = seg.title;
    el.cue.textContent = cueLabel(st.cue);
    el.cue.className = "tp-cue tp-cue--" + (MODE === "test" || MODE === "placement" ? "test" : st.cue);
    el.say.textContent = st.say || "";
    setBox(el.doBox, el.doText, st["do"] || (seg.materials && pos.step === 0 ? "You will need: " + seg.materials + "." : ""));
    var testing = MODE === "test" || MODE === "placement";
    setBox(el.answerBox, el.answerText, numeralChains(st.answer || ""));
    setBox(el.confirmBox, el.confirmText, !testing && st.cue === "test" ? st.confirm : "");
    setBox(el.correctBox, el.correctText, !testing && st.cue === "test" ? numeralChains(st.correct) : "");
    el.correctBox.classList.remove("is-active");
    el.testNote.hidden = !testing;

    var isTest = st.cue === "test";
    el.btnFirm.hidden = !isTest;
    el.btnError.hidden = !isTest;
    el.btnNext.hidden = isTest;
    el.btnOver.hidden = true;
    el.btnGoOn.hidden = true;
    el.btnBack.disabled = pos.seg === 0 && pos.step === 0;
    el.btnShow.hidden = !(st.flash || hasType(st.screen, "write"));
    el.btnClear.hidden = !hasMarks(st.screen);
    var r = results[key(pos.seg, pos.step)];
    el.btnFirm.classList.toggle("is-chosen", r === "firm");
    el.btnError.classList.toggle("is-chosen", r === "error");
    renderProgress();
    renderOutline();
    fitPanel();
  }

  // Keep the teacher's panel on one screen. If the text does not fit, hide
  // the exercise details, then step the type down a little at a time. Before
  // Error, a correction that would need more than a small step down is shown
  // as a short note instead, never cut off; Error shows it in full. The body
  // scrolls only if the smallest setting still does not fit.
  var FIT_STEPS = 4, FIT_WITH_CORRECTION = 2;
  function overflows() { return el.teacher.scrollHeight > el.teacher.clientHeight + 1; }
  function stepDown(max) {
    var b = el.teacher, n;
    for (n = 1; n <= FIT_STEPS; n++) b.classList.remove("fit-" + n);
    for (n = 1; n <= max && overflows(); n++) b.classList.add("fit-" + n);
  }
  function fitPanel() {
    var box = el.correctBox;
    var waiting = !box.hidden && !box.classList.contains("is-active");
    box.classList.remove("is-folded");
    stepDown(waiting ? FIT_WITH_CORRECTION : FIT_STEPS);
    if (waiting && overflows()) {
      box.classList.add("is-folded");
      stepDown(FIT_STEPS);
    }
    el.teacher.scrollTop = 0;
  }

  // A long counting chain is easier to scan as numerals: "105, 106, 107".
  // The child never sees the panel, so this changes only what the parent reads.
  var ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  var TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  function wordValue(w) {
    w = w.toLowerCase();
    var total = 0, m = w.match(/^([a-z]+) hundred(?: (.+))?$/);
    if (m) {
      var h = ONES.indexOf(m[1]);
      if (h < 1 || h > 9) return -1;
      total = h * 100;
      if (!m[2]) return total;
      w = m[2];
    }
    var i = ONES.indexOf(w);
    if (i >= 0) return total + i;
    var p = w.split("-"), t = TENS.indexOf(p[0]);
    if (t < 2 || p.length > 2) return -1;
    if (p.length === 1) return total + t * 10;
    var o = ONES.indexOf(p[1]);
    return o >= 1 && o <= 9 ? total + t * 10 + o : -1;
  }
  function numeralChains(text) {
    if (!text) return text;
    return text.replace(/[A-Za-z][A-Za-z -]*(?:, [A-Za-z][A-Za-z -]*){5,}/g, function (run) {
      if (run.length < 70) return run;
      var nums = run.split(", ").map(wordValue);
      for (var i = 0; i < nums.length; i++) if (nums[i] < 0) return run;
      return nums.join(", ");
    });
  }

  function setBox(box, textEl, text) {
    if (text) { textEl.textContent = text; box.hidden = false; }
    else { textEl.textContent = ""; box.hidden = true; }
  }

  function hasType(screen, t) {
    var found = false;
    (function walk(v) {
      if (!v || found) return;
      if (Array.isArray(v)) return v.forEach(walk);
      if (v.t === t) found = true;
      if (v.items && v.t !== "pattern" && v.t !== "size") walk(v.items);
      if (v.opts) walk(v.opts);
    })(screen);
    return found;
  }
  function hasMarks(screen) {
    var found = false;
    (function walk(v) {
      if (!v || found) return;
      if (Array.isArray(v)) return v.forEach(walk);
      if (v.t === "obj" && v.tap) found = true;
      if (v.items && v.t !== "pattern" && v.t !== "size") walk(v.items);
    })(screen);
    return found;
  }

  // Shrink wide equations and number rows so they fit on one line.
  function fitStage() {
    var eqs = stage.querySelectorAll(".mdv-eq, .mdv-num, .mdv-col");
    for (var i = 0; i < eqs.length; i++) {
      var e = eqs[i];
      e.style.fontSize = "";
      var tries = 0;
      while (e.scrollWidth > stage.clientWidth - 8 && tries < 25) {
        var fs = parseFloat(window.getComputedStyle(e).fontSize);
        e.style.fontSize = (fs * 0.9) + "px";
        tries++;
      }
    }
  }

  function startFlash(ms) {
    stage.classList.remove("is-flashed");
    clearTimeout(flashTimer);
    flashTimer = setTimeout(function () { stage.classList.add("is-flashed"); }, ms);
  }

  function showAgain() {
    var st = currentStep();
    if (!st) return;
    stage.innerHTML = window.MDV.render(st.screen || []);
    fitStage();
    window.MDV.bind(stage, onChoose);
    if (st.flash && !errorState) startFlash(st.flash);
    else stage.classList.remove("is-flashed");
  }

  function renderProgress() {
    var html = "";
    segments.forEach(function (s, si) {
      var errs = 0, done = 0, tests = 0;
      s.steps.forEach(function (st, i) {
        if (st.cue !== "test") return;
        tests++;
        var r = results[key(si, i)];
        if (r) done++;
        if (r === "error") errs++;
      });
      var cls = "tp-seg" + (si === pos.seg ? " is-current" : "") + (si < pos.seg ? " is-done" : "") + (errs ? " has-errors" : "");
      html += '<button type="button" class="' + cls + '" data-seg="' + si + '" title="' + escapeAttr(s.title) + '"><span class="tp-seg__bar" style="--p:' + (si < pos.seg ? 1 : si === pos.seg ? (pos.step + 1) / s.steps.length : 0) + '"></span></button>';
    });
    el.progress.innerHTML = html;
    var btns = el.progress.querySelectorAll(".tp-seg");
    for (var i = 0; i < btns.length; i++) btns[i].addEventListener("click", function () { jump(Number(this.getAttribute("data-seg")), 0); });
  }

  function renderOutline() {
    if (!el.outlineList) return;
    var html = "";
    segments.forEach(function (s, si) {
      var errs = 0;
      s.steps.forEach(function (st, i) { if (results[key(si, i)] === "error") errs++; });
      html += '<li class="' + (si === pos.seg ? "is-current" : "") + '"><button type="button" data-seg="' + si + '"><span class="tp-outline__n">' + (si + 1) + "</span><span><strong>" + escapeHtml(s.title) + "</strong><small>" + escapeHtml(s.meta || "") + (s.materials ? " · needs " + escapeHtml(s.materials) : "") + (errs ? " · " + errs + " error" + (errs > 1 ? "s" : "") : "") + "</small></span></button></li>";
    });
    el.outlineList.innerHTML = html;
    var btns = el.outlineList.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) btns[i].addEventListener("click", function () { jump(Number(this.getAttribute("data-seg")), 0); toggleOutline(false); });
  }

  function escapeHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function escapeAttr(s) { return escapeHtml(s).replace(/"/g, "&quot;"); }

  // ── Responses ──
  function onChoose(idx, right) {
    var st = currentStep();
    if (!st || st.cue !== "test") return;
    mark(right ? "firm" : "error", true);
  }

  function mark(r, fromChild) {
    var st = currentStep();
    if (!st || st.cue !== "test") return;
    results[key(pos.seg, pos.step)] = r;
    if (st.fact && window.mathProgress && window.mathProgress.recordFact) window.mathProgress.recordFact(st.fact, r === "firm");
    if (r === "firm") {
      el.btnFirm.classList.add("is-chosen");
      el.btnError.classList.remove("is-chosen");
      if (fromChild) {
        // Let the parent see the child's choice, then confirm.
        el.btnFirm.hidden = true; el.btnError.hidden = true; el.btnNext.hidden = false;
        setBox(el.confirmBox, el.confirmText, MODE === "test" || MODE === "placement" ? "Marked firm." : st.confirm);
        renderProgress();
        fitPanel();
        return;
      }
      advance();
      return;
    }
    // Error
    el.btnError.classList.add("is-chosen");
    el.btnFirm.classList.remove("is-chosen");
    if (MODE === "test" || MODE === "placement") {
      if (fromChild) {
        el.btnFirm.hidden = true; el.btnError.hidden = true; el.btnNext.hidden = false;
        setBox(el.confirmBox, el.confirmText, "Marked as an error. Do not correct during a test.");
        renderProgress();
        fitPanel();
        return;
      }
      advance();
      return;
    }
    errorState = true;
    el.correctBox.hidden = false;
    el.correctBox.classList.add("is-active");
    // The correction states the answer, so the other boxes can give way to it.
    el.confirmBox.hidden = true;
    el.answerBox.hidden = true;
    el.doBox.hidden = true;
    el.btnFirm.hidden = true;
    el.btnError.hidden = true;
    el.btnNext.hidden = true;
    el.btnOver.hidden = currentSeg().kind === "delayed" || MODE === "practice";
    el.btnGoOn.hidden = false;
    if (currentStep().flash) { clearTimeout(flashTimer); stage.classList.remove("is-flashed"); }
    renderProgress();
    renderOutline();
    fitPanel();
    if (el.teacher.scrollHeight > el.teacher.clientHeight + 1) el.teacher.scrollTop = el.correctBox.offsetTop - el.teacher.offsetTop;
  }

  function startOver() {
    // Direct Instruction correction: after correcting, start the exercise over.
    var seg = currentSeg();
    var first = 0;
    for (var i = 0; i < seg.steps.length; i++) { if (seg.steps[i].cue === "test") { first = i; break; } }
    // Begin at the first step so the child hears the model again if there is one.
    pos.step = seg.steps[0].cue === "model" ? 0 : first;
    render();
  }

  function advance() {
    var seg = currentSeg();
    if (pos.step < seg.steps.length - 1) { pos.step++; render(); return; }
    if (pos.seg < segments.length - 1) { pos.seg++; pos.step = 0; render(); return; }
    endOfScript();
  }

  function back() {
    if (pos.step > 0) pos.step--;
    else if (pos.seg > 0) { pos.seg--; pos.step = segments[pos.seg].steps.length - 1; }
    render();
  }

  function jump(seg, step) {
    pos.seg = Math.max(0, Math.min(seg, segments.length - 1));
    pos.step = step || 0;
    render();
  }

  // ── End of script ──
  function endOfScript() {
    if (MODE === "lesson" && !delayedAdded) {
      var missed = [];
      segments.forEach(function (s, si) {
        s.steps.forEach(function (st, i) {
          if (results[key(si, i)] === "error") {
            var c = asTestStep(st);
            c.from = { seg: si, step: i };
            missed.push(c);
          }
        });
      });
      delayedAdded = true;
      if (missed.length) {
        segments.push({ title: "Missed items, once more", meta: "Delayed test", kind: "delayed", steps: missed });
        pos.seg = segments.length - 1;
        pos.step = 0;
        render();
        return;
      }
    }
    if (MODE === "placement") return placementSectionDone();
    finish();
  }

  function tally(filter) {
    var firm = 0, errors = 0;
    segments.forEach(function (s, si) {
      if (filter && !filter(s)) return;
      s.steps.forEach(function (st, i) {
        var r = results[key(si, i)];
        if (r === "firm") firm++;
        if (r === "error") errors++;
      });
    });
    return { firm: firm, errors: errors };
  }

  function showFinish(html) {
    el.shell.hidden = true;
    el.finish.innerHTML = html;
    el.finish.hidden = false;
    document.body.classList.add("is-finished");
    window.scrollTo(0, 0);
    var row = el.finish.querySelector("[data-mark-kind]");
    if (row) row.addEventListener("click", function (e) {
      var b = e.target.closest("[data-mark]");
      if (!b || !window.mathProgress) return;
      var v = b.getAttribute("data-mark"), id = row.getAttribute("data-mark-id");
      if (row.getAttribute("data-mark-kind") === "lesson") window.mathProgress.setLessonStatus(id, v);
      else window.mathProgress.setTestStatus(id, v);
      var all = row.querySelectorAll("[data-mark]");
      for (var i = 0; i < all.length; i++) all[i].setAttribute("aria-pressed", all[i] === b ? "true" : "false");
    });
    var noteBtn = $("finish-note-save");
    if (noteBtn) {
      noteBtn.addEventListener("click", function () {
        var t = $("finish-note").value.trim();
        if (t && window.mathProgress) {
          window.mathProgress.addNote(t, DATA.lesson ? DATA.lesson.id : DATA.test ? DATA.test.id : "");
          noteBtn.textContent = "Saved";
          noteBtn.disabled = true;
        }
      });
    }
  }

  function finish() {
    var minutes = Math.max(1, Math.round((Date.now() - startTime) / 60000));
    if (MODE === "lesson") return finishLesson(minutes);
    if (MODE === "test") return finishTest(minutes);
    if (MODE === "practice") return finishPractice();
  }

  function finishLesson(minutes) {
    var lesson = DATA.lesson;
    var main = tally(function (s) { return s.kind !== "delayed"; });
    var delayed = tally(function (s) { return s.kind === "delayed"; });
    var exErrors = [];
    segments.forEach(function (s, si) {
      if (s.kind === "delayed") return;
      var errs = 0;
      s.steps.forEach(function (st, i) { if (results[key(si, i)] === "error") errs++; });
      if (errs) exErrors.push({ n: si + 1, title: s.title, track: s.track, errors: errs });
    });
    var stillMissed = [];
    var del = segments.filter(function (s) { return s.kind === "delayed"; })[0];
    if (del) {
      var di = segments.indexOf(del);
      del.steps.forEach(function (st, i) {
        if (results[key(di, i)] === "error") {
          var src = segments[st.from.seg];
          if (stillMissed.indexOf(src.title) === -1) stillMissed.push(src.title);
        }
      });
    }
    var total = main.firm + main.errors;
    var repeat = total > 0 && (main.errors / total > 0.25 || stillMissed.length > 1);
    var summary = {
      date: new Date().toISOString(), minutes: minutes, firm: main.firm, errors: main.errors,
      delayedFirm: delayed.firm, delayedErrors: delayed.errors, exercises: exErrors, stillMissed: stillMissed, repeat: repeat,
    };
    if (window.mathProgress) window.mathProgress.recordLesson(lesson.id, summary);

    var name = window.mathProgress && window.mathProgress.getActiveProfile() ? window.mathProgress.getActiveProfile().name : "";
    var html = '<div class="finish">';
    html += '<p class="finish__kicker">' + escapeHtml(lesson.levelName) + (name ? " · " + escapeHtml(name) : "") + "</p>";
    html += '<h1 class="finish__title">Lesson ' + lesson.number + " is finished</h1>";
    html += '<dl class="finish__facts"><div><dt>Firm</dt><dd>' + main.firm + "</dd></div><div><dt>Errors</dt><dd>" + main.errors + "</dd></div>";
    if (del) html += '<div title="Missed items asked again at the end of the lesson, and how many were firm"><dt>Retest</dt><dd>' + delayed.firm + " of " + (delayed.firm + delayed.errors) + "</dd></div>";
    html += "<div><dt>Time</dt><dd>" + minutes + " min</dd></div></dl>";
    if (exErrors.length) {
      html += '<h2 class="finish__h2">Where the errors were</h2><ul class="finish__list">';
      exErrors.forEach(function (e) { html += "<li>Exercise " + e.n + ", " + escapeHtml(e.title) + ": " + e.errors + " error" + (e.errors > 1 ? "s" : "") + "</li>"; });
      html += "</ul>";
    }
    html += '<div class="finish__advice">';
    if (repeat) {
      html += "<p><strong>Repeat this lesson next time.</strong> " + (stillMissed.length > 1 ? "Several items were still missed at the end of the lesson." : "More than one answer in four needed correcting.") + " Repeating a lesson is normal; it makes sure each step is firm before the next is built on it.</p>";
    } else if (stillMissed.length) {
      html += "<p><strong>Go on to the next lesson, but first reteach one exercise.</strong> At the start of the next session, teach this exercise again from the beginning: " + escapeHtml(stillMissed.join(", ")) + ".</p>";
    } else {
      html += "<p><strong>Go on to the next lesson.</strong> Every item was firm by the end.</p>";
    }
    html += "</div>";
    html += markRow("lesson", lesson.id);
    html += '<div class="finish__actions">';
    if (lesson.worksheet && lesson.worksheet.length) html += '<a class="btn btn--outline-dark" href="' + lesson.worksheetUrl + '">' + (lesson.worksheetOptional ? "Worksheet (optional)" : "Worksheet") + "</a>";
    if (lesson.testAfter) html += '<a class="btn btn--cta" href="' + lesson.testAfter.url + '">' + escapeHtml(lesson.testAfter.title) + "</a>";
    else if (lesson.next) html += '<a class="btn btn--cta" href="' + lesson.next.url + '">Next: ' + escapeHtml(lesson.next.title) + "</a>";
    html += '<a class="btn btn--outline-dark" href="' + lesson.url + '">Teach again</a>';
    html += '<a class="btn btn--outline-dark" href="/' + lesson.levelSlug + '/">All ' + escapeHtml(lesson.levelName) + " lessons</a>";
    html += "</div>";
    html += noteForm();
    html += "</div>";
    showFinish(html);
  }

  // The teacher may overrule the advice: mark the lesson finished or to
  // repeat, or the test passed or to give again.
  function markRow(kind, id) {
    var P = window.mathProgress;
    if (!P) return "";
    var opts = kind === "lesson" ? [["done", "Finished"], ["repeat", "To repeat"]] : [["passed", "Passed"], ["retake", "To give again"]];
    var cur = kind === "lesson" ? P.lessonStatus(id) : P.testStatus(id);
    return '<div class="finish__mark" role="group" aria-label="Mark this ' + kind + '" data-mark-kind="' + kind + '" data-mark-id="' + id + '"><span class="finish__mark-label">Mark this ' + kind + ":</span>" +
      opts.map(function (o) { return '<button type="button" class="finish__mark-btn" data-mark="' + o[0] + '" aria-pressed="' + (cur === o[0]) + '">' + o[1] + "</button>"; }).join("") + "</div>";
  }

  function noteForm() {
    return '<details class="finish__note"><summary>Add a note for your records</summary><div class="finish__note-body"><label class="sr-only" for="finish-note">Note</label><textarea id="finish-note" rows="2" placeholder="For example: confused six and nine; tired today."></textarea><button type="button" class="btn btn--outline-dark" id="finish-note-save">Save note</button></div></details>';
  }

  function finishTest(minutes) {
    var t = DATA.test;
    var parts = t.parts.map(function (p, pi) {
      var si = pi, errs = 0, n = p.items.length;
      segments[si].steps.forEach(function (st, i) { if (results[key(si, i)] === "error") errs++; });
      return { track: p.track, trackName: p.trackName, items: n, errors: errs, passed: errs <= p.allowed, remedy: p.remedy };
    });
    var failed = parts.filter(function (p) { return !p.passed; });
    var summary = { date: new Date().toISOString(), minutes: minutes, parts: parts.map(function (p) { return { track: p.track, trackName: p.trackName, items: p.items, errors: p.errors, passed: p.passed }; }), passed: !failed.length };
    if (window.mathProgress) window.mathProgress.recordTest(t.id, summary);

    var html = '<div class="finish">';
    html += '<p class="finish__kicker">' + escapeHtml(t.levelName) + "</p>";
    html += '<h1 class="finish__title">' + escapeHtml(t.title) + ": results</h1>";
    if (!failed.length) {
      html += '<div class="finish__advice"><p><strong>Every part was passed.</strong> Go on to the next lesson.</p></div>';
    } else {
      html += '<div class="finish__advice"><p><strong>' + failed.length + " part" + (failed.length > 1 ? "s need" : " needs") + " reteaching.</strong> Teach the exercises listed below, then give only those parts of the test again before going on.</p></div>";
    }
    // Parts to reteach, each with its lessons; then the passed parts on one line.
    if (failed.length) {
      html += '<h2 class="finish__h2">Reteach</h2><ul class="finish__list">';
      failed.forEach(function (p) {
        html += "<li><strong>" + escapeHtml(p.trackName) + "</strong>, " + errorsIn(p) + ": " +
          (p.remedy.map(function (r) { return '<a href="' + r.url + '">Lesson ' + r.lesson + ", exercise " + r.exercise + "</a> (" + escapeHtml(r.label) + ")"; }).join("; ") || "repeat the last three lessons' exercises for this skill") + ".</li>";
      });
      html += "</ul>";
    }
    var passed = parts.filter(function (p) { return p.passed; });
    if (passed.length) {
      html += '<p class="finish__passed"><strong>Passed:</strong> ' + passed.map(function (p) { return escapeHtml(p.trackName) + (p.errors ? " (" + errorsIn(p) + ")" : ""); }).join(", ") + ".</p>";
    }
    html += markRow("test", t.id);
    html += '<div class="finish__actions">';
    if (t.next) html += '<a class="btn btn--cta" href="' + t.next.url + '">' + escapeHtml(t.next.title) + "</a>";
    html += '<a class="btn btn--outline-dark" href="' + t.url + '">Give the test again</a>';
    html += '<a class="btn btn--outline-dark" href="/teacher/">Teacher dashboard</a>';
    html += "</div>" + noteForm() + "</div>";
    showFinish(html);
  }

  function errorsIn(p) {
    return p.errors + " error" + (p.errors === 1 ? "" : "s") + " in " + p.items;
  }

  function finishPractice() {
    var missed = [];
    var seg = segments[0];
    seg.steps.forEach(function (st, i) { if (results[key(0, i)] === "error") missed.push(st); });
    var tl = tally();
    var html = '<div class="finish">';
    html += '<p class="finish__kicker">' + escapeHtml(DATA.set.levelName) + " practice</p>";
    html += '<h1 class="finish__title">' + escapeHtml(DATA.set.title) + "</h1>";
    html += '<dl class="finish__facts"><div><dt>Firm</dt><dd>' + tl.firm + "</dd></div><div><dt>Errors</dt><dd>" + tl.errors + "</dd></div></dl>";
    if (missed.length) {
      html += '<h2 class="finish__h2">Items to go over again</h2><ul class="finish__list">';
      missed.forEach(function (m) { html += "<li>" + escapeHtml(m.say) + " (" + escapeHtml(m.answer) + ")</li>"; });
      html += "</ul>";
    }
    html += '<div class="finish__actions"><a class="btn btn--cta" href="">Another set</a><a class="btn btn--outline-dark" href="/practice/">All practice</a></div></div>';
    showFinish(html);
  }

  function placementSectionDone() {
    var sec = DATA.sections[placement.idx];
    var errs = tally().errors;
    var passed = errs <= sec.allowed;
    placement[passed ? "passed" : "failed"][placement.idx] = errs;
    var next = null;
    if (passed) {
      if (placement.direction === -1) {
        // Going back after a failure: this section is passed, so start at the one after it.
        return placementDone(placement.idx + 1);
      }
      if (placement.idx < DATA.sections.length - 1) next = placement.idx + 1;
      else return placementDone(DATA.sections.length); // passed everything
    } else {
      if (placement.idx === placement.startIdx && placement.idx > 0 && placement.direction === 1) {
        placement.direction = -1;
        next = placement.idx - 1;
      } else if (placement.direction === -1 && placement.idx > 0) {
        next = placement.idx - 1;
      } else {
        return placementDone(placement.idx);
      }
    }
    placement.idx = next;
    loadPlacementSection();
    el.shell.hidden = true;
    var s2 = DATA.sections[next];
    el.finish.innerHTML = '<div class="finish"><p class="finish__kicker">Placement test</p><h1 class="finish__title">Section ' + (passed ? "passed" : "not passed") + '</h1><p class="finish__lead">' +
      (passed ? "The child knows this part of the program. The next section checks the next span of lessons." : "This span of lessons is not yet firm. The next section checks the span before it.") +
      '</p><div class="finish__actions"><button type="button" class="btn btn--cta" id="placement-continue">Begin: ' + escapeHtml(s2.title) + "</button></div></div>";
    el.finish.hidden = false;
    $("placement-continue").addEventListener("click", function () {
      el.finish.hidden = true;
      el.shell.hidden = false;
      render();
    });
  }

  function placementDone(startIdx) {
    var rec;
    if (startIdx >= DATA.sections.length) rec = DATA.afterAll;
    else rec = DATA.sections[startIdx].start;
    var sec = startIdx < DATA.sections.length ? DATA.sections[startIdx] : null;
    var label = rec.label || (sec ? sec.levelName + ", Lesson " + rec.lesson : "");
    if (window.mathProgress) window.mathProgress.recordPlacement({ date: new Date().toISOString(), level: rec.level, lesson: rec.lesson, url: rec.url, label: label });
    var html = '<div class="finish"><p class="finish__kicker">Placement test</p><h1 class="finish__title">Start at ' + escapeHtml(label) + "</h1>";
    html += '<p class="finish__lead">The child passed the sections before this point. Begin here, and the lessons will review what came before as they go. If the first few lessons are too easy, move ahead five lessons at a time; if they are too hard, move back.</p>';
    html += '<div class="finish__actions"><a class="btn btn--cta" href="' + rec.url + '">Go to ' + escapeHtml(label) + '</a><a class="btn btn--outline-dark" href="/teacher/">Teacher dashboard</a></div></div>';
    el.shell.hidden = true;
    el.finish.innerHTML = html;
    el.finish.hidden = false;
  }

  // ── Outline drawer ──
  function toggleOutline(force) {
    if (!el.outline) return;
    var open = force !== undefined ? force : el.outline.hidden;
    el.outline.hidden = !open;
    if (el.btnOutline) el.btnOutline.setAttribute("aria-expanded", open ? "true" : "false");
  }

  // ── Wire up ──
  el.btnNext.addEventListener("click", function () { advance(); });
  el.btnBack.addEventListener("click", back);
  el.btnFirm.addEventListener("click", function () { mark("firm"); });
  el.btnError.addEventListener("click", function () { mark("error"); });
  el.btnOver.addEventListener("click", startOver);
  el.btnGoOn.addEventListener("click", function () { advance(); });
  el.btnShow.addEventListener("click", showAgain);
  el.btnClear.addEventListener("click", function () { window.MDV.clearMarks(stage); });
  if (el.btnOutline) el.btnOutline.addEventListener("click", function () { toggleOutline(); });
  var closeOutline = $("tp-outline-close");
  if (closeOutline) closeOutline.addEventListener("click", function () { toggleOutline(false); });

  document.addEventListener("keydown", function (e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!el.finish.hidden) return;
    var st = currentStep();
    var isTest = st && st.cue === "test";
    switch (e.key) {
      case "ArrowRight":
      case "Enter":
        e.preventDefault();
        if (errorState) advance();
        else if (isTest && !el.btnFirm.hidden) mark("firm");
        else advance();
        break;
      case "f": case "F":
        if (isTest && !errorState) { e.preventDefault(); mark("firm"); }
        break;
      case "x": case "X": case "e": case "E":
        if (isTest && !errorState) { e.preventDefault(); mark("error"); }
        break;
      case "ArrowLeft": e.preventDefault(); back(); break;
      case "s": case "S": if (MODE === "lesson") { e.preventDefault(); startOver(); } break;
      case " ": e.preventDefault(); showAgain(); break;
      case "o": case "O": e.preventDefault(); toggleOutline(); break;
      case "Escape":
        if (el.outline && !el.outline.hidden) { toggleOutline(false); break; }
        if (DATA.exitUrl && confirm("Leave this " + (MODE === "test" ? "test" : "lesson") + "? Marks made so far will not be saved.")) window.location.href = DATA.exitUrl;
        break;
    }
  });

  window.addEventListener("resize", function () { fitStage(); });
  // Refit the panel whenever its body changes size: a turned screen, or a
  // header that grows a line when the child's name picker appears.
  if (window.ResizeObserver) {
    var lastHeight = 0;
    new ResizeObserver(function () {
      if (el.teacher.clientHeight === lastHeight || el.shell.hidden || !currentStep()) return;
      lastHeight = el.teacher.clientHeight;
      fitPanel();
    }).observe(el.teacher);
  } else {
    window.addEventListener("resize", function () { if (!el.shell.hidden) fitPanel(); });
  }

  function start() {
    if (MODE === "lesson") initLesson();
    else if (MODE === "test") initTest();
    else if (MODE === "practice") initPractice();
    else if (MODE === "placement") {
      var chooser = $("placement-start");
      if (chooser) {
        el.shell.hidden = true;
        chooser.hidden = false;
        var btns = chooser.querySelectorAll("[data-start]");
        for (var i = 0; i < btns.length; i++) {
          btns[i].addEventListener("click", function () {
            chooser.hidden = true;
            el.shell.hidden = false;
            initPlacement(Number(this.getAttribute("data-start")));
            render();
          });
        }
        return;
      }
      initPlacement(0);
    }
    render();
  }

  window.mdRunner = {
    results: function () { return results; },
    segments: function () { return segments; },
    pos: function () { return pos; },
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
