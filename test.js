WALL_SIZE = 20;
PATH_SIZE = 1600;

let GRID_WALL = 0;
let GRID_PATH = 1;

UP = 0;
RIGHT = 1;
DOWN = 2;
LEFT = 3;

var maxX;
var maxY;

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
  var grid = [];
  for (var y = 0; y < maxY; y++) {
    grid[y] = new Array(maxX).fill(0);
  }
  return grid;
}



window.onload = function () {
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");

  initCanvas(ctx);

  let grid = initGrid();

  //buildDfsMaze(grid, r(maxX-1), r(maxY-1));
  buildCellularAutomataMaze(ctx, grid);
  renderMaze(ctx, grid);
}

function renderMaze(ctx, grid) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (var y = 0; y < maxY; y++) {
    for (var x = 0; x < maxX; x++) {
      if (grid[y][x] === GRID_PATH) {
        drawPathCell(ctx, x * WALL_SIZE, y * WALL_SIZE);
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
  let STEP_DELAY = 100

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
    console.log("Running...")
    if (renderCount == NUM_STEPS) {
      clearTimeout(timeout);
      return;
    }

    caStep();
    renderMaze(ctx, grid);
    renderCount++;
  }, STEP_DELAY)
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
  if (length > PATH_SIZE || grid[y][x] === 1 || getNeighbors(walls, x, y).filter((x) => x == 1).length > 1) {
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
    var dirIndex = r(possibleDirs.length - 1);
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

    fillPath(grid, nextX, nextY);
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

function r(n) {
  return Math.round((Math.random() * n));
}

function drawPathCell(ctx, x, y) {
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(x, y, WALL_SIZE, WALL_SIZE);
}
