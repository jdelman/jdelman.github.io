// (function() {
//   const canvas = document.getElementById('canvas');
//   const ctx = canvas.getContext('2d');
//   ctx.lineWidth = 1;

//   const initialRect = Rect(Point(0, 0), Size(500, 700));

//   ctx.fillStyle = 'black';
//   ctx.fillRect(0, 0, 500, 700);

//   const rects = generateRects(initialRect, 3);
//   drawRects(rects, ctx);

//   const lines = generateLines(rects, 40);
//   drawLines(lines, ctx);
// })();

(function() {
  const svg = document.getElementById('svg');
  
  const initialRect = Rect(Point(0, 0), Size(500, 700));

  const rects = generateRects(initialRect, 5);
  const lines = generateLines(rects, 40);

  const rectSVGElems = getSVG(rects);
  const lineSVGElems = getSVG(lines);

  rectSVGElems.forEach(elem => svg.appendChild(elem));
  lineSVGElems.forEach(elem => svg.appendChild(elem));
})();
