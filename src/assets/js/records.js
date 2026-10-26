// Records: one child's results, drawn from the progress store and the
// program summary. Cards: next up, levels with tests by part, pace, where
// the errors are, recent lessons, facts, and notes.
(function () {
  "use strict";
  var P = window.mathProgress;
  var root = document.getElementById("dash");
  var levels = JSON.parse(document.getElementById("dash-data").textContent);
  var subjectsEl = document.getElementById("dash-subjects");
  var subjects = subjectsEl ? JSON.parse(subjectsEl.textContent) : [{ id: "math", name: "Math", placementUrl: "/placement/" }];
  if (!P || !root) return;

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function day(iso) { try { return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); } catch (e) { return ""; } }
  function shortDay(iso) { try { return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" }); } catch (e) { return ""; } }
  function pad3(n) { return String(n).padStart(3, "0"); }
  function lessonUrl(lv, n) { return "/" + lv.slug + "/lesson-" + pad3(n) + "/"; }
  function parseId(id) { var m = /^(.+)-(\d{3})$/.exec(id); return m ? { level: m[1], n: Number(m[2]) } : null; }
  function levelOf(id) { return levels.filter(function (l) { return l.id === id; })[0]; }
  function plural(n, word) { return n + " " + word + (n === 1 ? "" : "s"); }
  function card(title, body, cls) { return '<section class="card' + (cls ? " " + cls : "") + '"><h2 class="card__title">' + title + "</h2>" + body + "</section>"; }

  function render() {
    var p = P.getActiveProfile();
    if (!p) { root.innerHTML = ""; return; }
    var html = "";

    // ── Next up, in each subject ──
    var many = subjects.length > 1;
    var order = P.subjectOrder(subjects.map(function (s) { return s.id; }), p);
    order.forEach(function (sid) {
      var subj = subjects.filter(function (s) { return s.id === sid; })[0];
      var lv = levelOf(P.currentLevel(sid, p));
      if (lv) {
        var step = P.nextStep(lv.id, lv.lessons, lv.tests, lv.slug);
        html += card("Next up" + (many ? " in " + esc(subj.name.toLowerCase()) : ""), '<p class="card__text">' + esc(lv.name) + ": " + esc(step.label) + '.</p><div class="btn-row"><a class="btn btn--primary" href="' + esc(step.url) + '">Start</a></div>', "card--strong");
      }
      var pl = P.getPlacement(sid, p);
      var what = many ? esc(subj.name) + " placement test" : "Placement test";
      html += '<p class="dash-line">' + (pl && pl.level === "done" ? what + " on " + day(pl.date) + ": every section was passed."
        : pl ? what + " on " + day(pl.date) + ': start at <a href="' + esc(pl.url) + '">' + esc(pl.label) + "</a>."
        : "No " + (many ? esc(subj.name.toLowerCase()) + " " : "") + 'placement test yet. <a href="' + esc(subj.placementUrl) + '">The placement test</a> finds where to begin.') + "</p>";
    });
    if (p.legacy && p.legacy.completed && p.legacy.completed.length) {
      html += '<p class="dash-line dash-line--note">From the earlier Math Direct program: ' + p.legacy.completed.length + " of its 150 lessons were finished. The program has since been rebuilt in levels, so those lessons do not map one to one. The placement test is the surest way to find the right starting lesson.</p>";
    }
    if (p.readingImport && p.readingImport.lessons) {
      html += '<p class="dash-line dash-line--note">From Open Phonics: ' + plural(p.readingImport.lessons, "lesson") + " finished there, marked here as reading lessons.</p>";
    }

    // ── Levels: started ones in full, the rest folded ──
    var started = [], other = [];
    var ordered = [];
    order.forEach(function (sid) { levels.forEach(function (l) { if ((l.subject || "math") === sid) ordered.push(l); }); });
    ordered.forEach(function (l) {
      var done = p.completed.filter(function (c) { return c.indexOf(l.id + "-") === 0; });
      var pl = P.getPlacement(l.subject || "math", p);
      var any = done.length || Object.keys(p.lessons).some(function (k) { return k.indexOf(l.id + "-") === 0; }) || (pl && pl.level === l.id) || l.tests.some(function (t) { return p.tests[t.id] && p.tests[t.id].length; });
      (any ? started : other).push(l);
    });
    function levelCard(l) {
      var done = p.completed.filter(function (c) { return c.indexOf(l.id + "-") === 0; });
      var body = '<div class="pbar"><span class="pbar__fill" style="--p:' + Math.min(1, done.length / l.lessons) + '"></span></div>';
      body += '<p class="pbar__label">' + done.length + " of " + l.lessons + " lessons finished</p>";
      var repeat = Object.keys(p.lessons).concat(p.redo.filter(function (k) { return !p.lessons[k]; })).filter(function (k) {
        return k.indexOf(l.id + "-") === 0 && P.lessonStatus(k, p) === "repeat";
      }).sort();
      if (repeat.length) body += '<p class="dash-small">To repeat: ' + repeat.map(function (k) { var x = parseId(k); return '<a href="' + lessonUrl(l, x.n) + '">Lesson ' + x.n + "</a>"; }).join(", ") + "</p>";
      var given = l.tests.filter(function (t) { return p.tests[t.id] && p.tests[t.id].length; });
      if (given.length) {
        body += '<ul class="dash-tests">';
        given.forEach(function (t) {
          var r = p.tests[t.id][p.tests[t.id].length - 1];
          var failed = (r.parts || []).filter(function (x) { return !x.passed; });
          var result = r.manual ? (r.passed ? "marked passed" : "marked to give again") : r.passed ? "passed" : "reteach " + failed.map(function (x) { return esc(x.trackName); }).join(", ");
          body += '<li class="' + (r.passed ? "is-pass" : "is-fail") + '"><a href="' + t.url + '">' + esc(t.title) + "</a>: " + result + ' <span class="dash-small">' + day(r.date) + "</span>";
          if (r.parts && r.parts.length && !r.manual) {
            body += '<details class="dash-parts"><summary>' + plural(r.parts.length, "part") + "</summary><ul>" + r.parts.map(function (x) {
              return "<li>" + esc(x.trackName) + ": " + (x.items - x.errors) + " of " + x.items + " right, " + (x.passed ? "passed" : "not passed") + "</li>";
            }).join("") + "</ul></details>";
          }
          body += "</li>";
        });
        body += "</ul>";
      }
      body += '<p class="dash-small"><a href="' + l.url + '">Open ' + esc(l.name) + "</a></p>";
      return card(esc(l.name), body);
    }
    started.forEach(function (l) { html += levelCard(l); });
    if (other.length) {
      html += '<details class="fold"><summary>' + (started.length ? "Other levels" : "Levels") + "</summary><div class=\"fold__body\">" + other.map(function (l) {
        return '<p class="dash-line"><a href="' + l.url + '">' + esc(l.name) + "</a>: not started.</p>";
      }).join("") + "</div></details>";
    }
    html += '<p class="dash-small">To mark a lesson finished, mark it to repeat, reset it, or rehearse it, open its level and choose Change marks.</p>';

    // ── Every lesson taught, newest first ──
    var recent = [];
    Object.keys(p.lessons).forEach(function (id) { p.lessons[id].forEach(function (s) { recent.push({ id: id, s: s }); }); });
    recent.sort(function (a, b) { return a.s.date < b.s.date ? 1 : -1; });
    var last = recent.slice(0, 25);

    // ── Pace ──
    if (recent.length >= 2) {
      var now = Date.now(), weeks = 4;
      var inWindow = recent.filter(function (x) { return now - new Date(x.s.date).getTime() <= weeks * 7 * 86400000; });
      var firstDate = new Date(recent[recent.length - 1].s.date).getTime();
      var spanWeeks = Math.max(1, Math.min(weeks, (now - firstDate) / (7 * 86400000)));
      var perWeek = Math.round((inWindow.length / spanWeeks) * 10) / 10;
      var minutes = inWindow.reduce(function (a, x) { return a + (x.s.minutes || 0); }, 0);
      var pace = "About " + perWeek + " lesson" + (perWeek === 1 ? "" : "s") + " a week over the last " + (spanWeeks < 1.5 ? "week" : Math.round(spanWeeks) + " weeks") + ". At four or five a week, a level takes about a school year.";
      if (minutes && inWindow.length) { var avg = Math.round(minutes / inWindow.length); pace += " Lessons have taken about " + plural(avg, "minute") + " each."; }
      html += card("Pace", '<p class="card__text">' + pace + "</p>");
    }

    // ── Where the errors are ──
    var byTrack = {};
    last.forEach(function (x) {
      var l = levelOf(parseId(x.id).level);
      (x.s.exercises || []).forEach(function (e) {
        var name = (l && l.tracks[e.track]) || e.title;
        byTrack[name] = (byTrack[name] || 0) + e.errors;
      });
    });
    var tracks = Object.keys(byTrack).sort(function (a, b) { return byTrack[b] - byTrack[a]; }).slice(0, 6);
    var errBody = !tracks.length
      ? '<p class="card__text">No errors recorded in recent lessons' + (last.length ? "." : ", because no lessons have been taught yet.") + "</p>"
      : '<p class="card__text">First-try errors in the last ' + plural(last.length, "lesson") + " taught, by skill. A skill near the top is worth extra practice.</p>" +
        '<ul class="dash-bars">' + tracks.map(function (t) { return '<li><span>' + esc(t) + '</span><span class="dash-bar" style="--n:' + byTrack[t] + '" aria-hidden="true"></span><b>' + byTrack[t] + "</b></li>"; }).join("") + "</ul>";
    html += card("Where the errors are", errBody);

    // ── Recent lessons ──
    if (last.length) {
      var rows = last.slice(0, 10).map(function (x) {
        var id = parseId(x.id), l = levelOf(id.level), s = x.s;
        var advice = s.repeat ? "Repeat the lesson" : s.stillMissed && s.stillMissed.length ? "Reteach " + esc(s.stillMissed.join(", ")) : "Go on";
        var extra = [];
        if (s.retestFirm + s.retestErrors) extra.push("asked again " + s.retestFirm + " of " + (s.retestFirm + s.retestErrors));
        if (s.independent) extra.push("on your own " + s.independent.firm + " of " + (s.independent.firm + s.independent.errors));
        if (s.group && s.with) extra.push("taught with " + esc(s.with));
        return '<li class="recent"><span class="recent__date">' + shortDay(s.date) + '</span><a class="recent__name" href="' + lessonUrl(l, id.n) + '">' + esc(l.name) + " " + id.n + '</a><span class="recent__nums">' + s.firm + " firm, " + plural(s.errors, "error") + (extra.length ? "; " + extra.join("; ") : "") + '</span><span class="recent__advice">' + advice + "</span></li>";
      });
      html += card("Recent lessons", '<ul class="recent-list">' + rows.join("") + "</ul>");
    }

    // ── Sounds, in reading ──
    levels.forEach(function (l) {
      if (!l.sounds || !l.sounds.length) return;
      var next = P.nextLesson(l.id, l.lessons);
      var taught = l.sounds.filter(function (s) { return s.lesson < next; });
      if (!taught.length && started.indexOf(l) === -1) return;
      var body = '<p class="card__text"><span class="fk fk--automatic" aria-hidden="true">&#10003;&#10003;</span> automatic (three right in a row, each under two seconds) <span class="fk fk--firm" aria-hidden="true">&#10003;</span> firm (three right in a row) <span class="fk fk--learning" aria-hidden="true">&middot;</span> learning <span class="fk fk--shaky" aria-hidden="true">!</span> missed recently <span class="fk fk--new" aria-hidden="true"></span> taught, not yet tried. Dashed boxes are sounds not taught yet.</p>';
      body += '<ul class="sound-grid" aria-label="' + esc(l.name) + ' sounds">';
      l.sounds.forEach(function (s) {
        var st = P.soundStatus(p.sounds && p.sounds[s.id]);
        var cls = s.lesson >= next && st === "new" ? "fc-later" : "fc-" + st;
        var glyph = st === "automatic" ? "&#10003;&#10003;" : st === "firm" ? "&#10003;" : st === "learning" ? "&middot;" : st === "shaky" ? "!" : "";
        body += '<li class="' + cls + '" data-sound="' + esc(s.id) + '"><span class="sound-grid__letters">' + esc(s.letters) + '</span><span class="sound-grid__mark" aria-hidden="true">' + (cls === "fc-later" ? "" : glyph) + '</span><span class="sr-only">' + esc(s.say) + (s.note ? ", " + esc(s.note) : "") + ", " + (cls === "fc-later" ? "not taught yet" : st === "new" ? "not tried" : st) + "</span></li>";
      });
      body += "</ul>";
      var missed = taught.filter(function (s) { return P.missedRecently(p.sounds && p.sounds[s.id]); });
      if (missed.length) body += '<p class="dash-small">Missed recently: ' + missed.map(function (s) { return esc(s.letters); }).join(", ") + '. <a href="/quick-sounds/">Quick sounds</a> brings them up first.</p>';
      html += card(esc(l.name) + " sounds", body);
    });

    // ── Checkouts, in reading ──
    if (p.checkouts && p.checkouts.length) {
      var cl = p.checkouts.slice().reverse().slice(0, 10);
      html += card("Reading checkouts", '<p class="card__text">Words a minute when reading a passage alone, with the errors, against the goal for the lesson.</p><ul class="recent-list">' + cl.map(function (c) {
        var lv = levelOf(c.level);
        return '<li class="recent"><span class="recent__date">' + shortDay(c.date) + (lv ? " · " + esc(lv.name) + " lesson " + c.lesson : "") + '</span><span class="recent__name">' + c.wpm + " words a minute, " + plural(c.errors, "error") + '</span><span class="recent__advice">' + (c.met ? "At the goal of " + c.goal + " a minute." : "The goal is " + c.goal + " a minute with " + (c.allowed === undefined ? 2 : c.allowed) + " errors or fewer.") + "</span></li>";
      }).join("") + "</ul>");
    }

    // ── Facts ──
    levels.forEach(function (l) {
      if (!l.facts.length) return;
      var next = P.nextLesson(l.id, l.lessons);
      var anyTaught = l.facts.some(function (f) { return f.lesson < next; });
      var levelStarted = started.indexOf(l) !== -1;
      if (!anyTaught && !levelStarted) return;
      var body = '<p class="card__text"><span class="fk fk--automatic" aria-hidden="true">&#10003;&#10003;</span> automatic (three right in a row, each under three seconds) <span class="fk fk--firm" aria-hidden="true">&#10003;</span> firm (three right in a row) <span class="fk fk--learning" aria-hidden="true">&middot;</span> learning <span class="fk fk--shaky" aria-hidden="true">!</span> missed recently <span class="fk fk--new" aria-hidden="true"></span> taught, not yet tried. Dashed squares are facts not taught yet.</p>';
      ["+", "-"].forEach(function (op) {
        var facts = l.facts.filter(function (f) { return f.key.indexOf(op) !== -1; });
        if (!facts.length) return;
        var maxA = 0, maxB = 0;
        facts.forEach(function (f) { var ab = f.key.split(op).map(Number); maxA = Math.max(maxA, ab[0]); maxB = Math.max(maxB, ab[1]); });
        var map = {};
        facts.forEach(function (f) { map[f.key] = f; });
        body += '<div class="fact-region"><p class="fact-region__cap">Scroll sideways to see all.</p><div class="fact-grid-wrap" role="region" tabindex="0" aria-label="' + esc(l.name) + " " + (op === "+" ? "addition" : "subtraction") + ' facts, scrolls sideways"><table class="fact-grid"><caption>' + (op === "+" ? "Addition: row plus column" : "Subtraction: row minus column") + "</caption><tr><th scope=\"col\"><span class=\"sr-only\">Row</span></th>";
        for (var b = 0; b <= maxB; b++) body += '<th scope="col">' + b + "</th>";
        body += "</tr>";
        for (var a = 0; a <= maxA; a++) {
          var rowHas = false;
          for (var b2 = 0; b2 <= maxB; b2++) if (map[a + op + b2]) rowHas = true;
          if (!rowHas) continue;
          body += '<tr><th scope="row">' + a + "</th>";
          for (var b3 = 0; b3 <= maxB; b3++) {
            var f = map[a + op + b3];
            if (!f) { body += '<td class="fc-none"></td>'; continue; }
            var st = P.factStatus(p.facts[f.key]);
            var cls = f.lesson >= next && st === "new" ? "fc-later" : "fc-" + st;
            var glyph = st === "automatic" ? "&#10003;&#10003;" : st === "firm" ? "&#10003;" : st === "learning" ? "&middot;" : st === "shaky" ? "!" : "";
            body += '<td class="' + cls + '"><span aria-hidden="true">' + (cls === "fc-later" ? "" : glyph) + '</span><span class="sr-only">' + a + (op === "+" ? " plus " : " minus ") + b3 + ", " + (cls === "fc-later" ? "not taught yet" : st === "new" ? "not tried" : st) + "</span></td>";
          }
          body += "</tr>";
        }
        body += "</table></div></div>";
      });
      html += card(esc(l.name) + " facts", body);
    });

    // ── Timed checks ──
    if (p.timed && p.timed.length) {
      var tl = p.timed.slice().reverse().slice(0, 10);
      html += card("Timed fact checks", '<p class="card__text">Facts right in one minute, against the goal for the sets released so far.</p><ul class="recent-list">' + tl.map(function (t) {
        return '<li class="recent"><span class="recent__date">' + shortDay(t.date) + '</span><span class="recent__name">' + t.right + " right, " + plural(t.errors, "error") + '</span><span class="recent__advice">' + (t.right >= t.goal ? "At the goal of " + t.goal : "Goal " + t.goal) + "</span></li>";
      }).join("") + "</ul>");
    }

    // ── Notes ──
    var notes = (p.notes || []).slice().reverse();
    var notesBody = !notes.length ? '<p class="card__text">No notes yet. Add one with the button below.</p>'
      : '<ul class="dash-notes">' + notes.map(function (n) {
        return "<li><span>" + esc(n.text) + '</span><span class="dash-small">' + day(n.date) + (n.ref ? " · " + esc(n.ref) : "") + '</span><button type="button" class="btn btn--quiet btn--square dash-note-del" data-note="' + n.id + '" aria-label="Delete note">' + xIcon() + "</button></li>";
      }).join("") + "</ul>";
    html += card("Notes", notesBody);

    root.innerHTML = html;
    var dels = root.querySelectorAll("[data-note]");
    for (var i = 0; i < dels.length; i++) dels[i].addEventListener("click", function () {
      var id = this.getAttribute("data-note");
      var text = this.parentNode.querySelector("span").textContent;
      P.deleteNote(id);
      render();
      if (window.MD && MD.toast) MD.toast("Note deleted.", { action: "Undo", onAction: function () { P.addNote(text); render(); } });
    });
  }
  function xIcon() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'; }
  render();

  // ── Add note: a sheet with a textarea ──
  var addBtn = document.getElementById("btn-add-note"), dlg = document.getElementById("sheet-note");
  if (addBtn && dlg && typeof dlg.showModal === "function") {
    var ta = document.getElementById("note-text"), err = document.getElementById("note-error");
    dlg.querySelector("form").addEventListener("submit", function (e) {
      if (e.submitter && e.submitter.value === "save" && !ta.value.trim()) {
        e.preventDefault();
        err.textContent = "Type a note first.";
        err.hidden = false;
        ta.setAttribute("aria-describedby", "note-error");
        ta.focus();
      }
    });
    dlg.addEventListener("close", function () {
      if (dlg.returnValue === "save" && ta.value.trim()) {
        P.addNote(ta.value.trim());
        render();
        if (window.MD && MD.toast) MD.toast("Note saved.");
      }
      ta.value = "";
      err.hidden = true;
    });
    addBtn.addEventListener("click", function () {
      if (window.MD) MD.openSheet(dlg, addBtn); else dlg.showModal();
      ta.focus();
    });
  }
})();
