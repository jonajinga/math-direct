(function () {
  var PROFILES_KEY = "math-direct-profiles";
  var ACTIVE_KEY = "math-direct-active-profile";
  var LEGACY_KEY = "math-direct-progress";

  function getProfiles() {
    try { return JSON.parse(localStorage.getItem(PROFILES_KEY) || "[]"); } catch (e) { return []; }
  }

  function saveProfiles(profiles) {
    try { localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles)); } catch (e) {}
  }

  function getActiveProfileId() {
    try { return localStorage.getItem(ACTIVE_KEY); } catch (e) { return null; }
  }

  function setActiveProfileId(id) {
    try { localStorage.setItem(ACTIVE_KEY, id); } catch (e) {}
  }

  function getActiveProfile() {
    var profiles = getProfiles();
    var activeId = getActiveProfileId();
    if (!activeId && profiles.length > 0) {
      activeId = profiles[0].id;
      setActiveProfileId(activeId);
    }
    return profiles.find(function (p) { return p.id === activeId; }) || null;
  }

  function createProfile(name) {
    var profiles = getProfiles();
    var id = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    var profile = { id: id, name: name, completed: [] };
    profiles.push(profile);
    saveProfiles(profiles);
    setActiveProfileId(id);
    return profile;
  }

  function deleteProfile(id) {
    var profiles = getProfiles().filter(function (p) { return p.id !== id; });
    saveProfiles(profiles);
    if (getActiveProfileId() === id) {
      setActiveProfileId(profiles.length > 0 ? profiles[0].id : "");
    }
  }

  function switchProfile(id) {
    setActiveProfileId(id);
    window.location.reload();
  }

  function migrateLegacy() {
    try {
      var legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy && getProfiles().length === 0) {
        var completed = JSON.parse(legacy);
        if (Array.isArray(completed) && completed.length > 0) {
          saveProfiles([{ id: "default", name: "Student 1", completed: completed }]);
          setActiveProfileId("default");
          localStorage.removeItem(LEGACY_KEY);
        }
      }
    } catch (e) {}
  }

  function getCompleted() {
    var profile = getActiveProfile();
    return new Set(profile ? profile.completed : []);
  }

  function markComplete(id) {
    var profiles = getProfiles();
    var activeId = getActiveProfileId();
    var profile = profiles.find(function (p) { return p.id === activeId; });
    if (profile) {
      var set = new Set(profile.completed);
      set.add(id);
      profile.completed = Array.from(set);
      saveProfiles(profiles);
    }
  }

  function markIncomplete(id) {
    var profiles = getProfiles();
    var activeId = getActiveProfileId();
    var profile = profiles.find(function (p) { return p.id === activeId; });
    if (profile) {
      profile.completed = profile.completed.filter(function (c) { return c !== id; });
      saveProfiles(profiles);
    }
  }

  function isComplete(id) { return getCompleted().has(id); }

  function resetProgress() {
    var profiles = getProfiles();
    var activeId = getActiveProfileId();
    var profile = profiles.find(function (p) { return p.id === activeId; });
    if (profile) { profile.completed = []; saveProfiles(profiles); }
  }

  function exportAllProfiles() {
    var data = JSON.stringify({ profiles: getProfiles(), version: 2 }, null, 2);
    var blob = new Blob([data], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "math-direct-profiles.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importProfiles(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var data = JSON.parse(e.target.result);
        if (data.profiles && Array.isArray(data.profiles)) {
          var existing = getProfiles();
          var existingNames = new Set(existing.map(function (p) { return p.name; }));
          data.profiles.forEach(function (p) {
            if (!existingNames.has(p.name)) {
              p.id = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
              existing.push(p);
            } else {
              var match = existing.find(function (ep) { return ep.name === p.name; });
              if (match) {
                var set = new Set(match.completed);
                p.completed.forEach(function (c) { set.add(c); });
                match.completed = Array.from(set);
              }
            }
          });
          saveProfiles(existing);
          window.location.reload();
        } else { alert("Invalid file format."); }
      } catch (err) { alert("Could not read file."); }
    };
    reader.readAsText(file);
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function confirmDelete(id, name) {
    if (confirm('Delete student "' + name + '" and all their progress?')) {
      deleteProfile(id);
      window.location.reload();
    }
  }

  function renderProfileSelector() {
    var container = document.getElementById("profile-selector");
    if (!container) return;
    var profiles = getProfiles();
    var active = getActiveProfile();
    var html = '<div class="profile-selector">';
    html += '<div class="profile-selector__header">';
    html += '<span class="profile-selector__label">Student</span>';
    html += '<button class="profile-selector__add" id="btn-add-profile" title="Add student">+ Add</button>';
    html += '</div>';
    if (profiles.length === 0) {
      html += '<p class="profile-selector__empty">No students yet. Add one to start tracking progress.</p>';
    } else {
      html += '<div class="profile-selector__list">';
      profiles.forEach(function (p) {
        var isActive = active && active.id === p.id;
        html += '<div class="profile-item' + (isActive ? ' is-active' : '') + '">';
        html += '<button class="profile-item__select" onclick="window.mathProgress.switchProfile(\'' + p.id + '\')">';
        html += '<span class="profile-item__name">' + escapeHtml(p.name) + '</span>';
        html += '<span class="profile-item__count">' + p.completed.length + '/150</span>';
        html += '</button>';
        if (!isActive) {
          html += '<button class="profile-item__delete" onclick="window.mathProgress.confirmDelete(\'' + p.id + '\', \'' + escapeHtml(p.name) + '\')" title="Delete">&times;</button>';
        }
        html += '</div>';
      });
      html += '</div>';
    }
    html += '</div>';
    container.innerHTML = html;
    var addBtn = document.getElementById("btn-add-profile");
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        var name = prompt("Student name:");
        if (name && name.trim()) { createProfile(name.trim()); window.location.reload(); }
      });
    }
  }

  window.mathProgress = {
    getCompleted: getCompleted,
    markComplete: markComplete,
    markIncomplete: markIncomplete,
    isComplete: isComplete,
    reset: resetProgress,
    exportAllProfiles: exportAllProfiles,
    importProfiles: importProfiles,
    getProfiles: getProfiles,
    getActiveProfile: getActiveProfile,
    createProfile: createProfile,
    deleteProfile: deleteProfile,
    switchProfile: switchProfile,
    confirmDelete: confirmDelete,
  };

  migrateLegacy();
  if (getProfiles().length === 0) createProfile("Student 1");

  document.addEventListener("DOMContentLoaded", function () {
    renderProfileSelector();
    var cards = document.querySelectorAll("[data-lesson-id]");
    var completed = getCompleted();
    cards.forEach(function (card) {
      var id = parseInt(card.getAttribute("data-lesson-id"), 10);
      if (completed.has(id)) {
        card.classList.add("is-complete");
        var check = document.createElement("span");
        check.className = "lesson-card__check";
        check.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
        card.appendChild(check);
        var resetBtn = document.createElement("button");
        resetBtn.className = "lesson-card__reset";
        resetBtn.title = "Reset lesson " + id;
        resetBtn.setAttribute("aria-label", "Reset lesson " + id);
        resetBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>';
        resetBtn.addEventListener("click", function (e) {
          e.preventDefault(); e.stopPropagation();
          markIncomplete(id);
          card.classList.remove("is-complete");
          check.remove(); resetBtn.remove();
          renderProfileSelector();
        });
        card.appendChild(resetBtn);
      }
    });
    var exportBtn = document.getElementById("btn-export-progress");
    if (exportBtn) exportBtn.addEventListener("click", exportAllProfiles);
    var importBtn = document.getElementById("btn-import-progress");
    var importInput = document.getElementById("import-progress-input");
    if (importBtn && importInput) {
      importBtn.addEventListener("click", function () { importInput.click(); });
      importInput.addEventListener("change", function (e) {
        if (e.target.files && e.target.files[0]) importProfiles(e.target.files[0]);
      });
    }
    var resetBtn = document.getElementById("btn-reset-progress");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        var profile = getActiveProfile();
        var name = profile ? profile.name : "this student";
        if (confirm('Reset all progress for "' + name + '"? This cannot be undone.')) {
          resetProgress(); window.location.reload();
        }
      });
    }
  });
})();
