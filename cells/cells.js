const randomOnOff = () => Math.round(Math.random());
const CONWAY_NEIGHBORS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
window.gen = 0;

const canvasElem = document.getElementById('canvas');

function* range(n) {
  for (let i = 0; i < n; i++) yield i;
}

function generateRandomGrid(colCount, rowCount, oneDimension = false) {
  let grid = [];
  for (let x = 0; x < colCount; x++) {
    let col = [];
    for (let y = 0; y < rowCount; y++) {
      if (oneDimension) {
        grid.push(randomOnOff())
      }
      else {
        col.push(randomOnOff());
      }
    }
    if (!oneDimension) grid.push(col);
  }
  return grid;
}

function numberOfLiveNeighbors(grid, x, y) {
  let count = 0;
  for (const neighbor of CONWAY_NEIGHBORS) {
    let [nextX, nextY] = [x + neighbor[0], y + neighbor[1]];
    if (nextX < 0 || nextX > grid[0].length - 1) continue;
    if (nextY < 0 || nextY > grid.length - 1) continue;
    count += grid[nextX][nextY];
  }
  return count;
}

function getNextGridConway(grid) {

  /*
  Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
  Any live cell with two or three live neighbours lives on to the next generation.
  Any live cell with more than three live neighbours dies, as if by overpopulation.
  Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
   */

  const nextGrid = [];
  for (let x = 0; x < grid.length; x++) {
    const col = [];
    for (let y = 0; y < grid[0].length; y++) {
      const nCount = numberOfLiveNeighbors(grid, x, y);
      const currentCell = grid[x][y];
      if (currentCell) {
        if (nCount < 2 || nCount > 3) { // under/over population
          col.push(0);
        }
        else if (nCount == 2 || nCount == 3) { // technically an else condition
          col.push(1);
        }
      }
      else {
        if (nCount == 3) {
          col.push(1);
        }
        else {
          col.push(0);
        }
      }
    }
    nextGrid.push(col);
  }

  return nextGrid;
}

function renderCanvas1D(canvas, grid1d, colCount, rowCount) {
  const colWidth = canvas.width / colCount;
  const rowHeight = canvas.height / rowCount;

  const context = canvas.getContext('2d');

  context.clearRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = '#0AF330';
  for (let n = 0; n < colCount * rowCount; n++) {
    const val = grid1d[n];
    if (val) {
      const offsetX = colWidth * (n % colCount);
      const offsetY = rowHeight * Math.floor(n / rowCount);
      context.fillRect(offsetX, offsetY, colWidth, rowHeight);
    }
  }

  // draw lines
  context.strokeStyle = 'rgba(200, 200, 200, 0.6)';
  for (let x = 0; x < canvas.width; x += colWidth) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }
  for (let y = 0; y < canvas.height; y += rowHeight) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }
}

function renderCanvas(canvas, grid) {
  const colCount = grid.length;
  const rowCount = grid[0].length;

  const rowHeight = canvas.height / rowCount;
  const colWidth = canvas.width / colCount;

  const context = canvas.getContext('2d');

  // clear canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = '#0AF330';
  for (let x = 0; x < colCount; x++) {
    for (let y = 0; y < rowCount; y++) {
      const val = grid[x][y];
      if (val) {
        const offsetX = x * colWidth;
        const offsetY = y * rowHeight;
        context.fillRect(offsetX, offsetY, colWidth, rowHeight);
      }
    }
  }
}

// function translate(grid1d, amount, newLength) {
//   // assumes a square grid
//   const side = Math.pow(grid1d.length, 1/2);
//   const f = unroll(side, side);
//   const g = rollup(side, side);

//   let extra = newLength ? newLength - side;

//   const newGrid = Array(grid1d.length).fill(0);
//   for (let n = 0; n < grid1.length; n++) {
//     let [x, y] = f(n);
//     x += amount;
//     y += amount;
//     if (grid1d[n]) {
//       const nP = g([x, y]);
//       newGrid[nP] = 1;
//     }
//   }

//   return newGrid;
// }

function simulate(length, intialGrid, steps) {
  const exponent = length + 2;
  const sim = new gol.Simulation(exponent);

  const f = unroll(length);
  const g = rollup(length);

  // move origin to center by subtracting half length
  let grid = translate(initialGrid, -length / 2);

  for (let n = 0; n < length * length; n++) {
    if (grid[n]) {
      let [ x, y ] = f(n);
      x -= length / 2;
      y -= length / 2;
      sim.set(x, y);
    }
  }

  grid = sim.get(steps);

  const out = Array(length * length).fill(0);

}

function parseRLEString(string) {
  let rule;
  let x;
  let y;

  const optionsRegex = /x[ ]?=[ ]?(\d+),[ ]?y[ ]?=[ ]?(\d+)(,[ ]?rule [ ]?[=]?[ ]?([BS0-9\/]+)?)?/i;
  const rleRegex = /[]/ig;

  const grid = [];

  return { grid, length, rule };
}

function animate() {
  window.gen++;

  /* run step */
  const t0 = Date.now();
  window.grid = window.gridFunc(window.grid);
  // console.log('step calc took', Date.now() - t0, 'ms');
  // console.log(window.grid);

  /* render */
  renderCanvas1D(canvasElem, window.grid, window.gridWidth, window.gridHeight);
  
  updateUI();

  /* repeat? */
  if (window.run) {
    window.requestAnimationFrame(animate);
  }
}

const unroll = (gridWidth, gridHeight) => n => [n % gridWidth, Math.floor(n / gridHeight)];
const rollup = (gridWidth, gridHeight) => ([x, y]) => x + (y * gridHeight);

const conwayGPUAlgo1D = function kernelFunction(grid1d) {
  var n = this.thread.x;
  var cell = grid1d[n];

  var nCount = 0 - cell;
  for (var nY = -this.constants.gridWidth; nY <= this.constants.gridWidth; nY += this.constants.gridWidth) { // rows
    for (var nX = -1; nX <= 1; nX++) {
      var nextN = n + nY + nX;
      if (nextN >= 0 && nextN < this.dimensions.x) {
        nCount += grid1d[nextN];
      }
    }
  }

  /* highlife */
  // if (cell == 1) {
  //   if (nCount == 2 || nCount == 3) {
  //     return 1;
  //   }
  //   return 0;
  // }
  // else {
  //   if (nCount == 3 || nCount == 6) {
  //     return 1;
  //   }
  //   return 0;
  // }

  /* conway's game of life */
  if (cell == 1) {
    if (nCount < 2 || nCount > 3) {
      return 0;
    }
    return 1;
  }
  else {
    if (nCount == 3) {
      return 1;
    }
    return 0;
  }
};

const conwayGPUAlgo = (gridWidth, gridHeight) => function kernelFunction(grid) {
  // console.log('dimensions', this.dimensions, 'thread', this.thread);
  // console.log(grid);

  var x = this.thread.x;
  var y = this.thread.y;

  // if (x === 3 && y === 3) debugger;

  var cell = grid[x][y];
  // var cell = grid[y][x];

  /* neighbor calc */
  var nCount = 0 - cell;
  for (var nX = -1; nX <= 1; nX++) {
    for (var nY = -1; nY <= 1; nY++) {
      var nextX = x + nX;
      var nextY = y + nY;
      if (nextX > 0 && nextX <= this.dimensions.x - 1 && nextY > 0 && nextY <= this.dimensions.y - 1) {
        // var val = grid[nextY][nextX];              
        var val = grid[nextX][nextY];
        // console.log('nX', nX, 'nY', nY, 'nextX', nextX, 'nextY', nextY, 'value:', val);
        nCount += val;
      }
    }
  }
  // console.log(nCount);

  /* apply rules */
  if (cell == 1) {
    if (nCount < 2 || nCount > 3) { // under/over population
      return 0;
    }
    return 1;
  }
  else {
    if (nCount == 3) {
      return 1;
    }
    return 0;
  }
};

const getNextGridConway1DWithGPUAlgo = (gridWidth, gridHeight) => function js(grid) {
  const context = {
    dimensions: {
      x: gridWidth * gridHeight
    },
    thread: {
      x: 0
    },
    constants: { gridWidth, gridHeight }
  }

  const nextGrid = [];
  for (let x = 0; x < gridWidth * gridHeight; x++) {
    context.thread.x = x;
    nextGrid.push(conwayGPUAlgo1D.call(context, grid));
  }
  return nextGrid;
}

const getNextGridConwayJSWithGPUAlgo = (gridWidth, gridHeight) => function js(grid) {
  this.dimensions = {
    x: gridWidth,
    y: gridHeight
  };
  this.thread = { x: 0, y: 0 };

  const context = {
    dimensions: {
      x: gridWidth,
      y: gridHeight
    },
    thread: {
      x: 0,
      y: 0
    }
  }

  const next = conwayGPUAlgo(gridWidth, gridHeight);
  const nextGrid = [];
  for (var x of range(context.dimensions.x)) {
    context.thread.x = x;
    const col = [];
    for (var y of range(context.dimensions.y)) {
      context.thread.y = y;
      const val = next.call(context, grid);
      col.push(val);
    }
    nextGrid.push(col);
  }
  return nextGrid;
};

const getNextGridConwayGPU1d = gpu =>
  (gridWidth, gridHeight) =>
    gpu.createKernel(conwayGPUAlgo1D, {
      dimensions: [gridWidth * gridHeight],
      debug: false,
      constants: { gridWidth, gridHeight },
      mode: 'gpu'
    });

const getNextGridConwayGPU = gpu =>
  (gridWidth, gridHeight) =>
    gpu.createKernel(conwayGPUAlgo(gridWidth, gridHeight), {
      dimensions: [gridWidth, gridHeight],
      debug: false,
      // mode: 'cpu'
    });
