// Draws a printable worksheet from the lesson's worksheet items.
(function () {
  "use strict";
  var dataEl = document.getElementById("ws-data");
  var sheet = document.getElementById("ws-sheet");
  if (!dataEl || !sheet) return;
  var data = JSON.parse(dataEl.textContent);
  var ORD = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth"];

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  var html = '<header class="ws-head"><div class="ws-head__title"><span class="ws-head__brand">Math Direct</span> ' + esc(data.level) + ", Lesson " + data.number + (data.optional ? " (optional)" : "") + "</div>" +
    '<div class="ws-head__lines"><span>Name <i></i></span><span>Date <i></i></span></div></header>';
  html += '<p class="ws-note">Read each direction aloud to the child. Let the child work alone, then check the page together.</p>';
  var key = [];
  data.items.forEach(function (it, i) {
    var n = i + 1;
    html += '<section class="ws-item ws-item--' + it.kind + '"><h2 class="ws-item__prompt"><span class="ws-item__n">' + n + "</span>" + esc(it.prompt) + "</h2>";
    if (it.kind === "circle") {
      if (it.show) html += '<div class="ws-item__show">' + MDV.render(it.show) + "</div>";
      html += '<div class="ws-opts">';
      it.opts.forEach(function (o) { html += '<div class="ws-opt">' + MDV.render(o) + "</div>"; });
      html += "</div>";
      key.push(n + ". Circle the " + it.ans.map(function (a) { return ORD[a] || a + 1; }).join(" and ") + " picture" + (it.ans.length > 1 ? "s" : "") + ".");
    } else if (it.kind === "write") {
      // An equation with a blank already has its box; otherwise add one.
      var hasBlank = JSON.stringify(it.show).indexOf('"_"') !== -1;
      html += '<div class="ws-write"><div class="ws-item__show">' + MDV.render(it.show) + "</div>" + (hasBlank ? "" : '<div class="ws-answer-box" aria-label="Write the answer here"></div>') + "</div>";
      key.push(n + ". " + it.answer);
    } else if (it.kind === "trace") {
      html += '<div class="ws-item__show ws-trace">' + MDV.render({ t: "trace", d: it.d, count: String(it.d).length > 1 ? 3 : 4 }) + "</div>";
      key.push(n + ". Traced and written, starting at the top.");
    } else if (it.kind === "mark") {
      html += '<div class="ws-item__show ws-outline">' + MDV.render(it.show) + "</div>";
      key.push(n + ". " + it.answer + ".");
    } else {
      html += '<div class="ws-answer-box ws-answer-box--wide"></div>';
      if (it.answer) key.push(n + ". " + it.answer);
    }
    html += "</section>";
  });
  html += '<footer class="ws-key" id="ws-key" hidden><h2>Answer key</h2><ol>' + key.map(function (k) { return "<li>" + esc(k.replace(/^\d+\. /, "")) + "</li>"; }).join("") + "</ol></footer>";
  sheet.innerHTML = html;

  var box = document.getElementById("ws-show-key");
  var keyEl = document.getElementById("ws-key");
  if (box && keyEl) {
    try { box.checked = localStorage.getItem("md-ws-key") === "1"; } catch (e) {}
    keyEl.hidden = !box.checked;
    box.addEventListener("change", function () {
      keyEl.hidden = !box.checked;
      try { localStorage.setItem("md-ws-key", box.checked ? "1" : "0"); } catch (e) {}
    });
  }
})();
