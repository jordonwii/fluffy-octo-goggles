
import { Game } from "./game";
import { Cell } from "./cell";
import { Maze } from "./maze";
import { CAMaze } from "./ca_maze";
import { DfsMaze } from "./dfs_maze";
import { GameConfig } from "./config";

export class GameGrid {
    cells: Array<Array<Cell>> = [];

    constructor(private game: Game) {
        for (let y = 0; y < game.maxY; y++) {
            this.cells[y] = new Array<Cell>(game.maxX);

            for (let x = 0; x < game.maxX; x++) {
                this.cells[y][x] = new Cell(true);
            }
        }
    }

    public build() {
        //let m: Maze = new CAMaze(this.game, this);
        let m: Maze = new DfsMaze(this.game, this);

        m.build();
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

                sprite.x = x*GameConfig.CELL_SIZE;
                sprite.y = y*GameConfig.CELL_SIZE;
            }
        }
    }

    public getCell(x: number, y: number): Cell {
        return this.cells[y][x];
    }

    public copyAllCells(): Array<Array<Cell>> {
        return this.cells.map((row) => Array.from(row));
    }
}