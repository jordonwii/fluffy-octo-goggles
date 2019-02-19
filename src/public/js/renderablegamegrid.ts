
import { Game, TOP_OFFSET, LEFT_OFFSET } from "./game";
import { Cell } from "../../shared/cell";
import { GameGrid } from "../../shared/gamegrid";
import { GameConfig } from "../../shared/config";


export class RenderableGameGrid extends GameGrid {
    gridContainer: PIXI.Container;

    constructor(private game: Game, cellArray: Cell[][]) {
        super(game.maxX, game.maxY, cellArray);
    }

    public init() {
        this.gridContainer = new PIXI.Container();
        this.gridContainer.x = LEFT_OFFSET;
        this.gridContainer.y = TOP_OFFSET;
        this.game.app.stage.addChild(this.gridContainer);
    }

    /**
     * Render the game cells.
     */
    public render() {
        for (var y = 0; y < this.game.maxY; y++) {
            for (var x = 0; x < this.game.maxX; x++) {
                let c = this.getCell(x, y);
                let sprite: PIXI.Sprite;

                if (c.isWall) {
                    sprite = this.game.addWall();
                } else {
                    sprite = this.game.addPath();
                }

                this.gridContainer.addChild(sprite);
                sprite.x = x * GameConfig.CELL_SIZE;
                sprite.y = y * GameConfig.CELL_SIZE;
            }
        }
    }
}