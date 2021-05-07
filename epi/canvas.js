const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const side = window.innerHeight * 2;

canvas.width = side;
canvas.height = side;

canvas.style.width = `${ side / 2 }px`;
canvas.style.height = `${ side / 2 }px`;

let framecount = 0;
const span = document.getElementById('fps');
setInterval(() => {
  span.innerHTML = framecount;
  framecount = 0;
}, 1000);

setInterval(() => {
  diff += 10;
  diff %= side;

  ctx.clearRect(0, 0, side, side);
}, 2000);

let diff = 0;

function random(n) {
  return Math.floor(Math.random() * n);
}

function randomAngle(deg) {
  const count = 360 / deg;
  const rand = Math.floor(Math.random() * count);
  return deg * rand;
}

function degToRad(deg) {
  return deg * (Math.PI / 180);
}

function randomPointConstrained(fromPoint, angle) {
  const distance = Math.floor(Math.random() * 300);
  const rads = degToRad(angle);
  const arc = Math.arctan(rads);
  const other = arc / distance;

  return [distance, other];
}

function randomCorner() {
  const lb = diff;
  const ub = side - diff;

  const x = Math.random() < .5 ? lb : ub;
  const y = Math.random() < .5 ? lb : ub;
  return [x, y];
}

function randomPoint() {
  const x = random(canvas.width);
  const y = random(canvas.height);
  return [x, y];
}

function draw() {
  // ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();

  const [x1, y1] = randomCorner();
  ctx.moveTo(x1, y1);

  const angle = randomAngle(22.5);
  // const [x2, y2] = randomPointConstrained([x1, y1], )

  const [x2, y2] = randomPoint();
  ctx.lineTo(x2, y2);

  ctx.stroke();

  framecount++;
  requestAnimationFrame(draw);
}

draw();
