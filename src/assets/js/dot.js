// Teach Direct dot: the dot under the letters in a reading step.
//
// The parent presses and holds the Dot button. On the press the dot moves
// under the next sound (or, in a line of text, the next word) and rests
// there while the button is held; it stays when the button is released, as
// a finger under the page does. A quick tap at the start sweeps the dot
// under the whole word, for "say it fast". In a "fast" step every press
// sweeps. After the last stop a press moves the dot to the end of the
// arrow, and the next one takes it back to the start.
//
//   MDDot.attach(stage, announce) -> true when the step has a dot
//   MDDot.layout()                   after the text is resized
//   MDDot.press(), MDDot.release(), MDDot.step(), MDDot.sweep(), MDDot.reset()
//   MDDot.state()                    for the checks
(function () {
  "use strict";
  var reduced = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  var text = null, dot = null, track = null, stops = [], idx = -1, mode = "none";
  var held = false, pressedAt = 0, pressIdx = -1, sweeping = false, sweepTimer = null;
  var say = function () {};

  function fontSize() { return parseFloat(getComputedStyle(text).fontSize) || 16; }

  function attach(stage, announce) {
    say = announce || function () {};
    clearTimeout(sweepTimer);
    text = stage ? stage.querySelector(".mdv-text[data-dot]") : null;
    dot = null; track = null; stops = []; idx = -1; held = false; sweeping = false;
    mode = text ? text.getAttribute("data-dot") : "none";
    if (!text || mode === "none") { text = null; mode = "none"; return false; }
    dot = text.querySelector(".mdv-text__dot");
    track = text.querySelector(".mdv-text__track");
    layout();
    return true;
  }

  // Where the dot can rest: under each sound group of the word, or under
  // each word of a line. Positions are measured from the text box's corner.
  function layout() {
    if (!text) return;
    var box = text.getBoundingClientRect(), fs = fontSize();
    var els = mode === "line" ? text.querySelectorAll(".mdv-text__word") : text.querySelectorAll(".mdv-tok[data-stop]");
    stops = [];
    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      stops.push({ x: r.left - box.left + r.width / 2, y: r.bottom - box.top + fs * 0.24, tap: els[i].getAttribute("data-stop") === "tap", text: els[i].getAttribute("data-say") || els[i].textContent });
    }
    if (track) {
      var word = text.querySelector(".mdv-text__word");
      if (word) {
        var wr = word.getBoundingClientRect();
        track.style.left = (wr.left - box.left - fs * 0.12) + "px";
        track.style.width = (wr.width + fs * 0.78) + "px";
        track.style.top = (wr.bottom - box.top + fs * 0.1) + "px";
        var tr = track.getBoundingClientRect();
        for (var k = 0; k < stops.length; k++) stops[k].y = tr.top - box.top + tr.height / 2;
      }
    }
    place(idx, true);
  }
  function edge(atEnd) {
    var b = text.getBoundingClientRect();
    if (!track) return stops.length ? stops[atEnd ? stops.length - 1 : 0].x : 0;
    var tr = track.getBoundingClientRect();
    // The start is the ball; the end lies just past the arrow's tip.
    return atEnd ? tr.right - b.left + fontSize() * 0.2 : tr.left - b.left + fontSize() * 0.14;
  }
  function place(i, instant) {
    if (!dot) return;
    if (mode === "line" && (i < 0 || i >= stops.length)) { dot.hidden = true; return; }
    var quick = instant || reduced.matches;
    if (quick) dot.classList.add("is-instant");
    dot.hidden = false;
    var x = i < 0 ? edge(false) : i >= stops.length ? edge(true) : stops[i].x;
    var y = i >= 0 && i < stops.length ? stops[i].y : stops.length ? stops[0].y : 0;
    dot.style.left = x + "px";
    dot.style.top = y + "px";
    if (quick) { void dot.offsetWidth; dot.classList.remove("is-instant"); }
  }
  function label(i) { return i < 0 ? "Dot at the start." : i >= stops.length ? "Dot at the end." : "Dot under " + stops[i].text + "."; }
  function move(i) { idx = i; place(i, false); say(label(i)); }
  function wordText() { var w = text && text.querySelector(".mdv-text__word"); return w ? (w.getAttribute("data-say") || w.textContent) : ""; }

  function press() {
    if (mode === "none" || !dot || sweeping || held) return;
    held = true; pressedAt = Date.now(); pressIdx = idx;
    dot.classList.add("is-held");
    if (mode === "fast") { if (idx >= stops.length) move(-1); else sweep(); return; }
    var next = idx + 1;
    if (next > stops.length) next = -1;
    move(next);
    if (next >= 0 && next < stops.length && stops[next].tap) {
      dot.classList.add("is-tap");
      setTimeout(function () { if (dot) dot.classList.remove("is-tap"); }, 260);
    }
  }
  function release() {
    if (!held) return;
    held = false;
    if (dot) dot.classList.remove("is-held");
    // A quick tap at the start of a word sweeps it: "say it fast".
    if (mode !== "line" && mode !== "fast" && pressIdx === -1 && idx === 0 && Date.now() - pressedAt < 200 && stops.length > 1) sweep();
  }
  // One step on, with no hold and never a sweep.
  function step() {
    if (mode === "none" || !dot || sweeping) return;
    if (mode === "fast") { press(); held = false; dot.classList.remove("is-held"); return; }
    var next = idx + 1;
    if (next > stops.length) next = -1;
    move(next);
  }
  function sweep() {
    if (mode === "none" || !dot || !stops.length || sweeping) return;
    sweeping = true;
    dot.classList.add("is-sweep");
    idx = stops.length;
    place(idx, false);
    say("Swept under " + wordText() + ".");
    clearTimeout(sweepTimer);
    sweepTimer = setTimeout(function () { sweeping = false; if (dot) dot.classList.remove("is-sweep"); }, reduced.matches ? 0 : 650);
  }
  function reset() {
    if (mode === "none" || !dot) return;
    clearTimeout(sweepTimer);
    sweeping = false; held = false;
    dot.classList.remove("is-held", "is-sweep", "is-tap");
    move(-1);
  }
  function state() {
    var b = text ? text.getBoundingClientRect() : null, d = dot && !dot.hidden ? dot.getBoundingClientRect() : null;
    return {
      mode: mode, idx: idx, held: held, sweeping: sweeping, count: stops.length,
      stops: stops.map(function (s) { return { x: s.x, y: s.y, tap: s.tap, text: s.text }; }),
      dot: d && b ? { x: d.left - b.left + d.width / 2, y: d.top - b.top + d.height / 2 } : null,
    };
  }
  window.MDDot = { attach: attach, layout: layout, press: press, release: release, step: step, sweep: sweep, reset: reset, state: state };
})();
