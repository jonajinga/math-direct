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
    var active = window.mathProgress.getActiveProfile();
    if (!active) return;

    var completed = window.mathProgress.getCompleted();
    var total = 150;
    var done = completed.size;
    var pct = Math.round((done / total) * 100);

    // Find current phase and next lesson
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
      var grade = pct === 100 ? "Math Master!" : pct >= 80 ? "Almost there!" : pct >= 50 ? "Great progress!" : pct >= 20 ? "Keep going!" : "Just getting started!";
      var html = '<div class="sd-overview">';
      html += '<div class="sd-overview__greeting">';
      html += '<h2 class="sd-overview__name">' + escapeHtml(active.name) + '</h2>';
      html += '<span class="sd-overview__grade">' + grade + '</span>';
      html += '</div>';
      html += '<div class="sd-overview__ring">';
      html += '<svg viewBox="0 0 120 120" class="sd-ring">';
      html += '<circle cx="60" cy="60" r="52" fill="none" stroke="var(--border-color)" stroke-width="8"/>';
      html += '<circle cx="60" cy="60" r="52" fill="none" stroke="var(--blue-500)" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + (2 * Math.PI * 52) + '" stroke-dashoffset="' + (2 * Math.PI * 52 * (1 - pct / 100)) + '" transform="rotate(-90 60 60)"/>';
      html += '</svg>';
      html += '<span class="sd-overview__pct">' + pct + '%</span>';
      html += '</div>';
      html += '<div class="sd-overview__stats">';
      html += '<div class="td-stat"><span class="td-stat__num">' + done + '</span><span class="td-stat__label">Done</span></div>';
      html += '<div class="td-stat"><span class="td-stat__num">' + (total - done) + '</span><span class="td-stat__label">Left</span></div>';
      html += '</div>';
      html += '</div>';
      overviewEl.innerHTML = html;
    }

    // Next lesson
    var nextEl = document.getElementById("student-next");
    if (nextEl && nextLesson) {
      var pad = nextLesson < 10 ? "0" + nextLesson : String(nextLesson);
      var html = '<div class="sd-next">';
      html += '<h3 class="sd-next__label">Up Next</h3>';
      html += '<a href="/lessons/lesson-' + pad + '/" class="sd-next__card">';
      html += '<span class="sd-next__lesson">Lesson ' + nextLesson + '</span>';
      html += '<span class="sd-next__phase">Phase ' + currentPhase.id + ': ' + currentPhase.name + '</span>';
      html += '<span class="sd-next__go">Start &rarr;</span>';
      html += '</a>';
      html += '</div>';
      nextEl.innerHTML = html;
    } else if (nextEl && !nextLesson) {
      nextEl.innerHTML = '<div class="sd-next"><h3 class="sd-next__label">All 150 lessons complete!</h3></div>';
    }

    // Phase progress bars
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
        var status = phaseDone === 0 ? "not-started" : phaseDone === phaseTotal ? "complete" : "in-progress";
        var icon = status === "complete" ? "&#10003;" : status === "in-progress" ? "&#9654;" : "&#9679;";

        html += '<div class="sd-phase">';
        html += '<div class="sd-phase__header">';
        html += '<span class="sd-phase__icon sd-phase__icon--' + status + '">' + icon + '</span>';
        html += '<a href="/phases/phase-' + p.id + '/" class="sd-phase__name">Phase ' + p.id + '</a>';
        html += '<span class="sd-phase__pct">' + phasePct + '%</span>';
        html += '</div>';
        html += '<div class="td-bar td-bar--sm"><div class="td-bar__fill td-bar__fill--' + status + '" style="width:' + phasePct + '%"></div></div>';
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
