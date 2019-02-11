import {Game} from "./game";

// Gives us access to the game for debugging.
// TODO (probably?) delete this for anything real.
window.addEventListener("DOMContentLoaded", function() {
  let game: Game = new Game();
  game.buildMaze();
  game.init(function() {
    game.render();
  })

});