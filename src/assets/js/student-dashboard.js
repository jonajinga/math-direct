(function () {
  "use strict";
  if (!window.mathProgress) return;

  var PHASES = [
    { id: 1, name: "Foundation", start: 1, end: 20 },
    { id: 2, name: "Counting & Comparing", start: 21, end: 40 },
    { id: 3, name: "Addition", start: 41, end: 65 },
    { id: 4, name: "Subtraction", start: 66, end: 85 },
    { id: 5, name: "Place Value", start: 86, end: 105 },
    { id: 6, name: "Fluency", start: 106, end: 125 },
    { id: 7, name: "Mastery", start: 126, end: 150 },
  ];

  var selectedProfileId = null;

  function getSelectedProfile() {
    var profiles = window.mathProgress.getProfiles();
    if (selectedProfileId) {
      var found = profiles.find(function (p) { return p.id === selectedProfileId; });
      if (found) return found;
    }
    // Fall back to active profile
    var active = window.mathProgress.getActiveProfile();
    if (active) selectedProfileId = active.id;
    return active;
  }

  function getCompletedFor(profile) {
    return new Set(profile ? profile.completed : []);
  }

  function renderPicker() {
    var pickerEl = document.getElementById("sd-student-picker");
    if (!pickerEl) return;

    var profiles = window.mathProgress.getProfiles();
    var selected = getSelectedProfile();

    if (profiles.length === 0) {
      pickerEl.innerHTML = '<p style="color:var(--text-secondary);font-style:italic">No students found. <a href="/lessons/">Add a student</a> from the lessons page.</p>';
      return;
    }

    var html = '<div class="sd-picker">';
    html += '<label class="sd-picker__label" for="sd-select">Select Student</label>';
    html += '<select class="sd-picker__select" id="sd-select" onchange="window.sdSelectStudent(this.value)">';
    for (var i = 0; i < profiles.length; i++) {
      var p = profiles[i];
      var isSelected = selected && selected.id === p.id;
      html += '<option value="' + p.id + '"' + (isSelected ? ' selected' : '') + '>' + escapeHtml(p.name) + ' (' + p.completed.length + '/150)</option>';
    }
    html += '</select>';
    html += '<button class="sd-picker__print" onclick="window.sdPrintReport()" title="Print this student\'s progress">Print Report</button>';
    html += '</div>';
    pickerEl.innerHTML = html;
  }

  function render() {
    var profile = getSelectedProfile();
    if (!profile) return;

    var completed = getCompletedFor(profile);
    var total = 150;
    var done = completed.size;
    var pct = Math.round((done / total) * 100);

    // Find next lesson
    var currentPhase = null;
    var nextLesson = null;
    for (var i = 0; i < PHASES.length; i++) {
      var p = PHASES[i];
      for (var j = p.start; j <= p.end; j++) {
        if (!completed.has(j)) {
          currentPhase = p;
          nextLesson = j;
          break;
        }
      }
      if (nextLesson) break;
    }

    // Overview
    var overviewEl = document.getElementById("student-overview");
    if (overviewEl) {
      var status = pct === 100 ? "Program Complete" : pct >= 80 ? "Nearing Completion" : pct >= 50 ? "Solid Progress" : pct >= 20 ? "Building Momentum" : pct > 0 ? "Getting Started" : "Not Started";
      var html = '<div class="sd-overview">';
      html += '<div class="sd-overview__greeting">';
      html += '<h2 class="sd-overview__name">' + escapeHtml(profile.name) + '</h2>';
      html += '<span class="sd-overview__grade">' + status + '</span>';
      html += '</div>';
      html += '<div class="sd-overview__ring">';
      html += '<svg viewBox="0 0 120 120" class="sd-ring">';
      html += '<circle cx="60" cy="60" r="52" fill="none" stroke="var(--border-color)" stroke-width="8"/>';
      html += '<circle cx="60" cy="60" r="52" fill="none" stroke="var(--blue-500)" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + (2 * Math.PI * 52) + '" stroke-dashoffset="' + (2 * Math.PI * 52 * (1 - pct / 100)) + '" transform="rotate(-90 60 60)"/>';
      html += '</svg>';
      html += '<span class="sd-overview__pct">' + pct + '%</span>';
      html += '</div>';
      html += '<div class="sd-overview__stats">';
      html += '<div class="td-stat"><span class="td-stat__num">' + done + '</span><span class="td-stat__label">Completed</span></div>';
      html += '<div class="td-stat"><span class="td-stat__num">' + (total - done) + '</span><span class="td-stat__label">Remaining</span></div>';
      html += '</div>';
      html += '</div>';
      overviewEl.innerHTML = html;
    }

    // Next lesson recommendation
    var nextEl = document.getElementById("student-next");
    if (nextEl) {
      if (nextLesson) {
        var pad = nextLesson < 10 ? "0" + nextLesson : String(nextLesson);
        var html = '<div class="sd-next">';
        html += '<h3 class="sd-next__label">Recommended Next Lesson</h3>';
        html += '<a href="/lessons/lesson-' + pad + '/" class="sd-next__card">';
        html += '<span class="sd-next__lesson">Lesson ' + nextLesson + '</span>';
        html += '<span class="sd-next__phase">Phase ' + currentPhase.id + ': ' + currentPhase.name + '</span>';
        html += '<span class="sd-next__go">Go to Lesson &rarr;</span>';
        html += '</a>';
        html += '</div>';
        nextEl.innerHTML = html;
      } else {
        nextEl.innerHTML = '<div class="sd-next"><h3 class="sd-next__label">All 150 lessons complete. Recommend practice sets and flashcards for continued review.</h3></div>';
      }
    }

    // Phase progress
    var phasesEl = document.getElementById("student-phases");
    if (phasesEl) {
      var html = '<div class="sd-phases">';
      html += '<h3 class="sd-phases__title">Phase Progress</h3>';
      for (var i = 0; i < PHASES.length; i++) {
        var p = PHASES[i];
        var phaseTotal = p.end - p.start + 1;
        var phaseDone = 0;
        for (var j = p.start; j <= p.end; j++) {
          if (completed.has(j)) phaseDone++;
        }
        var phasePct = Math.round((phaseDone / phaseTotal) * 100);
        var phaseStatus = phaseDone === 0 ? "not-started" : phaseDone === phaseTotal ? "complete" : "in-progress";
        var icon = phaseStatus === "complete" ? "&#10003;" : phaseStatus === "in-progress" ? "&#9654;" : "&#9679;";

        html += '<div class="sd-phase">';
        html += '<div class="sd-phase__header">';
        html += '<span class="sd-phase__icon sd-phase__icon--' + phaseStatus + '">' + icon + '</span>';
        html += '<a href="/phases/phase-' + p.id + '/" class="sd-phase__name">Phase ' + p.id + ': ' + p.name + '</a>';
        html += '<span class="sd-phase__pct">' + phaseDone + '/' + phaseTotal + ' (' + phasePct + '%)</span>';
        html += '</div>';
        html += '<div class="td-bar td-bar--sm"><div class="td-bar__fill td-bar__fill--' + phaseStatus + '" style="width:' + phasePct + '%"></div></div>';

        // Show incomplete lessons for in-progress phases
        if (phaseStatus === "in-progress") {
          var incomplete = [];
          for (var j = p.start; j <= p.end; j++) {
            if (!completed.has(j)) incomplete.push(j);
          }
          if (incomplete.length <= 10) {
            html += '<div class="td-phase__remaining">Not completed: ';
            for (var k = 0; k < incomplete.length; k++) {
              var lid = incomplete[k];
              var lpad = lid < 10 ? "0" + lid : String(lid);
              html += '<a href="/lessons/lesson-' + lpad + '/" class="td-phase__lesson">' + lid + '</a>';
            }
            html += '</div>';
          } else {
            html += '<div class="td-phase__remaining">' + incomplete.length + ' lessons remaining</div>';
          }
        }
        html += '</div>';
      }
      html += '</div>';
      phasesEl.innerHTML = html;
    }

    // Completed lessons list
    var completedEl = document.getElementById("student-completed");
    if (completedEl && done > 0) {
      var html = '<div class="sd-completed">';
      html += '<h3 class="sd-phases__title">Completed Lessons (' + done + ')</h3>';
      html += '<div class="sd-completed__list">';
      var sortedCompleted = Array.from(completed).sort(function (a, b) { return a - b; });
      for (var c = 0; c < sortedCompleted.length; c++) {
        var lid = sortedCompleted[c];
        var lpad = lid < 10 ? "0" + lid : String(lid);
        html += '<a href="/lessons/lesson-' + lpad + '/" class="sd-completed__item">' + lid + '</a>';
      }
      html += '</div>';
      html += '</div>';
      completedEl.innerHTML = html;
    } else if (completedEl) {
      completedEl.innerHTML = '';
    }

    // Notes for this student
    var notes = (profile.notes || []);
    if (notes.length > 0 && phasesEl) {
      var notesHtml = '<div class="td-notes" style="margin-top:var(--space-lg)">';
      notesHtml += '<h3 class="sd-phases__title">Instructor Notes</h3>';
      notesHtml += '<div class="td-notes__list">';
      for (var n = notes.length - 1; n >= 0; n--) {
        var note = notes[n];
        var noteDate = new Date(note.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        notesHtml += '<div class="td-note"><div class="td-note__text">' + escapeHtml(note.text) + '</div><div class="td-note__meta"><span class="td-note__date">' + noteDate + '</span></div></div>';
      }
      notesHtml += '</div></div>';
      phasesEl.insertAdjacentHTML("afterend", notesHtml);
    }
  }

  // Student selector
  window.sdSelectStudent = function (profileId) {
    selectedProfileId = profileId;
    render();
  };

  // Print report for selected student
  window.sdPrintReport = function () {
    var profile = getSelectedProfile();
    if (!profile) return;
    var completed = getCompletedFor(profile);
    var total = 150;
    var done = completed.size;
    var pct = Math.round((done / total) * 100);
    var notes = profile.notes || [];
    var today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
    html += '<title>Student Progress — ' + escapeHtml(profile.name) + '</title>';
    html += '<style>';
    html += 'body{font-family:system-ui,-apple-system,sans-serif;max-width:7in;margin:0.5in auto;color:#000;font-size:11pt;line-height:1.5}';
    html += 'h1{font-size:18pt;border-bottom:2px solid #000;padding-bottom:6pt;margin-bottom:4pt}';
    html += 'h1 span{font-size:10pt;font-weight:400;color:#555;float:right;margin-top:6pt}';
    html += 'h2{font-size:12pt;margin-top:16pt;margin-bottom:6pt;color:#333}';
    html += '.stats{display:flex;gap:24pt;margin:12pt 0}';
    html += '.stat{text-align:center}.stat strong{display:block;font-size:20pt;color:#2563eb}';
    html += '.stat span{font-size:8pt;text-transform:uppercase;color:#666}';
    html += '.bar{height:8pt;background:#e5e5e5;margin:8pt 0 16pt}';
    html += '.bar-fill{height:100%;background:#2563eb}';
    html += '.phase{margin-bottom:8pt;display:flex;align-items:center;gap:8pt}';
    html += '.phase-name{flex:1;font-size:10pt}.phase-pct{font-size:10pt;font-weight:700;min-width:3em;text-align:right}';
    html += '.phase-bar{width:120pt;height:6pt;background:#e5e5e5;flex-shrink:0}';
    html += '.phase-bar span{display:block;height:100%;background:#2563eb}';
    html += '.note{padding:4pt 0;border-bottom:1pt solid #ddd;font-size:10pt}';
    html += '.note-date{color:#999;font-size:8pt}';
    html += '.next{padding:8pt;background:#eff6ff;border:1pt solid #bfdbfe;margin:8pt 0;font-size:10pt}';
    html += '@media print{body{margin:0.3in}}';
    html += '</style></head><body>';

    html += '<h1>' + escapeHtml(profile.name) + ' — Progress Report<span>' + today + '</span></h1>';

    html += '<div class="stats">';
    html += '<div class="stat"><strong>' + done + '</strong><span>Completed</span></div>';
    html += '<div class="stat"><strong>' + (total - done) + '</strong><span>Remaining</span></div>';
    html += '<div class="stat"><strong>' + pct + '%</strong><span>Overall</span></div>';
    html += '</div>';
    html += '<div class="bar"><div class="bar-fill" style="width:' + pct + '%"></div></div>';

    // Next lesson
    for (var i = 0; i < PHASES.length; i++) {
      var p = PHASES[i];
      for (var j = p.start; j <= p.end; j++) {
        if (!completed.has(j)) {
          html += '<div class="next"><strong>Recommended Next:</strong> Lesson ' + j + ' (Phase ' + p.id + ': ' + p.name + ')</div>';
          i = PHASES.length; // break outer
          break;
        }
      }
    }

    html += '<h2>Phase Progress</h2>';
    for (var i = 0; i < PHASES.length; i++) {
      var p = PHASES[i];
      var phaseTotal = p.end - p.start + 1;
      var phaseDone = 0;
      for (var j = p.start; j <= p.end; j++) {
        if (completed.has(j)) phaseDone++;
      }
      var phasePct = Math.round((phaseDone / phaseTotal) * 100);
      html += '<div class="phase">';
      html += '<span class="phase-name">Phase ' + p.id + ': ' + p.name + ' (' + phaseDone + '/' + phaseTotal + ')</span>';
      html += '<div class="phase-bar"><span style="width:' + phasePct + '%"></span></div>';
      html += '<span class="phase-pct">' + phasePct + '%</span>';
      html += '</div>';
    }

    if (notes.length > 0) {
      html += '<h2>Instructor Notes</h2>';
      for (var n = 0; n < notes.length; n++) {
        var noteDate = new Date(notes[n].date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        html += '<div class="note">' + escapeHtml(notes[n].text) + ' <span class="note-date">' + noteDate + '</span></div>';
      }
    }

    html += '</body></html>';
    var win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); setTimeout(function () { win.print(); }, 300); }
  };

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderPicker();
    render();
  });
})();
