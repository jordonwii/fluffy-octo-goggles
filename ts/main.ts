import {Game} from "./game.js";

var game;
window.addEventListener("DOMContentLoaded", function() {
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  game = new Game(canvas, ctx);
  game.buildMaze();

  // buildDfsMaze(grid, 
  game.render();
});