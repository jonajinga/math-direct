// Teach Direct lesson engine.
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
    touched: $("tp-touched"), testNote: $("tp-test-note"), signal: $("tp-signal"),
    btnMore: $("btn-more"), btnShow: $("btn-show"), btnClear: $("btn-clear"), btnDot: $("btn-dot"), btnError: $("btn-error"), btnOver: $("btn-over"),
    btnNext: $("btn-next"), btnFirm: $("btn-firm"), btnGoOn: $("btn-goon"), btnBigBack: $("btn-big-back"),
    moreList: $("more-list"), outlineList: $("tp-outline-list"), outlineLinks: $("tp-outline-links"),
    childList: $("sheet-child-list"), childText: $("sheet-child-text"), leaveTitle: $("sheet-leave-title"), leaveText: $("sheet-leave-text"), leaveGo: $("sheet-leave-go"),
    withTitle: $("sheet-with-title"), withText: $("sheet-with-text"), withList: $("sheet-with-list"), withLabel: $("more-with-label"),
    shell: $("runner-shell"), finish: $("runner-finish"), teacher: $("tp-body"),
  };
  var P = window.mathProgress;

  // ── State ──
  var DATA = null, MODE = "", HOOKS = {};
  var segments = [];
  var pos = { seg: 0, step: 0 };
  var results = {}; // step uid -> { first: "firm" | "error", last: "firm" | "error", n: tries }
  var inserted = []; // steps added while teaching: retests after corrections { seg, at, from }, and turns { kind: "turn", seg, at, from, child }
  var sitting = { children: [], group: false }; // the child, or the two children, being taught: [{ id, name }]
  var moved = false; // the parent moved or marked something in this sitting
  var errorState = false; // showing a correction after an Error
  var delayedAdded = false;
  var flashTimer = null;
  var startTime = Date.now();
  var touched = null; // what the child touched on this step: { idx, right }
  var placement = { idx: 0, startIdx: 0, passed: {}, failed: {}, direction: 1 };
  var where = { child: "", level: "", name: "", ex: "", exShort: "" };
  var leaving = false; // set when the parent leaves through a sheet, so the browser does not ask again
  var rehearsing = false; // a run without a child: nothing is recorded or saved
  var stepShown = 0; // when the current step was drawn, for response times
  var segTimes = {}; // seconds spent in each segment
  var segEntered = 0, segIndex = -1;
  var resumed = false;
  var timed = null; // the one-minute check: { ends, timer }
  var checkout = null; // a reading checkout: { seg, started, errors, timer, round, results: [{ child, rec }], done }

  function key(s, i) { var st = segments[s] && segments[s].steps[i]; return st ? st.uid : s + ":" + i; }
  function firstOf(k) { var r = results[k]; return r ? r.first : null; }
  function lastOf(k) { var r = results[k]; return r ? r.last : null; }
  function assignUids() {
    segments.forEach(function (s, si) { s.steps.forEach(function (st, i) { if (!st.uid) st.uid = si + ":" + i; }); });
  }
  function currentSeg() { return segments[pos.seg]; }
  function currentStep() { var s = currentSeg(); return s ? s.steps[pos.step] : null; }
  function escapeHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function escapeAttr(s) { return escapeHtml(s).replace(/"/g, "&quot;"); }
  function childName() { return sitting.children.map(function (c) { return c.name; }).join(" and "); }
  // Two children: the active child and the one named by ?with=<id>, in a lesson only.
  function setSitting() {
    sitting = { children: [], group: false };
    var p = P && P.getActiveProfile ? P.getActiveProfile() : null;
    if (p) sitting.children.push({ id: p.id, name: p.name });
    var m = /[?&]with=([^&]+)/.exec(window.location.search);
    if (!m || !p || MODE !== "lesson" || rehearsing || !P.getProfile) return;
    var other = P.getProfile(decodeURIComponent(m[1]));
    if (!other || other.id === p.id) return;
    sitting.children.push({ id: other.id, name: other.name });
    sitting.group = true;
  }
  function childById(id) { return sitting.children.filter(function (c) { return c.id === id; })[0] || null; }
  function nameOf(id) { var c = childById(id); return c ? c.name : ""; }
  function otherChildId() { return sitting.group ? sitting.children[1].id : ""; }
  // The query that keeps a pair of children together from one lesson to the next.
  function withQuery() { return sitting.group ? "?with=" + encodeURIComponent(otherChildId()) : ""; }
  // Does a step count for this child? Unison steps count for both; a turn only for its child.
  function forChildOk(st, id) { return !id || !st.forChild || st.forChild === id; }
  function isExercise(seg) { return !!seg && seg.kind !== "delayed" && seg.kind !== "independent" && seg.kind !== "checkout"; }
  function thing() { return MODE === "test" ? "test" : MODE === "placement" ? "placement test" : MODE === "practice" || MODE === "timed" ? "practice" : "lesson"; }

  // ── Building scripts for each mode ──
  function initLesson() {
    var lesson = DATA.lesson;
    segments = lesson.exercises.map(function (ex) {
      if (ex.kind === "checkout") return { title: ex.title, meta: "Rate and accuracy · " + ex.words + " words", kind: "checkout", track: ex.track, n: ex.n, words: ex.words, goal: ex.goal, allowed: ex.allowed, passage: ex.passage, steps: ex.steps };
      return { title: ex.title, meta: ex.trackName + " · " + kindName(ex.kind), kind: ex.kind, track: ex.track, n: ex.n, materials: ex.materials, steps: ex.steps };
    });
    if (lesson.independent && lesson.independent.steps.length) {
      // With two children, the items are shared out one child at a time, so neither can copy.
      if (sitting.group) lesson.independent.steps.forEach(function (st, i) { st.forChild = sitting.children[i % 2].id; });
      segments.push({ title: "Independent work", meta: "Read each line once, give no help", kind: "independent", steps: lesson.independent.steps });
    }
    if (!rehearsing) adaptReview(lesson);
    assignUids();
    setWhere(lesson.levelName, "Lesson " + lesson.number);
    el.outlineLinks.innerHTML = '<a href="/' + lesson.levelSlug + '/">All ' + escapeHtml(lesson.levelName) + " lessons</a>";
  }

  // Review draws first from items the child missed in recent sittings: a
  // spare item missed recently takes the place of one that is firm, and
  // comes first. A lesson taught before draws the spare items in instead,
  // so a repeat is not the same lesson twice.
  function missedRecently(item) {
    var h = P && P.itemHistory ? P.itemHistory(item) : null;
    return !!(h && h.r && h.r.slice(-3).indexOf(0) !== -1);
  }
  function firmRecently(item) {
    var h = P && P.itemHistory ? P.itemHistory(item) : null;
    return !!(h && h.r && h.r.length >= 3 && h.r.slice(-3).every(function (x) { return x === 1; }));
  }
  function adaptReview(lesson) {
    if (!P || !P.itemHistory) return;
    var taughtBefore = P.lessonHistory ? P.lessonHistory(lesson.id).length : 0;
    lesson.exercises.forEach(function (ex, i) {
      var seg = segments[i];
      if (!seg || !ex.spare || !ex.spare.length || ex.kind === "new") return;
      var tests = seg.steps.filter(function (st) { return st.cue === "test" && st.item; });
      if (!tests.length) return;
      var spares = ex.spare.slice();
      // Spare items the child missed recently replace firm items.
      spares.filter(function (sp) { return sp.item && missedRecently(sp.item); }).forEach(function (sp) {
        var victim = tests.filter(function (st) { return firmRecently(st.item) && !st.missedNote; })[0];
        if (!victim) return;
        var at = seg.steps.indexOf(victim);
        var c = asTestStep(sp);
        c.missedNote = true;
        seg.steps[at] = c;
        tests[tests.indexOf(victim)] = c;
        spares.splice(spares.indexOf(sp), 1);
      });
      // A repeated lesson swaps in fresh items for the ones still firm.
      if (taughtBefore > 0) {
        var k = taughtBefore;
        tests.forEach(function (st) {
          if (!spares.length || st.missedNote || missedRecently(st.item)) return;
          if ((k++ % 2) === 0) { var at2 = seg.steps.indexOf(st); var fresh = asTestStep(spares.shift()); seg.steps[at2] = fresh; }
        });
      }
      // Items missed recently come first in the exercise.
      seg.steps.forEach(function (st) { if (st.cue === "test" && st.item && missedRecently(st.item)) st.missedNote = true; });
      var head = seg.steps.filter(function (st) { return st.cue !== "test"; });
      var firstTest = seg.steps.findIndex(function (st) { return st.cue === "test"; });
      if (firstTest > 0) head = seg.steps.slice(0, firstTest); else head = [];
      var rest = seg.steps.slice(head.length);
      rest.sort(function (a, b) { return (b.missedNote ? 1 : 0) - (a.missedNote ? 1 : 0); });
      seg.steps = head.concat(rest);
    });
  }

  function setWhere(level, name) {
    where.level = level;
    where.name = name;
  }

  function kindName(k) {
    return { "new": "new teaching", firm: "firming", review: "review", delayed: "delayed test", test: "test", practice: "practice", placement: "placement", checkout: "checkout" }[k] || k;
  }

  var testParts = [];
  function initTest() {
    var t = DATA.test;
    // ?parts=2,4 gives only those parts again (numbered from 1).
    var only = (new URLSearchParams(window.location.search).get("parts") || "").split(",").map(Number).filter(function (x) { return x >= 1 && x <= t.parts.length; });
    testParts = only.length ? only.map(function (x) { return x - 1; }) : t.parts.map(function (p, i) { return i; });
    segments = testParts.map(function (pi, i) {
      var p = t.parts[pi];
      // The passage part is a checkout: the clock runs while the child reads alone.
      if (p.kind === "checkout") return { title: p.trackName, meta: "Part " + (i + 1) + " of " + testParts.length + " · rate and accuracy · " + p.words + " words", kind: "checkout", part: pi, words: p.words, goal: p.goal, allowed: p.allowed, passage: p.passage, steps: p.items.map(function (s) { var c = {}; for (var k in s) c[k] = s[k]; return c; }) };
      return { title: p.trackName, meta: "Part " + (i + 1) + " of " + testParts.length, kind: "test", part: pi, steps: p.items.map(asTestStep) };
    });
    assignUids();
    setWhere(t.levelName + (t.final ? ", end of level" : ""), "Mastery Test " + t.number + (only.length ? ", " + only.length + " part" + (only.length > 1 ? "s" : "") + " again" : ""));
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
    assignUids();
    pos = { seg: 0, step: 0 };
    results = {};
    setWhere("Placement test", sec.title);
    el.outlineLinks.innerHTML = "";
  }

  // The one-minute fact check: facts released so far, newest set favored,
  // shuffled. The parent marks each answer; the next fact comes up at once.
  function initTimed() {
    var facts = DATA.facts || [];
    var next = P && DATA.level ? P.nextLesson(DATA.level.id, DATA.level.lessons) : 9999;
    var released = facts.filter(function (f) { return f.lesson < next; });
    if (!released.length) released = facts.slice(0, 12);
    var sets = 0;
    released.forEach(function (f) { if (f.set) sets = Math.max(sets, f.lesson); });
    var newest = released.filter(function (f) { return f.lesson >= next - 3; }), known = released.filter(function (f) { return f.lesson < next - 3; });
    function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    var order = [], ns = shuffle(newest), ks = shuffle(known);
    while (order.length < 60 && (ns.length || ks.length)) {
      if (ns.length && (order.length % 2 === 0 || !ks.length)) order.push(ns.shift()); else order.push(ks.shift());
      if (!ns.length && !ks.length) { ns = shuffle(newest); ks = shuffle(known); }
    }
    segments = [{ title: "Timed facts", meta: "One minute", kind: "timed", steps: order.map(function (f) { var st = asTestStep(f); delete st.lesson; return st; }) }];
    assignUids();
    var released2 = released.length;
    DATA.goal = Math.min(25, 8 + Math.floor(released2 / 12) * 2);
    setWhere(DATA.level ? DATA.level.name + " facts" : "Facts", "Timed check");
    el.outlineLinks.innerHTML = '<a href="/practice/">All practice</a>';
  }
  function startTimed() {
    timed = { ends: Date.now() + (DATA.seconds || 60) * 1000, timer: null };
    where.ex = (DATA.seconds || 60) + " s left";
    where.exShort = where.ex;
    fitStrip();
    timed.timer = setInterval(function () {
      var left = Math.max(0, Math.round((timed.ends - Date.now()) / 1000));
      where.ex = left + " s left";
      where.exShort = where.ex;
      fitStrip();
      if (left <= 10 && left > 0 && left % 5 === 0) announce(left + " seconds left.");
      if (left <= 0) finishTimed();
    }, 250);
  }
  window.addEventListener("md-end-timed", function () { if (timed) timed.ends = Date.now(); });
  function finishTimed() {
    if (!timed) return;
    clearInterval(timed.timer);
    timed = null;
    var tl = tally();
    var goal = DATA.goal || 10;
    if (P && P.recordTimed && !rehearsing) P.recordTimed({ date: new Date().toISOString(), level: DATA.level ? DATA.level.id : "", right: tl.firm, errors: tl.errors, goal: goal });
    var html = '<article class="finish"><p class="finish__kicker">Timed facts' + (childName() ? " · " + escapeHtml(childName()) : "") + "</p>";
    html += '<h1 class="finish__title">' + tl.firm + " right in one minute</h1>";
    html += '<dl class="finish__facts"><div><dt>Right</dt><dd>' + tl.firm + "</dd></div><div><dt>Errors</dt><dd>" + tl.errors + "</dd></div><div><dt>Goal</dt><dd>" + goal + "</dd></div></dl>";
    html += '<div class="finish__advice"><p>' + (tl.firm >= goal ? "<strong>At the goal.</strong> The goal rises as more facts are released." : "<strong>Below the goal of " + goal + ".</strong> Keep the daily Quick facts going, and give this check again in a week.") + "</p></div>";
    html += '<ul class="finish__links"><li><a href="/records/">Records</a></li></ul></article>';
    showFinish(html, actionBar({ label: "Again", act: "again" }, { label: "All practice", href: DATA.exitUrl || "/practice/" }));
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
    assignUids();
    setWhere(set.levelName + " practice", set.title);
    el.outlineLinks.innerHTML = '<a href="' + escapeAttr(DATA.exitUrl || "/practice/") + '">' + escapeHtml(DATA.exitLabel || "All practice") + "</a>";
  }

  // ── The strip: one line that shortens itself rather than clip ──
  function renderStrip() {
    var seg = currentSeg();
    where.child = rehearsing ? "Rehearsal" : childName();
    if (checkoutRunning()) { where.ex = "Checkout " + clockText(); where.exShort = where.ex; }
    else if (MODE === "lesson") { where.ex = "Exercise " + (pos.seg + 1) + " of " + segments.length; where.exShort = "Ex " + (pos.seg + 1) + " of " + segments.length; }
    else if (MODE === "test") { where.ex = "Part " + (pos.seg + 1) + " of " + segments.length; where.exShort = where.ex; }
    else if (MODE === "placement") { where.ex = "Section " + (placement.idx + 1) + " of " + DATA.sections.length; where.exShort = where.ex; }
    else if (MODE === "timed") { where.ex = timed ? Math.max(0, Math.round((timed.ends - Date.now()) / 1000)) + " s left" : ""; where.exShort = where.ex; }
    else { where.ex = seg ? (pos.step + 1) + " of " + seg.steps.length : ""; where.exShort = where.ex; }
    fitStrip();
  }
  function fitStrip() {
    var tries = [
      [where.child, where.level, where.name, where.ex],
      [where.child, where.level, where.name, where.exShort],
      [where.child, where.name, where.exShort],
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
        if (firstOf(st.uid) === "error") errs++;
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
  function cueLabel(c, seg, st) {
    if (MODE === "timed") return "Timed";
    if (seg && seg.kind === "checkout") return "Checkout";
    if (MODE === "test" || MODE === "placement") return "Test item";
    if (st && st.forChild && sitting.group) return nameOf(st.forChild) + " alone";
    if (seg && seg.kind === "independent") return "On your own";
    return { model: "My turn", lead: "Together", test: "Your turn", note: "Set up" }[c] || "";
  }
  function isOwn() { var seg = currentSeg(); return !!seg && seg.kind === "independent"; }

  // The signal for a test step: touch, a hand drop, a rhythm, or a watch.
  var SIGNALS = {
    touch: ["Touch", "The child touches the screen."],
    drop: ["Drop", "Pause, then drop your hand or nod. The child answers on the signal."],
    rhythm: ["Rhythm", "Tap a steady beat. The child says one number on each tap."],
    watch: ["Watch", "Watch and listen for the whole answer."],
    hold: ["Hold", "Press and hold Dot. The child says the sound as long as the dot rests under it."],
    tap: ["Tap", "Press Dot and let go at once. The child says the sound short."],
    sweep: ["Sweep", "Tap Dot once at the start. The dot runs under the word, and the child says it fast."],
  };
  function renderSignal(st) {
    var box = el.signal;
    if (!box) return;
    if (!st || st.cue !== "test" || !st.signal || !SIGNALS[st.signal] || MODE === "timed") { box.hidden = true; box.textContent = ""; return; }
    var sig = SIGNALS[st.signal];
    box.innerHTML = '<span class="tp-signal__glyph tp-signal__glyph--' + st.signal + '" aria-hidden="true"></span><span class="tp-signal__word">' + sig[0] + "</span>" + (st.pause ? '<span class="tp-signal__pause"> · pause ' + st.pause + " seconds</span>" : "");
    box.setAttribute("title", sig[1]);
    box.setAttribute("aria-label", "Signal: " + sig[0].toLowerCase() + ". " + sig[1] + (st.pause ? " Pause " + st.pause + " seconds first." : ""));
    box.hidden = false;
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
    if (window.MDDot) MDDot.attach(stage, announce);
    if (st.flash) startFlash(st.flash);

    el.exTitle.textContent = seg.title;
    el.exMeta.textContent = seg.meta || "";
    el.stepNo.textContent = (pos.step + 1) + " of " + seg.steps.length;
    el.stepNo.setAttribute("aria-label", "Step " + (pos.step + 1) + " of " + seg.steps.length);
    renderSignal(st);
    var testing = MODE === "test" || MODE === "placement" || MODE === "timed";
    var own = seg.kind === "independent";
    var turn = !!(st.forChild && sitting.group);
    el.cue.textContent = cueLabel(st.cue, seg, st);
    var co = seg.kind === "checkout";
    if (checkout && !checkout.done && checkout.seg !== pos.seg) stopCheckoutClock(true);
    el.cue.className = "tp-cue tp-cue--" + (testing || co ? "test" : turn ? "turn" : own ? "own" : st.cue);
    el.say.textContent = st.say || "";
    setBox(el.doBox, el.doText, own ? "" : st["do"] || (seg.materials && pos.step === 0 ? "You will need: " + seg.materials + "." : ""));
    setBox(el.answerBox, el.answerText, numeralChains(st.answer || ""));
    setBox(el.confirmBox, el.confirmText, !testing && !own && st.cue === "test" ? st.confirm : "");
    setBox(el.correctBox, el.correctText, !testing && !own && st.cue === "test" ? numeralChains(st.correct) : "");
    el.correctBox.classList.remove("is-active");
    el.touched.hidden = true;
    el.touched.textContent = "";
    el.testNote.textContent = co ? checkoutNote(seg) : MODE === "timed" ? "Mark each answer at once. The next fact comes up by itself." :
      testing ? "This is a test. Do not correct or help. Mark each answer and go on." :
      own && turn ? "Read the line once. Give no help. Mark " + nameOf(st.forChild) + "'s answer." :
      own ? "Read the line once. Give no help. Mark the answer." :
      turn && st.retestOf ? nameOf(st.forChild) + " answers alone, asked again after the correction." :
      turn ? nameOf(st.forChild) + " answers alone. Mark " + nameOf(st.forChild) + "'s answer." :
      st.retestOf ? "Asked again after the correction. Mark it as before." :
      st.missedNote ? "Missed last time. Watch this one." : "";
    el.testNote.hidden = !el.testNote.textContent;
    if (co && checkout && checkout.seg === pos.seg && checkout.results.length) {
      el.touched.textContent = checkout.results.map(function (x) { return checkoutLine(x); }).join(" ");
      el.touched.hidden = false;
    }
    stepShown = Date.now();
    if (segIndex !== pos.seg) {
      var now = Date.now();
      if (segIndex >= 0) segTimes[segIndex] = (segTimes[segIndex] || 0) + (now - segEntered) / 1000;
      segIndex = pos.seg;
      segEntered = now;
    }

    renderStrip();
    renderRail();
    renderOutline();
    syncBar();
    fitPanel();
    saveSession();
    announce((cueLabel(st.cue, seg, st) ? cueLabel(st.cue, seg, st) + ". " : "") + (st.say || ""));
  }

  // ── The sitting: saved after every move and mark, cleared when finished ──
  // Practice sets draw new items each time, so they are not saved.
  function sessionId() { return DATA.lesson ? DATA.lesson.id : DATA.test ? DATA.test.id : MODE; }
  function markCount() { var n = 0; for (var k in results) n++; return n; }
  function saveSession() {
    if (!P || !P.saveSession || MODE === "practice" || MODE === "timed" || !DATA || rehearsing) return;
    if (!markCount() && !moved && MODE !== "placement") return;
    P.saveSession({
      kind: MODE, url: sittingUrl(), id: sessionId(),
      title: (where.level ? where.level + " · " : "") + where.name, where: where.ex, marks: markCount(),
      pos: { seg: pos.seg, step: pos.step }, results: results, delayedAdded: delayedAdded, inserted: inserted,
      placement: MODE === "placement" ? placement : null, elapsed: Date.now() - startTime,
      with: otherChildId() || null, children: sitting.children.map(function (c) { return c.name; }),
    });
  }
  // The page a sitting belongs to: a partial test keeps its parts, a lesson for two keeps the pair.
  function sittingUrl() {
    if (MODE === "test") return window.location.pathname + (/[?&]parts=/.test(window.location.search) ? window.location.search.replace(/[?&]continue=1/, "").replace(/^&/, "?") : "");
    return window.location.pathname + withQuery();
  }
  function clearSession() { if (P && P.clearSession) P.clearSession(); }
  function savedSitting() {
    if (!P || !P.loadSession || MODE === "practice" || MODE === "timed" || rehearsing) return null;
    var s = P.loadSession();
    if (!s || s.url !== sittingUrl() || s.kind !== MODE) return null;
    if (!s.marks && !(s.pos && (s.pos.seg || s.pos.step)) && MODE !== "placement") return null;
    return s;
  }
  function restoreSitting(s) {
    if (MODE === "placement" && s.placement) {
      placement = s.placement;
      loadPlacementSection();
    }
    results = {};
    for (var k in (s.results || {})) {
      var v = s.results[k];
      results[k] = typeof v === "string" ? { first: v, last: v, n: 1 } : v;
    }
    inserted = [];
    (s.inserted || []).forEach(function (ins) {
      var seg = segments[ins.seg];
      if (!seg) return;
      var src = seg.steps.filter(function (st) { return st.uid === ins.from; })[0];
      if (!src) return;
      if (ins.kind === "turn") { if (sitting.group && childById(ins.child)) { insertTurn(seg, ins.seg, src, ins.child, Math.min(ins.at, seg.steps.length)); seg.turnsAdded = true; } }
      else insertRetest(seg, ins.seg, seg.steps.indexOf(src));
    });
    moved = true;
    delayedAdded = !!s.delayedAdded;
    if (delayedAdded && MODE === "lesson") {
      var del = buildDelayed();
      if (del) segments.push(del);
    }
    pos = { seg: Math.min(s.pos.seg, segments.length - 1), step: 0 };
    pos.step = Math.min(s.pos.step, segments[pos.seg].steps.length - 1);
    startTime = Date.now() - (s.elapsed || 0);
    resumed = true;
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
    for (var k in results) if (results[k].first === "error") return true;
    return false;
  }
  function isLastStep() {
    var seg = currentSeg();
    if (!seg || pos.seg !== segments.length - 1 || pos.step !== seg.steps.length - 1) return false;
    if (MODE === "lesson" && !delayedAdded && anyErrors()) return false;
    if (MODE === "lesson" && sitting.group && isExercise(seg) && !seg.turnsAdded && lastTestIndex(seg) >= 0) return false;
    return MODE !== "placement";
  }
  function syncBar() {
    var st = currentStep(), seg = currentSeg();
    var isTest = !!(st && st.cue === "test");
    var canOver = MODE === "lesson" && !!seg && seg.kind !== "delayed" && seg.kind !== "independent";
    var marks = st ? hasMarks(st.screen) : false;
    var showAgain = !!(st && (st.flash || touched));
    // In a reading step the tool slot holds Dot.
    var dotStep = !!(el.btnDot && stage.querySelector(".mdv-text[data-dot]:not([data-dot='none'])"));
    if (el.btnDot) el.btnDot.hidden = !dotStep;
    el.btnShow.hidden = dotStep || !showAgain;
    el.btnClear.hidden = dotStep || showAgain || !marks;
    var overNow = errorState && canOver;
    el.btnOver.hidden = !overNow;
    el.btnError.hidden = overNow;
    el.btnError.disabled = !isTest || errorState;
    el.btnGoOn.hidden = !errorState;
    el.btnFirm.hidden = errorState || !isTest;
    el.btnNext.hidden = errorState || isTest;
    el.btnNext.textContent = isLastStep() ? "Finish" : "Next";
    if (seg && seg.kind === "checkout") {
      // In a checkout the primary button runs the clock, and Error counts a word missed.
      var running = checkoutRunning(), done = !!(checkout && checkout.seg === pos.seg && checkout.done);
      el.btnOver.hidden = true;
      el.btnGoOn.hidden = true;
      el.btnFirm.hidden = true;
      el.btnError.hidden = false;
      el.btnError.disabled = !running;
      el.btnError.setAttribute("aria-pressed", "false");
      el.btnNext.hidden = false;
      el.btnNext.textContent = done ? (isLastStep() ? "Finish" : "Next") : !running ? "Start" : pos.step === seg.steps.length - 1 ? "Stop" : "Next";
    }
    var r = lastOf(key(pos.seg, pos.step));
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
    var cs = window.getComputedStyle(stage);
    var availW = stage.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
    var availH = stage.clientHeight - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0);
    var eqs = stage.querySelectorAll(".mdv-eq, .mdv-num, .mdv-col, .mdv-text");
    for (var i = 0; i < eqs.length; i++) {
      var e = eqs[i];
      e.style.fontSize = "";
      var tries = 0;
      while ((e.scrollWidth > e.clientWidth + 1 || e.scrollWidth > availW || e.scrollHeight > availH) && tries < 25) {
        var fs = parseFloat(window.getComputedStyle(e).fontSize);
        e.style.fontSize = (fs * 0.9) + "px";
        tries++;
      }
    }
    if (window.MDDot) MDDot.layout();
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
    if (window.MDDot) MDDot.attach(stage, announce);
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
      s.steps.forEach(function (st) { if (firstOf(st.uid) === "error") errs++; });
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
    var st = currentStep(), seg = currentSeg();
    if (!st || st.cue !== "test" || errorState) return;
    var k = st.uid, cur = results[k];
    if (!cur) results[k] = { first: r, last: r, n: 1 };
    else { cur.last = r; cur.n++; }
    moved = true;
    if (st.fact && P && P.recordFact && !cur && !rehearsing) {
      var ms = Date.now() - stepShown;
      if (sitting.group && P.recordFactFor) sitting.children.forEach(function (c) { if (forChildOk(st, c.id)) P.recordFactFor(c.id, st.fact, r === "firm", ms); });
      else P.recordFact(st.fact, r === "firm", ms);
    }
    // A sound, in reading, is recorded like a fact: the mark and the seconds it took.
    if (st.sound && P && P.recordSound && !cur && !rehearsing) {
      var sms = Date.now() - stepShown;
      if (sitting.group && P.recordSoundFor) sitting.children.forEach(function (c) { if (forChildOk(st, c.id)) P.recordSoundFor(c.id, st.sound, r === "firm", sms); });
      else P.recordSound(st.sound, r === "firm", sms);
    }
    saveSession();
    if (r === "firm" || MODE === "test" || MODE === "placement" || MODE === "timed" || seg.kind === "independent") {
      announce(r === "firm" ? "Marked firm." : "Marked as an error.");
      advance();
      return;
    }
    // In a lesson, a missed item comes back two items later, as Direct
    // Instruction does within a task. A retest that is missed again is not
    // doubled; the delayed test at the end catches it.
    if (MODE === "lesson" && seg.kind !== "delayed" && !st.retestOf && !cur) insertRetest(seg, pos.seg, pos.step);
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

  function insertRetest(seg, si, i) {
    var st = seg.steps[i];
    st.retests = (st.retests || 0) + 1;
    var clone = asTestStep(st);
    delete clone.retests;
    clone.retestOf = st.uid;
    clone.uid = st.uid + ":r" + st.retests;
    var at = Math.min(i + 3, seg.steps.length);
    seg.steps.splice(at, 0, clone);
    inserted.push({ seg: si, at: at, from: st.uid });
  }

  // Two children: when the last test step of an exercise is done, each child
  // takes one turn alone, as Direct Instruction gives individual turns after
  // the group is firm. The child with more errors so far goes first. The item
  // is one the group missed in this exercise, or else the exercise's last.
  function lastTestIndex(seg) {
    for (var i = seg.steps.length - 1; i >= 0; i--) if (seg.steps[i].cue === "test") return i;
    return -1;
  }
  function turnOrder() {
    var errs = {};
    sitting.children.forEach(function (c) { errs[c.id] = tally(isExercise, null, c.id).errors; });
    return sitting.children.slice().sort(function (a, b) { return errs[b.id] - errs[a.id]; });
  }
  function insertTurns(seg, si) {
    seg.turnsAdded = true;
    var tests = seg.steps.filter(function (st) { return st.cue === "test" && !st.forChild; });
    if (!tests.length) return;
    var missed = tests.filter(function (st) { return !st.retestOf && firstOf(st.uid) === "error"; });
    var plain = tests.filter(function (st) { return !st.retestOf; });
    var pool = missed.length ? missed : [plain.length ? plain[plain.length - 1] : tests[tests.length - 1]];
    var at = lastTestIndex(seg) + 1;
    turnOrder().forEach(function (c, i) { insertTurn(seg, si, pool[i % pool.length], c.id, at + i); });
  }
  function insertTurn(seg, si, src, childId, at) {
    var c = asTestStep(src);
    delete c.retests; delete c.retestOf; delete c.missedNote;
    c.forChild = childId;
    c.turnOf = src.uid;
    c.uid = src.uid + ":c" + childId;
    seg.steps.splice(at, 0, c);
    inserted.push({ kind: "turn", seg: si, at: at, from: src.uid, child: childId });
  }

  // ── Checkouts: the child reads a passage alone while the clock runs ──
  function checkoutRunning() { return !!(checkout && checkout.seg === pos.seg && checkout.started && !checkout.done); }
  function inCheckout() { var seg = currentSeg(); return !!(seg && seg.kind === "checkout" && !(checkout && checkout.seg === pos.seg && checkout.done)); }
  function clockText() {
    var s = checkout && checkout.started ? Math.round((Date.now() - checkout.started) / 1000) : 0;
    return Math.floor(s / 60) + ":" + (s % 60 < 10 ? "0" : "") + (s % 60);
  }
  function checkoutChild() { return sitting.group ? sitting.children[checkout ? checkout.round : 0] : null; }
  function checkoutNote(seg) {
    var done = !!(checkout && checkout.seg === pos.seg && checkout.done);
    if (done) return "The checkout is recorded. Tap Next to go on.";
    var who = sitting.group ? nameOf((checkoutChild() || {}).id) + " reads alone. " : "The child reads alone. ";
    if (!checkoutRunning()) return who + "Tap Start as the reading begins. Give no help.";
    return who + "Tap Error for each word missed. Tap " + (pos.step === seg.steps.length - 1 ? "Stop at the end." : "Next at the end of the line.");
  }
  function checkoutLine(x) {
    var r = x.rec;
    return (x.child ? x.child.name + ": " : "") + r.wpm + " words a minute, " + r.errors + (r.errors === 1 ? " error" : " errors") + ". " +
      (r.met ? "At the goal of " + r.goal + "." : "The goal is " + r.goal + " a minute with " + r.allowed + " errors or fewer.");
  }
  function startCheckoutClock() {
    checkout.started = Date.now();
    checkout.errors = 0;
    checkout.timer = setInterval(function () { renderStrip(); }, 500);
  }
  function stopCheckoutClock(abandon) {
    if (!checkout) return;
    clearInterval(checkout.timer);
    checkout.timer = null;
    if (abandon) checkout = null;
  }
  function checkoutNext() {
    var seg = currentSeg();
    if (!checkout || checkout.seg !== pos.seg) checkout = { seg: pos.seg, started: 0, errors: 0, timer: null, round: 0, results: [], done: false };
    if (!checkout.started) {
      startCheckoutClock();
      announce("Clock started.");
      renderStrip();
      syncBar();
      el.testNote.textContent = checkoutNote(seg);
      return;
    }
    if (pos.step < seg.steps.length - 1) { pos.step++; render(); return; }
    // Stop: words a minute and errors, against the goal.
    var seconds = Math.max(1, Math.round((Date.now() - checkout.started) / 100) / 10);
    stopCheckoutClock(false);
    var child = checkoutChild();
    var wpm = Math.round((seg.words / seconds) * 60);
    var src = DATA.lesson || DATA.test || {};
    var rec = { date: new Date().toISOString(), level: src.level, lesson: DATA.lesson ? DATA.lesson.number : src.afterLesson || 0, words: seg.words, seconds: seconds, errors: checkout.errors, wpm: wpm, goal: seg.goal, allowed: seg.allowed, met: wpm >= seg.goal && checkout.errors <= seg.allowed };
    if (DATA.test) rec.test = DATA.test.id;
    if (P && !rehearsing) {
      if (child && P.recordCheckoutFor) P.recordCheckoutFor(child.id, rec);
      else if (P.recordCheckout) P.recordCheckout(rec);
    }
    checkout.results.push({ child: child, rec: rec });
    announce("Clock stopped. " + checkoutLine(checkout.results[checkout.results.length - 1]));
    if (sitting.group && checkout.round < sitting.children.length - 1) {
      checkout.round++;
      checkout.started = 0;
      checkout.errors = 0;
      pos.step = 0;
      render();
      return;
    }
    checkout.done = true;
    moved = true;
    render();
  }
  function checkoutError() {
    if (!checkoutRunning()) return;
    checkout.errors++;
    el.btnError.setAttribute("aria-pressed", "true");
    setTimeout(function () { el.btnError.setAttribute("aria-pressed", "false"); }, 200);
    announce(checkout.errors + (checkout.errors === 1 ? " error." : " errors."));
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
    moved = true;
    var seg = currentSeg();
    if (sitting.group && MODE === "lesson" && isExercise(seg) && !seg.turnsAdded && lastTestIndex(seg) === pos.step) insertTurns(seg, pos.seg);
    if (pos.step < seg.steps.length - 1) { pos.step++; render(); return; }
    if (pos.seg < segments.length - 1) { pos.seg++; pos.step = 0; render(); return; }
    endOfScript();
  }

  function back() {
    moved = true;
    if (pos.step > 0) pos.step--;
    else if (pos.seg > 0) { pos.seg--; pos.step = segments[pos.seg].steps.length - 1; }
    else return;
    render();
  }

  function jump(seg, step) {
    moved = true;
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
        if (st.retestOf || firstOf(st.uid) !== "error") return;
        var c = asTestStep(st);
        delete c.retests;
        c.from = { seg: si, step: i, uid: st.uid };
        c.uid = st.uid + ":d";
        delete c.independent;
        missed.push(c);
      });
    });
    return missed.length ? { title: "Missed items, once more", meta: "Delayed test", kind: "delayed", steps: missed } : null;
  }
  function endOfScript() {
    if (MODE === "timed") return finishTimed();
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

  // Counts the first-try results of the steps a filter admits; retest
  // steps added after corrections are counted apart.
  function tally(filter, which, childId) {
    var firm = 0, errors = 0;
    segments.forEach(function (s) {
      if (filter && !filter(s)) return;
      s.steps.forEach(function (st) {
        if (which === "retest" ? !st.retestOf : !!st.retestOf) return;
        if (!forChildOk(st, childId)) return;
        var r = firstOf(st.uid);
        if (r === "firm") firm++;
        if (r === "error") errors++;
      });
    });
    return { firm: firm, errors: errors };
  }
  function itemResults(childId) {
    var items = {};
    segments.forEach(function (s) {
      if (s.kind === "delayed") return;
      s.steps.forEach(function (st) {
        if (!st.item || st.retestOf || !results[st.uid] || !forChildOk(st, childId)) return;
        var r = results[st.uid];
        if (!items[st.item]) items[st.item] = { first: r.first === "firm", last: r.last === "firm" };
        else items[st.item].last = r.last === "firm";
      });
    });
    // A retest's result is the item's latest.
    segments.forEach(function (s) {
      s.steps.forEach(function (st) {
        if (st.item && (st.retestOf || s.kind === "delayed") && results[st.uid] && items[st.item] && forChildOk(st, childId)) items[st.item].last = results[st.uid].last === "firm";
      });
    });
    return items;
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
    if (timed) { clearInterval(timed.timer); timed = null; }
    bigPicture(false);
    clearSession();
    el.shell.hidden = true;
    el.finish.innerHTML = html + (bar || "");
    el.finish.hidden = false;
    window.scrollTo(0, 0);
    var h1 = el.finish.querySelector("h1");
    if (h1) { h1.setAttribute("tabindex", "-1"); h1.focus(); }
    var rows = el.finish.querySelectorAll("[data-mark-kind]");
    for (var ri = 0; ri < rows.length; ri++) (function (row) {
      row.addEventListener("click", function (e) {
        var b = e.target.closest("[data-mark]");
        if (!b || !P) return;
        var v = b.getAttribute("data-mark"), id = row.getAttribute("data-mark-id"), child = row.getAttribute("data-mark-child") || null;
        if (row.getAttribute("data-mark-kind") === "lesson") P.setLessonStatus(id, v, child);
        else P.setTestStatus(id, v);
        var all = row.querySelectorAll("[data-mark]");
        for (var i = 0; i < all.length; i++) all[i].setAttribute("aria-pressed", all[i] === b ? "true" : "false");
        if (window.MD && MD.toast) MD.toast("Marked " + b.textContent.toLowerCase() + (child ? " for " + nameOf(child) : "") + ".");
      });
    })(rows[ri]);
    var noteBtn = $("finish-note-save");
    if (noteBtn) {
      noteBtn.addEventListener("click", function () {
        var t = $("finish-note").value.trim();
        if (t && P) {
          var ref = DATA.lesson ? DATA.lesson.id : DATA.test ? DATA.test.id : "";
          // A note made after a lesson for two children goes to both records.
          if (sitting.group && P.addNoteFor) sitting.children.forEach(function (c) { P.addNoteFor(c.id, t, ref); });
          else P.addNote(t, ref);
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

  // One child's results for the lesson: the unison steps, plus that child's
  // own turns when two were taught. With one child, every step is theirs.
  function lessonReport(c, minutes, pace) {
    var id = sitting.group ? c.id : null;
    var main = tally(isExercise, null, id);
    var retests = tally(isExercise, "retest", id);
    var own = tally(function (s) { return s.kind === "independent"; }, null, id);
    var delayed = tally(function (s) { return s.kind === "delayed"; }, null, id);
    var turns = { firm: 0, errors: 0 };
    if (id) segments.forEach(function (s) {
      if (!isExercise(s)) return;
      s.steps.forEach(function (st) {
        if (st.forChild !== id || st.retestOf) return;
        var r = firstOf(st.uid);
        if (r === "firm") turns.firm++;
        if (r === "error") turns.errors++;
      });
    });
    var exErrors = [];
    segments.forEach(function (s, si) {
      if (!isExercise(s)) return;
      var errs = 0;
      s.steps.forEach(function (st) { if (!st.retestOf && forChildOk(st, id) && firstOf(st.uid) === "error") errs++; });
      if (errs) exErrors.push({ n: si + 1, title: s.title, track: s.track, errors: errs });
    });
    var stillMissed = [];
    var del = segments.filter(function (s) { return s.kind === "delayed"; })[0];
    if (del) {
      del.steps.forEach(function (st) {
        if (!forChildOk(st, id) || lastOf(st.uid) !== "error") return;
        var src = segments[st.from.seg];
        if (stillMissed.indexOf(src.title) === -1) stillMissed.push(src.title);
      });
    }
    var total = main.firm + main.errors;
    var repeat = total > 0 && (main.errors / total > 0.25 || stillMissed.length > 1);
    var ownTotal = own.firm + own.errors;
    var summary = {
      date: new Date().toISOString(), minutes: minutes, firm: main.firm, errors: main.errors, firstTry: true, pace: pace, resumed: resumed,
      retestFirm: retests.firm, retestErrors: retests.errors,
      delayedFirm: delayed.firm, delayedErrors: delayed.errors, exercises: exErrors, stillMissed: stillMissed, repeat: repeat,
      independent: ownTotal ? { firm: own.firm, errors: own.errors } : null,
      checkout: checkoutResult(id),
    };
    if (sitting.group) {
      summary.group = true;
      summary.with = sitting.children.filter(function (x) { return x.id !== id; }).map(function (x) { return x.name; }).join(" and ");
      summary.turns = turns;
    }
    return { child: c, id: id, summary: summary, main: main, retests: retests, own: own, delayed: delayed, turns: turns, exErrors: exErrors, stillMissed: stillMissed, repeat: repeat, ownTotal: ownTotal, ownLow: ownTotal > 0 && own.firm / ownTotal < 0.85, hadDelayed: delayed.firm + delayed.errors > 0 };
  }
  // The checkout's result for one child: words a minute, errors, the goal.
  function checkoutResult(childId) {
    if (!checkout || !checkout.results.length) return null;
    var x = checkout.results.filter(function (y) { return !childId || (y.child && y.child.id === childId); })[0];
    if (!x) return null;
    return { wpm: x.rec.wpm, errors: x.rec.errors, goal: x.rec.goal, allowed: x.rec.allowed, words: x.rec.words, seconds: x.rec.seconds, met: x.rec.met };
  }
  function reportFacts(r) {
    var html = "<div><dt>Firm</dt><dd>" + r.main.firm + "</dd></div><div><dt>Errors</dt><dd>" + r.main.errors + "</dd></div>";
    if (sitting.group && r.turns.firm + r.turns.errors) html += "<div><dt>Alone</dt><dd>" + r.turns.firm + " of " + (r.turns.firm + r.turns.errors) + "</dd></div>";
    if (r.retests.firm + r.retests.errors) html += "<div><dt>Asked again</dt><dd>" + r.retests.firm + " of " + (r.retests.firm + r.retests.errors) + "</dd></div>";
    if (r.hadDelayed) html += "<div><dt>Retest</dt><dd>" + r.delayed.firm + " of " + (r.delayed.firm + r.delayed.errors) + "</dd></div>";
    if (r.ownTotal) html += "<div><dt>On your own</dt><dd>" + r.own.firm + " of " + r.ownTotal + "</dd></div>";
    if (r.summary.checkout) html += "<div><dt>Checkout</dt><dd>" + r.summary.checkout.wpm + " a minute, " + r.summary.checkout.errors + (r.summary.checkout.errors === 1 ? " error" : " errors") + "</dd></div>";
    return html;
  }
  function reportAdvice(r, whom) {
    var html = "";
    if (r.exErrors.length) {
      html += '<h' + (sitting.group ? 3 : 2) + ' class="finish__h2">Where the errors were</h' + (sitting.group ? 3 : 2) + '><ul class="finish__list">';
      r.exErrors.forEach(function (e) { html += "<li>Exercise " + e.n + ", " + escapeHtml(e.title) + ": " + e.errors + " error" + (e.errors > 1 ? "s" : "") + "</li>"; });
      html += "</ul>";
    }
    html += '<div class="finish__advice">';
    if (rehearsing) {
      html += "<p><strong>This was a rehearsal.</strong> Nothing was recorded.</p>";
    } else if (r.repeat) {
      html += "<p><strong>Repeat this lesson" + (whom ? " with " + escapeHtml(whom) : "") + " next time.</strong> " + (r.stillMissed.length > 1 ? "Several items were still missed at the end of the lesson." : "More than one answer in four needed correcting.") + " Repeating a lesson is normal; it makes sure each step is firm before the next is built on it.</p>";
    } else if (r.stillMissed.length) {
      html += "<p><strong>Go on to the next lesson, but first reteach one exercise" + (whom ? " with " + escapeHtml(whom) : "") + ".</strong> At the start of the next session, teach this exercise again from the beginning: " + escapeHtml(r.stillMissed.join(", ")) + ".</p>";
    } else {
      html += "<p><strong>" + (whom ? escapeHtml(whom) + " can go on to the next lesson." : "Go on to the next lesson.") + "</strong> Every item was firm by the end.</p>";
    }
    if (r.ownLow && !rehearsing) html += "<p>On your own, " + r.own.errors + " of " + r.ownTotal + " were missed. Before the next lesson, go over those items with " + (whom ? escapeHtml(whom) : "the child") + ".</p>";
    var co = r.summary.checkout;
    if (co && !rehearsing) html += "<p>" + (co.met ? "The checkout met its goal of " + co.goal + " words a minute with " + co.allowed + " errors or fewer." : "The checkout read " + co.wpm + " words a minute with " + co.errors + (co.errors === 1 ? " error" : " errors") + "; the goal is " + co.goal + " a minute with " + co.allowed + " or fewer. Read the passage again the fast way before the next lesson.") + "</p>";
    html += "</div>";
    return html;
  }

  function finishLesson(minutes) {
    var lesson = DATA.lesson;
    if (segIndex >= 0) { segTimes[segIndex] = (segTimes[segIndex] || 0) + (Date.now() - segEntered) / 1000; segEntered = Date.now(); }
    var teachSeconds = 0;
    segments.forEach(function (s, i) { if (isExercise(s)) teachSeconds += segTimes[i] || 0; });
    var all = tally(isExercise), allRetests = tally(isExercise, "retest");
    var pace = teachSeconds > 0 ? Math.round(((all.firm + all.errors + allRetests.firm + allRetests.errors) / (teachSeconds / 60)) * 10) / 10 : null;
    var showPace = pace && teachSeconds >= 30;
    var kids = sitting.children.length ? sitting.children : [{ id: null, name: "" }];
    var reports = kids.map(function (c) { return lessonReport(c, minutes, pace); });
    if (P && !rehearsing) reports.forEach(function (r) {
      if (r.id && P.recordLessonFor) { P.recordLessonFor(r.id, lesson.id, r.summary); if (P.recordItemsFor) P.recordItemsFor(r.id, itemResults(r.id), r.summary.date); }
      else { P.recordLesson(lesson.id, r.summary); if (P.recordItems) P.recordItems(itemResults(), r.summary.date); }
    });

    var name = rehearsing ? "Rehearsal" : childName();
    var html = '<article class="finish">';
    html += '<p class="finish__kicker">' + escapeHtml(lesson.levelName) + (name ? " · " + escapeHtml(name) : "") + "</p>";
    html += '<h1 class="finish__title">Lesson ' + lesson.number + " is finished</h1>";
    html += '<dl class="finish__facts">';
    if (!sitting.group) html += reportFacts(reports[0]);
    html += "<div><dt>Time</dt><dd>" + minutes + " min</dd></div>";
    if (showPace) html += "<div><dt>Pace</dt><dd>" + pace + " a minute</dd></div>";
    html += "</dl>";
    if (showPace && !rehearsing) html += '<p class="finish__lead">Pace is answers a minute during the exercises. Direct Instruction aims for about ten on firm work; slower is right for new teaching.</p>';
    if (sitting.group) {
      reports.forEach(function (r) {
        html += '<section class="finish__child"><h2 class="finish__h2">' + escapeHtml(r.child.name) + '</h2><dl class="finish__facts">' + reportFacts(r) + "</dl>" + reportAdvice(r, r.child.name);
        if (!rehearsing) html += markRow("lesson", lesson.id, r.child);
        html += "</section>";
      });
    } else {
      html += reportAdvice(reports[0], "");
      if (!rehearsing) html += markRow("lesson", lesson.id);
    }
    if (!rehearsing) {
      html += '<ul class="finish__links"><li><a href="' + lesson.url + withQuery() + '">Teach this lesson again</a></li><li><a href="/records/">Records</a></li></ul>';
      html += noteForm();
    } else {
      html += '<ul class="finish__links"><li><a href="' + lesson.url + '">Teach this lesson</a></li><li><a href="' + lesson.url + '?rehearse=1">Rehearse it again</a></li></ul>';
    }
    html += "</article>";
    // A mastery test is given to one child at a time, so the pair is kept only on the next lesson.
    var primary = lesson.testAfter ? { label: lesson.testAfter.title, href: lesson.testAfter.url } : lesson.next ? { label: "Next: " + lesson.next.title, href: lesson.next.url + withQuery() } : null;
    var secondary = { label: "All lessons", href: "/" + lesson.levelSlug + "/" };
    showFinish(html, actionBar(primary || secondary, primary ? secondary : null));
  }

  // The teacher may overrule the advice: mark the lesson finished or to
  // repeat, or the test passed or to give again.
  function markRow(kind, id, child) {
    if (!P) return "";
    var opts = kind === "lesson" ? [["done", "Finished"], ["repeat", "To repeat"]] : [["passed", "Passed"], ["retake", "To give again"]];
    var cur = kind === "lesson" ? P.lessonStatus(id, child && P.getProfile ? P.getProfile(child.id) : undefined) : P.testStatus(id);
    var label = "Mark this " + kind + (child ? " for " + child.name : "");
    return '<div class="finish__mark" role="group" aria-label="' + escapeAttr(label) + '" data-mark-kind="' + kind + '" data-mark-id="' + id + '"' + (child ? ' data-mark-child="' + escapeAttr(child.id) + '"' : "") + '><span class="finish__mark-label">' + escapeHtml(label) + ":</span>" +
      opts.map(function (o) { return '<button type="button" class="finish__mark-btn" data-mark="' + o[0] + '" aria-pressed="' + (cur === o[0]) + '">' + o[1] + "</button>"; }).join("") + "</div>";
  }

  function noteForm() {
    return '<details class="finish__note"><summary>Add a note for your records</summary><div class="finish__note-body"><label class="sr-only" for="finish-note">Note</label><textarea id="finish-note" rows="2" placeholder="For example: confused six and nine; tired today."></textarea><button type="button" class="btn btn--secondary" id="finish-note-save">Save note</button></div></details>';
  }

  function finishTest(minutes) {
    var t = DATA.test;
    var partial = testParts.length < t.parts.length;
    var given = segments.map(function (seg) {
      var p = t.parts[seg.part], errs = 0;
      if (seg.kind === "checkout") {
        var co = checkoutResult(null);
        return { track: p.track, trackName: p.trackName, kind: "checkout", items: p.words, errors: co ? co.errors : 0, allowed: p.allowed, passed: !!(co && co.met), wpm: co ? co.wpm : 0, goal: p.goal, remedy: p.remedy, n: seg.part + 1 };
      }
      seg.steps.forEach(function (st) { if (firstOf(st.uid) === "error") errs++; });
      return { track: p.track, trackName: p.trackName, items: p.items.length, errors: errs, allowed: p.allowed, passed: errs <= p.allowed, remedy: p.remedy, n: seg.part + 1 };
    });
    var summary = { date: new Date().toISOString(), minutes: minutes, partial: partial, parts: given.map(function (p) { var o = { track: p.track, trackName: p.trackName, items: p.items, errors: p.errors, passed: p.passed }; if (p.kind === "checkout") { o.kind = "checkout"; o.wpm = p.wpm; o.goal = p.goal; } return o; }), passed: given.every(function (p) { return p.passed; }) };
    if (P) { P.recordTest(t.id, summary); if (P.recordItems) P.recordItems(itemResults(), summary.date); }
    // What the record now says, with the parts not given this time.
    var parts = given;
    if (partial && P) {
      var h = P.getActiveProfile() && P.getActiveProfile().tests[t.id];
      var rec = h && h[h.length - 1];
      if (rec && rec.parts) parts = rec.parts.map(function (rp) {
        var g = given.filter(function (x) { return x.track === rp.track; })[0];
        if (g) return g;
        var tp = t.parts.filter(function (x) { return x.track === rp.track; })[0];
        return { track: rp.track, trackName: rp.trackName, kind: rp.kind, wpm: rp.wpm, goal: rp.goal, items: rp.items, errors: rp.errors, passed: rp.passed, remedy: tp ? tp.remedy : [], n: t.parts.indexOf(tp) + 1, earlier: true };
      });
    }
    var failed = parts.filter(function (p) { return !p.passed; });

    var html = '<article class="finish">';
    html += '<p class="finish__kicker">' + escapeHtml(t.levelName) + (childName() ? " · " + escapeHtml(childName()) : "") + "</p>";
    html += '<h1 class="finish__title">' + escapeHtml(t.title) + ": results</h1>";
    if (!failed.length) {
      html += '<div class="finish__advice"><p><strong>Every part was passed.</strong> Go on to the next lesson.</p></div>';
    } else {
      html += '<div class="finish__advice"><p><strong>' + failed.length + " part" + (failed.length > 1 ? "s need" : " needs") + " reteaching.</strong> Teach the exercises listed below, then give only " + (failed.length > 1 ? "those parts" : "that part") + " of the test again before going on. A part is passed with every item right" + (t.parts.some(function (p) { return p.allowed; }) ? ", or one error in five or more" : "") + ".</p></div>";
    }
    if (failed.length) {
      html += '<h2 class="finish__h2">Reteach</h2><ul class="finish__list">';
      failed.forEach(function (p) {
        html += "<li><strong>" + escapeHtml(p.trackName) + "</strong>, " + errorsIn(p) + (p.earlier ? " last time" : "") + ": " +
          (p.remedy.map(function (r) { return r.lesson ? '<a href="' + r.url + '">Lesson ' + r.lesson + ", exercise " + r.exercise + "</a> (" + escapeHtml(r.label) + ")" : '<a href="' + r.url + '">' + escapeHtml(r.label) + "</a>"; }).join("; ") || "repeat the last three lessons' exercises for this skill") + ".</li>";
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
    var primary, secondary;
    if (failed.length) {
      primary = { label: "Give " + (failed.length > 1 ? "the failed parts" : "that part") + " again", href: t.url + "?parts=" + failed.map(function (p) { return p.n; }).join(",") };
      secondary = { label: "All lessons", href: "/" + t.levelSlug + "/" };
    } else {
      primary = t.next ? { label: t.next.title, href: t.next.url } : { label: "Records", href: "/records/" };
      secondary = t.next ? { label: "Records", href: "/records/" } : null;
    }
    showFinish(html, actionBar(primary, secondary));
  }

  function errorsIn(p) {
    if (p.kind === "checkout") return p.wpm + " words a minute with " + p.errors + " error" + (p.errors === 1 ? "" : "s") + " (the goal is " + p.goal + " with " + (p.allowed === undefined ? 2 : p.allowed) + " or fewer)";
    return p.errors + " error" + (p.errors === 1 ? "" : "s") + " in " + p.items;
  }

  function finishPractice() {
    var missed = [];
    var seg = segments[0];
    seg.steps.forEach(function (st) { if (lastOf(st.uid) === "error") missed.push(st); });
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
    showFinish(html, actionBar({ label: DATA.exitLabel ? "Again" : "Another set", act: "again" }, { label: DATA.exitLabel || "All practice", href: DATA.exitUrl || "/practice/" }));
  }

  // Another set starts in place: new items, no page load.
  function restartPractice() {
    if (HOOKS.again) { HOOKS.again(); return; }
    results = {};
    pos = { seg: 0, step: 0 };
    startTime = Date.now();
    if (MODE === "timed") { initTimed(); el.finish.hidden = true; el.finish.innerHTML = ""; el.shell.hidden = false; render(); startTimed(); el.btnMore.focus(); return; }
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
    if (P) P.recordPlacement({ date: new Date().toISOString(), subject: DATA.subject || "math", level: rec.level, lesson: rec.lesson, url: rec.url, label: label });
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
      case "with": renderWithSheet(); openAfterClose("sheet-with"); break;
      case "leave": openAfterClose("sheet-leave"); break;
    }
  }

  // Teach two children, or go back to one. Either way the lesson starts over,
  // since the answers so far were given by a different set of children.
  function renderWithSheet() {
    if (!el.withList) return;
    var a = sitting.children[0];
    if (sitting.group) {
      el.withTitle.textContent = "Teach one child";
      el.withText.textContent = "The marks made so far are dropped. The lesson starts over for the child you pick.";
      el.withList.innerHTML = sitting.children.map(function (c) {
        return '<li><button type="button" class="sheet__row" data-with="" data-active="' + escapeAttr(c.id) + '">' + escapeHtml(c.name) + " alone</button></li>";
      }).join("");
    } else {
      var others = (P ? P.getProfiles() : []).filter(function (p) { return !a || p.id !== a.id; });
      el.withTitle.textContent = "Teach two children";
      el.withText.textContent = "Both children answer together, and you mark each answer once for both. Each exercise ends with a turn for each child alone. The marks made so far are dropped, and the lesson starts over.";
      el.withList.innerHTML = others.map(function (p) {
        return '<li><button type="button" class="sheet__row" data-with="' + escapeAttr(p.id) + '">' + escapeHtml(a ? a.name : "") + " and " + escapeHtml(p.name) + "</button></li>";
      }).join("");
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
    el.leaveText.textContent = rehearsing ? "Nothing is recorded in a rehearsal." : MODE === "practice" ? "Marks made in a practice set are not kept." : "The marks are saved. You can continue later from Today.";
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
  el.btnNext.addEventListener("click", function () {
    var seg = currentSeg();
    if (seg && seg.kind === "checkout" && !(checkout && checkout.seg === pos.seg && checkout.done)) return checkoutNext();
    advance();
  });
  el.btnFirm.addEventListener("click", function () { mark("firm"); });
  el.btnError.addEventListener("click", function () {
    var seg = currentSeg();
    if (seg && seg.kind === "checkout") return checkoutError();
    mark("error");
  });
  el.btnOver.addEventListener("click", startOver);
  el.btnGoOn.addEventListener("click", function () { advance(); });
  el.btnShow.addEventListener("click", showAgain);
  el.btnClear.addEventListener("click", clearMarks);
  // Dot: press and hold. The pointer, or Space or Enter on the button.
  function dotDown() { if (!el.btnDot || el.btnDot.hidden) return; el.btnDot.classList.add("is-held"); if (window.MDDot) MDDot.press(); }
  function dotUp() { if (!el.btnDot) return; el.btnDot.classList.remove("is-held"); if (window.MDDot) MDDot.release(); }
  function dotStepShown() { return !!(el.btnDot && !el.btnDot.hidden && !el.shell.hidden); }
  if (el.btnDot) {
    el.btnDot.addEventListener("pointerdown", function (e) { if (e.button) return; e.preventDefault(); dotDown(); });
    el.btnDot.addEventListener("pointerup", dotUp);
    el.btnDot.addEventListener("pointercancel", dotUp);
    el.btnDot.addEventListener("pointerleave", dotUp);
    el.btnDot.addEventListener("keydown", function (e) { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); dotDown(); } });
    el.btnDot.addEventListener("keyup", function (e) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); dotUp(); } });
    el.btnDot.addEventListener("click", function (e) { e.preventDefault(); });
  }
  document.addEventListener("keyup", function (e) {
    if (e.key === " " && dotStepShown() && !anySheetOpen()) { e.preventDefault(); dotUp(); }
  });
  el.btnMore.addEventListener("click", function () { syncBar(); openSheet("sheet-more"); });
  el.btnBigBack.addEventListener("click", function () { bigPicture(false); });
  el.moreList.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]");
    if (!b || b.disabled) return;
    var a = b.getAttribute("data-act");
    if (a === "outline" || a === "keys" || a === "child" || a === "with" || a === "leave") { act(a); return; }
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
  if (el.withList) el.withList.addEventListener("click", function (e) {
    var b = e.target.closest("[data-with]");
    if (!b || !P) return;
    leaving = true;
    var withId = b.getAttribute("data-with"), activeId = b.getAttribute("data-active");
    if (P.clearSession) P.clearSession();
    if (activeId && P.switchProfile) P.switchProfile(activeId, true);
    window.location.href = window.location.pathname + (withId ? "?with=" + encodeURIComponent(withId) : "");
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
        if (inCheckout()) checkoutNext();
        else if (errorState) advance();
        else if (isTest) mark("firm");
        else advance();
        break;
      case "f": case "F": if (isTest && !errorState) { e.preventDefault(); mark("firm"); } break;
      case "x": case "X": case "e": case "E":
        if (inCheckout()) { e.preventDefault(); checkoutError(); }
        else if (isTest && !errorState) { e.preventDefault(); mark("error"); }
        break;
      case "ArrowLeft": e.preventDefault(); back(); break;
      case "s": case "S": e.preventDefault(); startOver(); break;
      case " ": e.preventDefault(); if (dotStepShown()) { if (!e.repeat) dotDown(); } else showAgain(); break;
      case "d": case "D": if (dotStepShown()) { e.preventDefault(); if (window.MDDot) MDDot.step(); } break;
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
  // Fonts load when text first shows them, which can be after a start screen
  // hides the runner; the panel is fitted again whenever a font arrives.
  function refitAll() { if (!el.shell.hidden && currentStep()) { fitPanel(); fitStrip(); fitStage(); } }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refitAll);
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener("loadingdone", refitAll);
  // Refit the panel whenever its body changes size: a turned screen, or a
  // keyboard that takes part of it.
  if (window.ResizeObserver) {
    new ResizeObserver(function () {
      if (el.teacher.clientHeight === lastHeight || el.shell.hidden || !currentStep()) return;
      lastHeight = el.teacher.clientHeight;
      fitPanel();
    }).observe(el.teacher);
    // The stage changes size when the layout tightens or the phone turns:
    // the pictures and the dot's track are laid out again for it.
    var lastStage = "";
    new ResizeObserver(function () {
      var now = stage.clientWidth + "x" + stage.clientHeight;
      if (now === lastStage || el.shell.hidden || !currentStep()) return;
      lastStage = now;
      fitStage();
    }).observe(stage);
  } else {
    window.addEventListener("resize", function () { if (!el.shell.hidden) fitPanel(); });
  }

  // ── Start ──
  function reset() {
    segments = [];
    pos = { seg: 0, step: 0 };
    results = {};
    inserted = [];
    moved = false;
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
    rehearsing = (MODE === "lesson" && /[?&]rehearse=1/.test(window.location.search)) || !!data.rehearse;
    reset();
    setSitting();
    setLeaveSheet();
    el.finish.hidden = true;
    el.finish.innerHTML = "";
    el.shell.hidden = false;
    var hide = el.moreList.querySelector('[data-act="over"]');
    if (hide) hide.parentNode.hidden = MODE !== "lesson";
    // Two children: offered in a lesson when there is a second child to teach.
    var withRow = el.moreList.querySelector('[data-act="with"]');
    if (withRow) withRow.parentNode.hidden = MODE !== "lesson" || rehearsing || !P || P.getProfiles().length < 2;
    if (el.withLabel) el.withLabel.textContent = sitting.group ? "Teach one child" : "Teach two children";
    var childRow = el.moreList.querySelector('[data-act="child"]');
    if (childRow) childRow.parentNode.hidden = sitting.group;
    var saved = savedSitting();
    var wantsContinue = /[?&]continue=1/.test(window.location.search);
    segTimes = {}; segIndex = -1; resumed = false;
    if (timed) { clearInterval(timed.timer); timed = null; }
    if (MODE === "lesson") initLesson();
    else if (MODE === "test") initTest();
    else if (MODE === "practice") initPractice();
    else if (MODE === "timed") {
      var tstart = $("timed-start");
      initTimed();
      if (tstart) {
        el.shell.hidden = true;
        tstart.hidden = false;
        var go = tstart.querySelector("[data-start-timed]");
        if (go) go.addEventListener("click", function () { tstart.hidden = true; el.shell.hidden = false; render(); startTimed(); el.btnMore.focus(); });
        return;
      }
      render();
      startTimed();
      return;
    }
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
    // A remedy link from a test opens the exercise it names.
    var ex = /#ex(\d+)/.exec(window.location.hash);
    if (ex && MODE === "lesson") { pos.seg = Math.max(0, Math.min(Number(ex[1]) - 1, segments.length - 1)); pos.step = 0; }
    render();
  }

  window.mdRunner = {
    start: start,
    results: function () { return results; },
    segments: function () { return segments; },
    pos: function () { return pos; },
    mode: function () { return MODE; },
    sitting: function () { return sitting; },
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
