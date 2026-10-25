// Math Direct progress store. Everything stays in this browser's localStorage.
//
// A profile is one child:
//   { id, name, completed: ["prek-001", ...],
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
      if (!summary.repeat && p.completed.indexOf(id) === -1) p.completed.push(id);
      p.lastLesson = { id: id, date: summary.date };
    });
  }
  function lessonHistory(id) {
    var p = getActiveProfile();
    return p && p.lessons[id] ? p.lessons[id] : [];
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
    update(function (p) { p.completed = []; p.lessons = {}; p.tests = {}; p.facts = {}; p.placement = null; });
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
        if (!data.profiles || !Array.isArray(data.profiles)) { alert("This file is not a Math Direct progress file."); return; }
        var existing = getProfiles();
        data.profiles.forEach(function (p) {
          var match = existing.find(function (x) { return x.name === p.name; });
          if (match) mergeInto(match, p);
          else { var n = normalize(p); n.id = newId(); existing.push(n); }
        });
        write(existing);
        window.location.reload();
      } catch (err) { alert("The file could not be read."); }
    };
    reader.readAsText(file);
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function confirmDelete(id, name) {
    if (confirm('Delete "' + name + '" and all of this child\'s records? This cannot be undone.')) {
      deleteProfile(id);
      window.location.reload();
    }
  }
  function promptRename(id) {
    var p = getProfiles().find(function (x) { return x.id === id; });
    if (!p) return;
    var name = prompt("New name:", p.name);
    if (name && name.trim() && name.trim() !== p.name) { renameProfile(id, name.trim()); window.location.reload(); }
  }
  function promptAdd() {
    var name = prompt("Child's name:");
    if (name && name.trim()) { createProfile(name.trim()); window.location.reload(); }
  }

  // A compact student picker: <select> plus an Add button.
  function renderStudentSelect(container) {
    if (!container) return;
    var profiles = getProfiles(), active = getActiveProfile();
    var html = '<label class="student-pick"><span class="student-pick__label">Teaching</span><select class="student-pick__select">';
    profiles.forEach(function (p) {
      html += '<option value="' + p.id + '"' + (active && active.id === p.id ? " selected" : "") + ">" + escapeHtml(p.name) + "</option>";
    });
    html += '<option value="__add">Add a child</option></select></label>';
    container.innerHTML = html;
    var sel = container.querySelector("select");
    sel.addEventListener("change", function () {
      if (sel.value === "__add") { sel.value = active ? active.id : ""; promptAdd(); return; }
      switchProfile(sel.value);
    });
  }

  // Full profile list with rename and delete (dashboard).
  function renderProfileSelector() {
    var container = document.getElementById("profile-selector");
    if (!container) return;
    var profiles = getProfiles(), active = getActiveProfile();
    var html = '<div class="profile-selector"><div class="profile-selector__header"><span class="profile-selector__label">Children</span>' +
      '<button class="profile-selector__add" id="btn-add-profile" type="button">+ Add a child</button></div><div class="profile-selector__list">';
    profiles.forEach(function (p) {
      var isActive = active && active.id === p.id;
      html += '<div class="profile-item' + (isActive ? " is-active" : "") + '">' +
        '<button class="profile-item__select" type="button" onclick="window.mathProgress.switchProfile(\'' + p.id + '\')"><span class="profile-item__name">' + escapeHtml(p.name) + '</span><span class="profile-item__count">' + p.completed.length + " lessons</span></button>" +
        '<button class="profile-item__rename" type="button" onclick="window.mathProgress.promptRename(\'' + p.id + '\')" title="Rename" aria-label="Rename ' + escapeHtml(p.name) + '">&#9998;</button>' +
        (isActive ? "" : '<button class="profile-item__delete" type="button" onclick="window.mathProgress.confirmDelete(\'' + p.id + "', '" + escapeHtml(p.name).replace(/'/g, "\\'") + '\')" title="Delete" aria-label="Delete ' + escapeHtml(p.name) + '">&times;</button>') +
        "</div>";
    });
    html += "</div></div>";
    container.innerHTML = html;
    var add = document.getElementById("btn-add-profile");
    if (add) add.addEventListener("click", promptAdd);
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
    recordTest: recordTest, recordPlacement: recordPlacement, recordFact: recordFact, factStatus: factStatus,
    addNote: addNote, deleteNote: deleteNote, getNotes: getNotes, reset: resetProgress,
    exportAllProfiles: exportAllProfiles, importProfiles: importProfiles,
    confirmDelete: confirmDelete, promptRename: promptRename, promptAdd: promptAdd,
    renderStudentSelect: renderStudentSelect, renderProfileSelector: renderProfileSelector,
  };

  migrateLegacy();
  if (getProfiles().length === 0) createProfile("Child 1");

  function onReady() {
    renderProfileSelector();
    var picks = document.querySelectorAll("[data-student-select]");
    for (var i = 0; i < picks.length; i++) renderStudentSelect(picks[i]);

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
      if (confirm('Erase all lesson, test, and fact records for "' + (p ? p.name : "this child") + '"? Notes are kept. This cannot be undone.')) { resetProgress(); window.location.reload(); }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", onReady);
  else onReady();
})();
