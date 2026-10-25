// Math Direct progress store. Everything stays in this browser's localStorage.
//
// A profile is one child:
//   { id, name, completed: ["prek-001", ...],
//     redo: ["prek-004", ...],                 lessons the teacher marked to repeat
//     lessons: { lessonId: [summary, ...] },   last five teachings of each lesson
//     tests: { testId: [summary, ...] },
//     facts: { "3+2": { r: [1,0,1], last } }, last five results for each fact
//     placement: { level, lesson, url, label, date },
//     notes: [{ id, text, date, ref }],
//     legacy: { completed: [1, 2, ...] } }      progress from the old 150-lesson program
(function () {
  var PROFILES_KEY = "math-direct-profiles";
  var ACTIVE_KEY = "math-direct-active-profile";
  var LEGACY_KEY = "math-direct-progress";
  var VERSION = 4;

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

  function update(fn) {
    var profiles = getProfiles();
    var id = getActiveId();
    var p = profiles.find(function (x) { return x.id === id; }) || profiles[0];
    if (!p) return null;
    fn(p);
    write(profiles);
    return p;
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
  //   { kind, url, id, title, where, marks, pos, results, delayedAdded, placement, elapsed, childId, savedAt }
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
  function recordLesson(id, summary) {
    update(function (p) {
      p.lessons[id] = (p.lessons[id] || []).concat([summary]).slice(-5);
      // A new teaching replaces any mark the teacher set by hand.
      p.redo = p.redo.filter(function (c) { return c !== id; });
      if (!summary.repeat && p.completed.indexOf(id) === -1) p.completed.push(id);
      p.lastLesson = { id: id, date: summary.date };
    });
  }
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
  function setLessonStatus(id, status) {
    update(function (p) {
      p.completed = p.completed.filter(function (c) { return c !== id; });
      p.redo = p.redo.filter(function (c) { return c !== id; });
      if (status === "done") p.completed.push(id);
      else if (status === "repeat") p.redo.push(id);
      else {
        delete p.lessons[id];
        if (p.lastLesson && p.lastLesson.id === id) delete p.lastLesson;
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
    if (p && p.placement && p.placement.level === levelId && hi < p.placement.lesson - 1) hi = p.placement.lesson - 1;
    return Math.min(hi + 1, total);
  }

  // The next thing to teach: a mastery test that is due and not yet passed,
  // or else the next lesson. tests: [{ id, url, title, afterLesson }]
  function nextStep(levelId, total, tests, slug) {
    var n = nextLesson(levelId, total);
    var p = getActiveProfile();
    var due = (tests || []).filter(function (t) { return t.afterLesson === n - 1; })[0];
    if (due && p) {
      var h = p.tests[due.id];
      var passed = h && h.length && h[h.length - 1].passed;
      if (!passed) return { url: due.url, label: due.title, test: true };
    }
    return { url: "/" + slug + "/lesson-" + String(n).padStart(3, "0") + "/", label: "Lesson " + n, test: false };
  }

  // ── Tests, placement, facts ──
  function recordTest(id, summary) {
    update(function (p) { p.tests[id] = (p.tests[id] || []).concat([summary]).slice(-5); });
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
  function recordPlacement(rec) {
    update(function (p) { p.placement = rec; });
  }
  function recordFact(fact, firm) {
    update(function (p) {
      var f = p.facts[fact] || { r: [] };
      f.r = f.r.concat([firm ? 1 : 0]).slice(-5);
      f.last = new Date().toISOString();
      p.facts[fact] = f;
    });
  }
  // firm: last three results correct; shaky: any recent error; new: no record.
  function factStatus(f) {
    if (!f || !f.r || !f.r.length) return "new";
    var last3 = f.r.slice(-3);
    if (last3.length >= 3 && last3.every(function (x) { return x === 1; })) return "firm";
    return last3[last3.length - 1] === 1 ? "learning" : "shaky";
  }

  // ── Notes ──
  function addNote(text, ref) {
    update(function (p) { p.notes.push({ id: newId(), text: text, date: new Date().toISOString(), ref: ref || "" }); });
  }
  function deleteNote(id) {
    update(function (p) { p.notes = p.notes.filter(function (n) { return n.id !== id; }); });
  }
  function getNotes() {
    var p = getActiveProfile();
    return p ? p.notes : [];
  }

  function resetProgress() {
    update(function (p) { p.completed = []; p.redo = []; p.lessons = {}; p.tests = {}; p.facts = {}; p.placement = null; });
  }

  // ── Export and import ──
  function exportAllProfiles() {
    var data = JSON.stringify({ profiles: getProfiles(), version: VERSION, exported: new Date().toISOString() }, null, 2);
    var blob = new Blob([data], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "math-direct-progress.json";
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
    var noteIds = {};
    target.notes.forEach(function (n) { noteIds[n.id] = 1; });
    src.notes.forEach(function (n) { if (!noteIds[n.id]) target.notes.push(n); });
    if (src.placement && (!target.placement || src.placement.date > target.placement.date)) target.placement = src.placement;
    if (src.legacy) {
      target.legacy = target.legacy || { completed: [] };
      var ls = {};
      target.legacy.completed.concat(src.legacy.completed).forEach(function (n) { ls[n] = 1; });
      target.legacy.completed = Object.keys(ls).map(Number).sort(function (a, b) { return a - b; });
    }
  }
  function importProfiles(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var data = JSON.parse(e.target.result);
        if (!data.profiles || !Array.isArray(data.profiles)) { say("This file is not a Math Direct backup."); return; }
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

  // The level the child is working in: the last lesson taught, else the
  // placement result, else nothing.
  function currentLevel() {
    var p = getActiveProfile();
    if (!p) return null;
    if (p.lastLesson && p.lastLesson.id) { var m = /^(.+)-(\d{3})$/.exec(p.lastLesson.id); if (m) return m[1]; }
    if (p.placement && p.placement.level) return p.placement.level;
    return null;
  }
  // The last lesson taught, with its summary.
  function lastResult() {
    var p = getActiveProfile();
    if (!p || !p.lastLesson || !p.lessons[p.lastLesson.id]) return null;
    var h = p.lessons[p.lastLesson.id];
    return { id: p.lastLesson.id, summary: h[h.length - 1] };
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
    getProfiles: getProfiles, getActiveProfile: getActiveProfile, createProfile: createProfile,
    deleteProfile: deleteProfile, renameProfile: renameProfile, switchProfile: switchProfile,
    getCompleted: getCompleted, isComplete: isComplete, markComplete: markComplete, markIncomplete: markIncomplete,
    recordLesson: recordLesson, lessonHistory: lessonHistory, nextLesson: nextLesson, nextStep: nextStep,
    lessonStatus: lessonStatus, setLessonStatus: setLessonStatus, testStatus: testStatus, setTestStatus: setTestStatus,
    recordTest: recordTest, recordPlacement: recordPlacement, recordFact: recordFact, factStatus: factStatus,
    addNote: addNote, deleteNote: deleteNote, getNotes: getNotes, reset: resetProgress,
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
      MD.confirm({ title: "Erase " + (p ? p.name + "'s" : "this child's") + " records?", text: "Lessons, tests, facts, and the placement result are erased. Notes are kept. Save a backup first if you may want them back.", ok: "Erase", cancel: "Keep", danger: true }).then(function (yes) {
        if (yes) { resetProgress(); window.location.reload(); }
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", onReady);
  else onReady();
})();
