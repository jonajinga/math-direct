// Teach Direct visual renderer.
// Draws the visual specifications produced by curriculum/lib/v.js as HTML and
// inline SVG. Used by lessons, tests, practice, and placement.
//
//   MDV.render(spec or [specs], { print: true }) -> HTML string
//   MDV.bind(container, onChoose, opts)          -> wires up touchable parts
//   MDV.describe(spec)                           -> text alternative for the stage
//   MDV.describeChoice(spec, idx)                -> names a touched part
(function () {
  "use strict";

  // ── Helpers ──

  function rng(seed) {
    var a = (seed || 1) >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // cw: width in "cells" (one counted object), so objects keep a steady size.
  function svg(w, h, body, cls, extra, cw) {
    var style = "--ar:" + (w / h).toFixed(3) + (cw ? ";--cw:" + cw.toFixed(2) : "");
    return '<svg class="mdv-svg ' + (cw ? "mdv-cells " : "") + (cls || "") + '" viewBox="0 0 ' + w + " " + h + '" style="' + style + '" xmlns="http://www.w3.org/2000/svg" ' + (extra || "") + ' role="img" aria-hidden="true">' + body + "</svg>";
  }

  var COLOR = {
    red: "var(--v-red)", blue: "var(--v-blue)", yellow: "var(--v-yellow)", green: "var(--v-green)",
    purple: "var(--v-purple)", orange: "var(--v-orange)", gray: "var(--v-gray)", brown: "var(--v-brown)",
    pink: "var(--v-pink)",
  };
  function col(c) { return COLOR[c] || c || COLOR.blue; }

  // ── Pictures (each drawn in a 100 x 100 box) ──

  var ICON = {
    apple: function () {
      return '<path d="M50 30 C 30 18, 10 30, 14 56 C 18 80, 36 94, 50 86 C 64 94, 82 80, 86 56 C 90 30, 70 18, 50 30 Z" fill="var(--v-red)"/>' +
        '<path d="M50 30 C 50 22, 52 14, 56 8" stroke="var(--v-brown)" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        '<path d="M56 18 C 64 8, 78 10, 80 14 C 74 22, 62 24, 56 18 Z" fill="var(--v-green)"/>';
    },
    star: function () {
      return '<polygon points="50,6 62,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 38,38" fill="var(--v-yellow)" stroke="var(--v-orange)" stroke-width="3" stroke-linejoin="round"/>';
    },
    duck: function () {
      return '<ellipse cx="46" cy="64" rx="36" ry="24" fill="var(--v-yellow)"/>' +
        '<circle cx="72" cy="34" r="18" fill="var(--v-yellow)"/>' +
        '<path d="M86 34 L100 40 L86 44 Z" fill="var(--v-orange)"/>' +
        '<circle cx="76" cy="30" r="3.5" fill="#222"/>' +
        '<path d="M28 58 C 40 50, 54 54, 58 64 C 46 70, 34 68, 28 58 Z" fill="var(--v-orange)" opacity="0.45"/>';
    },
    fish: function () {
      return '<ellipse cx="44" cy="50" rx="34" ry="22" fill="var(--v-orange)"/>' +
        '<path d="M74 50 L98 30 L98 70 Z" fill="var(--v-orange)"/>' +
        '<circle cx="26" cy="44" r="4" fill="#222"/>' +
        '<path d="M44 34 C 52 42, 52 58, 44 66" stroke="#fff" stroke-width="3" fill="none" opacity="0.6"/>';
    },
    ball: function () {
      // A beach ball: colored panels, no lines that could read as a cross.
      return '<circle cx="50" cy="50" r="42" fill="var(--v-blue)"/>' +
        '<path d="M50 8 C 30 24, 30 76, 50 92 C 36 88, 12 72, 8 50 C 12 28, 36 12, 50 8 Z" fill="var(--v-red)"/>' +
        '<path d="M50 8 C 70 24, 70 76, 50 92 C 64 88, 88 72, 92 50 C 88 28, 64 12, 50 8 Z" fill="var(--v-yellow)"/>' +
        '<circle cx="50" cy="50" r="42" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="2"/>' +
        '<ellipse cx="36" cy="30" rx="8" ry="5" fill="#fff" opacity="0.6"/>';
    },
    car: function () {
      return '<path d="M8 62 L8 48 C 8 44, 12 42, 18 42 L28 26 C 30 22, 34 20, 40 20 L64 20 C 70 20, 74 22, 76 26 L84 42 C 90 42, 94 46, 94 50 L94 62 Z" fill="var(--v-red)"/>' +
        '<path d="M34 28 L44 28 L44 42 L26 42 Z M50 28 L66 28 L74 42 L50 42 Z" fill="#dbeafe"/>' +
        '<circle cx="28" cy="66" r="11" fill="#222"/><circle cx="74" cy="66" r="11" fill="#222"/>' +
        '<circle cx="28" cy="66" r="4" fill="#aaa"/><circle cx="74" cy="66" r="4" fill="#aaa"/>';
    },
    flower: function () {
      var p = "";
      for (var i = 0; i < 5; i++) {
        var a = (i * 72 - 90) * Math.PI / 180;
        p += '<circle cx="' + (50 + Math.cos(a) * 18).toFixed(1) + '" cy="' + (40 + Math.sin(a) * 18).toFixed(1) + '" r="14" fill="var(--v-pink)"/>';
      }
      return '<path d="M50 52 L50 96" stroke="var(--v-green)" stroke-width="6"/>' +
        '<path d="M50 80 C 62 66, 76 68, 80 72 C 70 82, 58 82, 50 80 Z" fill="var(--v-green)"/>' + p +
        '<circle cx="50" cy="40" r="10" fill="var(--v-yellow)"/>';
    },
    bird: function () {
      return '<ellipse cx="46" cy="58" rx="32" ry="24" fill="var(--v-blue)"/>' +
        '<circle cx="72" cy="38" r="16" fill="var(--v-blue)"/>' +
        '<path d="M86 36 L98 40 L86 44 Z" fill="var(--v-orange)"/>' +
        '<circle cx="76" cy="34" r="3.5" fill="#222"/>' +
        '<path d="M22 56 C 34 44, 52 48, 56 58 C 44 66, 30 66, 22 56 Z" fill="#fff" opacity="0.35"/>' +
        '<path d="M14 54 L2 46 L6 62 Z" fill="var(--v-blue)"/>';
    },
    cookie: function () {
      return '<circle cx="50" cy="50" r="42" fill="#d6a15e"/>' +
        '<circle cx="34" cy="36" r="6" fill="#5b3a1a"/><circle cx="62" cy="30" r="5" fill="#5b3a1a"/>' +
        '<circle cx="66" cy="60" r="6" fill="#5b3a1a"/><circle cx="40" cy="66" r="5" fill="#5b3a1a"/><circle cx="52" cy="48" r="4" fill="#5b3a1a"/>';
    },
    leaf: function () {
      return '<path d="M14 86 C 10 40, 40 10, 90 10 C 90 60, 60 90, 14 86 Z" fill="var(--v-green)"/>' +
        '<path d="M14 86 C 40 60, 60 40, 84 16" stroke="#fff" stroke-width="3" fill="none" opacity="0.6"/>';
    },
    block: function () {
      return '<path d="M14 34 L50 18 L86 34 L50 50 Z" fill="var(--v-purple)" opacity="0.7"/>' +
        '<path d="M14 34 L50 50 L50 92 L14 76 Z" fill="var(--v-purple)"/>' +
        '<path d="M86 34 L50 50 L50 92 L86 76 Z" fill="var(--v-purple)" opacity="0.85"/>';
    },
    frog: function () {
      return '<ellipse cx="50" cy="62" rx="40" ry="28" fill="var(--v-green)"/>' +
        '<circle cx="30" cy="34" r="13" fill="var(--v-green)"/><circle cx="70" cy="34" r="13" fill="var(--v-green)"/>' +
        '<circle cx="30" cy="33" r="6" fill="#fff"/><circle cx="70" cy="33" r="6" fill="#fff"/>' +
        '<circle cx="31" cy="34" r="3" fill="#222"/><circle cx="71" cy="34" r="3" fill="#222"/>' +
        '<path d="M32 66 C 42 74, 58 74, 68 66" stroke="#222" stroke-width="3" fill="none" stroke-linecap="round"/>';
    },
    ladybug: function () {
      return '<circle cx="50" cy="24" r="14" fill="#222"/>' +
        '<ellipse cx="50" cy="60" rx="38" ry="34" fill="var(--v-red)"/>' +
        '<path d="M50 28 L50 94" stroke="#222" stroke-width="3"/>' +
        '<circle cx="34" cy="50" r="6" fill="#222"/><circle cx="66" cy="50" r="6" fill="#222"/>' +
        '<circle cx="32" cy="74" r="5" fill="#222"/><circle cx="68" cy="74" r="5" fill="#222"/>';
    },
    boat: function () {
      return '<path d="M8 64 L92 64 L78 86 L22 86 Z" fill="var(--v-brown)"/>' +
        '<path d="M50 10 L50 64" stroke="#555" stroke-width="4"/>' +
        '<path d="M54 14 L86 58 L54 58 Z" fill="#f5f5f4" stroke="#888" stroke-width="2"/>' +
        '<path d="M46 22 L22 58 L46 58 Z" fill="var(--v-yellow)"/>';
    },
    heart: function () {
      return '<path d="M50 88 C 20 66, 6 48, 10 30 C 14 14, 36 10, 50 28 C 64 10, 86 14, 90 30 C 94 48, 80 66, 50 88 Z" fill="var(--v-red)"/>';
    },
    cat: function () {
      return '<path d="M20 30 L28 6 L44 24 Z M80 30 L72 6 L56 24 Z" fill="var(--v-gray)"/>' +
        '<ellipse cx="50" cy="52" rx="34" ry="30" fill="var(--v-gray)"/>' +
        '<circle cx="38" cy="46" r="4" fill="#222"/><circle cx="62" cy="46" r="4" fill="#222"/>' +
        '<path d="M46 58 L54 58 L50 63 Z" fill="var(--v-pink)"/>' +
        '<path d="M50 63 C 46 68, 40 68, 38 65 M50 63 C 54 68, 60 68, 62 65" stroke="#222" stroke-width="2" fill="none"/>';
    },
    rock: function () {
      return '<path d="M10 80 C 6 60, 20 36, 44 30 C 66 24, 90 40, 92 64 C 94 80, 80 88, 52 88 C 30 88, 14 88, 10 80 Z" fill="#8a8580"/>' +
        '<path d="M30 52 C 40 46, 52 46, 60 50" stroke="#6b6560" stroke-width="3" fill="none"/>';
    },
    feather: function () {
      return '<path d="M20 90 C 30 50, 50 20, 86 10 C 80 40, 60 70, 20 90 Z" fill="#e7e5e4" stroke="#a8a29e" stroke-width="2"/>' +
        '<path d="M20 90 L74 24" stroke="#a8a29e" stroke-width="2"/>';
    },
    melon: function () {
      return '<ellipse cx="50" cy="54" rx="42" ry="34" fill="var(--v-green)"/>' +
        '<path d="M30 24 C 24 44, 24 66, 30 86 M50 20 L50 88 M70 24 C 76 44, 76 66, 70 86" stroke="#14532d" stroke-width="3" fill="none" opacity="0.6"/>';
    },
    grape: function () {
      return '<circle cx="50" cy="56" r="14" fill="var(--v-purple)"/><path d="M50 42 L54 30" stroke="var(--v-brown)" stroke-width="3"/>';
    },
    cup: function () {
      return '<path d="M18 14 L82 14 L74 92 L26 92 Z" fill="var(--v-soft)" stroke="var(--v-ink)" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M22 40 L78 40 L74 92 L26 92 Z" fill="var(--v-blue)" opacity="0.55"/>';
    },
  };
  var ICON_NAMES = Object.keys(ICON);

  function icon(name, x, y, s, extra) {
    var f = ICON[name] || ICON.ball;
    var k = s / 100;
    return '<g class="mdv-icon" transform="translate(' + x.toFixed(1) + " " + y.toFixed(1) + ") scale(" + k.toFixed(3) + ')" ' + (extra || "") + ">" + f() + "</g>";
  }

  // ── Layout positions for groups ──

  var DICE = {
    1: [[0.5, 0.5]],
    2: [[0.25, 0.25], [0.75, 0.75]],
    3: [[0.2, 0.2], [0.5, 0.5], [0.8, 0.8]],
    4: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]],
    5: [[0.22, 0.22], [0.78, 0.22], [0.5, 0.5], [0.22, 0.78], [0.78, 0.78]],
    6: [[0.25, 0.2], [0.75, 0.2], [0.25, 0.5], [0.75, 0.5], [0.25, 0.8], [0.75, 0.8]],
  };

  // Returns { pts: [[x,y]...] in cell units, w, h } for n items.
  function layout(n, arr, seed, cols) {
    var pts = [], i;
    if (arr === "dice" && n <= 6) {
      var d = DICE[n] || [];
      for (i = 0; i < d.length; i++) pts.push([d[i][0] * 3, d[i][1] * 3]);
      return { pts: pts, w: 3, h: 3 };
    }
    if (arr === "line") {
      for (i = 0; i < n; i++) pts.push([i + 0.5, 0.5]);
      return { pts: pts, w: Math.max(n, 1), h: 1 };
    }
    if (arr === "circle") {
      var r = Math.max(1.2, n * 0.36);
      for (i = 0; i < n; i++) {
        var a = (i / n) * Math.PI * 2 - Math.PI / 2;
        pts.push([r + 0.6 + Math.cos(a) * r, r + 0.6 + Math.sin(a) * r]);
      }
      return { pts: pts, w: 2 * r + 1.2, h: 2 * r + 1.2 };
    }
    if (arr === "scatter") {
      var W = Math.max(3, Math.ceil(Math.sqrt(n) * 1.9)), H = Math.max(2.4, Math.ceil(Math.sqrt(n) * 1.3));
      var rand = rng((seed || 7) * 97 + n * 13);
      var tries = 0;
      while (pts.length < n && tries < 4000) {
        tries++;
        var x = 0.5 + rand() * (W - 1), y = 0.5 + rand() * (H - 1), ok = true;
        for (var j = 0; j < pts.length; j++) {
          var dx = pts[j][0] - x, dy = pts[j][1] - y;
          if (dx * dx + dy * dy < 1.05) { ok = false; break; }
        }
        if (ok) pts.push([x, y]);
      }
      return { pts: pts, w: W, h: H };
    }
    if (arr === "array") {
      var c = cols || Math.ceil(Math.sqrt(n));
      for (i = 0; i < n; i++) pts.push([(i % c) + 0.5, Math.floor(i / c) + 0.5]);
      return { pts: pts, w: c, h: Math.ceil(n / c) };
    }
    // "row": rows of five; tens grouped with a gap.
    var row = 0, placed = 0, gapY = 0;
    while (placed < n) {
      var inRow = Math.min(5, n - placed);
      for (i = 0; i < inRow; i++) pts.push([i + 0.5, row + 0.5 + gapY]);
      placed += inRow;
      row++;
      if (placed % 10 === 0 && placed < n) gapY += 0.4;
    }
    return { pts: pts, w: Math.min(5, Math.max(n, 1)), h: row + gapY };
  }

  // ── Renderers ──

  var R = {};

  R.say = function () {
    return '<div class="mdv mdv-say">' + svg(120, 100,
      '<path d="M18 20 h70 a12 12 0 0 1 12 12 v30 a12 12 0 0 1 -12 12 h-40 l-18 16 v-16 h-12 a12 12 0 0 1 -12 -12 v-30 a12 12 0 0 1 12 -12 z" fill="var(--v-soft)" stroke="var(--v-ink)" stroke-width="3"/>' +
      '<circle cx="36" cy="47" r="5" fill="var(--v-ink)"/><circle cx="53" cy="47" r="5" fill="var(--v-ink)"/><circle cx="70" cy="47" r="5" fill="var(--v-ink)"/>' +
      '<path d="M104 34 c6 6 6 20 0 26 M112 28 c10 10 10 28 0 38" stroke="var(--v-ink)" stroke-width="3" fill="none" stroke-linecap="round"/>', "mdv-say__svg") + "</div>";
  };

  function dotRow(n) {
    if (!n) return "";
    var l = layout(n, "row");
    var body = "";
    for (var i = 0; i < l.pts.length; i++) body += '<circle cx="' + (l.pts[i][0] * 20) + '" cy="' + (l.pts[i][1] * 20) + '" r="7.5" fill="var(--v-dot)"/>';
    return svg(l.w * 20, l.h * 20, body, "mdv-numdots");
  }

  R.num = function (v, o) {
    var vals = Array.isArray(v.v) ? v.v : [v.v];
    var size = v.size || "lg";
    // The widest item, in characters, so a numeral in a narrow box can be sized to fit it.
    var chars = 1;
    for (var c = 0; c < vals.length; c++) chars = Math.max(chars, String(vals[c]).length);
    var html = '<div class="mdv mdv-num mdv-num--' + size + '" style="--chars:' + chars + '">';
    for (var i = 0; i < vals.length; i++) {
      var val = vals[i];
      html += '<span class="mdv-num__item">';
      if (val === "?") html += '<span class="mdv-blank">?</span>';
      else html += '<span class="mdv-num__digit">' + esc(val) + "</span>";
      if (v.dots && typeof val === "number" && val > 0 && val <= 20) html += dotRow(val);
      html += "</span>";
    }
    return html + "</div>";
  };

  R.sign = function (v) {
    return '<div class="mdv mdv-num mdv-num--lg"><span class="mdv-num__digit mdv-sign">' + esc(v.s) + "</span></div>";
  };

  R.seq = function (v) {
    var html = '<div class="mdv mdv-seq">';
    for (var i = 0; i < v.items.length; i++) {
      var it = v.items[i];
      var cls = "mdv-seq__box" + (v.hl === i ? " is-hl" : "") + (it === "?" ? " is-blank" : "");
      html += '<span class="' + cls + '">' + (it === "?" ? "?" : esc(it)) + "</span>";
    }
    return html + "</div>";
  };

  R.dots = function (v) {
    var arr = v.arr || "row";
    if (arr === "five") return R.frame({ size: 5, n: v.n });
    var l = layout(v.n, arr, v.seed, v.cols);
    var cell = 40, body = "";
    if (arr === "dice") {
      body += '<rect x="2" y="2" width="' + (l.w * cell - 4) + '" height="' + (l.h * cell - 4) + '" rx="14" fill="var(--v-soft)" stroke="var(--v-line)" stroke-width="3"/>';
    }
    for (var i = 0; i < l.pts.length; i++) {
      body += '<circle cx="' + (l.pts[i][0] * cell).toFixed(1) + '" cy="' + (l.pts[i][1] * cell).toFixed(1) + '" r="' + (cell * 0.36) + '" fill="var(--v-dot)"/>';
    }
    return '<div class="mdv mdv-dots mdv--' + (v.size || "md") + '">' + svg(Math.max(l.w * cell, cell), Math.max(l.h * cell, cell), body, "", "", Math.max(l.w, 1)) + "</div>";
  };

  R.obj = function (v, o) {
    var arr = v.arr || "row";
    var l = layout(v.n, arr, v.seed, v.cols);
    var cell = 100, s = 84 * (v.scale || 1), body = "";
    var crossFrom = v.cross ? v.n - v.cross : v.n;
    for (var i = 0; i < l.pts.length; i++) {
      var cx = l.pts[i][0] * cell, cy = l.pts[i][1] * cell;
      var tapAttr = v.tap ? 'class="mdv-tap mdv-mark" data-mark="' + i + '" tabindex="-1"' : "";
      body += "<g " + tapAttr + ">";
      if (v.tap) body += '<circle class="mdv-mark__ring" cx="' + cx + '" cy="' + cy + '" r="48" fill="transparent"/>';
      body += icon(v.icon, cx - s / 2, cy - s / 2, s);
      if (i >= crossFrom) body += '<path d="M' + (cx - 38) + " " + (cy - 38) + " L" + (cx + 38) + " " + (cy + 38) + " M" + (cx + 38) + " " + (cy - 38) + " L" + (cx - 38) + " " + (cy + 38) + '" stroke="var(--v-ink)" stroke-width="7" stroke-linecap="round"/>';
      if (v.start && i === 0) body += '<circle cx="' + cx + '" cy="' + (cy + 50) + '" r="7" fill="var(--v-ink)"/>';
      body += "</g>";
    }
    var w = Math.max(l.w, 1) * cell, h = Math.max(l.h, 1) * cell + (v.start ? 14 : 0);
    var sz = v.size || (v.n > 10 ? "md" : "lg");
    return '<div class="mdv mdv-obj mdv--' + sz + (v.tap ? " mdv-markable" : "") + '">' + svg(w, h, body, "", "", w / cell) + "</div>";
  };

  R.frame = function (v) {
    var size = v.size || 10, frames = v.frames || Math.ceil(Math.max(v.n + (v.n2 || 0), 1) / size), html = "";
    if (v.n + (v.n2 || 0) <= size) frames = 1;
    var cols = 5, rows = size / 5, cell = 50, body;
    var left = v.n, left2 = v.n2 || 0;
    html += '<div class="mdv mdv-frames mdv-frames--' + frames + '">';
    for (var f = 0; f < frames; f++) {
      body = "";
      for (var r2 = 0; r2 < rows; r2++) {
        for (var c = 0; c < cols; c++) {
          var x = c * cell, y = r2 * cell;
          body += '<rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="' + (cell - 4) + '" height="' + (cell - 4) + '" fill="var(--v-paper)" stroke="var(--v-ink)" stroke-width="3"/>';
          if (left > 0) { body += '<circle cx="' + (x + cell / 2) + '" cy="' + (y + cell / 2) + '" r="16" fill="var(--v-dot)"/>'; left--; }
          else if (left2 > 0) { body += '<circle cx="' + (x + cell / 2) + '" cy="' + (y + cell / 2) + '" r="16" fill="var(--v-dot2)"/>'; left2--; }
        }
      }
      html += svg(cols * cell + 4, rows * cell + 4, body, "mdv-frame");
    }
    return html + "</div>";
  };

  function tokenHtml(p) {
    if (p === "?") return '<span class="mdv-blank">?</span>';
    if (p === "_") return '<span class="mdv-blank mdv-blank--write"></span>';
    if (typeof p === "number") return '<span class="mdv-eq__n">' + p + "</span>";
    if (p === "+" || p === "−" || p === "-" || p === "×" || p === "÷" || p === "=" || p === "<" || p === ">") return '<span class="mdv-eq__op">' + esc(p === "-" ? "−" : p) + "</span>";
    return '<span class="mdv-eq__n">' + esc(p) + "</span>";
  }

  R.eq = function (v) {
    var html = '<div class="mdv mdv-eq">';
    for (var i = 0; i < v.parts.length; i++) html += tokenHtml(v.parts[i]);
    return html + "</div>";
  };

  R.col = function (v) {
    var a = String(v.a), b = String(v.b), ans = v.ans !== undefined ? String(v.ans) : "";
    var width = Math.max(a.length, b.length, ans.length);
    function cells(str, cls) {
      var out = "";
      var padded = str;
      while (padded.length < width) padded = " " + padded;
      for (var i = 0; i < padded.length; i++) out += '<span class="mdv-col__d ' + (cls || "") + '">' + (padded[i] === " " ? "" : esc(padded[i])) + "</span>";
      return out;
    }
    var html = '<div class="mdv mdv-col" style="--w:' + width + '">';
    if (v.labels) html += '<div class="mdv-col__row mdv-col__labels"><span class="mdv-col__op"></span>' + (width > 1 ? '<span class="mdv-col__d">T</span>' : "") + '<span class="mdv-col__d">O</span></div>';
    if (v.carry) html += '<div class="mdv-col__row mdv-col__carry"><span class="mdv-col__op"></span>' + cells(String(v.carry) + " ", "is-carry") + "</div>";
    if (v.cross) {
      // cross: { tens: new tens digit, ones: new ones value } for trading a ten
      html += '<div class="mdv-col__row mdv-col__carry"><span class="mdv-col__op"></span>' + '<span class="mdv-col__d is-carry">' + v.cross.tens + '</span><span class="mdv-col__d is-carry">' + v.cross.ones + "</span></div>";
    }
    html += '<div class="mdv-col__row"><span class="mdv-col__op"></span>' + cells(a, v.cross ? "is-struck" : "") + "</div>";
    html += '<div class="mdv-col__row mdv-col__line"><span class="mdv-col__op">' + esc(v.op === "-" ? "−" : v.op) + "</span>" + cells(b) + "</div>";
    html += '<div class="mdv-col__row"><span class="mdv-col__op"></span>' + (v.show ? cells(ans) : v.blank ? cells(ans.replace(/./g, "?").replace(/^\?+/, function (m) { return m; }), "is-blank") : cells("")) + "</div>";
    return html + "</div>";
  };

  R.choices = function (v, o) {
    var ans = Array.isArray(v.ans) ? v.ans : [v.ans];
    var html = '<div class="mdv mdv-choices mdv-choices--' + v.opts.length + '" data-ans="' + ans.join(",") + '">';
    for (var i = 0; i < v.opts.length; i++) {
      html += '<button type="button" class="mdv-choice mdv-tap" data-choice="' + i + '" aria-label="' + esc(describeOne(v.opts[i]) || "choice " + (i + 1)) + '">' + render(v.opts[i], { inChoice: true }) + "</button>";
    }
    return html + "</div>";
  };

  R.row = function (v, o) {
    var html = '<div class="mdv mdv-row">';
    for (var i = 0; i < v.items.length; i++) html += '<div class="mdv-row__item">' + render(v.items[i], o) + "</div>";
    return html + "</div>";
  };

  R.stack = function (v, o) {
    var html = '<div class="mdv mdv-stack">';
    for (var i = 0; i < v.items.length; i++) html += render(v.items[i], o);
    return html + "</div>";
  };

  R.match = function (v) {
    var a = v.a, b = v.b, cell = 100, s = 74;
    var spread = v.spread; // 0: top spread out, 1: bottom spread out
    var maxN = Math.max(a, b);
    var topStep = spread === 0 ? cell * 1.7 : cell, botStep = spread === 1 ? cell * 1.7 : cell;
    var w = Math.max(a * topStep, b * botStep, maxN * cell);
    var body = "";
    function rowAt(n, y, step, idx) {
      var g = "<g " + (v.tap ? 'class="mdv-tap mdv-rowpick" data-choice="' + idx + '" tabindex="-1"' : "") + ">";
      if (v.tap) g += '<rect class="mdv-rowpick__bg" x="0" y="' + (y - 50) + '" width="' + w + '" height="100" rx="10" fill="transparent"/>';
      for (var i = 0; i < n; i++) g += icon(v.icon, i * step + (cell - s) / 2, y - s / 2, s);
      return g + "</g>";
    }
    if (v.lines) {
      var pairs = Math.min(a, b);
      for (var i = 0; i < pairs; i++) {
        var x1 = i * topStep + cell / 2, x2 = i * botStep + cell / 2;
        body += '<line x1="' + x1 + '" y1="92" x2="' + x2 + '" y2="148" stroke="var(--v-line)" stroke-width="4" stroke-dasharray="8 6"/>';
      }
    }
    body += rowAt(a, 50, topStep, 0) + rowAt(b, 190, botStep, 1);
    return '<div class="mdv mdv-match' + (v.tap ? " mdv-pickable" : "") + '" data-ans="' + (v.ans !== undefined ? v.ans : "") + '">' + svg(w, 240, body, "", "", w / cell) + "</div>";
  };

  function polygon(n, r, rot) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2 - Math.PI / 2 + (rot || 0);
      pts.push((50 + Math.cos(a) * r).toFixed(1) + "," + (50 + Math.sin(a) * r).toFixed(1));
    }
    return pts.join(" ");
  }

  function shapeBody(s, c, o) {
    var fill = col(c), st = 'stroke="var(--v-ink)" stroke-width="3" stroke-linejoin="round"';
    switch (s) {
      case "circle": return '<circle cx="50" cy="50" r="40" fill="' + fill + '" ' + st + "/>";
      case "oval": return '<ellipse cx="50" cy="50" rx="46" ry="26" fill="' + fill + '" ' + st + "/>";
      case "square": return '<rect x="14" y="14" width="72" height="72" fill="' + fill + '" ' + st + "/>";
      case "rectangle": return o.thin ? '<rect x="4" y="38" width="92" height="24" fill="' + fill + '" ' + st + "/>" : '<rect x="4" y="24" width="92" height="52" fill="' + fill + '" ' + st + "/>";
      case "triangle": return o.tall ? '<polygon points="50,4 70,92 30,92" fill="' + fill + '" ' + st + "/>" : '<polygon points="50,10 92,86 8,86" fill="' + fill + '" ' + st + "/>";
      case "triangle-open": return '<polyline points="56,18 92,86 8,86 42,22" fill="none" stroke="' + fill + '" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>';
      case "square-open": return '<polyline points="40,14 14,14 14,86 86,86 86,14 60,14" fill="none" stroke="' + fill + '" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>';
      case "hexagon": return '<polygon points="' + polygon(6, 44, Math.PI / 6) + '" fill="' + fill + '" ' + st + "/>";
      case "pentagon": return '<polygon points="' + polygon(5, 44) + '" fill="' + fill + '" ' + st + "/>";
      case "rhombus": return '<polygon points="50,6 84,50 50,94 16,50" fill="' + fill + '" ' + st + "/>";
      case "trapezoid": return '<polygon points="28,24 72,24 94,78 6,78" fill="' + fill + '" ' + st + "/>";
      case "semicircle": return '<path d="M8 66 A42 42 0 0 1 92 66 Z" fill="' + fill + '" ' + st + "/>";
      case "star": return '<polygon points="50,6 62,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 38,38" fill="' + fill + '" ' + st + "/>";
      case "heart": return ICON.heart();
      default: return '<circle cx="50" cy="50" r="40" fill="' + fill + '"/>';
    }
  }

  R.shape = function (v) {
    var sc = v.scale || 1;
    var body = '<g transform="translate(50 50) rotate(' + (v.rot || 0) + ") scale(" + sc + ') translate(-50 -50)">' + shapeBody(v.s, v.c || "blue", v) + "</g>";
    return '<div class="mdv mdv-shape mdv--' + (v.size || "lg") + '">' + svg(100, 100, body, "", 'overflow="visible"') + "</div>";
  };

  R.solid = function (v) {
    var c = col(v.c || "blue"), body = "", ink = 'stroke="var(--v-ink)" stroke-width="2.5"';
    switch (v.s) {
      case "sphere":
        body = '<defs><radialGradient id="gs" cx="35%" cy="35%"><stop offset="0" stop-color="#fff" stop-opacity="0.8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' +
          '<circle cx="50" cy="50" r="40" fill="' + c + '" ' + ink + '/><circle cx="50" cy="50" r="40" fill="url(#gs)"/>' +
          '<ellipse cx="50" cy="50" rx="40" ry="12" fill="none" stroke="var(--v-ink)" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.5"/>';
        break;
      case "cube":
        body = '<path d="M20 34 L56 34 L56 84 L20 84 Z" fill="' + c + '" ' + ink + '/>' +
          '<path d="M20 34 L40 16 L76 16 L56 34 Z" fill="' + c + '" opacity="0.7" ' + ink + '/>' +
          '<path d="M56 34 L76 16 L76 66 L56 84 Z" fill="' + c + '" opacity="0.85" ' + ink + "/>";
        break;
      case "box":
        body = '<path d="M8 40 L64 40 L64 84 L8 84 Z" fill="' + c + '" ' + ink + '/>' +
          '<path d="M8 40 L30 22 L90 22 L64 40 Z" fill="' + c + '" opacity="0.7" ' + ink + '/>' +
          '<path d="M64 40 L90 22 L90 66 L64 84 Z" fill="' + c + '" opacity="0.85" ' + ink + "/>";
        break;
      case "cylinder":
        body = '<path d="M22 24 L22 76 A28 10 0 0 0 78 76 L78 24" fill="' + c + '" ' + ink + '/>' +
          '<ellipse cx="50" cy="24" rx="28" ry="10" fill="' + c + '" opacity="0.7" ' + ink + "/>";
        break;
      case "cone":
        body = '<path d="M50 8 L80 78 A30 10 0 0 1 20 78 Z" fill="' + c + '" ' + ink + '/>' +
          '<path d="M20 78 A30 10 0 0 1 80 78" fill="none" stroke="var(--v-ink)" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.6"/>';
        break;
      default:
        body = "";
    }
    return '<div class="mdv mdv-shape mdv--' + (v.size || "lg") + '">' + svg(100, 100, body) + "</div>";
  };

  R.scene = function (v) {
    var rel = v.rel, ref = v.ref || "table", body = "", obj = v.obj || "ball";
    var floor = 170;
    body += '<line x1="0" y1="' + floor + '" x2="300" y2="' + floor + '" stroke="var(--v-line)" stroke-width="3"/>';
    var tableTop = 90, tx = 90, tw = 120;
    function table() {
      return '<rect x="' + tx + '" y="' + tableTop + '" width="' + tw + '" height="12" fill="var(--v-brown)"/>' +
        '<rect x="' + (tx + 8) + '" y="' + (tableTop + 12) + '" width="10" height="' + (floor - tableTop - 12) + '" fill="var(--v-brown)"/>' +
        '<rect x="' + (tx + tw - 18) + '" y="' + (tableTop + 12) + '" width="10" height="' + (floor - tableTop - 12) + '" fill="var(--v-brown)"/>';
    }
    // An open-top box: front face 95..205 x 100..170, right side, and the opening.
    function boxOpening() {
      return '<path d="M95 100 L115 82 L225 82 L205 100 Z" fill="var(--v-ink)" opacity="0.55" stroke="var(--v-ink)" stroke-width="3"/>';
    }
    function boxFront() {
      return '<path d="M95 100 L205 100 L205 170 L95 170 Z" fill="var(--v-box)" stroke="var(--v-ink)" stroke-width="3"/>' +
        '<path d="M205 100 L225 82 L225 152 L205 170 Z" fill="var(--v-box)" opacity="0.8" stroke="var(--v-ink)" stroke-width="3"/>';
    }
    var s = 56, ox, oy;
    if (ref === "table") {
      body += table();
      if (rel === "on") { ox = 150 - s / 2; oy = tableTop - s; }
      else if (rel === "under") { ox = 150 - s / 2; oy = floor - s; }
      else if (rel === "next") { ox = tx + tw + 14; oy = floor - s; }
      else if (rel === "above") { ox = 150 - s / 2; oy = 6; }
      else { ox = 20; oy = floor - s; }
      body += icon(obj, ox, oy, s);
    } else {
      if (rel === "behind") {
        // Partly hidden by the box, peeking out at the top and right side.
        body += icon(obj, 176, 52, s + 8) + boxOpening() + boxFront();
      } else if (rel === "in") {
        body += boxOpening() + icon(obj, 128, 62, s) + boxFront();
      } else if (rel === "front") {
        body += boxOpening() + boxFront() + icon(obj, 120, floor - s + 14, s + 8);
      } else {
        body += boxOpening() + boxFront() + icon(obj, 236, floor - s, s);
      }
    }
    return '<div class="mdv mdv-scene mdv--' + (v.size || "lg") + '">' + svg(300, 190, body) + "</div>";
  };

  R.lineup = function (v) {
    var cell = 100, s = 80, body = "";
    body += '<path d="M18 30 L18 96" stroke="var(--v-ink)" stroke-width="4"/><path d="M18 30 L52 40 L18 52 Z" fill="var(--v-red)"/>';
    for (var i = 0; i < v.icons.length; i++) {
      var x = 70 + i * cell;
      var tap = v.tap ? 'class="mdv-tap mdv-linepick" data-choice="' + i + '" tabindex="-1"' : "";
      body += "<g " + tap + ">" + (v.tap ? '<rect class="mdv-rowpick__bg" x="' + (x - 6) + '" y="6" width="' + (cell - 4) + '" height="96" rx="10" fill="transparent"/>' : "") +
        '<g transform="translate(' + (x + s) + ' 0) scale(-1 1)">' + icon(v.icons[i], 0, 18, s) + "</g></g>";
    }
    return '<div class="mdv mdv-lineup' + (v.tap ? " mdv-pickable" : "") + '" data-ans="' + (v.ans !== undefined ? v.ans : "") + '">' + svg(80 + v.icons.length * cell, 110, body, "", "", (80 + v.icons.length * cell) / cell) + "</div>";
  };

  R.size = function (v) {
    var kind = v.kind, items = v.items, body = "", w, h, i;
    var tapWrap = function (idx, inner, x, y, bw, bh) {
      if (!v.tap) return inner;
      return '<g class="mdv-tap mdv-sizepick" data-choice="' + idx + '" tabindex="-1"><rect class="mdv-rowpick__bg" x="' + x + '" y="' + y + '" width="' + bw + '" height="' + bh + '" rx="10" fill="transparent"/>' + inner + "</g>";
    };
    if (kind === "big") {
      w = items.length * 180; h = 180;
      for (i = 0; i < items.length; i++) {
        var s = 160 * items[i];
        body += tapWrap(i, icon(v.icon || "ball", i * 180 + (180 - s) / 2, h - s - 6, s), i * 180, 0, 180, h);
      }
    } else if (kind === "long") {
      w = 320; h = items.length * 70;
      for (i = 0; i < items.length; i++) {
        var L = 300 * items[i], y = i * 70 + 20, inner;
        if (v.icon === "stick") {
          inner = '<rect x="10" y="' + y + '" width="' + L + '" height="24" rx="12" fill="var(--v-brown)" stroke="var(--v-ink)" stroke-width="2"/>' +
            '<rect x="' + (10 + L * 0.3) + '" y="' + (y + 6) + '" width="' + (L * 0.5) + '" height="4" rx="2" fill="#fff" opacity="0.35"/>';
        } else if (v.icon === "snake") {
          var d = "M10 " + (y + 13);
          for (var x = 10; x < L; x += 30) d += " q 15 -14 30 0 t 0 0";
          inner = '<path d="' + d + '" stroke="var(--v-green)" stroke-width="14" fill="none" stroke-linecap="round"/><circle cx="' + (L + 4) + '" cy="' + (y + 13) + '" r="10" fill="var(--v-green)"/><circle cx="' + (L + 7) + '" cy="' + (y + 10) + '" r="2.5" fill="#222"/>';
        } else {
          inner = '<rect x="10" y="' + y + '" width="' + L + '" height="24" rx="4" fill="' + col(["red", "blue", "purple"][i % 3]) + '"/>';
        }
        body += tapWrap(i, inner, 0, y - 12, 320, 50);
      }
      body = '<line x1="10" y1="0" x2="10" y2="' + h + '" stroke="var(--v-line)" stroke-width="2" stroke-dasharray="4 4"/>' + body;
    } else if (kind === "tall") {
      w = items.length * 120; h = 230;
      for (i = 0; i < items.length; i++) {
        var H = 210 * items[i], inner2 = "";
        var x0 = i * 120 + 25;
        if (v.icon === "tree") {
          inner2 = '<rect x="' + (x0 + 28) + '" y="' + (h - H * 0.3) + '" width="14" height="' + (H * 0.3) + '" fill="var(--v-brown)"/>' +
            '<path d="M' + (x0 + 35) + " " + (h - H) + " L" + (x0 + 70) + " " + (h - H * 0.28) + " L" + x0 + " " + (h - H * 0.28) + ' Z" fill="var(--v-green)"/>';
        } else {
          var blocks = Math.max(1, Math.round(H / 30));
          for (var b = 0; b < blocks; b++) inner2 += '<rect x="' + x0 + '" y="' + (h - (b + 1) * 30) + '" width="70" height="28" fill="' + col(["red", "blue", "yellow", "green"][b % 4]) + '" stroke="var(--v-ink)" stroke-width="2"/>';
        }
        body += tapWrap(i, inner2, i * 120, 0, 120, h);
      }
      body += '<line x1="0" y1="' + h + '" x2="' + w + '" y2="' + h + '" stroke="var(--v-ink)" stroke-width="3"/>';
      h += 4;
    } else if (kind === "heavy") {
      w = 320; h = 200;
      var heavyLeft = items[0] >= items[1];
      var tilt = heavyLeft ? 12 : -12;
      var names = v.names || ["block", "leaf"];
      body += '<path d="M160 100 L140 190 L180 190 Z" fill="var(--v-gray)"/>';
      body += '<g transform="rotate(' + (-tilt) + ' 160 100)"><rect x="30" y="96" width="260" height="8" fill="var(--v-ink)"/>' +
        '<path d="M30 104 L60 104 L45 116 Z M260 104 L290 104 L275 116 Z" fill="var(--v-ink)"/></g>';
      var ly = 100 + Math.sin(tilt * Math.PI / 180) * 115, ry = 100 - Math.sin(tilt * Math.PI / 180) * 115;
      body += tapWrap(0, icon(names[0], 20, ly - 92, 80), 10, ly - 100, 110, 100);
      body += tapWrap(1, icon(names[1], 220, ry - 92, 80), 210, ry - 100, 110, 100);
    } else {
      w = 100; h = 100;
    }
    return '<div class="mdv mdv-size' + (v.tap ? " mdv-pickable" : "") + " mdv--" + (v.size || "lg") + '" data-ans="' + (v.ans !== undefined ? v.ans : "") + '">' + svg(w, h, body) + "</div>";
  };

  R.pattern = function (v) {
    var cell = 100, n = v.items.length + (v.blanks || 0), body = "";
    for (var i = 0; i < v.items.length; i++) {
      var it = v.items[i];
      if (it.icon) body += icon(it.icon, i * cell + 10, 10, 80);
      else body += '<g transform="translate(' + (i * cell + 10) + ' 10) scale(0.8)">' + shapeBody(it.s, it.c, it) + "</g>";
    }
    for (var j = 0; j < (v.blanks || 0); j++) {
      var x = (v.items.length + j) * cell;
      body += '<rect x="' + (x + 8) + '" y="8" width="84" height="84" rx="10" fill="none" stroke="var(--v-ink)" stroke-width="4" stroke-dasharray="10 8"/>' +
        '<text x="' + (x + 50) + '" y="66" text-anchor="middle" font-size="48" font-weight="700" fill="var(--v-ink)" font-family="var(--font-child)">?</text>';
    }
    return '<div class="mdv mdv-pattern mdv--' + (v.size || "md") + '">' + svg(n * cell, 100, body, "", "", n) + "</div>";
  };

  R.story = function (v) {
    var start = v.start || 0, add = v.add || 0, take = v.take || 0;
    var total = start + add, cell = 100, s = 80, body = "";
    var perRow = Math.min(5, Math.max(total, 1));
    for (var i = 0; i < total; i++) {
      var cx = (i % perRow) * cell + cell / 2 + (i >= start && add ? 30 : 0);
      var cy = Math.floor(i / perRow) * cell + cell / 2;
      var arriving = i >= start && add;
      body += '<g class="' + (arriving ? "mdv-arrive" : "") + '">' + icon(v.icon, cx - s / 2, cy - s / 2, s) + "</g>";
      if (take && i >= total - take) {
        body += '<path d="M' + (cx - 36) + " " + (cy - 36) + " L" + (cx + 36) + " " + (cy + 36) + " M" + (cx + 36) + " " + (cy - 36) + " L" + (cx - 36) + " " + (cy + 36) + '" stroke="var(--v-ink)" stroke-width="7" stroke-linecap="round"/>';
      }
    }
    if (add) {
      var ax = (start % perRow) * cell + 6, ay = Math.floor(start / perRow) * cell + cell / 2;
      body += '<path d="M' + (ax + 10) + " " + (ay + 40) + " L" + (ax + 26) + " " + (ay + 40) + '" stroke="var(--v-accent)" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M' + (ax + 22) + " " + (ay + 32) + " L" + (ax + 30) + " " + (ay + 40) + " L" + (ax + 22) + " " + (ay + 48) + '" stroke="var(--v-accent)" stroke-width="5" fill="none" stroke-linecap="round"/>';
    }
    var w = perRow * cell + (add ? 40 : 0), h = Math.ceil(total / perRow) * cell;
    return '<div class="mdv mdv-story mdv--lg">' + svg(Math.max(w, 100), Math.max(h, 100), body, "", "", Math.max(w, 100) / cell) + "</div>";
  };

  R.family = function (v) {
    function box(val, miss, x, y, big) {
      var t = miss ? "?" : String(val);
      return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="' + (big ? 64 : 56) + '" font-weight="700" fill="' + (miss ? "var(--v-accent)" : "var(--v-ink)") + '" font-family="var(--font-child)">' + t + "</text>";
    }
    var body = '<line x1="20" y1="96" x2="330" y2="96" stroke="var(--v-ink)" stroke-width="5"/>' +
      '<path d="M330 80 L356 96 L330 112 Z" fill="var(--v-ink)"/>' +
      box(v.a, v.miss === "a", 90, 80) + box(v.b, v.miss === "b", 220, 80) + box(v.c, v.miss === "c", 410, 116, true);
    return '<div class="mdv mdv-family">' + svg(470, 140, body) + "</div>";
  };

  R.pv = function (v) {
    var tens = v.tens || 0, ones = v.ones || 0, body = "", x = 10;
    var stickW = 22, gap = 12, cellH = 20;
    for (var t = 0; t < tens; t++) {
      for (var k = 0; k < 10; k++) {
        body += '<rect x="' + x + '" y="' + (10 + k * cellH) + '" width="' + stickW + '" height="' + (cellH - 2) + '" fill="var(--v-ten)" stroke="var(--v-ink)" stroke-width="1.5"/>';
      }
      x += stickW + gap;
    }
    var onesX = x + (tens ? 26 : 0);
    var oneRows = Math.ceil(ones / 2);
    for (var o2 = 0; o2 < ones; o2++) {
      var ox = onesX + (o2 % 2) * 26, oy = 10 + 200 - (Math.floor(o2 / 2) + 1) * 26;
      body += '<rect x="' + ox + '" y="' + oy + '" width="20" height="20" fill="var(--v-one)" stroke="var(--v-ink)" stroke-width="1.5"/>';
    }
    var w = Math.max(onesX + (ones ? 56 : 0), 60), h = 220;
    if (v.chart) {
      var split = onesX - 13;
      body = '<rect x="2" y="2" width="' + (w - 4) + '" height="' + (h + 40) + '" fill="none" stroke="var(--v-line)" stroke-width="2"/>' +
        '<line x1="' + split + '" y1="2" x2="' + split + '" y2="' + (h + 42) + '" stroke="var(--v-line)" stroke-width="2"/>' +
        '<text x="' + (split / 2) + '" y="' + (h + 32) + '" text-anchor="middle" font-size="20" fill="var(--v-ink)">tens</text>' +
        '<text x="' + (split + (w - split) / 2) + '" y="' + (h + 32) + '" text-anchor="middle" font-size="20" fill="var(--v-ink)">ones</text>' + body;
      h += 44;
    }
    return '<div class="mdv mdv-pv">' + svg(w, h, body, "", "", w / 34) + "</div>";
  };

  R.nl = function (v) {
    var from = v.from, to = v.to, by = v.by || 1, denom = v.denom || 1;
    var n = Math.round((to - from) / by * denom), step = n > 40 ? 20 : n > 20 ? 30 : n > 10 ? 40 : 60, body = "";
    var w = n * step + 60, y = 50, every = v.labelsEvery || 1, places = (String(by).split(".")[1] || "").length;
    function label(val) {
      if (denom > 1) { var whole = Math.floor(val + 1e-9), rest = Math.round((val - whole) * denom); return rest ? (whole ? whole + " " : "") + rest + "/" + denom : String(whole); }
      return places ? val.toFixed(places) : String(val);
    }
    body += '<line x1="20" y1="' + y + '" x2="' + (w - 20) + '" y2="' + y + '" stroke="var(--v-ink)" stroke-width="3"/>';
    for (var i = 0; i <= n; i++) {
      var x = 30 + i * step, val = from + i * by / denom;
      var whole = denom === 1 || Math.abs(val - Math.round(val)) < 1e-9;
      var hl = v.hl !== undefined && v.hl !== null && Math.abs(v.hl - val) < 1e-9;
      var show = denom > 1 ? (whole || v.labelFractions) : i % every === 0;
      body += '<line x1="' + x + '" y1="' + (y - (whole ? 10 : 6)) + '" x2="' + x + '" y2="' + (y + (whole ? 10 : 6)) + '" stroke="var(--v-ink)" stroke-width="3"/>';
      if (show) body += '<text x="' + x + '" y="' + (y + 40) + '" text-anchor="middle" font-size="' + (n > 20 ? 16 : 22) + '" font-weight="' + (hl ? 800 : 600) + '" fill="' + (hl ? "var(--v-accent)" : "var(--v-ink)") + '" font-family="var(--font-child)">' + esc(label(val)) + "</text>";
      if (hl) body += '<circle cx="' + x + '" cy="' + y + '" r="10" fill="var(--v-accent)"/>';
    }
    var unit = by / denom;
    if (v.hops) {
      var a = v.hops[0], b = v.hops[1], dir = b > a ? 1 : -1;
      for (var hv = a; dir > 0 ? hv < b - 1e-9 : hv > b + 1e-9; hv += dir * unit) {
        var x1 = 30 + (hv - from) / unit * step, x2 = 30 + (hv + dir * unit - from) / unit * step;
        body += '<path d="M' + x1.toFixed(1) + " " + (y - 12) + " Q " + ((x1 + x2) / 2).toFixed(1) + " " + (y - 46) + " " + x2.toFixed(1) + " " + (y - 12) + '" stroke="var(--v-accent)" stroke-width="3" fill="none"/>';
      }
    }
    (v.points || []).forEach(function (p) {
      var px = 30 + (p.v - from) / unit * step;
      body += '<circle cx="' + px.toFixed(1) + '" cy="' + y + '" r="9" fill="var(--v-dot)"/>' + (p.label ? '<text x="' + px.toFixed(1) + '" y="' + (y - 18) + '" text-anchor="middle" font-size="20" font-weight="700" fill="var(--v-ink)" font-family="var(--font-child)">' + esc(p.label) + "</text>" : "");
    });
    return '<div class="mdv mdv-nl">' + svg(w, 100, body) + "</div>";
  };

  R.clock = function (v) {
    if (v.digital) {
      var mm = v.m < 10 ? "0" + v.m : String(v.m);
      return '<div class="mdv mdv-digital"><span>' + v.h + ":" + mm + "</span></div>";
    }
    var body = '<circle cx="100" cy="100" r="92" fill="var(--v-paper)" stroke="var(--v-ink)" stroke-width="6"/>';
    for (var i = 1; i <= 12; i++) {
      var a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      body += '<text x="' + (100 + Math.cos(a) * 72).toFixed(1) + '" y="' + (100 + Math.sin(a) * 72 + 9).toFixed(1) + '" text-anchor="middle" font-size="26" font-weight="700" fill="var(--v-ink)" font-family="var(--font-child)">' + i + "</text>";
    }
    for (var m = 0; m < 60; m++) {
      var am = (m / 60) * Math.PI * 2;
      var r1 = m % 5 === 0 ? 84 : 88;
      body += '<line x1="' + (100 + Math.sin(am) * r1).toFixed(1) + '" y1="' + (100 - Math.cos(am) * r1).toFixed(1) + '" x2="' + (100 + Math.sin(am) * 92).toFixed(1) + '" y2="' + (100 - Math.cos(am) * 92).toFixed(1) + '" stroke="var(--v-ink)" stroke-width="' + (m % 5 === 0 ? 3 : 1) + '"/>';
    }
    if (v.noHands) return '<div class="mdv mdv-clock mdv--' + (v.size || "lg") + '">' + svg(200, 200, body + '<circle cx="100" cy="100" r="5" fill="var(--v-ink)"/>') + "</div>";
    var hourA = ((v.h % 12) + v.m / 60) / 12 * Math.PI * 2;
    var minA = (v.m / 60) * Math.PI * 2;
    body += '<line x1="100" y1="100" x2="' + (100 + Math.sin(hourA) * 46).toFixed(1) + '" y2="' + (100 - Math.cos(hourA) * 46).toFixed(1) + '" stroke="var(--v-hour)" stroke-width="10" stroke-linecap="round"/>';
    body += '<line x1="100" y1="100" x2="' + (100 + Math.sin(minA) * 70).toFixed(1) + '" y2="' + (100 - Math.cos(minA) * 70).toFixed(1) + '" stroke="var(--v-minute)" stroke-width="6" stroke-linecap="round"/>';
    body += '<circle cx="100" cy="100" r="7" fill="var(--v-ink)"/>';
    return '<div class="mdv mdv-clock mdv--' + (v.size || "lg") + '">' + svg(200, 200, body) + "</div>";
  };

  R.tally = function (v) {
    var n = v.n, groups = Math.floor(n / 5), left = n % 5, body = "", x = 10;
    for (var g = 0; g < groups; g++) {
      for (var i = 0; i < 4; i++) body += '<line x1="' + (x + i * 14) + '" y1="10" x2="' + (x + i * 14) + '" y2="70" stroke="var(--v-ink)" stroke-width="5" stroke-linecap="round"/>';
      body += '<line x1="' + (x - 6) + '" y1="60" x2="' + (x + 48) + '" y2="20" stroke="var(--v-ink)" stroke-width="5" stroke-linecap="round"/>';
      x += 76;
    }
    for (var j = 0; j < left; j++) body += '<line x1="' + (x + j * 14) + '" y1="10" x2="' + (x + j * 14) + '" y2="70" stroke="var(--v-ink)" stroke-width="5" stroke-linecap="round"/>';
    var w = x + left * 14 + 10;
    return '<div class="mdv mdv-tally">' + svg(Math.max(w, 40), 80, body) + "</div>";
  };

  R.graph = function (v) {
    var rows = v.cats, cell = 64, body = "", maxN = 0;
    for (var i = 0; i < rows.length; i++) maxN = Math.max(maxN, rows[i].n);
    var w = 90 + (v.kind === "tally" ? Math.max(maxN * 16 + 60, 120) : maxN * cell + 10), h = rows.length * cell + 10;
    for (var r2 = 0; r2 < rows.length; r2++) {
      var y = r2 * cell + 5;
      body += '<rect x="2" y="' + y + '" width="' + (w - 4) + '" height="' + cell + '" fill="none" stroke="var(--v-line)" stroke-width="2"/>';
      body += '<line x1="80" y1="' + y + '" x2="80" y2="' + (y + cell) + '" stroke="var(--v-line)" stroke-width="2"/>';
      body += icon(rows[r2].icon, 14, y + 6, 52);
      if (v.kind === "tally") {
        var n = rows[r2].n, x = 96, g;
        for (g = 0; g < Math.floor(n / 5); g++) {
          for (var k = 0; k < 4; k++) body += '<line x1="' + (x + k * 10) + '" y1="' + (y + 12) + '" x2="' + (x + k * 10) + '" y2="' + (y + cell - 12) + '" stroke="var(--v-ink)" stroke-width="4" stroke-linecap="round"/>';
          body += '<line x1="' + (x - 5) + '" y1="' + (y + cell - 18) + '" x2="' + (x + 36) + '" y2="' + (y + 18) + '" stroke="var(--v-ink)" stroke-width="4" stroke-linecap="round"/>';
          x += 54;
        }
        for (k = 0; k < n % 5; k++) body += '<line x1="' + (x + k * 10) + '" y1="' + (y + 12) + '" x2="' + (x + k * 10) + '" y2="' + (y + cell - 12) + '" stroke="var(--v-ink)" stroke-width="4" stroke-linecap="round"/>';
      } else {
        for (var c = 0; c < rows[r2].n; c++) body += icon(rows[r2].icon, 88 + c * cell, y + 8, 48);
      }
    }
    return '<div class="mdv mdv-graph">' + svg(w, h + 2, body, "", "", w / 64) + "</div>";
  };

  R.parts = function (v) {
    var s = v.s || "circle", cut = v.cut || "halves", shade = v.shade || 0, body = "", fill = col(v.c || "blue");
    var ink = 'stroke="var(--v-ink)" stroke-width="3"';
    var regions = [];
    if (s === "circle") {
      if (cut === "halves") regions = ["M100 100 L100 10 A90 90 0 0 1 100 190 Z", "M100 100 L100 190 A90 90 0 0 1 100 10 Z"];
      else if (cut === "fourths") regions = ["M100 100 L100 10 A90 90 0 0 1 190 100 Z", "M100 100 L190 100 A90 90 0 0 1 100 190 Z", "M100 100 L100 190 A90 90 0 0 1 10 100 Z", "M100 100 L10 100 A90 90 0 0 1 100 10 Z"];
      else if (cut === "unequal2") regions = ["M140 18.6 A90 90 0 0 1 140 181.4 Z", "M140 181.4 A90 90 0 1 1 140 18.6 Z"];
      else regions = ["M100 100 L100 10 A90 90 0 0 1 177.9 145 Z", "M100 100 L177.9 145 A90 90 0 0 1 100 190 Z", "M100 100 L100 190 A90 90 0 0 1 10 100 Z", "M100 100 L10 100 A90 90 0 0 1 100 10 Z"];
    } else {
      var W = s === "square" ? 180 : 240, H = 180, x0 = 10, y0 = 10;
      if (cut === "halves") regions = [[x0, y0, W / 2, H], [x0 + W / 2, y0, W / 2, H]];
      else if (cut === "halves-h") regions = [[x0, y0, W, H / 2], [x0, y0 + H / 2, W, H / 2]];
      else if (cut === "fourths") regions = [[x0, y0, W / 2, H / 2], [x0 + W / 2, y0, W / 2, H / 2], [x0, y0 + H / 2, W / 2, H / 2], [x0 + W / 2, y0 + H / 2, W / 2, H / 2]];
      else if (cut === "fourths-strips") regions = [[x0, y0, W / 4, H], [x0 + W / 4, y0, W / 4, H], [x0 + W / 2, y0, W / 4, H], [x0 + 3 * W / 4, y0, W / 4, H]];
      else if (cut === "unequal2") regions = [[x0, y0, W * 0.3, H], [x0 + W * 0.3, y0, W * 0.7, H]];
      else regions = [[x0, y0, W * 0.2, H], [x0 + W * 0.2, y0, W * 0.2, H], [x0 + W * 0.4, y0, W * 0.25, H], [x0 + W * 0.65, y0, W * 0.35, H]];
      regions = regions.map(function (r3) { return "M" + r3[0] + " " + r3[1] + " h" + r3[2] + " v" + r3[3] + " h" + (-r3[2]) + " Z"; });
    }
    for (var i = 0; i < regions.length; i++) body += '<path d="' + regions[i] + '" fill="' + (i < shade ? fill : "var(--v-paper)") + '" ' + ink + "/>";
    var w = s === "circle" ? 200 : s === "square" ? 200 : 260;
    return '<div class="mdv mdv-parts mdv--' + (v.size || "lg") + '">' + svg(w, 200, body) + "</div>";
  };

  var COIN = {
    penny: { r: 38, fill: "#c27a4a", ring: "#9a5a32", text: "ONE CENT" },
    nickel: { r: 42, fill: "#c9c9c9", ring: "#9a9a9a", text: "FIVE CENTS" },
    dime: { r: 34, fill: "#d9d9d9", ring: "#a5a5a5", text: "ONE DIME" },
    quarter: { r: 48, fill: "#cfcfcf", ring: "#9c9c9c", text: "QUARTER DOLLAR" },
  };
  var coinId = 0;
  R.coins = function (v) {
    var body = "", x = 0, list = v.list || [];
    for (var i = 0; i < list.length; i++) {
      var c = COIN[list[i]] || COIN.penny, id = "cp" + (coinId++);
      var cx = x + c.r + 6, cy = 56;
      body += '<circle cx="' + cx + '" cy="' + cy + '" r="' + c.r + '" fill="' + c.fill + '" stroke="' + c.ring + '" stroke-width="4"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + (c.r - 9) + '" fill="none" stroke="' + c.ring + '" stroke-width="1.5"/>' +
        '<path id="' + id + '" d="M' + (cx - c.r + 14) + " " + cy + " A" + (c.r - 14) + " " + (c.r - 14) + " 0 0 1 " + (cx + c.r - 14) + " " + cy + '" fill="none"/>' +
        '<text font-size="' + (c.r > 40 ? 9 : 8) + '" font-weight="700" fill="' + c.ring + '" letter-spacing="1"><textPath href="#' + id + '" startOffset="50%" text-anchor="middle">' + c.text + "</textPath></text>" +
        '<path d="M' + (cx - 6) + " " + (cy - c.r * 0.35) + " c " + (c.r * 0.35) + " -2 " + (c.r * 0.4) + " " + (c.r * 0.3) + " " + (c.r * 0.25) + " " + (c.r * 0.55) + " l -2 " + (c.r * 0.25) + " l " + (-c.r * 0.45) + " 0 c 0 -10 -6 -14 -6 -22 c 0 -12 6 -18 " + (c.r * 0.12) + ' -20 z" fill="' + c.ring + '" opacity="0.55"/>';
      x += c.r * 2 + 16;
    }
    return '<div class="mdv mdv-coins mdv--' + (v.size || "lg") + '">' + svg(Math.max(x, 60), 112, body) + "</div>";
  };

  R.measure = function (v) {
    var unit = 40, len = v.len, body = "";
    // A stick as long as the units beneath it.
    body += '<rect x="10" y="20" width="' + (len * unit) + '" height="26" rx="13" fill="var(--v-brown)" stroke="var(--v-ink)" stroke-width="2"/>' +
      '<rect x="' + (10 + len * unit * 0.25) + '" y="26" width="' + (len * unit * 0.5) + '" height="4" rx="2" fill="#fff" opacity="0.35"/>';
    if (v.units !== false) {
      for (var i = 0; i < len; i++) {
        body += '<rect x="' + (10 + i * unit) + '" y="62" width="' + (unit - 2) + '" height="18" rx="9" fill="none" stroke="var(--v-blue)" stroke-width="4"/>';
      }
    }
    return '<div class="mdv mdv-measure">' + svg(len * unit + 30, 90, body) + "</div>";
  };

  R.blank = function () { return '<div class="mdv"></div>'; };

  // ── Reading: letters, the arrow, and the dot ──
  // A word is a list of tokens (see curriculum/lib/v.js). The alphabet's
  // marks depend on the fade stage: full shows joined pairs, macrons, and
  // small silent letters; light keeps the joined pairs; plain shows none.
  // The dot (src/assets/js/dot.js) rests under each token that has a
  // data-stop, or under each word of a line.
  function tokenText(word) { var out = ""; for (var i = 0; i < word.length; i++) out += word[i].s; return out; }
  R.text = function (v) {
    var prompts = v.prompts || "full", kind = v.kind || "word", dot = v.dot || "none";
    var html = '<div class="mdv mdv-text mdv-text--' + esc(kind) + '" data-dot="' + esc(dot) + '" data-prompts="' + esc(prompts) + '">';
    var lines = v.lines || [];
    for (var li = 0; li < lines.length; li++) {
      html += '<div class="mdv-text__line">';
      for (var wi = 0; wi < lines[li].length; wi++) {
        var word = lines[li][wi];
        html += '<span class="mdv-text__word" data-say="' + esc(tokenText(word)) + '">';
        for (var ti = 0; ti < word.length; ti++) {
          var t = word[ti], cls = "mdv-tok";
          if (prompts !== "plain" && t.joined) cls += " mdv-tok--joined";
          if (prompts === "full" && t.macron) cls += " mdv-tok--macron";
          if (prompts === "full" && t.silent) cls += " mdv-tok--silent";
          if (t.punct) cls += " mdv-tok--punct";
          var stop = t.silent || t.punct ? "" : ' data-stop="' + (t.stop ? "tap" : "hold") + '"';
          html += '<span class="' + cls + '"' + stop + (t.say ? ' data-say="' + esc(t.say) + '"' : "") + ">" + esc(t.s) + "</span>";
        }
        html += "</span>";
      }
      html += "</div>";
    }
    if (dot === "sound" || dot === "word" || dot === "fast") html += '<span class="mdv-text__track" aria-hidden="true"><span class="mdv-text__ball"></span><span class="mdv-text__rail"></span><span class="mdv-text__head"></span></span>';
    if (dot !== "none") html += '<span class="mdv-text__dot" aria-hidden="true" hidden></span>';
    return html + "</div>";
  };

  // ── Grades 2 to 5 ──

  // Column work: any number of rows, up to six digits, carries above,
  // traded digits struck through with the new digit above, and the answer
  // shown, blank, or left out.
  R.colx = function (v) {
    var rows = (v.rows || []).map(String), ans = v.ans !== undefined ? String(v.ans) : "";
    var width = Math.max.apply(null, rows.map(function (r) { return r.length; }).concat([ans.length, 1]));
    var trades = v.trades || [], carries = v.carries || [];
    function cells(str, cls, rowIdx) {
      var out = "", padded = str;
      while (padded.length < width) padded = " " + padded;
      for (var i = 0; i < padded.length; i++) {
        var fromRight = width - 1 - i;
        var struck = trades.some(function (t) { return t.row === rowIdx && t.col === fromRight; });
        out += '<span class="mdv-col__d ' + (cls || "") + (struck ? " is-struck" : "") + '">' + (padded[i] === " " ? "" : esc(padded[i])) + "</span>";
      }
      return out;
    }
    var above = [];
    for (var c = 0; c < width; c++) above[c] = carries[c] !== undefined && carries[c] !== "" ? String(carries[c]) : "";
    trades.forEach(function (t) { if (t.to !== undefined) above[t.col] = String(t.to); });
    var html = '<div class="mdv mdv-col mdv-colx" style="--w:' + width + '">';
    if (above.some(Boolean)) {
      html += '<div class="mdv-col__row mdv-col__carry"><span class="mdv-col__op"></span>';
      for (var k = width - 1; k >= 0; k--) html += '<span class="mdv-col__d is-carry">' + esc(above[k]) + "</span>";
      html += "</div>";
    }
    for (var r = 0; r < rows.length; r++) {
      var last = r === rows.length - 1;
      html += '<div class="mdv-col__row' + (last ? " mdv-col__line" : "") + '"><span class="mdv-col__op">' + (last ? esc(v.op === "-" ? "−" : v.op) : "") + "</span>" + cells(rows[r], "", r) + "</div>";
    }
    html += '<div class="mdv-col__row"><span class="mdv-col__op"></span>' + (v.show ? cells(ans) : v.blank ? cells(ans.replace(/./g, "?"), "is-blank") : cells("")) + "</div>";
    return html + "</div>";
  };

  // Multiplication with the partial products revealed in turn.
  R.mult = function (v) {
    var a = String(v.a), b = String(v.b), partials = v.partials || [], show = Math.min(v.show || 0, partials.length);
    var total = v.ans !== undefined ? String(v.ans) : String(v.a * v.b);
    var width = Math.max.apply(null, [a.length, b.length, total.length].concat(partials.map(function (p) { return String(p.value).length; })));
    function cells(str, cls) { var out = "", p = str; while (p.length < width) p = " " + p; for (var i = 0; i < p.length; i++) out += '<span class="mdv-col__d ' + (cls || "") + '">' + (p[i] === " " ? "" : esc(p[i])) + "</span>"; return out; }
    var html = '<div class="mdv mdv-col mdv-mult" style="--w:' + width + '">';
    html += '<div class="mdv-col__row"><span class="mdv-col__op"></span>' + cells(a) + "</div>";
    html += '<div class="mdv-col__row mdv-col__line"><span class="mdv-col__op">×</span>' + cells(b) + "</div>";
    for (var i = 0; i < show; i++) {
      var p = partials[i], lastP = i === partials.length - 1;
      html += '<div class="mdv-col__row' + (lastP ? " mdv-col__line" : "") + '"><span class="mdv-col__op">' + (i > 0 ? "+" : "") + "</span>" + cells(String(p.value)) + (p.label ? '<span class="mdv-col__note">' + esc(p.label) + "</span>" : "") + "</div>";
    }
    if (partials.length && show >= partials.length) html += '<div class="mdv-col__row"><span class="mdv-col__op"></span>' + (v.total === false ? cells("") : cells(total)) + "</div>";
    return html + "</div>";
  };

  // The long division bracket, with its steps revealed in turn.
  R.ldiv = function (v) {
    var a = String(v.a), b = String(v.b), steps = v.steps || [], show = Math.min(v.show || 0, steps.length);
    var cw = 44, rh = 50, left = (b.length + 1) * cw, w = left + a.length * cw + 20;
    var h = (2 + show * 2) * rh + 10;
    function t(x, y, s, color) { return '<text x="' + x + '" y="' + y + '" text-anchor="end" font-size="36" font-weight="700" fill="' + (color || "var(--v-ink)") + '" font-family="var(--font-child)">' + esc(s) + "</text>"; }
    var body = "", i;
    for (i = 0; i < show; i++) body += t(left + (steps[i].at + 1) * cw - 6, rh - 10, String(steps[i].q), "var(--v-accent)");
    body += '<path d="M' + (left - 10) + " " + (rh + 4) + " q 6 20 0 " + (rh - 8) + " M" + (left - 4) + " " + (rh + 4) + " H " + (w - 10) + '" stroke="var(--v-ink)" stroke-width="3" fill="none"/>';
    body += t(left - 16, 2 * rh - 12, b);
    for (i = 0; i < a.length; i++) body += t(left + (i + 1) * cw - 6, 2 * rh - 12, a[i]);
    var y = 3 * rh;
    for (i = 0; i < show; i++) {
      var s = steps[i], prod = String(s.prod), endX = left + (s.at + 1) * cw - 6;
      body += t(endX - prod.length * cw - 4, y - 12, "−", "var(--v-accent)") + t(endX, y - 12, prod);
      body += '<line x1="' + (endX - prod.length * cw - 20) + '" y1="' + (y - 2) + '" x2="' + (endX + 6) + '" y2="' + (y - 2) + '" stroke="var(--v-ink)" stroke-width="3"/>';
      y += rh;
      var rem = String(s.rem), remEnd = left + Math.min(a.length, s.at + 1 + (rem.length > prod.length ? 1 : 0)) * cw - 6;
      body += t(remEnd, y - 12, rem);
      y += rh;
    }
    return '<div class="mdv mdv-ldiv">' + svg(w, h, body) + "</div>";
  };

  // Base-ten blocks: thousands cubes, hundreds flats, tens rods, and ones.
  R.blocks = function (v) {
    var S = 100, gap = 14, x = 10, H = 10, body = "", groups = [], i;
    var th = v.th || 0, hd = v.h || 0, tens = v.tens || 0, ones = v.ones || 0;
    function cube(x0, y0) { var d = S * 0.4; return '<path d="M' + x0 + " " + (y0 + d) + " h" + S + " v" + S + " h-" + S + ' z" fill="var(--v-ten)" stroke="var(--v-ink)" stroke-width="1.5"/><path d="M' + x0 + " " + (y0 + d) + " l" + d + " -" + d + " h" + S + " l-" + d + " " + d + ' z" fill="var(--v-one)" stroke="var(--v-ink)" stroke-width="1.5"/><path d="M' + (x0 + S) + " " + (y0 + d) + " l" + d + " -" + d + " v" + S + " l-" + d + " " + d + ' z" fill="var(--v-box)" stroke="var(--v-ink)" stroke-width="1.5"/>'; }
    function flat(x0, y0) { var out = '<rect x="' + x0 + '" y="' + y0 + '" width="' + S + '" height="' + S + '" fill="var(--v-ten)" stroke="var(--v-ink)" stroke-width="2"/>'; for (var k = 1; k < 10; k++) out += '<line x1="' + (x0 + k * S / 10) + '" y1="' + y0 + '" x2="' + (x0 + k * S / 10) + '" y2="' + (y0 + S) + '" stroke="var(--v-ink)" stroke-width="0.6"/><line x1="' + x0 + '" y1="' + (y0 + k * S / 10) + '" x2="' + (x0 + S) + '" y2="' + (y0 + k * S / 10) + '" stroke="var(--v-ink)" stroke-width="0.6"/>'; return out; }
    function rod(x0, y0) { var out = ""; for (var k = 0; k < 10; k++) out += '<rect x="' + x0 + '" y="' + (y0 + k * S / 10) + '" width="' + (S / 10) + '" height="' + (S / 10) + '" fill="var(--v-ten)" stroke="var(--v-ink)" stroke-width="1"/>'; return out; }
    if (th) { var gx = x; for (i = 0; i < th; i++) { body += cube(gx, 50); gx += S * 1.4 + gap; } groups.push({ x: x, w: gx - x - gap, n: th, name: "thousands" }); x = gx + gap; H = Math.max(H, 50 + S + 10); }
    if (hd) { var cols = Math.min(3, hd), rowsN = Math.ceil(hd / cols); for (i = 0; i < hd; i++) body += flat(x + (i % cols) * (S + gap), 10 + Math.floor(i / cols) * (S + gap)); groups.push({ x: x, w: cols * (S + gap) - gap, n: hd, name: "hundreds" }); x += cols * (S + gap) + gap; H = Math.max(H, 10 + rowsN * (S + gap)); }
    if (tens) { for (i = 0; i < tens; i++) body += rod(x + i * (S / 10 + 6), 10); groups.push({ x: x, w: tens * (S / 10 + 6) - 6, n: tens, name: "tens" }); x += tens * (S / 10 + 6) + gap; H = Math.max(H, 10 + S + 10); }
    if (ones) { for (i = 0; i < ones; i++) body += '<rect x="' + (x + Math.floor(i / 5) * 16) + '" y="' + (10 + S - (i % 5 + 1) * (S / 10) - (i % 5) * 2) + '" width="' + (S / 10) + '" height="' + (S / 10) + '" fill="var(--v-one)" stroke="var(--v-ink)" stroke-width="1"/>'; groups.push({ x: x, w: Math.ceil(ones / 5) * 16, n: ones, name: "ones" }); x += Math.ceil(ones / 5) * 16 + gap; H = Math.max(H, 10 + S + 10); }
    if (v.labels) { H += 30; groups.forEach(function (g) { body += '<text x="' + (g.x + g.w / 2) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="20" fill="var(--v-ink)" font-family="var(--font-ui)">' + g.n + " " + g.name + "</text>"; }); }
    return '<div class="mdv mdv-blocks">' + svg(Math.max(x, 60), H, body) + "</div>";
  };

  // Fraction notation, with a whole number for a mixed number.
  R.frac = function (v) {
    var size = v.size || "lg";
    var chars = String(v.n).length + String(v.d).length + (v.whole ? String(v.whole).length + 1 : 0);
    function part(x) { return x === "?" ? '<span class="mdv-blank">?</span>' : esc(x); }
    return '<div class="mdv mdv-frac mdv-frac--' + size + '" style="--chars:' + chars + '">' + (v.whole ? '<span class="mdv-frac__whole">' + esc(v.whole) + "</span>" : "") +
      '<span class="mdv-frac__stack"><span class="mdv-frac__n">' + part(v.n) + '</span><span class="mdv-frac__d">' + part(v.d) + "</span></span></div>";
  };

  // Fraction bars, one or several to compare.
  R.bar = function (v) {
    var bars = v.bars || [{ d: v.d, shade: v.shade, label: v.label }];
    var W = 360, H = 56, body = "", labelW = bars.some(function (b) { return b.label; }) ? 70 : 0;
    bars.forEach(function (b, i) {
      var y = i * (H + 16), pw = W / b.d;
      for (var k = 0; k < b.d; k++) body += '<rect x="' + (labelW + k * pw) + '" y="' + y + '" width="' + pw + '" height="' + H + '" fill="' + (k < (b.shade || 0) ? col(b.c || "blue") : "var(--v-paper)") + '" stroke="var(--v-ink)" stroke-width="3"/>';
      if (b.label) body += '<text x="' + (labelW - 12) + '" y="' + (y + H / 2 + 10) + '" text-anchor="end" font-size="28" font-weight="700" fill="var(--v-ink)" font-family="var(--font-child)">' + esc(b.label) + "</text>";
    });
    return '<div class="mdv mdv-bar">' + svg(W + labelW + 4, bars.length * (H + 16) - 12, body) + "</div>";
  };

  // An array or area model.
  R.grid = function (v) {
    var rows = v.rows, cols = v.cols, cell = 40, pad = v.labels ? 44 : 4, body = "", fill = v.fill || 0, sp = v.split;
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var idx = r * cols + c, x = pad + c * cell, y = pad + r * cell;
      if (v.dots) body += '<circle cx="' + (x + cell / 2) + '" cy="' + (y + cell / 2) + '" r="' + (cell * 0.3) + '" fill="' + (!fill || idx < fill ? "var(--v-dot)" : "var(--v-line)") + '"/>';
      else body += '<rect x="' + x + '" y="' + y + '" width="' + cell + '" height="' + cell + '" fill="' + (idx < fill ? "var(--v-blue)" : "var(--v-paper)") + '" stroke="var(--v-ink)" stroke-width="1.5"/>';
    }
    if (sp) {
      var sx = pad + sp[1] * cell, sy = pad + sp[0] * cell;
      body += '<line x1="' + sx + '" y1="' + pad + '" x2="' + sx + '" y2="' + (pad + rows * cell) + '" stroke="var(--v-accent)" stroke-width="5"/><line x1="' + pad + '" y1="' + sy + '" x2="' + (pad + cols * cell) + '" y2="' + sy + '" stroke="var(--v-accent)" stroke-width="5"/>';
      if (v.partLabels) {
        var cx = [pad + sp[1] * cell / 2, sx + (cols - sp[1]) * cell / 2], cy = [pad + sp[0] * cell / 2, sy + (rows - sp[0]) * cell / 2];
        [[0, 0], [0, 1], [1, 0], [1, 1]].forEach(function (q, i) { if (v.partLabels[i]) body += '<text x="' + cx[q[1]] + '" y="' + (cy[q[0]] + 10) + '" text-anchor="middle" font-size="26" font-weight="700" fill="var(--v-ink)" font-family="var(--font-child)">' + esc(v.partLabels[i]) + "</text>"; });
      }
    }
    if (v.labels) body += '<text x="' + (pad + cols * cell / 2) + '" y="30" text-anchor="middle" font-size="26" font-weight="700" fill="var(--v-ink)" font-family="var(--font-child)">' + esc(v.colLabel !== undefined ? v.colLabel : cols) + '</text><text x="22" y="' + (pad + rows * cell / 2 + 10) + '" text-anchor="middle" font-size="26" font-weight="700" fill="var(--v-ink)" font-family="var(--font-child)">' + esc(v.rowLabel !== undefined ? v.rowLabel : rows) + "</text>";
    return '<div class="mdv mdv-grid">' + svg(pad + cols * cell + 4, pad + rows * cell + 4, body) + "</div>";
  };

  // A tape model.
  R.tape = function (v) {
    var parts = v.parts || [], W = 400, H = 60, top = v.total !== undefined ? 50 : 10, body = "", x = 10;
    var total = parts.reduce(function (a, p) { return a + (p.len || 1); }, 0);
    parts.forEach(function (p, i) {
      var pw = (p.len || 1) / total * (W - 20), unknown = v.unknown === i;
      body += '<rect x="' + x + '" y="' + top + '" width="' + pw + '" height="' + H + '" fill="' + (unknown ? "var(--v-soft)" : col(p.c || ["blue", "yellow", "green", "red"][i % 4])) + '" stroke="var(--v-ink)" stroke-width="3"/>';
      body += '<text x="' + (x + pw / 2) + '" y="' + (top + H / 2 + 10) + '" text-anchor="middle" font-size="28" font-weight="700" fill="' + (unknown ? "var(--v-accent)" : "var(--v-ink)") + '" font-family="var(--font-child)">' + esc(unknown ? "?" : p.label !== undefined ? p.label : "") + "</text>";
      x += pw;
    });
    if (v.total !== undefined) body += '<path d="M10 ' + (top - 14) + " v-8 h" + (W - 20) + ' v8" stroke="var(--v-ink)" stroke-width="3" fill="none"/><text x="' + (W / 2) + '" y="' + (top - 26) + '" text-anchor="middle" font-size="26" font-weight="700" fill="' + (v.total === "?" ? "var(--v-accent)" : "var(--v-ink)") + '" font-family="var(--font-child)">' + esc(v.total) + "</text>";
    return '<div class="mdv mdv-tape">' + svg(W, top + H + 6, body) + "</div>";
  };

  // A table.
  R.table = function (v) {
    var html = '<div class="mdv mdv-table"><table>';
    if (v.head && v.head.length) { html += "<thead><tr>"; v.head.forEach(function (h) { html += "<th>" + esc(h) + "</th>"; }); html += "</tr></thead>"; }
    html += "<tbody>";
    (v.rows || []).forEach(function (r) { html += "<tr>"; r.forEach(function (c) { html += "<td>" + (c === "?" ? '<span class="mdv-blank">?</span>' : esc(c)) + "</td>"; }); html += "</tr>"; });
    return html + "</tbody></table></div>";
  };

  // A labeled figure.
  R.geo = function (v) {
    var s = v.s || "rect", W = 340, H = 260, pts;
    var w = v.w || (s === "square" ? 1 : 1.5), h = v.h || 1;
    var scale = Math.min(200 / w, 150 / h), bw = w * scale, bh = h * scale, ox = (W - bw) / 2, oy = (H - bh) / 2;
    switch (s) {
      case "square": case "rect": pts = [[ox, oy], [ox + bw, oy], [ox + bw, oy + bh], [ox, oy + bh]]; break;
      case "tri": pts = [[ox + bw / 2, oy], [ox + bw, oy + bh], [ox, oy + bh]]; break;
      case "right-tri": pts = [[ox, oy], [ox, oy + bh], [ox + bw, oy + bh]]; break;
      case "para": pts = [[ox + bw * 0.25, oy], [ox + bw, oy], [ox + bw * 0.75, oy + bh], [ox, oy + bh]]; break;
      case "trap": pts = [[ox + bw * 0.25, oy], [ox + bw * 0.75, oy], [ox + bw, oy + bh], [ox, oy + bh]]; break;
      case "quad": pts = [[ox + bw * 0.15, oy], [ox + bw * 0.9, oy + bh * 0.1], [ox + bw, oy + bh], [ox, oy + bh * 0.75]]; break;
      default: pts = (v.pts || [[50, 0], [100, 40], [80, 100], [20, 100], [0, 40]]).map(function (p) { return [ox + p[0] / 100 * bw, oy + p[1] / 100 * bh]; });
    }
    function unit(a, b) { var dx = a[0] - b[0], dy = a[1] - b[1], L = Math.hypot(dx, dy) || 1; return [dx / L, dy / L]; }
    var body = '<polygon points="' + pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") + '" fill="var(--v-soft)" stroke="var(--v-ink)" stroke-width="3" stroke-linejoin="round"/>';
    var cx = pts.reduce(function (a, p) { return a + p[0]; }, 0) / pts.length, cy = pts.reduce(function (a, p) { return a + p[1]; }, 0) / pts.length;
    (v.right || []).forEach(function (i) { var p = pts[i], u = unit(pts[(i + pts.length - 1) % pts.length], p), q = unit(pts[(i + 1) % pts.length], p), k = 14; body += '<path d="M' + (p[0] + u[0] * k) + " " + (p[1] + u[1] * k) + " L" + (p[0] + (u[0] + q[0]) * k) + " " + (p[1] + (u[1] + q[1]) * k) + " L" + (p[0] + q[0] * k) + " " + (p[1] + q[1] * k) + '" fill="none" stroke="var(--v-ink)" stroke-width="2"/>'; });
    function label(x, y, text, color, size) { return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" text-anchor="middle" font-size="' + (size || 22) + '" font-weight="700" fill="' + (color || "var(--v-ink)") + '" font-family="var(--font-child)">' + esc(text) + "</text>"; }
    (v.sides || []).forEach(function (lab, i) { if (!lab) return; var a = pts[i], b = pts[(i + 1) % pts.length], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, nx = mx - cx, ny = my - cy, L = Math.hypot(nx, ny) || 1; body += label(mx + nx / L * 24, my + ny / L * 24 + 8, lab); });
    (v.angles || []).forEach(function (lab, i) { if (!lab) return; var p = pts[i], nx = cx - p[0], ny = cy - p[1], L = Math.hypot(nx, ny) || 1; body += label(p[0] + nx / L * 32, p[1] + ny / L * 32 + 7, lab, "var(--v-accent)", 20); });
    (v.names || []).forEach(function (lab, i) { if (!lab) return; var p = pts[i], nx = p[0] - cx, ny = p[1] - cy, L = Math.hypot(nx, ny) || 1; body += label(p[0] + nx / L * 20, p[1] + ny / L * 20 + 7, lab); });
    return '<div class="mdv mdv-geo">' + svg(W, H, body) + "</div>";
  };

  // An angle, with a protractor laid on it if asked.
  R.angle = function (v) {
    var deg = v.deg, W = 340, H = 200, vx = 40, vy = 170, L = 250, rad = deg * Math.PI / 180, body = "";
    if (v.protractor || deg > 90) { vx = 170; L = 150; }
    if (v.protractor) {
      var R0 = 150;
      body += '<path d="M' + (vx - R0) + " " + vy + " A" + R0 + " " + R0 + " 0 0 1 " + (vx + R0) + " " + vy + ' Z" fill="var(--v-soft)" stroke="var(--v-line)" stroke-width="2"/>';
      for (var d = 0; d <= 180; d += 10) {
        var a = d * Math.PI / 180, inner = d % 30 === 0 ? R0 - 22 : R0 - 12;
        body += '<line x1="' + (vx + inner * Math.cos(a)).toFixed(1) + '" y1="' + (vy - inner * Math.sin(a)).toFixed(1) + '" x2="' + (vx + R0 * Math.cos(a)).toFixed(1) + '" y2="' + (vy - R0 * Math.sin(a)).toFixed(1) + '" stroke="var(--v-ink)" stroke-width="1.5"/>';
        if (d % 30 === 0) body += '<text x="' + (vx + (R0 - 38) * Math.cos(a)).toFixed(1) + '" y="' + (vy - (R0 - 38) * Math.sin(a) + 5).toFixed(1) + '" text-anchor="middle" font-size="13" fill="var(--v-ink)" font-family="var(--font-ui)">' + d + "</text>";
      }
    }
    var ex = vx + L * Math.cos(rad), ey = vy - L * Math.sin(rad), arcR = 40;
    if (deg === 90) body += '<path d="M' + (vx + 18) + " " + vy + ' v-18 h-18" fill="none" stroke="var(--v-accent)" stroke-width="3"/>';
    else body += '<path d="M' + (vx + arcR) + " " + vy + " A" + arcR + " " + arcR + " 0 " + (deg > 180 ? 1 : 0) + " 0 " + (vx + arcR * Math.cos(rad)).toFixed(1) + " " + (vy - arcR * Math.sin(rad)).toFixed(1) + '" fill="none" stroke="var(--v-accent)" stroke-width="3"/>';
    body += '<line x1="' + vx + '" y1="' + vy + '" x2="' + (vx + L) + '" y2="' + vy + '" stroke="var(--v-ink)" stroke-width="4" stroke-linecap="round"/><line x1="' + vx + '" y1="' + vy + '" x2="' + ex.toFixed(1) + '" y2="' + ey.toFixed(1) + '" stroke="var(--v-ink)" stroke-width="4" stroke-linecap="round"/><circle cx="' + vx + '" cy="' + vy + '" r="5" fill="var(--v-ink)"/>';
    if (v.label) body += '<text x="' + (vx + 70 * Math.cos(rad / 2)).toFixed(1) + '" y="' + (vy - 70 * Math.sin(rad / 2) + 8).toFixed(1) + '" text-anchor="middle" font-size="24" font-weight="700" fill="var(--v-accent)" font-family="var(--font-child)">' + esc(v.label === true ? deg + "°" : v.label) + "</text>";
    return '<div class="mdv mdv-angle">' + svg(W, H, body) + "</div>";
  };

  // A coordinate grid with points and lines.
  R.coord = function (v) {
    var w = v.w || 10, h = v.h || 10, cell = w > 12 || h > 12 ? 24 : 36, pad = 34, body = "", every = w > 12 || h > 12 ? 2 : 1;
    for (var i = 0; i <= w; i++) body += '<line x1="' + (pad + i * cell) + '" y1="' + pad + '" x2="' + (pad + i * cell) + '" y2="' + (pad + h * cell) + '" stroke="' + (i ? "var(--v-line)" : "var(--v-ink)") + '" stroke-width="' + (i ? 1 : 3) + '"/>' + (i % every === 0 ? '<text x="' + (pad + i * cell) + '" y="' + (pad + h * cell + 24) + '" text-anchor="middle" font-size="16" fill="var(--v-ink)" font-family="var(--font-ui)">' + i + "</text>" : "");
    for (var j = 0; j <= h; j++) body += '<line x1="' + pad + '" y1="' + (pad + h * cell - j * cell) + '" x2="' + (pad + w * cell) + '" y2="' + (pad + h * cell - j * cell) + '" stroke="' + (j ? "var(--v-line)" : "var(--v-ink)") + '" stroke-width="' + (j ? 1 : 3) + '"/>' + (j % every === 0 ? '<text x="' + (pad - 10) + '" y="' + (pad + h * cell - j * cell + 6) + '" text-anchor="end" font-size="16" fill="var(--v-ink)" font-family="var(--font-ui)">' + j + "</text>" : "");
    var P = (v.points || []).map(function (p) { return [pad + p.x * cell, pad + h * cell - p.y * cell, p]; });
    (v.lines || []).forEach(function (l) { var a = P[l[0]], b = P[l[1]]; if (a && b) body += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="var(--v-accent)" stroke-width="3"/>'; });
    P.forEach(function (p, i) { body += (v.tap ? '<g class="mdv-tap" data-choice="' + i + '" tabindex="-1"><circle cx="' + p[0] + '" cy="' + p[1] + '" r="18" fill="transparent"/>' : "<g>") + '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="7" fill="var(--v-dot)"/>' + (p[2].label ? '<text x="' + (p[0] + 10) + '" y="' + (p[1] - 10) + '" font-size="20" font-weight="700" fill="var(--v-ink)" font-family="var(--font-child)">' + esc(p[2].label) + "</text>" : "") + "</g>"; });
    return '<div class="mdv mdv-coord' + (v.tap ? " mdv-pickable" : "") + '" data-ans="' + (v.ans !== undefined ? v.ans : "") + '">' + svg(pad + w * cell + 12, pad + h * cell + 30, body) + "</div>";
  };

  // A ruler, with a bar laid along it to measure.
  R.ruler = function (v) {
    var len = v.len, unit = v.unit || "cm", u = unit === "in" ? 60 : 30, pad = 20, W = pad * 2 + len * u, H = v.obj !== undefined ? 130 : 80, y0 = H - 60, body = "";
    body += '<rect x="' + pad + '" y="' + y0 + '" width="' + (len * u) + '" height="50" fill="var(--v-ten)" stroke="var(--v-ink)" stroke-width="2"/>';
    for (var i = 0; i <= len; i++) {
      var x = pad + i * u;
      body += '<line x1="' + x + '" y1="' + y0 + '" x2="' + x + '" y2="' + (y0 + 22) + '" stroke="var(--v-ink)" stroke-width="2"/><text x="' + x + '" y="' + (y0 + 44) + '" text-anchor="middle" font-size="16" font-weight="700" fill="var(--v-ink)" font-family="var(--font-ui)">' + i + "</text>";
      if (i < len) { var subs = unit === "in" ? 4 : 2; for (var k = 1; k < subs; k++) body += '<line x1="' + (x + k * u / subs) + '" y1="' + y0 + '" x2="' + (x + k * u / subs) + '" y2="' + (y0 + (subs === 4 && k === 2 ? 14 : 8)) + '" stroke="var(--v-ink)" stroke-width="1.5"/>'; }
    }
    body += '<text x="' + (W - pad - 4) + '" y="' + (y0 + 44) + '" text-anchor="end" font-size="14" fill="var(--v-ink)" font-family="var(--font-ui)">' + unit + "</text>";
    if (v.obj !== undefined) body += '<rect x="' + (pad + (v.start || 0) * u) + '" y="' + (y0 - 46) + '" width="' + (v.obj * u) + '" height="30" rx="6" fill="' + col(v.c || "red") + '" stroke="var(--v-ink)" stroke-width="2"/>';
    return '<div class="mdv mdv-ruler">' + svg(W, H, body) + "</div>";
  };

  // A box of unit cubes.
  R.cubes = function (v) {
    var l = v.l, w = v.w, h = v.h, s = 36, dx = s * 0.5, dy = s * 0.28, ox = 30, oy = 10 + w * dy, body = "";
    function cubeAt(x, y, z) {
      var X = ox + x * s + z * dx, Y = oy + y * s - z * dy;
      return '<path d="M' + X + " " + Y + " h" + s + " v" + s + " h-" + s + ' z" fill="var(--v-ten)" stroke="var(--v-ink)" stroke-width="1.2"/><path d="M' + X + " " + Y + " l" + dx + " -" + dy + " h" + s + " l-" + dx + " " + dy + ' z" fill="var(--v-one)" stroke="var(--v-ink)" stroke-width="1.2"/><path d="M' + (X + s) + " " + Y + " l" + dx + " -" + dy + " v" + s + " l-" + dx + " " + dy + ' z" fill="var(--v-box)" stroke="var(--v-ink)" stroke-width="1.2"/>';
    }
    for (var z = w - 1; z >= 0; z--) for (var y = 0; y < h; y++) for (var x = 0; x < l; x++) body += cubeAt(x, y, z);
    if (v.labels) body += '<text x="' + (ox + l * s / 2) + '" y="' + (oy + h * s + 24) + '" text-anchor="middle" font-size="18" fill="var(--v-ink)" font-family="var(--font-ui)">' + l + '</text><text x="' + (ox - 8) + '" y="' + (oy + h * s / 2 + 6) + '" text-anchor="end" font-size="18" fill="var(--v-ink)" font-family="var(--font-ui)">' + h + '</text><text x="' + (ox + l * s + w * dx + 8) + '" y="' + (oy + h * s - w * dy / 2) + '" font-size="18" fill="var(--v-ink)" font-family="var(--font-ui)">' + w + "</text>";
    return '<div class="mdv mdv-cubes">' + svg(ox + l * s + w * dx + 40, oy + h * s + 30, body) + "</div>";
  };

  // Text in the interface face: a word problem, a science note, a hint.
  R.prose = function (v) {
    var html = '<div class="mdv mdv-prose">';
    (v.lines || []).forEach(function (l) { html += "<p>" + esc(l) + "</p>"; });
    return html + "</div>";
  };

  // A poem by stanzas, with words faded by a rule that the seed fixes.
  R.poem = function (v) {
    var fade = v.fade || 0, rand = rng((v.seed || 1) * 7919 + 17);
    var html = '<div class="mdv mdv-poem" data-fade="' + esc(String(fade)) + '">';
    (v.stanzas || []).forEach(function (st) {
      html += '<div class="mdv-poem__stanza">';
      st.forEach(function (line) {
        if (fade === "rules") { html += '<span class="mdv-poem__rule" style="--n:' + Math.max(8, line.length) + '"></span>'; return; }
        html += '<span class="mdv-poem__line">';
        line.split(/(\s+)/).forEach(function (piece) {
          if (!piece.trim()) { html += piece; return; }
          var m = /^([^A-Za-z'’]*)([A-Za-z'’]+)(.*)$/.exec(piece);
          if (!m) { html += esc(piece); return; }
          var hide = fade === "first" || (typeof fade === "number" && rand() < fade);
          if (!hide) html += esc(piece);
          else if (fade === "first") html += esc(m[1]) + '<span class="mdv-poem__gap" data-word="' + esc(m[2]) + '">' + esc(m[2].charAt(0)) + '<span class="mdv-poem__rest" style="--n:' + (m[2].length - 1) + '"></span></span>' + esc(m[3]);
          else html += esc(m[1]) + '<span class="mdv-poem__gap mdv-poem__gap--all" data-word="' + esc(m[2]) + '" style="--n:' + m[2].length + '"></span>' + esc(m[3]);
        });
        html += "</span>";
      });
      html += "</div>";
    });
    return html + "</div>";
  };

  // A hand-drawn diagram (src/assets/js/diagrams.js) with its labels.
  R.diagram = function (v) {
    var lib = window.MDDiagrams, d = lib && lib[v.kind];
    if (!d) return '<div class="mdv mdv-diagram">' + svg(300, 200, '<rect x="4" y="4" width="292" height="192" rx="12" fill="var(--v-soft)" stroke="var(--v-line)" stroke-width="2"/><text x="150" y="108" text-anchor="middle" font-size="22" fill="var(--v-ink)" font-family="var(--font-ui)">' + esc(v.kind) + "</text>") + "</div>";
    var body = d.draw(v), shownNames = v.labels;
    (d.labels || []).forEach(function (lab, i) {
      if (shownNames && shownNames.indexOf(lab.name) === -1) return;
      var text = v.hide && v.hide.indexOf(lab.name) !== -1 ? "?" : lab.name;
      var g = (lab.lx !== undefined ? '<line x1="' + lab.x + '" y1="' + (lab.y - 8) + '" x2="' + lab.lx + '" y2="' + lab.ly + '" stroke="var(--v-ink)" stroke-width="2"/>' : "") +
        '<rect x="' + (lab.x - 6) + '" y="' + (lab.y - 20) + '" width="' + (text.length * 11 + 12) + '" height="26" rx="6" fill="var(--v-paper)" stroke="var(--v-line)" stroke-width="1.5"/><text x="' + lab.x + '" y="' + (lab.y - 2) + '" font-size="18" font-weight="700" fill="var(--v-ink)" font-family="var(--font-ui)">' + esc(text) + "</text>";
      body += v.tap ? '<g class="mdv-tap" data-choice="' + i + '" tabindex="-1">' + g + "</g>" : "<g>" + g + "</g>";
    });
    return '<div class="mdv mdv-diagram' + (v.tap ? " mdv-pickable" : "") + '" data-ans="' + (v.ans !== undefined ? v.ans : "") + '">' + svg(d.w, d.h, body) + "</div>";
  };

  // Bar graphs and line plots join the picture and tally graphs.
  var graphBase = R.graph;
  R.graph = function (v, o) {
    if (v.kind === "bar") return barGraph(v);
    if (v.kind === "plot") return linePlot(v);
    return graphBase(v, o);
  };
  function barGraph(v) {
    var cats = v.cats || [], scale = v.scale || 1, top = Math.max.apply(null, cats.map(function (c) { return c.n; }).concat([scale])), steps = Math.ceil(top / scale);
    var bw = 56, gap = 24, left = 50, bottom = 40, H = 220, W = left + cats.length * (bw + gap) + 10, body = "";
    for (var s = 0; s <= steps; s++) { var y = 10 + (H - 10) * (1 - s / steps); body += '<line x1="' + left + '" y1="' + y.toFixed(1) + '" x2="' + (W - 10) + '" y2="' + y.toFixed(1) + '" stroke="var(--v-line)" stroke-width="1"/><text x="' + (left - 8) + '" y="' + (y + 6).toFixed(1) + '" text-anchor="end" font-size="16" fill="var(--v-ink)" font-family="var(--font-ui)">' + (s * scale) + "</text>"; }
    cats.forEach(function (c, i) { var x = left + i * (bw + gap) + gap / 2, bh = (H - 10) * (c.n / (steps * scale)); body += '<rect x="' + x + '" y="' + (H - bh).toFixed(1) + '" width="' + bw + '" height="' + bh.toFixed(1) + '" fill="' + col(c.c || ["blue", "red", "green", "yellow", "purple"][i % 5]) + '" stroke="var(--v-ink)" stroke-width="2"/>' + (c.icon ? icon(c.icon, x + bw / 2 - 16, H + 6, 32) : '<text x="' + (x + bw / 2) + '" y="' + (H + 26) + '" text-anchor="middle" font-size="16" fill="var(--v-ink)" font-family="var(--font-ui)">' + esc(c.label || "") + "</text>"); });
    body += '<line x1="' + left + '" y1="' + H + '" x2="' + (W - 10) + '" y2="' + H + '" stroke="var(--v-ink)" stroke-width="3"/><line x1="' + left + '" y1="10" x2="' + left + '" y2="' + H + '" stroke="var(--v-ink)" stroke-width="3"/>';
    if (v.title) body += '<text x="' + (W / 2) + '" y="' + (H + bottom + 10) + '" text-anchor="middle" font-size="18" font-weight="700" fill="var(--v-ink)" font-family="var(--font-ui)">' + esc(v.title) + "</text>";
    return '<div class="mdv mdv-graph mdv-graph--bar">' + svg(W, H + bottom + (v.title ? 18 : 0), body) + "</div>";
  }
  function linePlot(v) {
    var cats = v.cats || [], step = 50, left = 24, W = left * 2 + Math.max(cats.length - 1, 1) * step, maxN = Math.max.apply(null, cats.map(function (c) { return c.n; }).concat([1])), H = 60 + maxN * 24 + (v.title ? 20 : 0), body = "";
    body += '<line x1="' + left + '" y1="' + (H - 40) + '" x2="' + (W - left) + '" y2="' + (H - 40) + '" stroke="var(--v-ink)" stroke-width="3"/>';
    cats.forEach(function (c, i) { var x = left + i * step; body += '<line x1="' + x + '" y1="' + (H - 48) + '" x2="' + x + '" y2="' + (H - 32) + '" stroke="var(--v-ink)" stroke-width="2"/><text x="' + x + '" y="' + (H - 10) + '" text-anchor="middle" font-size="18" font-weight="700" fill="var(--v-ink)" font-family="var(--font-child)">' + esc(c.label !== undefined ? c.label : c.v) + "</text>"; for (var k = 0; k < c.n; k++) body += '<text x="' + x + '" y="' + (H - 54 - k * 24) + '" text-anchor="middle" font-size="24" font-weight="700" fill="var(--v-accent)" font-family="var(--font-child)">×</text>'; });
    if (v.title) body += '<text x="' + (W / 2) + '" y="18" text-anchor="middle" font-size="18" font-weight="700" fill="var(--v-ink)" font-family="var(--font-ui)">' + esc(v.title) + "</text>";
    return '<div class="mdv mdv-graph mdv-graph--plot">' + svg(W, H, body) + "</div>";
  }

  function render(spec, o) {
    if (!spec) return "";
    if (Array.isArray(spec)) {
      var html = "";
      for (var i = 0; i < spec.length; i++) html += render(spec[i], o);
      return html;
    }
    var fn = R[spec.t];
    if (!fn) return '<div class="mdv">[' + esc(spec.t) + "]</div>";
    return fn(spec, o || {});
  }

  // Wire up touchable parts. onChoose(index, correct, group) is called when
  // the child picks an answer; marks on countable pictures simply toggle.
  // Options: feedback (default false) adds is-right or is-wrong to the pick;
  // the child's screen never shows a verdict, so the runner leaves it off.
  // lockAfterPick (default true) lets a group take one pick until it is
  // rendered again.
  function bind(container, onChoose, opts) {
    opts = opts || {};
    var feedback = !!opts.feedback;
    var lock = opts.lockAfterPick !== false;
    var marks = container.querySelectorAll(".mdv-mark");
    for (var i = 0; i < marks.length; i++) {
      (function (el) {
        function toggle() { el.classList.toggle("is-marked"); }
        el.addEventListener("click", toggle);
        el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
      })(marks[i]);
    }
    var groups = container.querySelectorAll("[data-ans]");
    for (var g = 0; g < groups.length; g++) {
      (function (group) {
        var raw = group.getAttribute("data-ans");
        if (raw === "") return;
        var ans = raw.split(",").map(Number);
        var opts2 = group.querySelectorAll(":scope > .mdv-tap, :scope svg .mdv-tap, :scope > svg > .mdv-tap");
        if (!opts2.length) opts2 = group.querySelectorAll(".mdv-tap");
        for (var k = 0; k < opts2.length; k++) {
          (function (opt) {
            function pick() {
              if (group.classList.contains("is-done")) return;
              var idx = Number(opt.getAttribute("data-choice"));
              var right = ans.indexOf(idx) !== -1;
              for (var m = 0; m < opts2.length; m++) opts2[m].classList.remove("is-picked", "is-right", "is-wrong");
              opt.classList.add("is-picked");
              if (feedback) opt.classList.add(right ? "is-right" : "is-wrong");
              if (lock) group.classList.add("is-done");
              if (onChoose) onChoose(idx, right, group);
            }
            opt.addEventListener("click", pick);
            opt.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
          })(opts2[k]);
        }
      })(groups[g]);
    }
  }

  function clearMarks(container) {
    var m = container.querySelectorAll(".is-marked, .is-picked");
    for (var i = 0; i < m.length; i++) m[i].classList.remove("is-marked", "is-picked", "is-right", "is-wrong");
  }

  // ── Text alternatives ──
  // describe(screen) says what the stage shows, for the hidden text beside
  // it. describeChoice(screen, idx) names the part the child touched.
  var ICON_WORD = { ladybug: "ladybug", ball: "ball", duck: "duck", fish: "fish", apple: "apple", star: "star", bird: "bird", flower: "flower", stick: "stick", heart: "heart" };
  function plural(n, word) {
    var w = ICON_WORD[word] || word || "thing";
    if (n === 1) return "one " + w;
    return n + " " + (/(s|x|ch|sh)$/.test(w) ? w + "es" : w + "s");
  }
  function list(items) {
    if (items.length <= 1) return items.join("");
    return items.slice(0, -1).join(", ") + ", and " + items[items.length - 1];
  }
  function numWord(v) { return v === "?" || v === "_" ? "a blank" : String(v); }
  function opWord(p) { return { "+": "plus", "−": "minus", "-": "minus", "×": "times", "÷": "divided by", "=": "equals", "<": "is less than", ">": "is more than" }[p] || p; }
  function arrWord(arr) { return { row: "in a row", scatter: "scattered", dice: "in a dice pattern", col: "in a column", grid: "in rows", five: "in a five frame", circle: "in a circle" }[arr] || ""; }
  function clockWord(h, m) {
    if (m === 0) return h + " o'clock";
    if (m === 30) return "half past " + h;
    if (m === 15) return "a quarter past " + h;
    if (m === 45) return "a quarter to " + (h % 12 + 1);
    return h + ":" + (m < 10 ? "0" + m : m);
  }
  function describeOne(v) {
    if (!v) return "";
    switch (v.t) {
      case "say": return "a speech bubble";
      case "num": {
        var vals = Array.isArray(v.v) ? v.v : [v.v];
        return (vals.length > 1 ? "the numbers " : "the number ") + list(vals.map(numWord)) + (v.dots ? ", with dots under each" : "");
      }
      case "sign": return "a " + opWord(v.s) + " sign";
      case "seq": return "the numbers " + v.items.map(numWord).join(", ") + (v.hl !== undefined && v.hl !== null ? ", with " + numWord(v.items[v.hl]) + " marked" : "");
      case "dots": return plural(v.n, "dot") + (v.arr ? " " + arrWord(v.arr) : "");
      case "obj": return plural(v.n, v.icon) + (v.arr ? " " + arrWord(v.arr) : "") + (v.cross ? ", " + v.cross + " crossed out" : "") + (v.tap ? ", each can be touched" : "");
      case "frame": return (v.frames > 1 || v.n + (v.n2 || 0) > (v.size || 10) ? "ten frames" : "a " + (v.size === 5 ? "five" : "ten") + " frame") + " with " + plural(v.n, "dot") + (v.n2 ? " and " + plural(v.n2, "red dot") : "");
      case "eq": return v.parts.map(function (p) { return typeof p === "number" ? String(p) : p === "?" || p === "_" ? "blank" : opWord(p); }).join(" ");
      case "col": return v.a + " " + opWord(v.op) + " " + v.b + ", written in columns" + (v.show ? ", with the answer " + v.ans : "");
      case "choices": return v.opts.length + " choices: " + list(v.opts.map(describeOne));
      case "row": case "stack": return list(v.items.map(describeOne));
      case "match": return "a row of " + plural(v.a, v.icon) + " over a row of " + plural(v.b, v.icon) + (v.lines ? ", paired with lines" : "");
      case "shape": return "a " + (v.c ? v.c + " " : "") + v.s.replace("-open", " with an opening");
      case "solid": return "a " + (v.c ? v.c + " " : "") + v.s;
      case "scene": return "a " + (ICON_WORD[v.obj] || v.obj || "ball") + " " + ({ on: "on", under: "under", next: "next to", above: "above", behind: "behind", in: "in", front: "in front of", beside: "beside" }[v.rel] || v.rel) + " a " + (v.ref || "table");
      case "lineup": return v.icons.length + " in a line, facing the arrow: " + list(v.icons.map(function (i) { return "a " + (ICON_WORD[i] || i); }));
      case "size": {
        if (v.kind === "heavy") return "a balance with a " + (v.names ? v.names[0] : "block") + " and a " + (v.names ? v.names[1] : "leaf");
        var sizes = v.items.map(function (x, i) { return i === 0 ? "one" : x > v.items[i - 1] ? "a bigger one" : "a smaller one"; });
        return v.items.length + " " + (v.icon || "ball") + (v.items.length > 1 ? "s" : "") + " of different " + ({ big: "sizes", long: "lengths", tall: "heights" }[v.kind] || "sizes") + ": " + list(sizes);
      }
      case "pattern": return "a pattern: " + v.items.map(function (it) { return it.icon ? (ICON_WORD[it.icon] || it.icon) : (it.c ? it.c + " " : "") + it.s; }).join(", ") + (v.blanks ? ", then " + v.blanks + " blank" + (v.blanks > 1 ? "s" : "") : "");
      case "story": return plural(v.start || 0, v.icon) + (v.add ? ", then " + plural(v.add, v.icon) + " more arriving" : "") + (v.take ? ", with " + v.take + " crossed out" : "");
      case "family": return "a number family with " + (v.miss === "a" ? "a blank" : v.a) + " and " + (v.miss === "b" ? "a blank" : v.b) + " on the arrow and " + (v.miss === "c" ? "a blank" : v.c) + " at the end";
      case "pv": return (v.tens ? plural(v.tens, "ten") + (v.ones ? " and " : "") : "") + (v.ones || !v.tens ? plural(v.ones || 0, "one") : "") + " in blocks";
      case "nl": return "a number line from " + v.from + " to " + v.to + (v.hl !== undefined && v.hl !== null ? ", with " + v.hl + " marked" : "") + (v.hops ? ", with hops from " + v.hops[0] + " to " + v.hops[1] : "");
      case "clock": return v.digital ? "a digital clock showing " + v.h + ":" + (v.m < 10 ? "0" + v.m : v.m) : v.noHands ? "a clock face with no hands" : "a clock showing " + clockWord(v.h, v.m);
      case "tally": return "tally marks for " + v.n;
      case "graph": {
        if (v.kind === "bar") return "a bar graph: " + list(v.cats.map(function (c) { return (c.label || c.icon) + " " + c.n; }));
        if (v.kind === "plot") return "a line plot: " + list(v.cats.map(function (c) { return c.n + " at " + (c.label !== undefined ? c.label : c.v); }));
        return "a " + (v.kind === "tally" ? "tally chart" : "picture graph") + ": " + list(v.cats.map(function (c) { return plural(c.n, c.icon); }));
      }
      case "parts": return "a " + v.s + " cut into " + (v.cut || "halves").replace(/-.*/, "") + (v.shade ? ", " + v.shade + " part" + (v.shade > 1 ? "s" : "") + " shaded" : "");
      case "coins": return list((v.list || []).map(function (c) { return "a " + c; }));
      case "measure": return "a " + (v.icon || "stick") + " " + v.len + " units long";
      case "blank": return "";
      case "text": {
        var lines = (v.lines || []).map(function (line) { return line.map(tokenText).join(" "); });
        var arrow = v.dot === "sound" || v.dot === "word" || v.dot === "fast" ? ", with an arrow under it" : "";
        if (v.kind === "sound") return "the letters " + lines[0] + arrow;
        if (v.kind === "word") return "the word " + lines[0] + arrow;
        if (v.kind === "words") return "the words " + list(lines);
        return (lines.length > 1 ? "lines of text: " : "a line of text: ") + lines.join(" ");
      }
      case "colx": return (v.rows || []).join(" " + opWord(v.op) + " ") + ", written in columns" + (v.show ? ", with the answer " + v.ans : "");
      case "mult": return v.a + " times " + v.b + " in columns" + (v.show ? ", with " + v.show + " partial product" + (v.show > 1 ? "s" : "") + " shown" : "");
      case "ldiv": return v.a + " divided by " + v.b + " under the long division bracket" + (v.show ? ", " + v.show + " step" + (v.show > 1 ? "s" : "") + " shown" : "");
      case "blocks": return "base-ten blocks: " + list([v.th ? plural(v.th, "thousand") : "", v.h ? plural(v.h, "hundred") : "", v.tens ? plural(v.tens, "ten") : "", v.ones ? plural(v.ones, "one") : ""].filter(Boolean));
      case "frac": return (v.whole ? v.whole + " and " : "") + v.n + " over " + v.d;
      case "bar": return list((v.bars || [{ d: v.d, shade: v.shade }]).map(function (b) { return "a bar in " + b.d + " parts with " + (b.shade || 0) + " shaded"; }));
      case "grid": return "a grid of " + v.rows + " rows and " + v.cols + " columns" + (v.fill ? ", " + v.fill + " filled" : "") + (v.split ? ", cut in four" : "");
      case "tape": return "a tape model with " + list((v.parts || []).map(function (p, i) { return v.unknown === i ? "a part marked ?" : "a part labeled " + (p.label !== undefined ? p.label : p.len); })) + (v.total !== undefined ? ", " + v.total + " over the whole" : "");
      case "table": return "a table" + (v.head ? " with the columns " + list(v.head.map(String)) : "") + " and " + plural((v.rows || []).length, "row");
      case "geo": return "a " + ({ rect: "rectangle", square: "square", tri: "triangle", "right-tri": "right triangle", quad: "quadrilateral", para: "parallelogram", trap: "trapezoid" }[v.s] || "figure") + (v.sides ? " with sides " + list(v.sides.filter(Boolean)) : "") + (v.angles ? " and angles " + list(v.angles.filter(Boolean)) : "");
      case "angle": return "an angle" + (v.label ? " of " + (v.label === true ? v.deg + " degrees" : v.label) : "") + (v.protractor ? " under a protractor" : "");
      case "coord": return "a coordinate grid " + v.w + " by " + v.h + (v.points && v.points.length ? " with points at " + list(v.points.map(function (p) { return (p.label ? p.label + " " : "") + "(" + p.x + ", " + p.y + ")"; })) : "");
      case "ruler": return "a ruler of " + v.len + " " + (v.unit === "in" ? "inches" : "centimeters") + (v.obj !== undefined ? " with a bar " + v.obj + " long laid on it" : "");
      case "cubes": return "a box of unit cubes, " + v.l + " by " + v.w + " by " + v.h;
      case "prose": return "text: " + (v.lines || []).join(" ");
      case "poem": return "a poem of " + plural((v.stanzas || []).length, "stanza") + (v.fade === "rules" ? ", shown as blank lines" : v.fade === "first" ? ", with first letters only" : v.fade ? ", with some words hidden" : "");
      case "diagram": return "a diagram of " + ({ plant: "a plant", insect: "an insect", body: "the body", "earth-sun-moon": "the earth, sun, and moon", "water-cycle": "the water cycle", circuit: "a circuit", "food-chain": "a food chain" }[v.kind] || v.kind) + (v.labels && v.labels.length ? " with the labels " + list(v.labels) : "");
      default: return "";
    }
  }
  function describe(screen) {
    if (!screen) return "The screen is empty.";
    var parts = (Array.isArray(screen) ? screen : [screen]).map(describeOne).filter(Boolean);
    if (!parts.length) return "The screen is empty.";
    var s = parts.join("; ");
    return "The child's screen shows " + s + ".";
  }
  function ordinal(i) { return ["first", "second", "third", "fourth", "fifth", "sixth"][i] || (i + 1) + "th"; }
  function findGroup(screen) {
    var found = null;
    (function walk(v) {
      if (!v || found) return;
      if (Array.isArray(v)) return v.forEach(walk);
      if (v.tap && v.t !== "obj") { found = v; return; }
      if (v.t === "choices") { found = v; return; }
      if (v.items && v.t !== "pattern" && v.t !== "size") walk(v.items);
    })(screen);
    return found;
  }
  function describeChoice(screen, idx) {
    var g = findGroup(screen);
    if (!g) return "the " + ordinal(idx) + " one";
    switch (g.t) {
      case "choices": return g.opts[idx] ? describeOne(g.opts[idx]) : "the " + ordinal(idx) + " choice";
      case "match": return idx === 0 ? "the top row" : "the bottom row";
      case "lineup": return "the " + ordinal(idx) + " in line, the " + (ICON_WORD[g.icons[idx]] || g.icons[idx]);
      case "size": return g.kind === "heavy" && g.names ? "the " + g.names[idx] : "the " + ordinal(idx) + " one";
      case "coord": { var pt = (g.points || [])[idx]; return pt ? "the point " + (pt.label ? pt.label + ", " : "") + "(" + pt.x + ", " + pt.y + ")" : "the " + ordinal(idx) + " point"; }
      case "diagram": { var lib = window.MDDiagrams, dd = lib && lib[g.kind], lab = dd && dd.labels && dd.labels[idx]; return lab ? "the label " + lab.name : "the " + ordinal(idx) + " label"; }
      default: return "the " + ordinal(idx) + " one";
    }
  }

  window.MDV = { render: render, bind: bind, clearMarks: clearMarks, describe: describe, describeChoice: describeChoice, icons: ICON_NAMES };
})();
