WALL_SIZE = 20;
PATH_SIZE = 1600;

UP = 0;
RIGHT  = 1;
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

  maxX = Math.round(window.innerWidth/WALL_SIZE);
  maxY = Math.round(window.innerHeight/WALL_SIZE);

  // Fill the background with black.
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

window.onload = function() {
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");

  initCanvas(ctx);

  var walls = [];
  for (var y = 0; y < maxY; y++) {
    walls[y] = new Array(maxX).fill(0);
  }

  fillPath(walls, r(maxX-1), r(maxY-1));


  for (var y = 0; y < maxY; y++) {
    for (var x = 0; x < maxX; x++) {
      if (walls[y][x] === 1) {
	drawPathCell(ctx, x*WALL_SIZE, y*WALL_SIZE);
      }
    }
  }

}

var length = 0;
function fillPath(walls, x, y) {
  if (length > PATH_SIZE || walls[y][x] === 1 || getNeighbors(walls, x, y).filter((x) => x == 1).length > 1) {
    return;
  }

  walls[y][x] = 1;
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
	console.log("going up");
	break;
      case DOWN:
	console.log("going down");
	nextY = y+1;
	break;
      case LEFT:
	console.log("going left");
	nextX = x-1;
	break;
      case RIGHT:
	console.log("going right");
	nextX += 1;
	break;
    }
    possibleDirs.splice(dirIndex, 1);

    fillPath(walls, nextX, nextY);
  }
  return;
}

function getNeighbors(walls, x, y) {
  var result = [];

  if (x > 0) 
    result.push(walls[y][x-1]);
  if (x + 1 < maxX)
    result.push(walls[y][x+1]);
  if (y > 0) 
    result.push(walls[y-1][x]);
  if (y + 1 < maxY)
    result.push(walls[y+1][x]);
  return result;
}

function r(n) {
  return Math.round((Math.random() * n));
}

function drawPathCell(ctx, x, y) {
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(x, y, WALL_SIZE, WALL_SIZE);
}
