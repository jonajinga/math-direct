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
      html += '<h2 class="td-overview__name">' + escapeHtml(active.name) + '</h2>';
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

        // Show incomplete lessons
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
      phasesEl.innerHTML = html;
    }
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  document.addEventListener("DOMContentLoaded", render);
})();
