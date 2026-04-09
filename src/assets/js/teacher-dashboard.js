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

  function render() {
    var profiles = window.mathProgress.getProfiles();
    var active = window.mathProgress.getActiveProfile();
    if (!active) return;

    var completed = window.mathProgress.getCompleted();
    var total = 150;
    var done = completed.size;
    var pct = Math.round((done / total) * 100);

    // Overview
    var overviewEl = document.getElementById("teacher-overview");
    if (overviewEl) {
      var html = '<div class="td-overview">';
      html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-md)">';
      html += '<h2 class="td-overview__name">' + escapeHtml(active.name) + '</h2>';
      html += '<button class="td-print-btn" onclick="window.printTeacherDashboard()" title="Print progress report">Print Report</button>';
      html += '</div>';
      html += '<div class="td-overview__stats">';
      html += '<div class="td-stat"><span class="td-stat__num">' + done + '</span><span class="td-stat__label">Completed</span></div>';
      html += '<div class="td-stat"><span class="td-stat__num">' + (total - done) + '</span><span class="td-stat__label">Remaining</span></div>';
      html += '<div class="td-stat"><span class="td-stat__num">' + pct + '%</span><span class="td-stat__label">Overall</span></div>';
      html += '</div>';
      html += '<div class="td-bar"><div class="td-bar__fill" style="width:' + pct + '%"></div></div>';
      html += '</div>';
      overviewEl.innerHTML = html;
    }

    // Phase breakdown
    var phasesEl = document.getElementById("teacher-phases");
    if (phasesEl) {
      var html = '<div class="td-phases">';
      html += '<h2 class="td-phases__title">Phase Breakdown</h2>';
      for (var i = 0; i < PHASES.length; i++) {
        var p = PHASES[i];
        var phaseTotal = p.end - p.start + 1;
        var phaseDone = 0;
        for (var j = p.start; j <= p.end; j++) {
          if (completed.has(j)) phaseDone++;
        }
        var phasePct = Math.round((phaseDone / phaseTotal) * 100);
        var status = phaseDone === 0 ? "not-started" : phaseDone === phaseTotal ? "complete" : "in-progress";

        html += '<div class="td-phase">';
        html += '<div class="td-phase__header">';
        html += '<a href="/phases/phase-' + p.id + '/" class="td-phase__name">Phase ' + p.id + ': ' + p.name + '</a>';
        html += '<span class="td-phase__count">' + phaseDone + '/' + phaseTotal + '</span>';
        html += '</div>';
        html += '<div class="td-bar td-bar--sm"><div class="td-bar__fill td-bar__fill--' + status + '" style="width:' + phasePct + '%"></div></div>';

        if (status === "in-progress") {
          var incomplete = [];
          for (var j = p.start; j <= p.end; j++) {
            if (!completed.has(j)) incomplete.push(j);
          }
          if (incomplete.length <= 10) {
            html += '<div class="td-phase__remaining">Remaining: ';
            for (var k = 0; k < incomplete.length; k++) {
              var lid = incomplete[k];
              var pad = lid < 10 ? "0" + lid : String(lid);
              html += '<a href="/lessons/lesson-' + pad + '/" class="td-phase__lesson">' + lid + '</a>';
            }
            html += '</div>';
          }
        }
        html += '</div>';
      }

      // All students comparison table
      if (profiles.length > 1) {
        html += '<h2 class="td-phases__title" style="margin-top:var(--space-2xl)">All Students</h2>';
        html += '<div class="td-students">';
        html += '<div class="td-students__header"><span>Student</span><span>Completed</span><span>Progress</span></div>';
        for (var s = 0; s < profiles.length; s++) {
          var prof = profiles[s];
          var sDone = prof.completed.length;
          var sPct = Math.round((sDone / total) * 100);
          var isActive = active && active.id === prof.id;
          html += '<div class="td-students__row' + (isActive ? ' td-students__row--active' : '') + '">';
          html += '<span class="td-students__name">' + escapeHtml(prof.name) + '</span>';
          html += '<span class="td-students__count">' + sDone + '/150</span>';
          html += '<span class="td-students__bar"><span class="td-bar td-bar--sm" style="flex:1"><span class="td-bar__fill" style="width:' + sPct + '%"></span></span> ' + sPct + '%</span>';
          html += '</div>';
        }
        html += '</div>';
      }

      html += '</div>';

      // Notes section
      html += '<div class="td-notes">';
      html += '<h2 class="td-phases__title">Notes</h2>';
      html += '<div class="td-notes__input-row">';
      html += '<input type="text" id="td-note-input" class="td-notes__input" placeholder="Add a note about ' + escapeHtml(active.name) + '...">';
      html += '<button class="td-notes__add" id="td-note-add">Add</button>';
      html += '</div>';

      var notes = window.mathProgress.getNotes();
      if (notes.length > 0) {
        html += '<div class="td-notes__list">';
        for (var n = notes.length - 1; n >= 0; n--) {
          var note = notes[n];
          var noteDate = new Date(note.date);
          var dateStr = noteDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
          html += '<div class="td-note">';
          html += '<div class="td-note__text">' + escapeHtml(note.text) + '</div>';
          html += '<div class="td-note__meta">';
          html += '<span class="td-note__date">' + dateStr + '</span>';
          html += '<button class="td-note__delete" onclick="window.deleteNoteAndRefresh(\'' + note.id + '\')" title="Delete note">&times;</button>';
          html += '</div>';
          html += '</div>';
        }
        html += '</div>';
      } else {
        html += '<p class="td-notes__empty">No notes yet.</p>';
      }
      html += '</div>';

      phasesEl.innerHTML = html;

      // Note add handler
      var noteInput = document.getElementById("td-note-input");
      var noteAddBtn = document.getElementById("td-note-add");
      if (noteInput && noteAddBtn) {
        function addNoteFromInput() {
          var text = noteInput.value.trim();
          if (text) {
            window.mathProgress.addNote(text);
            render(); // Re-render to show the new note
          }
        }
        noteAddBtn.addEventListener("click", addNoteFromInput);
        noteInput.addEventListener("keydown", function (e) {
          if (e.key === "Enter") addNoteFromInput();
        });
      }
    }
  }

  // Delete note and re-render
  window.deleteNoteAndRefresh = function (noteId) {
    window.mathProgress.deleteNote(noteId);
    render();
  };

  // Print teacher dashboard
  window.printTeacherDashboard = function () {
    var active = window.mathProgress.getActiveProfile();
    if (!active) return;
    var completed = window.mathProgress.getCompleted();
    var total = 150;
    var done = completed.size;
    var pct = Math.round((done / total) * 100);
    var notes = window.mathProgress.getNotes();
    var today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
    html += '<title>Progress Report — ' + escapeHtml(active.name) + '</title>';
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
    html += '@media print{body{margin:0.3in}}';
    html += '</style></head><body>';

    html += '<h1>Progress Report: ' + escapeHtml(active.name) + '<span>' + today + '</span></h1>';

    html += '<div class="stats">';
    html += '<div class="stat"><strong>' + done + '</strong><span>Completed</span></div>';
    html += '<div class="stat"><strong>' + (total - done) + '</strong><span>Remaining</span></div>';
    html += '<div class="stat"><strong>' + pct + '%</strong><span>Overall</span></div>';
    html += '</div>';
    html += '<div class="bar"><div class="bar-fill" style="width:' + pct + '%"></div></div>';

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
      html += '<h2>Teacher Notes</h2>';
      for (var n = 0; n < notes.length; n++) {
        var noteDate = new Date(notes[n].date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        html += '<div class="note">' + escapeHtml(notes[n].text) + ' <span class="note-date">' + noteDate + '</span></div>';
      }
    }

    html += '</body></html>';

    var win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(function () { win.print(); }, 300);
    }
  };

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  document.addEventListener("DOMContentLoaded", render);
})();
