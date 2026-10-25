// Teacher dashboard: one child's records, drawn from the progress store and
// the program summary.
(function () {
  "use strict";
  var P = window.mathProgress;
  var root = document.getElementById("dash");
  var levels = JSON.parse(document.getElementById("dash-data").textContent);
  if (!P || !root) return;

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function day(iso) { try { return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); } catch (e) { return ""; } }
  function pad3(n) { return String(n).padStart(3, "0"); }
  function lessonUrl(lv, n) { return "/" + lv.slug + "/lesson-" + pad3(n) + "/"; }
  function parseId(id) { var m = /^(.+)-(\d{3})$/.exec(id); return m ? { level: m[1], n: Number(m[2]) } : null; }

  function render() {
    var p = P.getActiveProfile();
    if (!p) { root.innerHTML = ""; return; }
    var html = '<h2 class="dash-name">' + esc(p.name) + "</h2>";

    if (p.placement) {
      html += '<p class="dash-line">Placement test on ' + day(p.placement.date) + ': start at <a href="' + esc(p.placement.url) + '">' + esc(p.placement.label) + "</a>.</p>";
    } else {
      html += '<p class="dash-line">No placement test yet. <a href="/placement/">The placement test</a> finds where to begin.</p>';
    }
    if (p.legacy && p.legacy.completed && p.legacy.completed.length) {
      html += '<p class="dash-line dash-line--note">From the earlier version of Math Direct: ' + p.legacy.completed.length + " of its 150 lessons were finished. The program has since been rebuilt in levels, so those lessons do not map one to one. The placement test is the surest way to find the right starting lesson.</p>";
    }

    // Levels
    html += '<div class="dash-levels">';
    levels.forEach(function (lv) {
      var done = p.completed.filter(function (c) { return c.indexOf(lv.id + "-") === 0; });
      var started = done.length || Object.keys(p.lessons).some(function (k) { return k.indexOf(lv.id + "-") === 0; });
      var next = P.nextLesson(lv.id, lv.lessons);
      html += '<section class="dash-level' + (started ? "" : " is-quiet") + '"><h3><a href="' + lv.url + '">' + esc(lv.name) + "</a></h3>";
      html += '<div class="pbar"><span class="pbar__fill" style="--p:' + Math.min(1, done.length / lv.lessons) + '"></span></div>';
      html += '<p class="pbar__label">' + done.length + " of " + lv.lessons + " lessons finished</p>";
      var step = P.nextStep(lv.id, lv.lessons, lv.tests, lv.slug);
      if (started || (p.placement && p.placement.level === lv.id)) html += '<p><a class="btn btn--cta btn--sm" href="' + step.url + '">Next: ' + esc(step.label) + "</a></p>";
      var repeat = Object.keys(p.lessons).concat(p.redo.filter(function (k) { return !p.lessons[k]; })).filter(function (k) {
        return k.indexOf(lv.id + "-") === 0 && P.lessonStatus(k, p) === "repeat";
      }).sort();
      if (repeat.length) html += '<p class="dash-small">To repeat: ' + repeat.map(function (k) { var x = parseId(k); return '<a href="' + lessonUrl(lv, x.n) + '">Lesson ' + x.n + "</a>"; }).join(", ") + "</p>";
      var given = lv.tests.filter(function (t) { return p.tests[t.id] && p.tests[t.id].length; });
      if (given.length) {
        html += '<ul class="dash-tests">';
        given.forEach(function (t) {
          var r = p.tests[t.id][p.tests[t.id].length - 1];
          var failed = r.parts.filter(function (x) { return !x.passed; });
          var result = r.manual ? (r.passed ? "marked passed" : "marked to give again") : r.passed ? "passed" : "reteach " + failed.map(function (x) { return esc(x.trackName); }).join(", ");
          html += '<li class="' + (r.passed ? "is-pass" : "is-fail") + '"><a href="' + t.url + '">' + esc(t.title) + "</a>: " + result + ' <span class="dash-small">' + day(r.date) + "</span></li>";
        });
        html += "</ul>";
      }
      html += "</section>";
    });
    html += "</div>";
    html += '<p class="dash-small">To mark a lesson finished, mark it to repeat, or reset it, open its level and choose Change marks.</p>';

    // Where the errors are, across the last 25 lessons taught.
    var recent = [];
    Object.keys(p.lessons).forEach(function (id) { p.lessons[id].forEach(function (s) { recent.push({ id: id, s: s }); }); });
    recent.sort(function (a, b) { return a.s.date < b.s.date ? 1 : -1; });
    var last = recent.slice(0, 25);
    var byTrack = {};
    last.forEach(function (x) {
      var lvId = parseId(x.id).level;
      var lv = levels.filter(function (l) { return l.id === lvId; })[0];
      (x.s.exercises || []).forEach(function (e) {
        var name = (lv && lv.tracks[e.track]) || e.title;
        byTrack[name] = (byTrack[name] || 0) + e.errors;
      });
    });
    var tracks = Object.keys(byTrack).sort(function (a, b) { return byTrack[b] - byTrack[a]; }).slice(0, 6);
    html += '<h3 class="dash-h">Where the errors are</h3>';
    if (!tracks.length) html += '<p class="dash-small">No errors recorded in recent lessons' + (last.length ? "." : ", because no lessons have been taught yet.") + "</p>";
    else html += '<p class="dash-small">Errors in the last ' + last.length + " lessons taught, by skill. A skill near the top is worth extra practice.</p>" +
      '<ul class="dash-bars">' + tracks.map(function (t) { return '<li><span>' + esc(t) + '</span><span class="dash-bar" style="--n:' + byTrack[t] + '"></span><b>' + byTrack[t] + "</b></li>"; }).join("") + "</ul>";

    // Recent lessons
    if (last.length) {
      html += '<h3 class="dash-h">Recent lessons</h3><table class="finish__table"><thead><tr><th>Date</th><th>Lesson</th><th>Firm</th><th>Errors</th><th>Advice</th></tr></thead><tbody>';
      last.slice(0, 10).forEach(function (x) {
        var id = parseId(x.id), lv = levels.filter(function (l) { return l.id === id.level; })[0];
        html += "<tr><td>" + day(x.s.date) + '</td><td><a href="' + lessonUrl(lv, id.n) + '">' + esc(lv.name) + " " + id.n + "</a></td><td>" + x.s.firm + "</td><td>" + x.s.errors + "</td><td>" +
          (x.s.repeat ? "Repeat the lesson" : x.s.stillMissed && x.s.stillMissed.length ? "Reteach: " + esc(x.s.stillMissed.join(", ")) : "Go on") + "</td></tr>";
      });
      html += "</tbody></table>";
    }

    // Fact charts
    levels.forEach(function (lv) {
      if (!lv.facts.length) return;
      var next = P.nextLesson(lv.id, lv.lessons);
      var anyTaught = lv.facts.some(function (f) { return f.lesson < next; });
      var anyRecord = lv.facts.some(function (f) { return p.facts[f.key]; });
      if (!anyTaught && !anyRecord) return;
      html += '<h3 class="dash-h">' + esc(lv.name) + " facts</h3>";
      html += '<p class="dash-small"><span class="fk fk--firm" aria-hidden="true">&#10003;</span> firm (three right in a row) <span class="fk fk--learning" aria-hidden="true">&middot;</span> learning <span class="fk fk--shaky" aria-hidden="true">!</span> missed recently <span class="fk fk--new" aria-hidden="true"></span> taught, not yet tried. Blank squares are facts not taught yet.</p>';
      ["+", "-"].forEach(function (op) {
        var facts = lv.facts.filter(function (f) { return f.key.indexOf(op) !== -1; });
        if (!facts.length) return;
        var maxA = 0, maxB = 0;
        facts.forEach(function (f) { var ab = f.key.split(op).map(Number); maxA = Math.max(maxA, ab[0]); maxB = Math.max(maxB, ab[1]); });
        var map = {};
        facts.forEach(function (f) { map[f.key] = f; });
        html += '<div class="fact-region" role="region" aria-label="' + (op === "+" ? "Addition" : "Subtraction") + ' facts"><p class="fact-region__cap">Scroll sideways to see all.</p><div class="fact-grid-wrap"><table class="fact-grid"><caption>' + (op === "+" ? "Addition: row plus column" : "Subtraction: row minus column") + "</caption><tr><th scope=\"col\"><span class=\"sr-only\">Row</span></th>";
        for (var b = 0; b <= maxB; b++) html += '<th scope="col">' + b + "</th>";
        html += "</tr>";
        for (var a = 0; a <= maxA; a++) {
          var rowHas = false;
          for (var b2 = 0; b2 <= maxB; b2++) if (map[a + op + b2]) rowHas = true;
          if (!rowHas) continue;
          html += '<tr><th scope="row">' + a + "</th>";
          for (var b3 = 0; b3 <= maxB; b3++) {
            var f = map[a + op + b3];
            if (!f) { html += '<td class="fc-none"></td>'; continue; }
            var st = P.factStatus(p.facts[f.key]);
            var cls = f.lesson >= next && st === "new" ? "fc-later" : "fc-" + st;
            var glyph = st === "firm" ? "&#10003;" : st === "learning" ? "&middot;" : st === "shaky" ? "!" : "";
            html += '<td class="' + cls + '"><span aria-hidden="true">' + (cls === "fc-later" ? "" : glyph) + '</span><span class="sr-only">' + a + (op === "+" ? " plus " : " minus ") + b3 + ", " + (cls === "fc-later" ? "not taught yet" : st === "new" ? "not tried" : st) + "</span></td>";
          }
          html += "</tr>";
        }
        html += "</table></div></div>";
      });
    });

    // Notes
    html += '<h3 class="dash-h">Notes</h3><div class="dash-note-form"><input type="text" id="dash-note" placeholder="A note about ' + esc(p.name) + '" aria-label="New note"><button type="button" class="btn btn--outline-dark" id="dash-note-add">Add note</button></div>';
    var notes = (p.notes || []).slice().reverse();
    if (!notes.length) html += '<p class="dash-small">No notes yet.</p>';
    else html += '<ul class="dash-notes">' + notes.map(function (n) { return "<li><span>" + esc(n.text) + '</span><span class="dash-small">' + day(n.date) + (n.ref ? " · " + esc(n.ref) : "") + '</span><button type="button" class="dash-note-del" data-note="' + n.id + '" aria-label="Delete note">&times;</button></li>'; }).join("") + "</ul>";

    root.innerHTML = html;
    var add = document.getElementById("dash-note-add"), input = document.getElementById("dash-note");
    function addNote() { var t = input.value.trim(); if (t) { P.addNote(t); render(); } }
    add.addEventListener("click", addNote);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") addNote(); });
    var dels = root.querySelectorAll("[data-note]");
    for (var i = 0; i < dels.length; i++) dels[i].addEventListener("click", function () { P.deleteNote(this.getAttribute("data-note")); render(); });
  }
  render();
})();
