// Today: the next thing to teach the selected child, in each subject.
(function () {
  "use strict";
  var P = window.mathProgress;
  var host = document.getElementById("today-next");
  var welcome = document.getElementById("today-welcome");
  if (!P || !host) return;
  var levels = JSON.parse(document.getElementById("today-data").textContent);
  var subjectsEl = document.getElementById("today-subjects");
  var subjects = subjectsEl ? JSON.parse(subjectsEl.textContent) : [{ id: "math", name: "Math", placementUrl: "/placement/", levels: levels.map(function (l) { return l.id; }) }];
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function day(iso) {
    var d = new Date(iso), now = new Date();
    var days = Math.round((now - d) / 86400000);
    if (days <= 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return days + " days ago";
    try { return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }); } catch (e) { return ""; }
  }
  function levelOf(id) { return levels.filter(function (l) { return l.id === id; })[0]; }

  // The app has moved to a new address: say so, once per screen, on the old ones.
  var moved = document.querySelector("[data-moved-notice]");
  if (moved) {
    var newHost = moved.getAttribute("data-new-host") || "";
    var here = window.location.hostname;
    moved.hidden = !(newHost && here !== newHost && here !== "www." + newHost && !/^(localhost|127\.)/.test(here));
  }

  var p = P.getActiveProfile();
  var anyProfileStarted = P.getProfiles().some(function (x) { return x.completed.length || Object.keys(x.lessons || {}).length || Object.keys(x.placements || {}).length; });
  if (welcome) welcome.hidden = anyProfileStarted;

  var html = "";
  // A lesson left in the middle comes first.
  var sitting = P.loadSession ? P.loadSession() : null;
  if (sitting && sitting.url && sitting.kind !== "practice") {
    html += '<div class="card next-card card--strong" data-continue-card><p class="eyebrow">Continue</p><h2 class="card__title">' + esc(sitting.title || "Where you left off") + "</h2>" +
      '<p class="card__text">' + esc(sitting.children && sitting.children.length > 1 ? sitting.children.join(" and ") : p.name) + " stopped " + (sitting.where ? "at " + esc(sitting.where.replace(/^Ex /, "Exercise ")) : "part way through") + (sitting.marks ? ", with " + sitting.marks + " answer" + (sitting.marks === 1 ? "" : "s") + " marked" : "") + ", " + day(sitting.savedAt).toLowerCase() + ".</p>" +
      '<div class="btn-row"><a class="btn btn--primary btn--big" href="' + esc(sitting.url + (sitting.url.indexOf("?") === -1 ? "?" : "&") + "continue=1") + '">Continue</a><button type="button" class="btn btn--quiet" data-discard-sitting>Clear it</button></div></div>';
  }

  // One card for each subject: the next step in a subject the child has
  // started, or where to begin in one not started yet. A new child sees the
  // welcome above instead.
  function nextCard(subj, lv) {
    var step = P.nextStep(lv.id, lv.lessons, lv.tests, lv.slug);
    var n = P.nextLesson(lv.id, lv.lessons);
    var done = p.completed.filter(function (c) { return c.indexOf(lv.id + "-") === 0; }).length;
    var brief = lv.brief && lv.brief[n - 1];
    var facts = step.test ? "A test of the last ten lessons, one part for each skill. Give it without helping." :
      "About " + (brief && brief[0] ? brief[0] : lv.minutes) + " minutes." + (brief && brief[1] ? " Needs " + esc(brief[1].charAt(0).toLowerCase() + brief[1].slice(1)) + "." : "");
    return '<div class="card next-card card--strong"><p class="eyebrow">' + esc(lv.name) + " · " + esc(p.name) + "</p>" +
      '<h2 class="card__title">' + esc(step.label) + "</h2>" +
      '<p class="next-card__facts">' + facts + (done ? " " + done + " of " + lv.lessons + " lessons finished." : "") + "</p>" +
      (!step.test && brief && brief[2] ? '<p class="next-card__new"><strong>New:</strong> ' + esc(brief[2]) + "</p>" : "") +
      '<a class="btn btn--primary btn--big btn--block" href="' + esc(step.url) + '">Start</a></div>';
  }
  function beginCard(subj) {
    return '<div class="card next-card"><p class="eyebrow">' + esc(subj.name) + " · " + esc(p.name) + '</p><h2 class="card__title">Where to begin</h2>' +
      '<p class="card__text">The placement test takes ten to twenty minutes and names the lesson to start with. Or choose a level by age.</p>' +
      '<div class="btn-row"><a class="btn btn--primary" href="' + esc(subj.placementUrl) + '">Take the placement test</a><a class="btn btn--secondary" href="/lessons/#' + esc(subj.id) + '">Choose a level</a></div></div>';
  }
  function lastLine(last) {
    var m = /^(.+)-(\d{3})$/.exec(last.id), ll = m && levelOf(m[1]);
    var s = last.summary;
    return '<p class="today-last">' + day(s.date) + ": " + esc(ll ? ll.name : "") + " Lesson " + Number(m[2]) + ", " + s.firm + " right, " + s.errors + " error" + (s.errors === 1 ? "" : "s") + ". " +
      (s.repeat ? "Repeat it." : s.stillMissed && s.stillMissed.length ? "Reteach " + esc(s.stillMissed.join(", ")) + " first." : "Go on.") + "</p>";
  }
  if (anyProfileStarted) {
    P.subjectOrder(subjects.map(function (s) { return s.id; }), p).forEach(function (sid) {
      var subj = subjects.filter(function (s) { return s.id === sid; })[0];
      var lv = levelOf(P.currentLevel(sid, p));
      if (!lv) { html += beginCard(subj); return; }
      html += nextCard(subj, lv);
      var last = P.lastResult(sid, p);
      if (last) html += lastLine(last);
    });
  }
  html += '<ul class="today-links"><li><a href="/lessons/">All lessons</a></li><li><a href="/records/">Records</a></li><li><a href="' + esc(subjects.length === 1 ? subjects[0].placementUrl : "/placement/") + '">Placement test</a></li></ul>';
  host.innerHTML = html;
  var discard = host.querySelector("[data-discard-sitting]");
  if (discard) discard.addEventListener("click", function () {
    P.clearSession();
    var card = host.querySelector("[data-continue-card]");
    if (card) card.remove();
    if (window.MD && MD.toast) MD.toast("The unfinished lesson was cleared.");
  });
})();
