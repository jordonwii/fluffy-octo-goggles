import {Game} from "./game";

window.addEventListener("DOMContentLoaded", function() {
  let game: Game = new Game();
  game.init().then(function() {
    game.render();
  })

});