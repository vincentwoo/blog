var SEGS = [
  [],                                       // 0, no contour
  [{s1: 'L', s2: 'B'}],                     // 1
  [{s1: 'R', s2: 'B'}],                     // 2
  [{s1: 'L', s2: 'R'}],                     // 3
  [{s1: 'T', s2: 'R'}],                     // 4
  [{s1: 'L', s2: 'T'}, {s1: 'B', s2: 'R'}], // 5, saddle
  [{s1: 'B', s2: 'T'}],                     // 6
  [{s1: 'L', s2: 'T'}],                     // 7
  [{s1: 'L', s2: 'T'}],                     // 8
  [{s1: 'B', s2: 'T'}],                     // 9
  [{s1: 'L', s2: 'B'}, {s1: 'T', s2: 'R'}], // 10, saddle
  [{s1: 'T', s2: 'R'}],                     // 11
  [{s1: 'L', s2: 'R'}],                     // 12
  [{s1: 'R', s2: 'B'}],                     // 13
  [{s1: 'L', s2: 'B'}],                     // 14
  [],                                       // 15, no contour
];
var interval;
var canvas;
var ctx;
var data = null;

window.addEventListener('load', function() {
  interval = document.getElementById('interval');
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  samples = document.getElementById('samples');
  
  window.addEventListener('dragover', function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
  });
  
  window.addEventListener('drop', function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var file = evt.dataTransfer.files[0];
    reader = new FileReader();
    reader.onloadend = function(e) {
      parse(e.target.result);
    }
    reader.readAsText(file);
  });
  
  window.addEventListener('resize', resize);
  resize();
  
  interval.addEventListener('change', beginDraw);
  interval.addEventListener('keyup', beginDraw);
  
  for (example in EXAMPLES) {
    (function (example) {
      var a = document.createElement('a');
      a.innerHTML = example;
      a.href= "#";
      a.addEventListener('click', function() {
        data = EXAMPLES[example];
        beginDraw();
        return false;
      });
      samples.appendChild(a);
    })(example);
  }
});
  
function resize() {
  canvas.setAttribute("width", canvas.offsetWidth);
  canvas.setAttribute("height", canvas.offsetHeight);
  beginDraw();
}

function parse(text) {
  data = text.split('\n').map( function(line) {
    return line.split('\t').map(parseFloat);
  });
  if (data[data.length-1].length != data[0].length) data.pop(); // ghetto trailing newline detection
  beginDraw();
}

function beginDraw() {
  if (!data) return;
  var ival = parseFloat(interval.value);
  if (ival < 0.0001) return; // don't spin CPU TOO hard
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  marching_squares(ival);
}

function marching_squares(ival) {
  var max = -Infinity, min = Infinity;
  data.forEach (function(row) {
    row.forEach (function(val) {
      if (val > max) max = val;
      if (val < min) min = val;
    });
  });
  var rows = data.length - 1;
  var cols = data[0].length - 1;
  var scale = cols / rows > canvas.width / canvas.height ?
    canvas.width / cols : canvas.height / rows;
  for (var threshold = min; threshold <= max; threshold += ival) {
    marching_squares_threshold(data.map (function(row) {
      return row.map (function(val) {
        return (val > threshold) ? 0 : 1; // flipped, 0 if above
      });
    }), rows, cols, threshold, min, max, scale);
  }
}

function marching_squares_threshold(filtered, rows, cols, threshold, min, max, scale) {
  var cells = new Array(rows);
  for (var i = 0; i < rows; i++) {
    cells[i] = new Array(cols);
    for (var j = 0; j < cols; j++) {
      // remember: cells stored in [row][col], or [y][x]
      var TL = filtered[i][j];
      var TR = filtered[i][j+1];
      var BL = filtered[i+1][j];
      var BR = filtered[i+1][j+1];
      var idx = 8 * TL + 4 * TR + 2 * BR + BL;
      if (idx == 5 || idx == 10) {
        var avg = (data[i][j] + data[i+1][j] + data[i][j+1] + data[i+1][j+1]) / 4;
        if (avg > threshold) idx = (idx == 5) ? 10 : 5;
      }
      cells[i][j] = idx;
    }
  }
  draw(cells, threshold, min, max, scale);
}

function interp(a, b, threshold) {
  return (threshold - a) / (b - a);
}

function pointForSide(row, col, threshold, side) {
  var x, y;
  switch (side) {
    case 'B':
      y = 1;
      x = interp(data[row+1][col], data[row+1][col+1], threshold);
      break;
    case 'T':
      y = 0;
      x = interp(data[row][col], data[row][col+1], threshold);
      break;
    case 'L':
      x = 0;
      y = interp(data[row][col], data[row+1][col], threshold);
      break;
    case 'R':
       x = 1;
       y = interp(data[row][col+1], data[row+1][col+1], threshold);
       break;
  }
  return {x: x, y: y};
}

function draw(cells, threshold, min, max, scale) {
  var alpha = (threshold - min) / max;
  ctx.strokeStyle = 'rgb(' + Math.round(alpha * 255) + ', ' + Math.round((1-alpha) * 255) + ', 0)';
  for (var row = 0; row < cells.length; row++) {
    for (var col = 0; col < cells[0].length; col++) {
      SEGS[cells[row][col]].forEach( function(seg) {
        var p1 = pointForSide(row, col, threshold, seg.s1);
        var p2 = pointForSide(row, col, threshold, seg.s2);
        ctx.beginPath();
        ctx.moveTo(col * scale + p1.x * scale, row * scale + p1.y * scale);
        ctx.lineTo(col * scale + p2.x * scale, row * scale + p2.y * scale);
        ctx.stroke();
        ctx.closePath();
      });
    }
  }
}
