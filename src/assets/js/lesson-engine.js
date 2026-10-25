// Math Direct lesson engine.
// Runs a lesson, a mastery test, the placement test, or a practice set. The
// child's screen shows only the picture; the parent's panel shows what to
// say, what the child should answer, and the correction. The parent marks
// each test step Firm or Error. A child's touch on the screen only rings the
// touched part and tells the parent what was touched; it never marks.
// Missed items return at the end of a lesson.
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var stage = $("child-stage");
  if (!stage) return;
  var el = {
    where: $("rn-where"), rail: $("rn-rail"), stageAlt: $("stage-alt"), live: $("rn-live"),
    exTitle: $("tp-ex-title"), exMeta: $("tp-ex-meta"), stepNo: $("tp-step-no"), cue: $("tp-cue"), say: $("tp-say"),
    doBox: $("tp-do"), doText: $("tp-do-text"), answerBox: $("tp-answer"), answerText: $("tp-answer-text"),
    confirmBox: $("tp-confirm"), confirmText: $("tp-confirm-text"), correctBox: $("tp-correct"), correctText: $("tp-correct-text"),
    touched: $("tp-touched"), testNote: $("tp-test-note"),
    btnMore: $("btn-more"), btnShow: $("btn-show"), btnClear: $("btn-clear"), btnError: $("btn-error"), btnOver: $("btn-over"),
    btnNext: $("btn-next"), btnFirm: $("btn-firm"), btnGoOn: $("btn-goon"), btnBigBack: $("btn-big-back"),
    moreList: $("more-list"), outlineList: $("tp-outline-list"), outlineLinks: $("tp-outline-links"),
    childList: $("sheet-child-list"), childText: $("sheet-child-text"), leaveTitle: $("sheet-leave-title"), leaveText: $("sheet-leave-text"), leaveGo: $("sheet-leave-go"),
    shell: $("runner-shell"), finish: $("runner-finish"), teacher: $("tp-body"),
  };
  var P = window.mathProgress;

  // ── State ──
  var DATA = null, MODE = "", HOOKS = {};
  var segments = [];
  var pos = { seg: 0, step: 0 };
  var results = {}; // "seg:step" -> "firm" | "error"
  var errorState = false; // showing a correction after an Error
  var delayedAdded = false;
  var flashTimer = null;
  var startTime = Date.now();
  var touched = null; // what the child touched on this step: { idx, right }
  var placement = { idx: 0, startIdx: 0, passed: {}, failed: {}, direction: 1 };
  var where = { child: "", level: "", name: "", ex: "", exShort: "" };
  var leaving = false; // set when the parent leaves through a sheet, so the browser does not ask again

  function key(s, i) { return s + ":" + i; }
  function currentSeg() { return segments[pos.seg]; }
  function currentStep() { var s = currentSeg(); return s ? s.steps[pos.step] : null; }
  function escapeHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function escapeAttr(s) { return escapeHtml(s).replace(/"/g, "&quot;"); }
  function childName() { var p = P && P.getActiveProfile ? P.getActiveProfile() : null; return p ? p.name : ""; }
  function thing() { return MODE === "test" ? "test" : MODE === "placement" ? "placement test" : MODE === "practice" ? "practice" : "lesson"; }

  // ── Building scripts for each mode ──
  function initLesson() {
    var lesson = DATA.lesson;
    segments = lesson.exercises.map(function (ex) {
      return { title: ex.title, meta: ex.trackName + " · " + kindName(ex.kind), kind: ex.kind, track: ex.track, n: ex.n, materials: ex.materials, steps: ex.steps };
    });
    setWhere(lesson.levelName, "Lesson " + lesson.number);
    el.outlineLinks.innerHTML = '<a href="/' + lesson.levelSlug + '/">All ' + escapeHtml(lesson.levelName) + " lessons</a>";
  }

  function setWhere(level, name) {
    where.level = level;
    where.name = name;
  }

  function kindName(k) {
    return { "new": "new teaching", firm: "firming", review: "review", delayed: "delayed test", test: "test", practice: "practice", placement: "placement" }[k] || k;
  }

  function initTest() {
    var t = DATA.test;
    segments = t.parts.map(function (p, i) {
      return { title: p.trackName, meta: "Part " + (i + 1) + " of " + t.parts.length, kind: "test", part: i, steps: p.items.map(asTestStep) };
    });
    setWhere(t.levelName + (t.final ? ", end of level" : ""), "Mastery Test " + t.number);
    el.outlineLinks.innerHTML = '<a href="/' + t.levelSlug + '/">All ' + escapeHtml(t.levelName) + " lessons</a>";
  }

  function asTestStep(s) {
    var c = {};
    for (var k in s) c[k] = s[k];
    c.cue = "test";
    return c;
  }

  // Placement: sections are run one at a time.
  function initPlacement(startIdx) {
    placement = { idx: startIdx, startIdx: startIdx, passed: {}, failed: {}, direction: 1 };
    loadPlacementSection();
  }
  function loadPlacementSection() {
    var sec = DATA.sections[placement.idx];
    segments = [{ title: sec.title, meta: "Placement section", kind: "placement", section: placement.idx, steps: sec.items.map(asTestStep) }];
    pos = { seg: 0, step: 0 };
    results = {};
    setWhere("Placement test", sec.title);
    el.outlineLinks.innerHTML = "";
  }

  function initPractice() {
    var set = DATA.set;
    var limit = DATA.limitLesson || 9999;
    // Use only what the selected child has been taught, unless ?upto= says otherwise.
    var upto = Number(new URLSearchParams(window.location.search).get("upto"));
    if (upto) limit = upto;
    else if (DATA.useProgress && P && set.total) limit = Math.max(set.startsAt, P.nextLesson(set.level, set.total) - 1);
    var pool = set.items.filter(function (it) { return it.lesson <= limit; });
    if (!pool.length) pool = set.items.slice(0, 10);
    var chosen = [];
    if (DATA.ordered) {
      chosen = pool.slice(0, DATA.count || pool.length).map(asTestStep);
    } else {
      // Prefer recent items, avoid repeats.
      var seen = {}, tries = 0, count = Math.min(DATA.count || 10, pool.length);
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
    }
    segments = [{ title: set.title, meta: set.levelName + " practice", kind: "practice", steps: chosen }];
    setWhere(set.levelName + " practice", set.title);
    el.outlineLinks.innerHTML = '<a href="/practice/">All practice</a>';
  }

  // ── The strip: one line that shortens itself rather than clip ──
  function renderStrip() {
    var seg = currentSeg();
    where.child = childName();
    if (MODE === "lesson") { where.ex = "Exercise " + (pos.seg + 1) + " of " + segments.length; where.exShort = "Ex " + (pos.seg + 1) + " of " + segments.length; }
    else if (MODE === "test") { where.ex = "Part " + (pos.seg + 1) + " of " + segments.length; where.exShort = where.ex; }
    else if (MODE === "placement") { where.ex = "Section " + (placement.idx + 1) + " of " + DATA.sections.length; where.exShort = where.ex; }
    else { where.ex = seg ? (pos.step + 1) + " of " + seg.steps.length : ""; where.exShort = where.ex; }
    fitStrip();
  }
  function fitStrip() {
    var tries = [
      [where.child, where.level, where.name, where.ex],
      [where.child, where.level, where.name, where.exShort],
      [where.level, where.name, where.exShort],
      [where.name, where.exShort],
      [where.name],
    ];
    for (var i = 0; i < tries.length; i++) {
      el.where.textContent = tries[i].filter(Boolean).join(" · ");
      if (el.where.scrollWidth <= el.where.clientWidth + 1) return;
    }
  }

  // ── The rail ──
  function renderRail() {
    var html = "", total = 0, done = 0;
    segments.forEach(function (s, si) {
      var errs = 0;
      s.steps.forEach(function (st, i) {
        total++;
        if (si < pos.seg || (si === pos.seg && i < pos.step)) done++;
        if (results[key(si, i)] === "error") errs++;
      });
      var cls = "rn-rail__seg" + (si === pos.seg ? " is-current" : "") + (si < pos.seg ? " is-done" : "") + (errs ? " has-errors" : "");
      html += '<span class="' + cls + '" style="--p:' + (si < pos.seg ? 1 : si === pos.seg ? (pos.step + 1) / s.steps.length : 0) + '"></span>';
    });
    el.rail.innerHTML = html;
    var seg = currentSeg();
    el.rail.setAttribute("aria-valuenow", total ? Math.round((done / total) * 100) : 0);
    el.rail.setAttribute("aria-valuetext", (where.ex ? where.ex + ", " : "") + "step " + (pos.step + 1) + " of " + (seg ? seg.steps.length : 0));
  }

  // ── Rendering a step ──
  function cueLabel(c) {
    if (MODE === "test" || MODE === "placement") return "Test item";
    return { model: "My turn", lead: "Together", test: "Your turn", note: "Set up" }[c] || "";
  }

  function announce(text) {
    if (!el.live) return;
    el.live.textContent = "";
    setTimeout(function () { el.live.textContent = text; }, 40);
  }

  function render() {
    clearTimeout(flashTimer);
    var seg = currentSeg(), st = currentStep();
    if (!seg || !st) return;
    errorState = false;
    touched = null;

    stage.classList.remove("is-flashed");
    stage.innerHTML = window.MDV.render(st.screen || []);
    el.stageAlt.textContent = window.MDV.describe(st.screen || []);
    fitStage();
    // A teacher's demonstration touch on a model step rings the picture
    // and nothing more; the child's answer on a test step also locks the group.
    window.MDV.bind(stage, onChoose, { feedback: false, lockAfterPick: st.cue === "test" });
    if (st.flash) startFlash(st.flash);

    el.exTitle.textContent = seg.title;
    el.exMeta.textContent = seg.meta || "";
    el.stepNo.textContent = (pos.step + 1) + " of " + seg.steps.length;
    el.stepNo.setAttribute("aria-label", "Step " + (pos.step + 1) + " of " + seg.steps.length);
    var testing = MODE === "test" || MODE === "placement";
    el.cue.textContent = cueLabel(st.cue);
    el.cue.className = "tp-cue tp-cue--" + (testing ? "test" : st.cue);
    el.say.textContent = st.say || "";
    setBox(el.doBox, el.doText, st["do"] || (seg.materials && pos.step === 0 ? "You will need: " + seg.materials + "." : ""));
    setBox(el.answerBox, el.answerText, numeralChains(st.answer || ""));
    setBox(el.confirmBox, el.confirmText, !testing && st.cue === "test" ? st.confirm : "");
    setBox(el.correctBox, el.correctText, !testing && st.cue === "test" ? numeralChains(st.correct) : "");
    el.correctBox.classList.remove("is-active");
    el.touched.hidden = true;
    el.touched.textContent = "";
    el.testNote.hidden = !testing;

    renderStrip();
    renderRail();
    renderOutline();
    syncBar();
    fitPanel();
    saveSession();
    announce((cueLabel(st.cue) ? cueLabel(st.cue) + ". " : "") + (st.say || ""));
  }

  // ── The sitting: saved after every move and mark, cleared when finished ──
  // Practice sets draw new items each time, so they are not saved.
  function sessionId() { return DATA.lesson ? DATA.lesson.id : DATA.test ? DATA.test.id : MODE; }
  function markCount() { var n = 0; for (var k in results) n++; return n; }
  function saveSession() {
    if (!P || !P.saveSession || MODE === "practice" || !DATA) return;
    if (!markCount() && pos.seg === 0 && pos.step === 0 && MODE !== "placement") return;
    P.saveSession({
      kind: MODE, url: window.location.pathname, id: sessionId(),
      title: (where.level ? where.level + " · " : "") + where.name, where: where.ex, marks: markCount(),
      pos: { seg: pos.seg, step: pos.step }, results: results, delayedAdded: delayedAdded,
      placement: MODE === "placement" ? placement : null, elapsed: Date.now() - startTime,
    });
  }
  function clearSession() { if (P && P.clearSession) P.clearSession(); }
  function savedSitting() {
    if (!P || !P.loadSession || MODE === "practice") return null;
    var s = P.loadSession();
    if (!s || s.url !== window.location.pathname || s.kind !== MODE) return null;
    if (!s.marks && !(s.pos && (s.pos.seg || s.pos.step)) && MODE !== "placement") return null;
    return s;
  }
  function restoreSitting(s) {
    if (MODE === "placement" && s.placement) {
      placement = s.placement;
      loadPlacementSection();
    }
    results = s.results || {};
    delayedAdded = !!s.delayedAdded;
    if (delayedAdded && MODE === "lesson") {
      var del = buildDelayed();
      if (del) segments.push(del);
    }
    pos = { seg: Math.min(s.pos.seg, segments.length - 1), step: 0 };
    pos.step = Math.min(s.pos.step, segments[pos.seg].steps.length - 1);
    startTime = Date.now() - (s.elapsed || 0);
    render();
  }
  function offerContinue(s) {
    var dlg = $("sheet-continue"), text = $("sheet-continue-text");
    if (!dlg) { restoreSitting(s); return; }
    var when = "";
    try { var d = new Date(s.savedAt), mins = Math.round((Date.now() - d.getTime()) / 60000); when = mins < 2 ? "a moment ago" : mins < 60 ? mins + " minutes ago" : mins < 120 ? "an hour ago" : Math.round(mins / 60) + " hours ago"; } catch (e) {}
    text.textContent = "You stopped " + (s.where ? "at " + s.where.replace(/^Ex /, "Exercise ") : "part way through") + (s.marks ? ", with " + s.marks + " answer" + (s.marks === 1 ? "" : "s") + " marked" : "") + (when ? ", " + when : "") + ".";
    render();
    dlg.addEventListener("close", function onClose() {
      dlg.removeEventListener("close", onClose);
      if (dlg.returnValue === "continue") restoreSitting(s);
      else { clearSession(); render(); }
      el.btnMore.focus();
    });
    openSheet("sheet-continue");
  }

  // The control bar: four fixed slots. More · tool · Error · primary.
  function anyErrors() {
    for (var k in results) if (results[k] === "error") return true;
    return false;
  }
  function isLastStep() {
    var seg = currentSeg();
    if (!seg || pos.seg !== segments.length - 1 || pos.step !== seg.steps.length - 1) return false;
    if (MODE === "lesson" && !delayedAdded && anyErrors()) return false;
    return MODE !== "placement";
  }
  function syncBar() {
    var st = currentStep(), seg = currentSeg();
    var isTest = !!(st && st.cue === "test");
    var canOver = MODE === "lesson" && !!seg && seg.kind !== "delayed";
    var marks = st ? hasMarks(st.screen) : false;
    var showAgain = !!(st && (st.flash || touched));
    el.btnShow.hidden = !showAgain;
    el.btnClear.hidden = showAgain || !marks;
    var overNow = errorState && canOver;
    el.btnOver.hidden = !overNow;
    el.btnError.hidden = overNow;
    el.btnError.disabled = !isTest || errorState;
    el.btnGoOn.hidden = !errorState;
    el.btnFirm.hidden = errorState || !isTest;
    el.btnNext.hidden = errorState || isTest;
    el.btnNext.textContent = isLastStep() ? "Finish" : "Next";
    var r = results[key(pos.seg, pos.step)];
    el.btnFirm.setAttribute("aria-pressed", r === "firm" ? "true" : "false");
    el.btnError.setAttribute("aria-pressed", r === "error" ? "true" : "false");
    el.btnFirm.classList.toggle("is-suggested", !!(touched && touched.right));
    el.btnError.classList.toggle("is-suggested", !!(touched && !touched.right));
    // Rows in the More sheet
    var rows = el.moreList.querySelectorAll("[data-act]");
    for (var i = 0; i < rows.length; i++) {
      var a = rows[i].getAttribute("data-act");
      rows[i].disabled = a === "back" ? (pos.seg === 0 && pos.step === 0) : a === "over" ? !canOver : a === "clear" ? !marks : a === "show" ? !st : false;
    }
  }

  // Keep the teacher's panel on one screen. If the text does not fit, hide
  // the exercise details, then step the box type down a little at a time;
  // the script line never drops under 16 px. Before Error, a correction that
  // would need more than a small step down waits behind a short note, never
  // cut off; Error shows it in full. The body scrolls only if the smallest
  // setting still does not fit.
  var FIT_STEPS = 5, FIT_WITH_CORRECTION = 2;
  function overflows() { return el.teacher.scrollHeight > el.teacher.clientHeight + 1; }
  function stepDown(max) {
    var b = el.teacher, n;
    for (n = 1; n <= FIT_STEPS; n++) b.classList.remove("fit-" + n);
    for (n = 1; n <= max && overflows(); n++) b.classList.add("fit-" + n);
  }
  var lastHeight = 0;
  function fitPanel() {
    var box = el.correctBox;
    var waiting = !box.hidden && !box.classList.contains("is-active");
    box.classList.remove("is-folded");
    el.shell.classList.remove("is-tight");
    stepDown(waiting ? FIT_WITH_CORRECTION : FIT_STEPS);
    if (waiting && overflows()) {
      box.classList.add("is-folded");
      stepDown(FIT_STEPS);
    }
    // Last resort before scrolling: the stage gives the panel more room.
    el.shell.classList.remove("is-tight-2");
    if (overflows()) {
      el.shell.classList.add("is-tight");
      stepDown(FIT_STEPS);
    }
    if (overflows()) {
      el.shell.classList.add("is-tight-2");
      stepDown(FIT_STEPS);
    }
    el.teacher.scrollTop = 0;
    lastHeight = el.teacher.clientHeight;
    // The stage's size is settled now; wide equations shrink to it last.
    fitStage();
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
    flashTimer = setTimeout(function () { stage.classList.add("is-flashed"); announce("The dots are hidden."); }, ms);
  }

  // Show again draws the picture afresh: the flash returns, and a locked
  // group opens for another try before the mark is made.
  function showAgain() {
    var st = currentStep();
    if (!st) return;
    stage.innerHTML = window.MDV.render(st.screen || []);
    fitStage();
    window.MDV.bind(stage, onChoose, { feedback: false, lockAfterPick: st.cue === "test" });
    touched = null;
    el.touched.hidden = true;
    el.touched.textContent = "";
    if (st.flash && !errorState) startFlash(st.flash);
    else stage.classList.remove("is-flashed");
    syncBar();
    fitPanel();
  }

  function clearMarks() {
    window.MDV.clearMarks(stage);
    announce("Marks cleared.");
  }

  function renderOutline() {
    if (!el.outlineList) return;
    var html = "";
    segments.forEach(function (s, si) {
      var errs = 0;
      s.steps.forEach(function (st, i) { if (results[key(si, i)] === "error") errs++; });
      html += '<li><button type="button" class="sheet__row" data-seg="' + si + '"' + (si === pos.seg ? ' aria-current="true"' : "") + '><span class="rn-outline__n">' + (si + 1) + "</span><span>" + escapeHtml(s.title) +
        "<small>" + escapeHtml(s.meta || "") + (s.materials ? " · needs " + escapeHtml(s.materials) : "") + (errs ? " · " + errs + " error" + (errs > 1 ? "s" : "") : "") + (si === pos.seg ? " · now" : "") + "</small></span></button></li>";
    });
    el.outlineList.innerHTML = html;
  }

  // ── Responses ──
  // The child's touch rings the touched part and locks the group. The panel
  // tells the parent what was touched and whether it was right; the parent
  // still presses Firm or Error.
  function onChoose(idx, right) {
    var st = currentStep();
    if (!st || st.cue !== "test" || errorState) return;
    touched = { idx: idx, right: right };
    var text = "Child touched " + window.MDV.describeChoice(st.screen, idx) + ". That is " + (right ? "right." : "not right.");
    el.touched.textContent = text;
    el.touched.hidden = false;
    syncBar();
    fitPanel();
    announce(text);
  }

  function mark(r) {
    var st = currentStep();
    if (!st || st.cue !== "test" || errorState) return;
    results[key(pos.seg, pos.step)] = r;
    if (st.fact && P && P.recordFact) P.recordFact(st.fact, r === "firm");
    saveSession();
    if (r === "firm" || MODE === "test" || MODE === "placement") {
      announce(r === "firm" ? "Marked firm." : "Marked as an error.");
      advance();
      return;
    }
    // Error in a lesson or practice set: show the correction in full.
    errorState = true;
    touched = null;
    el.touched.hidden = true;
    el.correctBox.hidden = false;
    el.correctBox.classList.add("is-active");
    // The correction states the answer, so the other boxes can give way to it.
    el.confirmBox.hidden = true;
    el.answerBox.hidden = true;
    el.doBox.hidden = true;
    if (st.flash) { clearTimeout(flashTimer); stage.classList.remove("is-flashed"); }
    renderRail();
    renderOutline();
    syncBar();
    fitPanel();
    if (overflows()) el.teacher.scrollTop = el.correctBox.offsetTop - el.teacher.offsetTop;
    announce("Marked as an error. Correction: " + (st.correct || ""));
  }

  function startOver() {
    if (MODE !== "lesson") return;
    var seg = currentSeg();
    if (!seg || seg.kind === "delayed") return;
    // Direct Instruction correction: after correcting, start the exercise
    // over, from the model if there is one so the child hears it again.
    var first = 0;
    for (var i = 0; i < seg.steps.length; i++) { if (seg.steps[i].cue === "test") { first = i; break; } }
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
    else return;
    render();
  }

  function jump(seg, step) {
    pos.seg = Math.max(0, Math.min(seg, segments.length - 1));
    pos.step = step || 0;
    render();
  }

  // ── End of script ──
  function buildDelayed() {
    var missed = [];
    segments.forEach(function (s, si) {
      if (s.kind === "delayed") return;
      s.steps.forEach(function (st, i) {
        if (results[key(si, i)] === "error") {
          var c = asTestStep(st);
          c.from = { seg: si, step: i };
          missed.push(c);
        }
      });
    });
    return missed.length ? { title: "Missed items, once more", meta: "Delayed test", kind: "delayed", steps: missed } : null;
  }
  function endOfScript() {
    if (MODE === "lesson" && !delayedAdded) {
      delayedAdded = true;
      var del = buildDelayed();
      if (del) {
        segments.push(del);
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

  // ── Finish screens: an article with its main action in a fixed bar ──
  function actionBar(primary, secondary) {
    function b(a, cls) {
      if (!a) return "";
      if (a.href !== undefined) return '<a class="btn ' + cls + '" href="' + escapeAttr(a.href) + '"' + (a.id ? ' id="' + a.id + '"' : "") + ">" + escapeHtml(a.label) + "</a>";
      return '<button type="button" class="btn ' + cls + '"' + (a.id ? ' id="' + a.id + '"' : "") + (a.act ? ' data-act="' + a.act + '"' : "") + ">" + escapeHtml(a.label) + "</button>";
    }
    return '<div class="action-bar"><div class="action-bar__inner">' + b(secondary, "btn--secondary") + b(primary, "btn--primary") + "</div></div>";
  }

  function showFinish(html, bar) {
    clearTimeout(flashTimer);
    bigPicture(false);
    clearSession();
    el.shell.hidden = true;
    el.finish.innerHTML = html + (bar || "");
    el.finish.hidden = false;
    window.scrollTo(0, 0);
    var h1 = el.finish.querySelector("h1");
    if (h1) { h1.setAttribute("tabindex", "-1"); h1.focus(); }
    var row = el.finish.querySelector("[data-mark-kind]");
    if (row) row.addEventListener("click", function (e) {
      var b = e.target.closest("[data-mark]");
      if (!b || !P) return;
      var v = b.getAttribute("data-mark"), id = row.getAttribute("data-mark-id");
      if (row.getAttribute("data-mark-kind") === "lesson") P.setLessonStatus(id, v);
      else P.setTestStatus(id, v);
      var all = row.querySelectorAll("[data-mark]");
      for (var i = 0; i < all.length; i++) all[i].setAttribute("aria-pressed", all[i] === b ? "true" : "false");
      if (window.MD && MD.toast) MD.toast("Marked " + b.textContent.toLowerCase() + ".");
    });
    var noteBtn = $("finish-note-save");
    if (noteBtn) {
      noteBtn.addEventListener("click", function () {
        var t = $("finish-note").value.trim();
        if (t && P) {
          P.addNote(t, DATA.lesson ? DATA.lesson.id : DATA.test ? DATA.test.id : "");
          noteBtn.textContent = "Saved";
          noteBtn.disabled = true;
        }
      });
    }
    var again = el.finish.querySelector('[data-act="again"]');
    if (again) again.addEventListener("click", restartPractice);
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
    if (P) P.recordLesson(lesson.id, summary);

    var name = childName();
    var html = '<article class="finish">';
    html += '<p class="finish__kicker">' + escapeHtml(lesson.levelName) + (name ? " · " + escapeHtml(name) : "") + "</p>";
    html += '<h1 class="finish__title">Lesson ' + lesson.number + " is finished</h1>";
    html += '<dl class="finish__facts"><div><dt>Firm</dt><dd>' + main.firm + "</dd></div><div><dt>Errors</dt><dd>" + main.errors + "</dd></div>";
    if (del) html += "<div><dt>Retest</dt><dd>" + delayed.firm + " of " + (delayed.firm + delayed.errors) + "</dd></div>";
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
    html += '<ul class="finish__links"><li><a href="' + lesson.url + '">Teach this lesson again</a></li><li><a href="/records/">Records</a></li></ul>';
    html += noteForm();
    html += "</article>";
    var primary = lesson.testAfter ? { label: lesson.testAfter.title, href: lesson.testAfter.url } : lesson.next ? { label: "Next: " + lesson.next.title, href: lesson.next.url } : null;
    var secondary = { label: "All lessons", href: "/" + lesson.levelSlug + "/" };
    showFinish(html, actionBar(primary || secondary, primary ? secondary : null));
  }

  // The teacher may overrule the advice: mark the lesson finished or to
  // repeat, or the test passed or to give again.
  function markRow(kind, id) {
    if (!P) return "";
    var opts = kind === "lesson" ? [["done", "Finished"], ["repeat", "To repeat"]] : [["passed", "Passed"], ["retake", "To give again"]];
    var cur = kind === "lesson" ? P.lessonStatus(id) : P.testStatus(id);
    return '<div class="finish__mark" role="group" aria-label="Mark this ' + kind + '" data-mark-kind="' + kind + '" data-mark-id="' + id + '"><span class="finish__mark-label">Mark this ' + kind + ":</span>" +
      opts.map(function (o) { return '<button type="button" class="finish__mark-btn" data-mark="' + o[0] + '" aria-pressed="' + (cur === o[0]) + '">' + o[1] + "</button>"; }).join("") + "</div>";
  }

  function noteForm() {
    return '<details class="finish__note"><summary>Add a note for your records</summary><div class="finish__note-body"><label class="sr-only" for="finish-note">Note</label><textarea id="finish-note" rows="2" placeholder="For example: confused six and nine; tired today."></textarea><button type="button" class="btn btn--secondary" id="finish-note-save">Save note</button></div></details>';
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
    if (P) P.recordTest(t.id, summary);

    var html = '<article class="finish">';
    html += '<p class="finish__kicker">' + escapeHtml(t.levelName) + (childName() ? " · " + escapeHtml(childName()) : "") + "</p>";
    html += '<h1 class="finish__title">' + escapeHtml(t.title) + ": results</h1>";
    if (!failed.length) {
      html += '<div class="finish__advice"><p><strong>Every part was passed.</strong> Go on to the next lesson.</p></div>';
    } else {
      html += '<div class="finish__advice"><p><strong>' + failed.length + " part" + (failed.length > 1 ? "s need" : " needs") + " reteaching.</strong> Teach the exercises listed below, then give only those parts of the test again before going on.</p></div>";
    }
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
    html += '<ul class="finish__links"><li><a href="' + t.url + '">Give the test again</a></li><li><a href="/' + t.levelSlug + '/">All ' + escapeHtml(t.levelName) + " lessons</a></li></ul>";
    html += noteForm() + "</article>";
    var primary = t.next ? { label: t.next.title, href: t.next.url } : { label: "Records", href: "/records/" };
    showFinish(html, actionBar(primary, t.next ? { label: "Records", href: "/records/" } : null));
  }

  function errorsIn(p) {
    return p.errors + " error" + (p.errors === 1 ? "" : "s") + " in " + p.items;
  }

  function finishPractice() {
    var missed = [];
    var seg = segments[0];
    seg.steps.forEach(function (st, i) { if (results[key(0, i)] === "error") missed.push(st); });
    var tl = tally();
    var html = '<article class="finish">';
    html += '<p class="finish__kicker">' + escapeHtml(DATA.set.levelName) + " practice" + (childName() ? " · " + escapeHtml(childName()) : "") + "</p>";
    html += '<h1 class="finish__title">' + escapeHtml(DATA.set.title) + "</h1>";
    html += '<dl class="finish__facts"><div><dt>Firm</dt><dd>' + tl.firm + "</dd></div><div><dt>Errors</dt><dd>" + tl.errors + "</dd></div></dl>";
    if (missed.length) {
      html += '<h2 class="finish__h2">Items to go over again</h2><ul class="finish__list">';
      missed.forEach(function (m) { html += "<li>" + escapeHtml(m.say) + " (" + escapeHtml(m.answer) + ")</li>"; });
      html += "</ul>";
    } else {
      html += '<div class="finish__advice"><p><strong>Every item was firm.</strong></p></div>';
    }
    html += "</article>";
    showFinish(html, actionBar({ label: "Another set", act: "again" }, { label: "All practice", href: DATA.exitUrl || "/practice/" }));
  }

  // Another set starts in place: new items, no page load.
  function restartPractice() {
    if (HOOKS.again) { HOOKS.again(); return; }
    results = {};
    pos = { seg: 0, step: 0 };
    startTime = Date.now();
    initPractice();
    el.finish.hidden = true;
    el.finish.innerHTML = "";
    el.shell.hidden = false;
    render();
    el.btnMore.focus();
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
    var s2 = DATA.sections[next];
    var keep = true;
    var html = '<article class="finish"><p class="finish__kicker">Placement test</p><h1 class="finish__title">Section ' + (passed ? "passed" : "not passed") + '</h1><p class="finish__lead">' +
      (passed ? "The child knows this part of the program. The next section checks the next span of lessons." : "This span of lessons is not yet firm. The next section checks the span before it.") + "</p></article>";
    showFinish(html, actionBar({ label: "Begin: " + s2.title, id: "placement-continue" }));
    if (keep) saveSession();
    $("placement-continue").addEventListener("click", function () {
      el.finish.hidden = true;
      el.finish.innerHTML = "";
      el.shell.hidden = false;
      render();
      el.btnMore.focus();
    });
  }

  function placementDone(startIdx) {
    var rec;
    if (startIdx >= DATA.sections.length) rec = DATA.afterAll;
    else rec = DATA.sections[startIdx].start;
    var sec = startIdx < DATA.sections.length ? DATA.sections[startIdx] : null;
    var label = rec.label || (sec ? sec.levelName + ", Lesson " + rec.lesson : "");
    if (P) P.recordPlacement({ date: new Date().toISOString(), level: rec.level, lesson: rec.lesson, url: rec.url, label: label });
    var html = '<article class="finish"><p class="finish__kicker">Placement test' + (childName() ? " · " + escapeHtml(childName()) : "") + '</p><h1 class="finish__title">Start at ' + escapeHtml(label) + "</h1>";
    html += '<p class="finish__lead">The child passed the sections before this point. Begin here, and the lessons will review what came before as they go. If the first few lessons are too easy, move ahead five lessons at a time; if they are too hard, move back.</p></article>';
    showFinish(html, actionBar({ label: "Go to " + label, href: rec.url }, { label: "Records", href: "/records/" }));
  }

  // ── Sheets ──
  function openSheet(id) {
    if (window.MD && MD.openSheet) MD.openSheet(id, el.btnMore);
    else { var d = $(id); if (d && d.showModal) d.showModal(); }
  }
  function closeSheet(id) {
    if (window.MD && MD.closeSheet) MD.closeSheet(id);
    else { var d = $(id); if (d && d.open) d.close(); }
  }
  function anySheetOpen() { return !!document.querySelector("dialog[open]"); }
  function openAfterClose(id) {
    closeSheet("sheet-more");
    setTimeout(function () { openSheet(id); }, 0);
  }

  function act(a) {
    switch (a) {
      case "back": back(); break;
      case "over": startOver(); break;
      case "show": showAgain(); break;
      case "clear": clearMarks(); break;
      case "outline": openAfterClose("sheet-outline"); break;
      case "big": bigPicture(true); break;
      case "keys": openAfterClose("sheet-keys"); break;
      case "child": renderChildSheet(); openAfterClose("sheet-child"); break;
      case "leave": openAfterClose("sheet-leave"); break;
    }
  }

  function renderChildSheet() {
    if (!el.childList) return;
    var profiles = P ? P.getProfiles() : [], active = P ? P.getActiveProfile() : null;
    el.childText.textContent = MODE === "practice" ? "Marks made in a practice set are not kept. The practice starts again for the child you pick." :
      (active ? active.name + "'s" : "The") + " marks are saved, and the " + thing() + " can be continued later. It starts again for the child you pick.";
    el.childList.innerHTML = profiles.map(function (p) {
      var on = active && active.id === p.id;
      return '<li><button type="button" class="sheet__row" data-child="' + escapeAttr(p.id) + '"' + (on ? " disabled" : "") + ">" + escapeHtml(p.name) + (on ? "<small>Teaching now</small>" : "") + "</button></li>";
    }).join("");
  }

  function setLeaveSheet() {
    var t = thing();
    el.leaveTitle.textContent = "Leave " + (t === "placement test" ? "the placement test" : "this " + t) + "?";
    el.leaveText.textContent = MODE === "practice" ? "Marks made in a practice set are not kept." : "The marks are saved. You can continue later from Today.";
    el.leaveGo.href = DATA.exitUrl || "/lessons/";
    el.leaveGo.addEventListener("click", function () { leaving = true; });
  }

  // Big picture: the stage fills the screen; one button comes back.
  function bigPicture(on) {
    var was = el.shell.classList.contains("is-big");
    if (on === undefined) on = !was;
    if (on === was) return;
    el.shell.classList.toggle("is-big", on);
    el.btnBigBack.hidden = !on;
    fitStage();
    if (on) el.btnBigBack.focus();
    else el.btnMore.focus();
  }

  // ── Wire up ──
  el.btnNext.addEventListener("click", function () { advance(); });
  el.btnFirm.addEventListener("click", function () { mark("firm"); });
  el.btnError.addEventListener("click", function () { mark("error"); });
  el.btnOver.addEventListener("click", startOver);
  el.btnGoOn.addEventListener("click", function () { advance(); });
  el.btnShow.addEventListener("click", showAgain);
  el.btnClear.addEventListener("click", clearMarks);
  el.btnMore.addEventListener("click", function () { syncBar(); openSheet("sheet-more"); });
  el.btnBigBack.addEventListener("click", function () { bigPicture(false); });
  el.moreList.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]");
    if (!b || b.disabled) return;
    var a = b.getAttribute("data-act");
    if (a === "outline" || a === "keys" || a === "child" || a === "leave") { act(a); return; }
    closeSheet("sheet-more");
    act(a);
  });
  el.outlineList.addEventListener("click", function (e) {
    var b = e.target.closest("[data-seg]");
    if (!b) return;
    closeSheet("sheet-outline");
    jump(Number(b.getAttribute("data-seg")), 0);
  });
  if (el.childList) el.childList.addEventListener("click", function (e) {
    var b = e.target.closest("[data-child]");
    if (!b || b.disabled || !P) return;
    leaving = true;
    P.switchProfile(b.getAttribute("data-child"));
  });

  document.addEventListener("keydown", function (e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!el.finish.hidden || el.shell.hidden) return;
    if (anySheetOpen()) return; // Escape closes it; the rest waits.
    var st = currentStep();
    var isTest = st && st.cue === "test";
    if (el.shell.classList.contains("is-big")) {
      if (e.key === "b" || e.key === "B" || e.key === "Escape") { e.preventDefault(); bigPicture(false); }
      return;
    }
    switch (e.key) {
      case "ArrowRight":
      case "Enter":
        if (e.target.tagName === "BUTTON" && e.key === "Enter") return;
        e.preventDefault();
        if (errorState) advance();
        else if (isTest) mark("firm");
        else advance();
        break;
      case "f": case "F": if (isTest && !errorState) { e.preventDefault(); mark("firm"); } break;
      case "x": case "X": case "e": case "E": if (isTest && !errorState) { e.preventDefault(); mark("error"); } break;
      case "ArrowLeft": e.preventDefault(); back(); break;
      case "s": case "S": e.preventDefault(); startOver(); break;
      case " ": e.preventDefault(); showAgain(); break;
      case "c": case "C": e.preventDefault(); clearMarks(); break;
      case "o": case "O": e.preventDefault(); openSheet("sheet-outline"); break;
      case "b": case "B": e.preventDefault(); bigPicture(true); break;
      case "m": case "M": e.preventDefault(); syncBar(); openSheet("sheet-more"); break;
      case "?": e.preventDefault(); openSheet("sheet-keys"); break;
      case "Escape": e.preventDefault(); openSheet("sheet-leave"); break;
    }
  });

  // The browser's own back gesture or a closed tab: ask first while marks exist.
  window.addEventListener("beforeunload", function (e) {
    if (leaving || el.shell.hidden || !markCount()) return;
    e.preventDefault();
    e.returnValue = "";
  });
  window.addEventListener("resize", function () { fitStage(); fitStrip(); });
  // Web fonts can arrive after the first step is laid out; fit again then.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!el.shell.hidden && currentStep()) { fitPanel(); fitStrip(); fitStage(); } });
  // Refit the panel whenever its body changes size: a turned screen, or a
  // keyboard that takes part of it.
  if (window.ResizeObserver) {
    new ResizeObserver(function () {
      if (el.teacher.clientHeight === lastHeight || el.shell.hidden || !currentStep()) return;
      lastHeight = el.teacher.clientHeight;
      fitPanel();
    }).observe(el.teacher);
  } else {
    window.addEventListener("resize", function () { if (!el.shell.hidden) fitPanel(); });
  }

  // ── Start ──
  function reset() {
    segments = [];
    pos = { seg: 0, step: 0 };
    results = {};
    errorState = false;
    delayedAdded = false;
    touched = null;
    startTime = Date.now();
    clearTimeout(flashTimer);
  }

  function start(data, hooks) {
    DATA = data;
    MODE = data.mode;
    HOOKS = hooks || {};
    reset();
    setLeaveSheet();
    el.finish.hidden = true;
    el.finish.innerHTML = "";
    el.shell.hidden = false;
    var hide = el.moreList.querySelector('[data-act="over"]');
    if (hide) hide.parentNode.hidden = MODE !== "lesson";
    var saved = savedSitting();
    var wantsContinue = /[?&]continue=1/.test(window.location.search);
    if (MODE === "lesson") initLesson();
    else if (MODE === "test") initTest();
    else if (MODE === "practice") initPractice();
    else if (MODE === "placement") {
      var chooser = $("placement-start");
      if (saved && saved.placement) {
        if (chooser) chooser.hidden = true;
        initPlacement(saved.placement.startIdx);
        if (wantsContinue) restoreSitting(saved); else offerContinue(saved);
        return;
      }
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
            el.btnMore.focus();
          });
        }
        return;
      }
      initPlacement(0);
    }
    if (saved) { if (wantsContinue) restoreSitting(saved); else offerContinue(saved); return; }
    render();
  }

  window.mdRunner = {
    start: start,
    results: function () { return results; },
    segments: function () { return segments; },
    pos: function () { return pos; },
    mode: function () { return MODE; },
  };

  var dataEl = document.getElementById("runner-data");
  if (dataEl) {
    var boot = function () { start(JSON.parse(dataEl.textContent)); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  } else {
    el.shell.hidden = true;
  }
})();
