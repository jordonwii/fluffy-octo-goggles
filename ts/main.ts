import {Game} from "./game.js";

// Gives us access to the game for debugging.
// TODO (probably?) delete this for anything real.
var game;
window.addEventListener("DOMContentLoaded", function() {
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  game = new Game(canvas, ctx);
  game.buildMaze();

  game.render();
});