(function () {
  "use strict";

  var dataEl = document.getElementById("all-lessons-data");
  if (!dataEl) return;

  var allLessons;
  try { allLessons = JSON.parse(dataEl.textContent); } catch (e) { return; }

  // Convert display HTML to print-friendly HTML
  // Keeps numbers, symbols, dots — strips class spans but preserves content
  function formatDisplay(str) {
    if (!str) return "";
    // Replace math-num spans with just the number (bold)
    var out = str.replace(/<span class='math-num'>(\d+)<\/span>/g, '<b>$1</b>');
    // Replace math-symbol spans with the symbol
    out = out.replace(/<span class='math-symbol'>([^<]+)<\/span>/g, ' $1 ');
    // Replace math-dots spans containing bullets with dot grid
    out = out.replace(/<span class='math-dots'>([^<]*)<\/span>/g, function (_, dots) {
      var count = 0;
      for (var i = 0; i < dots.length; i++) {
        if (dots.charCodeAt(i) === 0x2022) count++;
      }
      if (count === 0) return dots;
      return buildPrintDots(count);
    });
    // Replace math-symbol-question with blank
    out = out.replace(/<span class='math-symbol-question'>\?<\/span>/g, '<span class="blank">___</span>');
    // Replace remaining ? that aren't in HTML tags
    out = out.replace(/\?/g, '<span class="blank">___</span>');
    return out;
  }

  // Build dots in rows of 5 for print
  function buildPrintDots(count) {
    var html = '<span class="dots">';
    var placed = 0;
    while (placed < count) {
      var rowSize = Math.min(5, count - placed);
      for (var i = 0; i < rowSize; i++) {
        html += "\u25CF";
        placed++;
      }
      if (placed < count) html += "<br>";
    }
    html += "</span>";
    return html;
  }

  // Build a dot grid block for print (rows of 5, separator after 10)
  function buildPrintDotGrid(count) {
    if (!count || count <= 0) return "";
    var html = '<div class="dot-grid">';
    var placed = 0;
    var tens = Math.floor(count / 10);
    var remainder = count % 10;
    for (var t = 0; t < tens; t++) {
      html += '<div class="dot-row">';
      for (var i = 0; i < 5; i++) { html += '\u25CF '; placed++; }
      html += '</div><div class="dot-row">';
      for (var i = 0; i < 5; i++) { html += '\u25CF '; placed++; }
      html += '</div>';
      if (remainder > 0 || t < tens - 1) html += '<div class="dot-sep"></div>';
    }
    while (placed < count) {
      var rowSize = Math.min(5, count - placed);
      html += '<div class="dot-row">';
      for (var i = 0; i < rowSize; i++) { html += '\u25CF '; placed++; }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  window.printLesson = function (id, e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    var lesson = allLessons.find(function (l) { return l.id === id; });
    if (!lesson) return;

    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
    html += '<title>Lesson ' + lesson.id + ' \u2014 ' + lesson.target + '</title>';
    html += '<style>';
    html += 'body{font-family:Georgia,"Times New Roman",serif;max-width:7in;margin:0.5in auto;color:#000;font-size:11pt;line-height:1.5}';
    html += 'h1{font-family:sans-serif;font-size:16pt;border-bottom:2px solid #000;padding-bottom:4pt;margin-bottom:12pt}';
    html += 'h1 span{font-size:10pt;font-weight:400;color:#555;float:right;margin-top:4pt}';
    html += '.step{margin-bottom:14pt;page-break-inside:avoid}';
    html += '.step-head{font-family:sans-serif;font-size:8pt;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2pt}';
    html += '.display{font-family:"Comic Sans MS",cursive,sans-serif;font-size:20pt;font-weight:700;margin:4pt 0 6pt;text-align:center}';
    html += '.display b{color:#000}';
    html += '.dots{display:inline-block;font-size:14pt;letter-spacing:0.2em;line-height:1.6;vertical-align:middle;text-align:left}';
    html += '.blank{display:inline-block;min-width:2em;border-bottom:2px solid #000;text-align:center;font-size:20pt;vertical-align:baseline}';
    html += '.dot-grid{text-align:center;margin:4pt 0 6pt;line-height:1}';
    html += '.dot-row{font-size:16pt;letter-spacing:0.25em;line-height:1.4}';
    html += '.dot-sep{height:2pt;border-top:1px solid #ccc;margin:2pt auto;width:5em}';
    html += '.say{padding:6pt 10pt;background:#f5f5f5;border-left:3pt solid #2563eb;margin-bottom:4pt;font-size:10.5pt}';
    html += '.do{padding:4pt 10pt;border-left:3pt solid #f59e0b;font-size:9pt;font-style:italic;color:#555;margin-bottom:4pt}';
    html += '.fb{display:flex;gap:8pt;font-size:9pt;margin-top:2pt}';
    html += '.fb-praise{color:#16a34a}.fb-correct{color:#dc2626}';
    html += '.fb span{font-weight:700}';
    html += 'hr{border:none;border-top:1px solid #ddd;margin:10pt 0}';
    html += '@media print{body{margin:0.3in}h1{font-size:14pt}.display{font-size:18pt}.dots{font-size:12pt}}';
    html += '</style></head><body>';

    html += '<h1>Lesson ' + lesson.id + ': ' + lesson.target;
    html += '<span>Phase ' + lesson.phase + ' \u00B7 ' + lesson.steps.length + ' steps</span></h1>';

    for (var i = 0; i < lesson.steps.length; i++) {
      var s = lesson.steps[i];
      html += '<div class="step">';
      html += '<div class="step-head">Step ' + (i + 1) + ' of ' + lesson.steps.length + '</div>';
      if (s.display) html += '<div class="display">' + formatDisplay(s.display) + '</div>';
      if (s.dotCount && s.visual === "dots") html += buildPrintDotGrid(s.dotCount);
      if (s.say) html += '<div class="say">' + s.say + '</div>';
      if (s.do) html += '<div class="do">' + s.do + '</div>';
      html += '<div class="fb">';
      if (s.praise) html += '<div class="fb-praise"><span>\u2713</span> ' + s.praise + '</div>';
      if (s.correct) html += '<div class="fb-correct"><span>\u2717</span> ' + s.correct + '</div>';
      html += '</div>';
      html += '</div>';
      if (i < lesson.steps.length - 1) html += '<hr>';
    }

    html += '</body></html>';

    var win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(function () { win.print(); }, 300);
    }
  };
})();
