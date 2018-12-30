const WALL_SIZE = 20;
const PATH_SIZE = 1600;

const GRID_WALL = 0;
const GRID_PATH = 1;

const UP = 0;
const RIGHT = 1;
const DOWN = 2;
const LEFT = 3;

let maxX;
let maxY;

/**
 * Initializes the canvas.
 */
function initCanvas(ctx) {
  // Scale up the canvas by the DPR, then scale back down with CSS.
  // www.html5rocks.com/en/tutorials/canvas/hidpi
  var dpr = window.devicePixelRatio || 1;

  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;

  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  ctx.scale(dpr, dpr);

  maxX = Math.round(window.innerWidth / WALL_SIZE);
  maxY = Math.round(window.innerHeight / WALL_SIZE);
}

function initGrid() {
  let grid = [];
  for (let y = 0; y < maxY; y++) {
    grid[y] = new Array(maxX).fill(0);
  }
  return grid;
}

window.onload = function() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  initCanvas(ctx);

  const grid = initGrid();

  // buildDfsMaze(grid, rand(maxX-1), rand(maxY-1));
  buildCellularAutomataMaze(ctx, grid);

  renderMaze(ctx, grid);
};

/**
 * 
 * @param {*} ctx 
 * @param {*} grid 
 */
function renderMaze(ctx, grid) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (var y = 0; y < maxY; y++) {
    for (var x = 0; x < maxX; x++) {
      if (grid[y][x] !== GRID_WALL) {
        drawPathCell(ctx, x * WALL_SIZE, y * WALL_SIZE, grid[y][x]);
      }
    }
  }
}

/**
 * Builds a maze using the cellular automata method.
 * 
 * Contains a bunch of config params at the top of the functions. The currently
 * committed code uses the params of MAZE, defined at http://www.conwaylife.com/w/index.php?title=Maze.
 */
function buildCellularAutomataMaze(ctx, grid) {
  let INIT_WALL_PROB = .5;
  let DEATH_MAX = 5;
  let DEATH_MIN = 1;
  let BIRTH_LIMIT = 3;
  let NUM_STEPS = 100;
  let STEP_DELAY = 10

  for (var y = 0; y < maxY; y++) {
    for (var x = 0; x < maxX; x++) {
      grid[y][x] = (Math.random() < INIT_WALL_PROB) ? GRID_WALL : GRID_PATH;
    }
  }


  renderMaze(ctx, grid);

  function caStep() {
    let newGrid = grid.map((row) => Array.from(row));
    for (var y = 0; y < maxY; y++) {
      for (var x = 0; x < maxX; x++) {
        let nbs = countAliveNeighbours(grid, x, y);

        if (grid[y][x] === GRID_PATH) {
          if (nbs >= DEATH_MAX || nbs <= DEATH_MIN) {
            newGrid[y][x] = GRID_WALL;
          } else {
            newGrid[y][x] = GRID_PATH;
          }
        } else {
          if (nbs === BIRTH_LIMIT) {
            newGrid[y][x] = GRID_PATH;
          } else {
            newGrid[y][x] = GRID_WALL;
          }
        }
      }
    }
    grid = newGrid;
  }

  let renderCount = 0
  let timeout = setInterval(function () {
    if (renderCount == NUM_STEPS) {
      clearTimeout(timeout);
      renderConnectedComponents(ctx, grid);
      return;
    }

    caStep();
    renderMaze(ctx, grid);
    renderCount++;
  }, STEP_DELAY)
}

/**
 * Draws the connected components in different colors.
 */
function renderConnectedComponents(ctx, grid) {
  let visited = [];

  function explore(x, y, fillStyle) {
    if (visited.includes(y*maxY + x*maxX)) {
      return;
    }

    if (grid[y][x] === GRID_WALL) {
      return;
    }

    grid[y][x] = fillStyle;
    visited.push(y * maxY + x*maxX);

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (Math.abs(i) === Math.abs(j)) {
          continue;
        }

        let nextY = y + i;
        let nextX = x + j;
        if (nextX < 0 || nextY < 0 || nextY >= maxY || nextX >= maxX) {
          continue;
        }

        explore(nextX, nextY, fillStyle);
      }
    }
  }

  for (let y = 0; y < maxY; y++) {
    for (let x = 0; x < maxX; x++) {
      let fillStyle = makeFillStyle(rand(255, 5), rand(255, 5), rand(255, 5));
      explore(x, y, fillStyle);
    }
  }

  renderMaze(ctx, grid);
}

function countAliveNeighbours(grid, x, y) {
  let count = 0;

  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      let neighborX = x + i;
      let neighborY = y + j;

      if (i == 0 && j == 0) {
        continue;
      }

      if (neighborX < 0 || neighborY < 0 || neighborY >= grid.length || neighborX >= grid[0].length) {
        count = count + 1;
      }

      else if (grid[neighborY][neighborX] === GRID_PATH) {
        count = count + 1;
      }
    }
  }
  return count;
}
var length = 0;

/**
 * Builds a maze using DFS.
 */
function buildDfsMaze(grid, x, y) {
  if (length > PATH_SIZE || grid[y][x] === 1 || getNeighbors(grid, x, y).filter((x) => x == 1).length > 1) {
    return;
  }

  grid[y][x] = 1;
  length += 1
  var possibleDirs = [];
  if (y > 0) {
    possibleDirs.push(UP);
  }

  if (y + 1 < maxY) {
    possibleDirs.push(DOWN);
  }

  if (x > 0) {
    possibleDirs.push(LEFT);
  }

  if (x + 1 < maxX) {
    possibleDirs.push(RIGHT);
  }
  if (possibleDirs.length == 0) {
    return;
  }

  while (possibleDirs.length > 0 && length < PATH_SIZE) {
    var dirIndex = rand(possibleDirs.length - 1);
    var nextX = x;
    var nextY = y;

    switch (possibleDirs[dirIndex]) {
      case UP:
        nextY = y - 1;
        break;
      case DOWN:
        nextY = y + 1;
        break;
      case LEFT:
        nextX = x - 1;
        break;
      case RIGHT:
        nextX += 1;
        break;
    }
    possibleDirs.splice(dirIndex, 1);

    buildDfsMaze(grid, nextX, nextY);
  }
  return;
}

function getNeighbors(grid, x, y) {
  var result = [];

  if (x > 0)
    result.push(grid[y][x - 1]);
  if (x + 1 < maxX)
    result.push(grid[y][x + 1]);
  if (y > 0)
    result.push(grid[y - 1][x]);
  if (y + 1 < maxY)
    result.push(grid[y + 1][x]);
  return result;
}

function rand(n, low) {
  if (low === undefined) low = 0;
  return Math.round((Math.random() * (n - low))) + low;
}

function drawPathCell(ctx, x, y, fillStyle) {
  if (fillStyle === undefined || fillStyle === GRID_PATH) {
    fillStyle = makeFillStyle(255, 255, 255);
  }

  ctx.fillStyle = fillStyle;
  ctx.fillRect(x, y, WALL_SIZE, WALL_SIZE);
}

function makeFillStyle(r, g, b) {
  return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}