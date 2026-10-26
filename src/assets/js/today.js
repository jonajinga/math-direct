// Today: the next thing to teach the selected child.
(function () {
  "use strict";
  var P = window.mathProgress;
  var host = document.getElementById("today-next");
  var welcome = document.getElementById("today-welcome");
  if (!P || !host) return;
  var levels = JSON.parse(document.getElementById("today-data").textContent);
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function day(iso) {
    var d = new Date(iso), now = new Date();
    var days = Math.round((now - d) / 86400000);
    if (days <= 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return days + " days ago";
    try { return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }); } catch (e) { return ""; }
  }

  var p = P.getActiveProfile();
  var anyProfileStarted = P.getProfiles().some(function (x) { return x.completed.length || Object.keys(x.lessons || {}).length || x.placement; });
  if (welcome) welcome.hidden = anyProfileStarted;

  var levelId = P.currentLevel();
  var html = "";
  // A sitting left in the middle comes first.
  var sitting = P.loadSession ? P.loadSession() : null;
  if (sitting && sitting.url && sitting.kind !== "practice") {
    html += '<div class="card next-card card--strong" data-continue-card><p class="kicker">Continue</p><h2 class="card__title">' + esc(sitting.title || "Where you left off") + "</h2>" +
      '<p class="card__text">' + esc(sitting.children && sitting.children.length > 1 ? sitting.children.join(" and ") : p.name) + " stopped " + (sitting.where ? "at " + esc(sitting.where.replace(/^Ex /, "Exercise ")) : "part way through") + (sitting.marks ? ", with " + sitting.marks + " answer" + (sitting.marks === 1 ? "" : "s") + " marked" : "") + ", " + day(sitting.savedAt).toLowerCase() + ".</p>" +
      '<div class="btn-row"><a class="btn btn--primary btn--big" href="' + esc(sitting.url + (sitting.url.indexOf("?") === -1 ? "?" : "&") + "continue=1") + '">Continue</a><button type="button" class="btn btn--quiet" data-discard-sitting>Start it over later</button></div></div>';
  }
  if (!levelId && !anyProfileStarted) {
    // The welcome above already says where to begin.
  } else if (!levelId) {
    html += '<div class="card next-card"><p class="kicker">' + esc(p.name) + '</p><h2 class="card__title">Where to begin</h2>' +
      '<p class="card__text">The placement test takes ten to twenty minutes and names the lesson to start with. Or choose a level by age.</p>' +
      '<div class="btn-row"><a class="btn btn--primary" href="/placement/">Take the placement test</a><a class="btn btn--secondary" href="/lessons/">Choose a level</a></div></div>';
  } else {
    var lv = levels.filter(function (l) { return l.id === levelId; })[0];
    var step = P.nextStep(lv.id, lv.lessons, lv.tests, lv.slug);
    var n = P.nextLesson(lv.id, lv.lessons);
    var done = p.completed.filter(function (c) { return c.indexOf(lv.id + "-") === 0; }).length;
    var brief = lv.brief && lv.brief[n - 1];
    var facts = step.test ? "A test of the last ten lessons, one part for each skill. Give it without helping." :
      "About " + (brief && brief[0] ? brief[0] : lv.minutes) + " minutes." + (brief && brief[1] ? " Needs " + esc(brief[1].charAt(0).toLowerCase() + brief[1].slice(1)) + "." : "");
    html += '<div class="card next-card card--strong"><p class="kicker">' + esc(lv.name) + " · " + esc(p.name) + "</p>" +
      '<h2 class="card__title">' + esc(step.label) + "</h2>" +
      '<p class="next-card__facts">' + facts + (done ? " " + done + " of " + lv.lessons + " lessons finished." : "") + "</p>" +
      (!step.test && brief && brief[2] ? '<p class="next-card__new"><strong>New:</strong> ' + esc(brief[2]) + "</p>" : "") +
      '<a class="btn btn--primary btn--big btn--block" href="' + esc(step.url) + '">Start</a></div>';
    var last = P.lastResult();
    if (last) {
      var m = /^(.+)-(\d{3})$/.exec(last.id), ll = levels.filter(function (l) { return l.id === m[1]; })[0];
      var s = last.summary;
      html += '<p class="today-last">' + day(s.date) + ": " + esc(ll ? ll.name : "") + " Lesson " + Number(m[2]) + ", " + s.firm + " firm, " + s.errors + " error" + (s.errors === 1 ? "" : "s") + ". " +
        (s.repeat ? "Repeat it." : s.stillMissed && s.stillMissed.length ? "Reteach " + esc(s.stillMissed.join(", ")) + " first." : "Go on.") + "</p>";
    }
  }
  html += '<ul class="today-links"><li><a href="/lessons/">All lessons</a></li><li><a href="/records/">Records</a></li><li><a href="/placement/">Placement test</a></li></ul>';
  host.innerHTML = html;
  var discard = host.querySelector("[data-discard-sitting]");
  if (discard) discard.addEventListener("click", function () {
    P.clearSession();
    var card = host.querySelector("[data-continue-card]");
    if (card) card.remove();
    if (window.MD && MD.toast) MD.toast("The saved sitting was cleared.");
  });
})();
