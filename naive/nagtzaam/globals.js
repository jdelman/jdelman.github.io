const COLORS = ['red', 'blue', 'green', 'orange', 'cyan', 'magenta',];

function Point(x, y) {
  if (!(this instanceof Point)) {
    return new Point(x, y);
  }

  if (isNaN(x) || isNaN(y)) {
    throw new TypeError('x and y must be numbers');
  } 

  this.x = x;
  this.y = y;

  this[0] = x;
  this[1] = y;
}

function Line(pointA, pointB) {
  if (!(this instanceof Line)) {
    return new Line(pointA, pointB);
  }

  this.pointA = pointA;
  this.pointB = pointB;
  
  this.xA = pointA.x;
  this.yA = pointA.y;

  this.xB = pointB.x;
  this.yB = pointB.y;

  // TODO: Object.defineProperty
  // this[0] = pointA;
  // this[1] = pointB;
  this.slope = (this.yB - this.yA) / (this.xB - this.xA);
  this.intercept = this.yA - (this.xA * this.slope);
}
Line.prototype.getIntercept = function() {

};
Line.prototype.randomPointOnLine = function() {
  let xMin = this.xA;
  let xMax = this.xB;
  if (this.xA > this.xB) {
    xMin = this.xB;
    xMax = this.xA;
  }

  const x = random(xMin, xMax);

  let y;
  if (Math.abs(this.slope) === Infinity) {
    // it's a vertical line
    y = this.yA;
  }
  else {
    y = (this.slope * x) + this.intercept;
  }

  // console.log('making point:', x, y, this.slope);

  return Point(x, y);
};

function Size(width, height) {
  if (!(this instanceof Size)) {
    return new Size(width, height);
  }

  this.width = width;
  this.height = height;

  this[0] = width;
  this[1] = height;
}

function Rect(point, size) {
  if (!(this instanceof Rect)) {
    return new Rect(point, size);
  }

  this.point = point;
  this.size = size;
  // this[0] = point.x;
  // this[1] = point.y;
  // this[2] = size.width;
  // this[3] = size.height;

  // this.xA = this.point.x;
  // this.yA = this.point.y;
  // this.xB = this.point.x + this.size.width;
  // this.yB = this.point.y + this.size.height;
}
Rect.prototype.getCenter = function() {
  return new Point(
    (this.size.width / 2) + this.point.x,
    (this.size.height / 2) + this.point.y
  );
};
Rect.prototype[Symbol.iterator] = function() {
  switch (this.index) {
    case 0:
      return { value: this.point.x, done: false };
    case 1:
      return { value: this.point.y, done: false };
    case 2:
      return { value: this.size.width, done: false };
    case 3:
      return { value: this.size.height, done: false };
    default:
      return { done: true };
  }
}

function random(min, max) {
  const ceil = max - min;
  return Math.floor(Math.random() * ceil) + min;
}

function choice(arr) {
  const index = random(0, arr.length);
  return arr[index];
}

function nthEdge(rect, n) {
  console.log('nthEdge:', rect, n);
  switch (n) {
    case 0: return Line(
      rect.point,
      Point(rect.size.width + rect.point.x, rect.point.y)
    );
    case 1: return Line(
      rect.point,
      Point(rect.point.x, rect.point.y + rect.size.height)
    );
    case 2: return Line(
      Point(rect.point.x + rect.size.width, rect.point.y + rect.size.height),
      Point(rect.point.x + rect.size.width, rect.point.y)
    );
    case 3: return Line(
      Point(rect.point.x + rect.size.width, rect.point.y + rect.size.height),
      Point(rect.point.x, rect.point.y + rect.size.height)
    );
  }
}

function randomCut(rect) {
  console.log('randomCut with rect:', rect);
  const { size: { width, height }, point: { x, y } } = rect;

  const minX = x;
  const minY = y;
  const maxX = x + width;
  const maxY = y + height;

  let rectA, rectB;
  
  // if horizontal, pick a coordinate minY <= y < maxY
  // if vertical, pick a coordinate minX <= x < maxX
  const dir = Math.round(Math.random());
  if (dir) { // horizontal
    const randomY = random(minY, maxY);
    rectA = Rect(Point(x, y), Size(width, randomY - minY));
    rectB = Rect(Point(x, randomY), Size(width, maxY - randomY));
  }
  else {
    const randomX = random(minX, maxX);
    rectA = Rect(Point(x, y), Size(randomX - minX, height));
    rectB = Rect(Point(randomX, y), Size(maxX - randomX, height));
  }

  // return value should be the two rectangles created by the line
  return [rectA, rectB];
}

function generateRects(rect, count = 1) {
  const boundaries = randomCut(rect);
  console.log('initial boundaries=', boundaries)

  for (let i = 0; i < count - 1; i++) {
    const randomIndex = random(0, boundaries.length - 1);
    const newRects = randomCut(boundaries[randomIndex]);
    // boundaries.splice(randomIndex, 1, ...newRects);
    boundaries.push(...newRects);
  } 

  return boundaries;
}

function validateSlope(slope) {
  // no horizontal or vertical lines
  if (slope === 0) return false;
  else if (Math.abs(slope) === Infinity) return false;
  else if (slope > -2 && slope < 1) return false;

  return true;
}

function generateLines(rects, count = 1) {
  return Array(count).fill().map(() => {   
    let done = false;
    let line;

    while (!done) {
      // choose two rectangles (don't have to be different)
      const [rectA, rectB] = [choice(rects), choice(rects)];

      // choose two edges
      const [edgeA, edgeB] = [nthEdge(rectA, random(0, 4)), nthEdge(rectB, random(0, 4))];
      // console.log('edge choices:', edgeA, edgeB);

      // create a new line using random points on each edge
      const [pointA, pointB] = [edgeA.randomPointOnLine(), edgeB.randomPointOnLine()];
      line = Line(pointA, pointB);

      if (validateSlope(line.slope)) {
        done = true;
      }
    }

    return line;
  });
}

function getSVG(things) {
  const NS = 'http://www.w3.org/2000/svg';
  return things.map(thing => {
    let tag;
    if (thing instanceof Rect) {
      tag = document.createElementNS(NS, 'rect');
      tag.setAttributeNS(null, 'x', thing.point.x);
      tag.setAttributeNS(null, 'y', thing.point.y);
      tag.setAttributeNS(null, 'width', thing.size.width);
      tag.setAttributeNS(null, 'height', thing.size.height);
      tag.setAttributeNS(null, 'style', `fill:${ choice(COLORS) }`);
      tag.setAttributeNS(null, 'opacity', 0.4);
    }
    else if (thing instanceof Line) {
      tag = document.createElementNS(NS, 'line');
      tag.setAttributeNS(null, 'x1', thing.xA);
      tag.setAttributeNS(null, 'y1', thing.yA);
      tag.setAttributeNS(null, 'x2', thing.xB);
      tag.setAttributeNS(null, 'y2', thing.yB);
      tag.setAttributeNS(null, 'stroke-width', 1);
      tag.setAttributeNS(null, 'stroke', 'black');
    }
    return tag;
  });
}

function drawRects(rects, ctx) {
  ctx.font = '16pt Courier';

  rects.forEach((rect, index) => {
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = choice(COLORS);

    // ctx.fillStyle = 
    console.log('drawing rect:', rect);
    ctx.fillRect(rect.point.x, rect.point.y, rect.size.width, rect.size.height);

    const center = rect.getCenter();
    
    ctx.fillStyle = 'white';
    ctx.globalAlpha = 1;
    ctx.fillText(String(index), center.x, center.y);
  });
}

function drawLines(lines, ctx) {
  lines.forEach(line => {
    ctx.strokeStyle = 'white'; //choice(COLORS);
    // console.log('drawing line:', line);
    ctx.beginPath();
    ctx.moveTo(line.xA, line.yA);
    ctx.lineTo(line.xB, line.yB);
    ctx.stroke();
    ctx.closePath();
  });
}
