// Teach Direct progress store. Everything stays in this browser's localStorage.
// The storage keys keep their original names so records made under the
// app's earlier name are still found.
//
// A profile is one child, with records for every subject:
//   { id, name, completed: ["prek-001", "reading-1-004", ...],
//     redo: ["prek-004", ...],                 lessons the teacher marked to repeat
//     lessons: { lessonId: [summary, ...] },   last five teachings of each lesson
//     tests: { testId: [summary, ...] },
//     facts: { "3+2": { r: [1,0,1], t, last } }, last five results for each fact, with seconds
//     sounds: { "th": { r, t, last } },         the same for each sound, in reading
//     checkouts: [{ date, level, lesson, words, seconds, errors, wpm, goal }],  timed reading
//     placements: { math: { level, lesson, url, label, date }, reading: {...} },
//     last: { math: { id, date }, reading: { id, date } },   the last lesson taught in each subject
//     notes: [{ id, text, date, ref }],
//     items: { itemKey: { r: [1,0,1], last } },   last five first-try results for each item
//     timed: [{ date, right, errors, goal }],
//     legacy: { completed: [1, 2, ...] } }      progress from the old 150-lesson program
(function () {
  var PROFILES_KEY = "math-direct-profiles";
  var ACTIVE_KEY = "math-direct-active-profile";
  var LEGACY_KEY = "math-direct-progress";
  var VERSION = 5;

  // The subject a level or lesson id belongs to: the reading levels are
  // "reading-1" and "reading-2"; every other level is math.
  function subjectOf(id) { return /^reading/.test(String(id || "")) ? "reading" : "math"; }

  function read() {
    try { return JSON.parse(localStorage.getItem(PROFILES_KEY) || "[]"); } catch (e) { return []; }
  }
  function write(profiles) {
    try { localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles)); } catch (e) {}
  }
  function getActiveId() {
    try { return localStorage.getItem(ACTIVE_KEY); } catch (e) { return null; }
  }
  function setActiveId(id) {
    try { localStorage.setItem(ACTIVE_KEY, id); } catch (e) {}
  }

  function normalize(p) {
    if (!p.notes) p.notes = [];
    if (!p.lessons) p.lessons = {};
    if (!p.tests) p.tests = {};
    if (!p.facts) p.facts = {};
    if (!p.items) p.items = {};
    if (!p.timed) p.timed = [];
    if (!p.sounds) p.sounds = {};
    if (!p.checkouts) p.checkouts = [];
    if (!p.placements) p.placements = {};
    // Version 4 kept one placement and one last lesson; version 5 keeps one of each for each subject.
    if (p.placement && p.placement.level && !p.placements[subjectOf(p.placement.level)]) p.placements[subjectOf(p.placement.level)] = p.placement;
    delete p.placement;
    if (!p.last) p.last = {};
    if (p.lastLesson && p.lastLesson.id && !p.last[subjectOf(p.lastLesson.id)]) p.last[subjectOf(p.lastLesson.id)] = p.lastLesson;
    if (!Array.isArray(p.completed)) p.completed = [];
    if (!Array.isArray(p.redo)) p.redo = [];
    // Old program: completed held lesson numbers 1 to 150.
    var old = p.completed.filter(function (c) { return typeof c === "number"; });
    if (old.length) {
      p.legacy = p.legacy || { completed: [] };
      var set = {};
      p.legacy.completed.concat(old).forEach(function (n) { set[n] = 1; });
      p.legacy.completed = Object.keys(set).map(Number).sort(function (a, b) { return a - b; });
      p.completed = p.completed.filter(function (c) { return typeof c === "string"; });
    }
    return p;
  }

  function getProfiles() { return read().map(normalize); }

  // Change one child's record. With no id, the active child's.
  function updateProfile(id, fn) {
    var profiles = getProfiles();
    id = id || getActiveId();
    var p = profiles.find(function (x) { return x.id === id; }) || (id ? null : profiles[0]);
    if (!p) return null;
    fn(p);
    write(profiles);
    return p;
  }
  function update(fn) { return updateProfile(null, fn); }
  function getProfile(id) {
    return getProfiles().find(function (p) { return p.id === id; }) || null;
  }

  function getActiveProfile() {
    var profiles = getProfiles();
    var id = getActiveId();
    if (!id && profiles.length) { id = profiles[0].id; setActiveId(id); }
    return profiles.find(function (p) { return p.id === id; }) || profiles[0] || null;
  }

  function newId() { return Date.now().toString(36) + Math.random().toString(36).substring(2, 6); }

  function createProfile(name) {
    var profiles = getProfiles();
    var p = normalize({ id: newId(), name: name, completed: [] });
    profiles.push(p);
    write(profiles);
    setActiveId(p.id);
    return p;
  }
  function deleteProfile(id) {
    var profiles = getProfiles().filter(function (p) { return p.id !== id; });
    write(profiles);
    if (getActiveId() === id) setActiveId(profiles.length ? profiles[0].id : "");
    clearSession(id);
  }

  // A sitting left in the middle: one per child, kept for twelve hours.
  //   { kind, url, id, title, where, marks, pos, results, delayedAdded, inserted, placement, elapsed, childId, with, savedAt }
  //   "with" names the second child when a lesson is taught to two at once.
  var SESSION_KEY = "math-direct-sessions";
  var SESSION_HOURS = 12;
  function readSessions() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "{}") || {}; } catch (e) { return {}; }
  }
  function writeSessions(all) {
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(all)); } catch (e) {}
  }
  function saveSession(s) {
    var p = getActiveProfile();
    if (!p || !s) return;
    var all = readSessions();
    s.childId = p.id;
    s.savedAt = new Date().toISOString();
    all[p.id] = s;
    writeSessions(all);
  }
  function loadSession(childId) {
    var p = childId ? { id: childId } : getActiveProfile();
    if (!p) return null;
    var s = readSessions()[p.id];
    if (!s) return null;
    if (Date.now() - new Date(s.savedAt).getTime() > SESSION_HOURS * 3600 * 1000) { clearSession(p.id); return null; }
    return s;
  }
  function clearSession(childId) {
    var p = childId ? { id: childId } : getActiveProfile();
    if (!p) return;
    var all = readSessions();
    if (!all[p.id]) return;
    delete all[p.id];
    writeSessions(all);
  }
  function renameProfile(id, name) {
    var profiles = getProfiles();
    var p = profiles.find(function (x) { return x.id === id; });
    if (p) { p.name = name; write(profiles); }
  }
  function switchProfile(id, noReload) {
    setActiveId(id);
    if (!noReload) window.location.reload();
  }

  // ── Lessons ──
  function getCompleted() {
    var p = getActiveProfile();
    return new Set(p ? p.completed : []);
  }
  function isComplete(id) { return getCompleted().has(id); }
  function markComplete(id) {
    update(function (p) { if (p.completed.indexOf(id) === -1) p.completed.push(id); });
  }
  function markIncomplete(id) {
    update(function (p) { p.completed = p.completed.filter(function (c) { return c !== id; }); });
  }
  // A lesson taught to two children at once is recorded for each of them.
  function recordLessonFor(childId, id, summary) {
    updateProfile(childId, function (p) {
      p.lessons[id] = (p.lessons[id] || []).concat([summary]).slice(-5);
      // A new teaching replaces any mark the teacher set by hand.
      p.redo = p.redo.filter(function (c) { return c !== id; });
      if (!summary.repeat && p.completed.indexOf(id) === -1) p.completed.push(id);
      p.lastLesson = { id: id, date: summary.date };
      p.last[subjectOf(id)] = { id: id, date: summary.date };
    });
  }
  function recordLesson(id, summary) { recordLessonFor(null, id, summary); }
  function lessonHistory(id) {
    var p = getActiveProfile();
    return p && p.lessons[id] ? p.lessons[id] : [];
  }

  // A lesson is "done", "repeat" (the last teaching said to repeat it, or the
  // teacher marked it so), or "new" (not taught, or reset).
  function lessonStatus(id, profile) {
    var p = profile || getActiveProfile();
    if (!p) return "new";
    if (p.completed.indexOf(id) !== -1) return "done";
    if (p.redo && p.redo.indexOf(id) !== -1) return "repeat";
    var h = p.lessons[id];
    return h && h.length && h[h.length - 1].repeat ? "repeat" : "new";
  }
  // The teacher's own mark. "new" resets the lesson: its record is erased.
  function setLessonStatus(id, status, childId) {
    updateProfile(childId, function (p) {
      p.completed = p.completed.filter(function (c) { return c !== id; });
      p.redo = p.redo.filter(function (c) { return c !== id; });
      if (status === "done") p.completed.push(id);
      else if (status === "repeat") p.redo.push(id);
      else {
        delete p.lessons[id];
        if (p.lastLesson && p.lastLesson.id === id) delete p.lastLesson;
        if (p.last[subjectOf(id)] && p.last[subjectOf(id)].id === id) delete p.last[subjectOf(id)];
      }
    });
  }

  // The next lesson to teach in a level: the one after the highest completed.
  function nextLesson(levelId, total) {
    var p = getActiveProfile();
    var hi = 0;
    if (p) p.completed.forEach(function (c) {
      var m = /^(.+)-(\d{3})$/.exec(c);
      if (m && m[1] === levelId) hi = Math.max(hi, Number(m[2]));
    });
    var pl = p && p.placements[subjectOf(levelId)];
    if (pl && pl.level === levelId && hi < pl.lesson - 1) hi = pl.lesson - 1;
    return Math.min(hi + 1, total);
  }

  // The next thing to teach: a mastery test that is due and not yet passed,
  // or else the next lesson. tests: [{ id, url, title, afterLesson }]
  function nextStep(levelId, total, tests, slug) {
    var n = nextLesson(levelId, total);
    var p = getActiveProfile();
    // The latest test that falls before the next lesson, and after where the
    // child began the level, must be passed or marked passed before going on.
    // A passed test covers the ones before it.
    var pl = p && p.placements[subjectOf(levelId)];
    var from = pl && pl.level === levelId ? pl.lesson : 1;
    var due = (tests || []).filter(function (t) { return t.afterLesson < n && t.afterLesson >= from; });
    var last = due[due.length - 1];
    if (last && p && testStatus(last.id, p) !== "passed") return { url: last.url, label: last.title, test: true };
    return { url: "/" + slug + "/lesson-" + String(n).padStart(3, "0") + "/", label: "Lesson " + n, test: false };
  }

  // ── Tests, placement, facts ──
  function recordTest(id, summary) {
    update(function (p) {
      var h = p.tests[id] || [];
      if (summary.partial && h.length && h[h.length - 1].parts && h[h.length - 1].parts.length) {
        // Only some parts were given again: keep the other parts' last results.
        var prev = h[h.length - 1];
        var parts = prev.parts.map(function (old) {
          var again = summary.parts.filter(function (x) { return x.track === old.track; })[0];
          return again || old;
        });
        summary = { date: summary.date, minutes: summary.minutes, parts: parts, passed: parts.every(function (x) { return x.passed; }), retested: summary.parts.map(function (x) { return x.track; }) };
      }
      p.tests[id] = h.concat([summary]).slice(-5);
    });
  }
  // Per-item results: the last five first-try results for each item key, as 1 or 0.
  function recordItemsFor(childId, items, date) {
    if (!items) return;
    updateProfile(childId, function (p) {
      p.items = p.items || {};
      for (var k in items) {
        var cur = p.items[k] || { r: [] };
        cur.r = cur.r.concat([items[k].first ? 1 : 0]).slice(-5);
        cur.last = date || new Date().toISOString();
        p.items[k] = cur;
      }
    });
  }
  function recordItems(items, date) { recordItemsFor(null, items, date); }
  function itemHistory(key, profile) {
    var p = profile || getActiveProfile();
    return p && p.items && p.items[key] ? p.items[key] : null;
  }
  // A test is "passed", "retake" (give it again), or "new" (not given).
  function testStatus(id, profile) {
    var p = profile || getActiveProfile();
    var h = p && p.tests[id];
    if (!h || !h.length) return "new";
    return h[h.length - 1].passed ? "passed" : "retake";
  }
  // The teacher's own mark, kept as a result with no parts. "new" erases the record.
  function setTestStatus(id, status) {
    if (status === "new") { update(function (p) { delete p.tests[id]; }); return; }
    recordTest(id, { date: new Date().toISOString(), manual: true, parts: [], passed: status === "passed" });
  }
  // One placement result for each subject: { level, lesson, url, label, date, subject }
  function recordPlacement(rec) {
    update(function (p) { p.placements[rec.subject || subjectOf(rec.level)] = rec; });
  }
  function getPlacement(subject, profile) {
    var p = profile || getActiveProfile();
    return p && p.placements && p.placements[subject || "math"] ? p.placements[subject || "math"] : null;
  }
  // Each fact keeps its last five results and, when known, how many seconds
  // the child took to answer.
  function recordFactFor(childId, fact, firm, ms) {
    updateProfile(childId, function (p) {
      var f = p.facts[fact] || { r: [] };
      f.r = f.r.concat([firm ? 1 : 0]).slice(-5);
      f.t = (f.t || []).concat([typeof ms === "number" ? Math.round(ms / 100) / 10 : null]).slice(-5);
      f.last = new Date().toISOString();
      p.facts[fact] = f;
    });
  }
  function recordFact(fact, firm, ms) { recordFactFor(null, fact, firm, ms); }
  // Sounds, in reading, keep the same record as facts.
  function recordSoundFor(childId, sound, firm, ms) {
    updateProfile(childId, function (p) {
      var f = p.sounds[sound] || { r: [] };
      f.r = f.r.concat([firm ? 1 : 0]).slice(-5);
      f.t = (f.t || []).concat([typeof ms === "number" ? Math.round(ms / 100) / 10 : null]).slice(-5);
      f.last = new Date().toISOString();
      p.sounds[sound] = f;
    });
  }
  function recordSound(sound, firm, ms) { recordSoundFor(null, sound, firm, ms); }
  // automatic: the last three right and each under three seconds; firm: the
  // last three right; learning: the last one right; shaky: the last one
  // missed; new: no record.
  var AUTOMATIC_SECONDS = 3;
  function factStatus(f, limit) {
    if (!f || !f.r || !f.r.length) return "new";
    var last3 = f.r.slice(-3);
    if (last3.length >= 3 && last3.every(function (x) { return x === 1; })) {
      var t3 = (f.t || []).slice(-3);
      if (t3.length >= 3 && t3.every(function (x) { return typeof x === "number" && x <= (limit || AUTOMATIC_SECONDS); })) return "automatic";
      return "firm";
    }
    return last3[last3.length - 1] === 1 ? "learning" : "shaky";
  }
  // A sound is automatic when said within two seconds.
  function soundStatus(f) { return factStatus(f, 2); }
  // Missed in the last five marks: the chart's "Missed recently", and the
  // first sounds Quick sounds brings up.
  function missedRecently(f) {
    return !!(f && f.r && f.r.slice(-5).some(function (x) { return x === 0; }));
  }
  // One-minute timed checks: { date, level, right, errors, goal }
  function recordTimed(rec) {
    update(function (p) { p.timed = (p.timed || []).concat([rec]).slice(-20); });
  }
  // Rate and accuracy checkouts in reading: { date, level, lesson, words, seconds, errors, wpm, goal }
  function recordCheckoutFor(childId, rec) {
    updateProfile(childId, function (p) { p.checkouts = (p.checkouts || []).concat([rec]).slice(-40); });
  }
  function recordCheckout(rec) { recordCheckoutFor(null, rec); }

  // ── Notes ──
  function addNoteFor(childId, text, ref) {
    updateProfile(childId, function (p) { p.notes.push({ id: newId(), text: text, date: new Date().toISOString(), ref: ref || "" }); });
  }
  function addNote(text, ref) { addNoteFor(null, text, ref); }
  function deleteNote(id) {
    update(function (p) { p.notes = p.notes.filter(function (n) { return n.id !== id; }); });
  }
  function getNotes() {
    var p = getActiveProfile();
    return p ? p.notes : [];
  }

  function resetProgress() {
    update(function (p) { p.completed = []; p.redo = []; p.lessons = {}; p.tests = {}; p.facts = {}; p.sounds = {}; p.items = {}; p.timed = []; p.checkouts = []; p.placements = {}; p.last = {}; delete p.lastLesson; delete p.readingImport; });
  }

  // ── Export and import ──
  function exportAllProfiles() {
    var data = JSON.stringify({ app: "teach-direct", profiles: getProfiles(), version: VERSION, exported: new Date().toISOString() }, null, 2);
    var blob = new Blob([data], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "teach-direct-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  function mergeInto(target, src) {
    src = normalize(src);
    var set = {};
    target.completed.concat(src.completed).forEach(function (c) { set[c] = 1; });
    target.completed = Object.keys(set);
    var redo = {};
    target.redo.concat(src.redo).forEach(function (c) { if (!set[c]) redo[c] = 1; });
    target.redo = Object.keys(redo);
    ["lessons", "tests"].forEach(function (k) {
      Object.keys(src[k]).forEach(function (id) {
        target[k][id] = (target[k][id] || []).concat(src[k][id]).sort(function (a, b) { return a.date < b.date ? -1 : 1; }).slice(-5);
      });
    });
    Object.keys(src.facts).forEach(function (f) { if (!target.facts[f]) target.facts[f] = src.facts[f]; });
    Object.keys(src.sounds || {}).forEach(function (f) { if (!target.sounds[f]) target.sounds[f] = src.sounds[f]; });
    target.checkouts = (target.checkouts || []).concat(src.checkouts || []).sort(function (a, b) { return a.date < b.date ? -1 : 1; }).slice(-40);
    Object.keys(src.placements || {}).forEach(function (s) { var sp = src.placements[s], tp = target.placements[s]; if (sp && (!tp || sp.date > tp.date)) target.placements[s] = sp; });
    Object.keys(src.last || {}).forEach(function (s) { var sl = src.last[s], tl = target.last[s]; if (sl && (!tl || sl.date > tl.date)) target.last[s] = sl; });
    if (src.readingImport && !target.readingImport) target.readingImport = src.readingImport;
    var noteIds = {};
    target.notes.forEach(function (n) { noteIds[n.id] = 1; });
    src.notes.forEach(function (n) { if (!noteIds[n.id]) target.notes.push(n); });
    if (src.legacy) {
      target.legacy = target.legacy || { completed: [] };
      var ls = {};
      target.legacy.completed.concat(src.legacy.completed).forEach(function (n) { ls[n] = 1; });
      target.legacy.completed = Object.keys(ls).map(Number).sort(function (a, b) { return a - b; });
    }
  }
  // A backup from Open Phonics carries version 2 and its finished lessons as
  // numbers, 1 to 150. Lessons 1 to 100 become Reading 1; 101 to 150, Reading 2.
  function isOpenPhonics(data) {
    if (data.app === "open-phonics") return true;
    return data.version === 2 && !data.exported && data.profiles.every(function (p) { return (p.completed || []).every(function (c) { return typeof c === "number"; }); });
  }
  function fromOpenPhonics(p) {
    var done = (p.completed || []).filter(function (n) { return typeof n === "number" && n >= 1 && n <= 150; });
    return {
      id: p.id, name: p.name,
      completed: done.map(function (n) { return n <= 100 ? "reading-1-" + String(n).padStart(3, "0") : "reading-2-" + String(n - 100).padStart(3, "0"); }),
      readingImport: { lessons: done.length, date: new Date().toISOString() },
    };
  }
  function importProfiles(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var data = JSON.parse(e.target.result);
        if (!data.profiles || !Array.isArray(data.profiles)) { say("This file is not a Teach Direct backup."); return; }
        if (isOpenPhonics(data)) data.profiles = data.profiles.map(fromOpenPhonics);
        var existing = getProfiles();
        data.profiles.forEach(function (p) {
          var match = existing.find(function (x) { return x.name === p.name; });
          if (match) mergeInto(match, p);
          else { var n = normalize(p); n.id = newId(); existing.push(n); }
        });
        write(existing);
        window.location.reload();
      } catch (err) { say("The file could not be read."); }
    };
    reader.readAsText(file);
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function say(text) { if (window.MD && MD.toast) MD.toast(text); }
  function confirmDelete(id, name) {
    if (!window.MD) return;
    MD.confirm({ title: "Remove " + name + "?", text: "Every lesson, test, and fact record for " + name + " is erased with the name. This cannot be undone.", ok: "Remove", cancel: "Keep", danger: true }).then(function (yes) {
      if (yes) { deleteProfile(id); window.location.reload(); }
    });
  }
  function promptRename(id) {
    var p = getProfiles().find(function (x) { return x.id === id; });
    if (!p || !window.MD) return;
    MD.ask({ title: "Rename " + p.name, label: "Name", value: p.name, ok: "Save" }).then(function (name) {
      if (name && name !== p.name) { renameProfile(id, name); window.location.reload(); }
    });
  }
  function promptAdd() {
    if (!window.MD) return;
    MD.ask({ title: "Add a child", label: "Name", placeholder: "For example, Mia", ok: "Add" }).then(function (name) {
      if (name) { createProfile(name); window.location.reload(); }
    });
  }

  // Child chips: one radio per child and an Add chip. Changing the child
  // reloads the screen so everything on it shows that child.
  function renderChildChips(container) {
    if (!container) return;
    var profiles = getProfiles(), active = getActiveProfile();
    var html = '<fieldset class="chips"><legend>Child</legend>';
    profiles.forEach(function (p) {
      var on = active && active.id === p.id;
      html += '<label class="chip"><input type="radio" name="md-child" value="' + p.id + '"' + (on ? " checked" : "") + ">" + escapeHtml(p.name) + "</label>";
    });
    html += '<button type="button" class="chip chip--add" data-add-child>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add</button></fieldset>';
    container.innerHTML = html;
    container.addEventListener("change", function (e) {
      if (e.target.name === "md-child" && e.target.checked && (!active || e.target.value !== active.id)) switchProfile(e.target.value);
    });
    var add = container.querySelector("[data-add-child]");
    if (add) add.addEventListener("click", promptAdd);
  }

  // The Records screen: chips plus Rename and Remove for the selected child.
  function renderProfileSelector() {
    var container = document.getElementById("profile-selector");
    if (!container) return;
    var active = getActiveProfile();
    container.innerHTML = '<div data-child-chips></div>' +
      '<div class="btn-row profile-tools"><button type="button" class="btn btn--secondary" id="btn-rename-profile">Rename</button>' +
      (getProfiles().length > 1 ? '<button type="button" class="btn btn--danger" id="btn-delete-profile">Remove</button>' : "") + "</div>";
    renderChildChips(container.querySelector("[data-child-chips]"));
    var ren = document.getElementById("btn-rename-profile");
    if (ren && active) ren.addEventListener("click", function () { promptRename(active.id); });
    var del = document.getElementById("btn-delete-profile");
    if (del && active) del.addEventListener("click", function () { confirmDelete(active.id, active.name); });
  }

  // The level the child is working in for a subject: the last lesson taught
  // in it, else that subject's placement result, else nothing.
  function currentLevel(subject, profile) {
    var p = profile || getActiveProfile();
    subject = subject || "math";
    if (!p) return null;
    var last = p.last && p.last[subject];
    if (last && last.id) { var m = /^(.+)-(\d{3})$/.exec(last.id); if (m) return m[1]; }
    var pl = p.placements && p.placements[subject];
    if (pl && pl.level && pl.level !== "done") return pl.level;
    return null;
  }
  // The last lesson taught in a subject, with its summary.
  function lastResult(subject, profile) {
    var p = profile || getActiveProfile();
    var last = p && p.last ? p.last[subject || "math"] : null;
    if (!last || !p.lessons[last.id]) return null;
    var h = p.lessons[last.id];
    return { id: last.id, summary: h[h.length - 1] };
  }
  // Subjects in teaching order: one not yet started first (reading before
  // math), then the one taught longest ago.
  function subjectOrder(subjects, profile) {
    var p = profile || getActiveProfile();
    function when(s) { return p && p.last && p.last[s] ? p.last[s].date : ""; }
    return subjects.slice().sort(function (a, b) {
      var la = when(a), lb = when(b);
      if (!la && !lb) return (a === "reading" ? 0 : 1) - (b === "reading" ? 0 : 1);
      if (!la) return -1;
      if (!lb) return 1;
      return la < lb ? -1 : la > lb ? 1 : 0;
    });
  }

  // One-time move of the oldest storage format.
  function migrateLegacy() {
    try {
      var legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy && getProfiles().length === 0) {
        var completed = JSON.parse(legacy);
        if (Array.isArray(completed) && completed.length) {
          write([normalize({ id: "default", name: "Student 1", completed: completed })]);
          setActiveId("default");
        }
        localStorage.removeItem(LEGACY_KEY);
      }
      // Rewrite profiles once so old lesson numbers move to "legacy".
      write(getProfiles());
    } catch (e) {}
  }

  window.mathProgress = {
    getProfiles: getProfiles, getActiveProfile: getActiveProfile, setActiveId: setActiveId, getProfile: getProfile, updateProfile: updateProfile, createProfile: createProfile,
    deleteProfile: deleteProfile, renameProfile: renameProfile, switchProfile: switchProfile,
    getCompleted: getCompleted, isComplete: isComplete, markComplete: markComplete, markIncomplete: markIncomplete,
    recordLesson: recordLesson, recordLessonFor: recordLessonFor, lessonHistory: lessonHistory, nextLesson: nextLesson, nextStep: nextStep,
    lessonStatus: lessonStatus, setLessonStatus: setLessonStatus, testStatus: testStatus, setTestStatus: setTestStatus,
    recordTest: recordTest, recordPlacement: recordPlacement, getPlacement: getPlacement, recordFact: recordFact, recordFactFor: recordFactFor, factStatus: factStatus,
    recordSound: recordSound, recordSoundFor: recordSoundFor, soundStatus: soundStatus, missedRecently: missedRecently, recordCheckout: recordCheckout, recordCheckoutFor: recordCheckoutFor, subjectOf: subjectOf, subjectOrder: subjectOrder,
    recordItems: recordItems, recordItemsFor: recordItemsFor, itemHistory: itemHistory, recordTimed: recordTimed,
    addNote: addNote, addNoteFor: addNoteFor, deleteNote: deleteNote, getNotes: getNotes, reset: resetProgress,
    exportAllProfiles: exportAllProfiles, importProfiles: importProfiles,
    confirmDelete: confirmDelete, promptRename: promptRename, promptAdd: promptAdd,
    renderProfileSelector: renderProfileSelector, renderChildChips: renderChildChips,
    currentLevel: currentLevel, lastResult: lastResult,
    saveSession: saveSession, loadSession: loadSession, clearSession: clearSession,
  };

  migrateLegacy();
  if (getProfiles().length === 0) createProfile("Child 1");

  function onReady() {
    renderProfileSelector();
    var chips = document.querySelectorAll("[data-child-picker]");
    for (var c = 0; c < chips.length; c++) renderChildChips(chips[c]);

    var exportBtn = document.getElementById("btn-export-progress");
    if (exportBtn) exportBtn.addEventListener("click", exportAllProfiles);
    var importBtn = document.getElementById("btn-import-progress");
    var importInput = document.getElementById("import-progress-input");
    if (importBtn && importInput) {
      importBtn.addEventListener("click", function () { importInput.click(); });
      importInput.addEventListener("change", function (e) { if (e.target.files && e.target.files[0]) importProfiles(e.target.files[0]); });
    }
    var resetBtn = document.getElementById("btn-reset-progress");
    if (resetBtn) resetBtn.addEventListener("click", function () {
      var p = getActiveProfile();
      if (!window.MD) return;
      MD.confirm({ title: "Erase " + (p ? p.name + "'s" : "this child's") + " records?", text: "Lessons, tests, facts, sounds, and placement results are erased. Notes are kept. Save a backup first if you may want them back.", ok: "Erase", cancel: "Keep", danger: true }).then(function (yes) {
        if (!yes) return;
        // The records are held for a minute behind Undo before they are gone.
        var keep = JSON.parse(JSON.stringify(getActiveProfile()));
        resetProgress();
        clearSession();
        MD.toast("Records erased.", { action: "Undo", ms: 60000, onAction: function () {
          var profiles = getProfiles();
          var i = profiles.findIndex(function (x) { return x.id === keep.id; });
          if (i !== -1) { profiles[i] = keep; write(profiles); }
          MD.toast("Records restored.");
        } });
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", onReady);
  else onReady();
})();
