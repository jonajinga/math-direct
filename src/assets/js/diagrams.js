// Hand-drawn diagrams for the science lessons, drawn by the visual renderer
// (R.diagram in visuals.js). Each has a size, a draw function that returns
// the SVG body, and its labels: the name, where the label box sits, and the
// point its line reaches. Labels are shown by name and may be touched.
(function () {
  "use strict";
  var D = {};

  D.plant = {
    w: 320, h: 300,
    labels: [
      { name: "flower", x: 196, y: 44, lx: 160, ly: 54 },
      { name: "leaf", x: 214, y: 150, lx: 190, ly: 160 },
      { name: "stem", x: 40, y: 190, lx: 155, ly: 200 },
      { name: "roots", x: 40, y: 282, lx: 150, ly: 270 },
    ],
    draw: function () {
      var p = "";
      for (var i = 0; i < 6; i++) { var a = i * 60 * Math.PI / 180; p += '<ellipse cx="' + (160 + Math.cos(a) * 22).toFixed(1) + '" cy="' + (50 + Math.sin(a) * 22).toFixed(1) + '" rx="14" ry="9" transform="rotate(' + (i * 60) + " " + (160 + Math.cos(a) * 22).toFixed(1) + " " + (50 + Math.sin(a) * 22).toFixed(1) + ')" fill="var(--v-pink)" stroke="var(--v-ink)" stroke-width="1.5"/>'; }
      return '<line x1="0" y1="240" x2="320" y2="240" stroke="var(--v-brown)" stroke-width="3"/>' +
        '<path d="M160 240 C 150 262, 120 268, 100 280 M160 240 C 170 262, 200 270, 220 282 M160 240 C 158 265, 150 280, 150 292" stroke="var(--v-brown)" stroke-width="4" fill="none" stroke-linecap="round"/>' +
        '<path d="M160 240 V 70" stroke="var(--v-green)" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M160 160 C 180 140, 205 140, 218 150 C 205 170, 180 172, 160 160 Z" fill="var(--v-green)" stroke="var(--v-ink)" stroke-width="1.5"/>' +
        '<path d="M160 200 C 140 180, 115 180, 102 190 C 115 210, 140 212, 160 200 Z" fill="var(--v-green)" stroke="var(--v-ink)" stroke-width="1.5"/>' +
        p + '<circle cx="160" cy="50" r="12" fill="var(--v-yellow)" stroke="var(--v-ink)" stroke-width="1.5"/>';
    },
  };

  D.circuit = {
    w: 320, h: 220,
    labels: [
      { name: "battery", x: 30, y: 206, lx: 70, ly: 150 },
      { name: "wire", x: 130, y: 36, lx: 160, ly: 40 },
      { name: "bulb", x: 232, y: 206, lx: 250, ly: 150 },
      { name: "switch", x: 128, y: 206, lx: 160, ly: 178 },
    ],
    draw: function (v) {
      var closed = v.closed !== false;
      return '<path d="M70 120 V 40 H 250 V 120 M70 170 V 180 H 140 M180 180 H 250 V 170" stroke="var(--v-ink)" stroke-width="4" fill="none" stroke-linecap="round"/>' +
        '<rect x="58" y="120" width="24" height="50" rx="3" fill="var(--v-gray)" stroke="var(--v-ink)" stroke-width="2"/><rect x="64" y="114" width="12" height="6" fill="var(--v-ink)"/>' +
        '<circle cx="250" cy="138" r="22" fill="' + (closed ? "var(--v-yellow)" : "var(--v-soft)") + '" stroke="var(--v-ink)" stroke-width="2"/><rect x="240" y="158" width="20" height="12" fill="var(--v-gray)" stroke="var(--v-ink)" stroke-width="2"/>' +
        '<circle cx="140" cy="180" r="4" fill="var(--v-ink)"/><circle cx="180" cy="180" r="4" fill="var(--v-ink)"/>' +
        '<line x1="140" y1="180" x2="' + (closed ? 180 : 172) + '" y2="' + (closed ? 180 : 158) + '" stroke="var(--v-ink)" stroke-width="4" stroke-linecap="round"/>';
    },
  };

  D["food-chain"] = {
    w: 360, h: 160,
    labels: [
      { name: "grass", x: 22, y: 150, lx: 50, ly: 118 },
      { name: "grasshopper", x: 96, y: 36, lx: 150, ly: 80 },
      { name: "frog", x: 214, y: 150, lx: 240, ly: 118 },
      { name: "hawk", x: 300, y: 36, lx: 325, ly: 70 },
    ],
    draw: function () {
      var arrow = function (x) { return '<path d="M' + x + " 100 h40 m-10 -10 l10 10 l-10 10" + '" stroke="var(--v-accent)" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; };
      return '<path d="M30 120 l6 -30 l6 30 M44 120 l8 -34 l8 34 M60 120 l5 -26 l5 26" stroke="var(--v-green)" stroke-width="4" fill="none" stroke-linecap="round"/>' + arrow(82) +
        '<ellipse cx="150" cy="96" rx="26" ry="12" fill="var(--v-green)" stroke="var(--v-ink)" stroke-width="1.5"/><circle cx="174" cy="90" r="8" fill="var(--v-green)" stroke="var(--v-ink)" stroke-width="1.5"/><path d="M135 108 l-10 16 M150 108 l-4 18 M165 106 l8 16" stroke="var(--v-ink)" stroke-width="2"/>' + arrow(186) +
        '<ellipse cx="240" cy="104" rx="26" ry="18" fill="var(--v-green)" stroke="var(--v-ink)" stroke-width="1.5"/><circle cx="228" cy="86" r="8" fill="var(--v-green)" stroke="var(--v-ink)" stroke-width="1.5"/><circle cx="252" cy="86" r="8" fill="var(--v-green)" stroke="var(--v-ink)" stroke-width="1.5"/><circle cx="228" cy="85" r="3" fill="var(--v-ink)"/><circle cx="252" cy="85" r="3" fill="var(--v-ink)"/>' + arrow(276) +
        '<path d="M325 70 c-20 10, -34 30, -30 50 c10 -8, 20 -10, 30 -8 c10 -2, 20 0, 30 8 c4 -20, -10 -40, -30 -50 z" fill="var(--v-brown)" stroke="var(--v-ink)" stroke-width="1.5"/><circle cx="325" cy="66" r="8" fill="var(--v-brown)" stroke="var(--v-ink)" stroke-width="1.5"/><path d="M331 64 l8 2 l-8 3 z" fill="var(--v-yellow)"/>';
    },
  };

  window.MDDiagrams = D;
})();
