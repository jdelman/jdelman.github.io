function compareGrids(grid1, grid2) {
  for (let x = 0; x <= grid1.length - 1; x++) {
    for (let y = 0; y <= grid1[0].length - 1; y++) {
      if (grid1[x][y] !== grid2[x][y]) {
        console.log('mismatch @', x, y, 'grid1:', grid1[x][y], 'grid2:', grid2[x][y]);
      }
    }
  }
}

function compareFunctions(startGrid) {
  const func1 = getNextGridConwayGPU(new GPU())(500, 500);
  const func2 = getNextGridConwayJSWithGPUAlgo(500, 500);

  console.log('step 0');
  let grid1 = func1(startGrid);
  let grid2 = func2(startGrid);
  compareGrids(grid1, grid2);
}
