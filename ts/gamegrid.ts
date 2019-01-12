import { Game } from "./game.js";
import { Cell } from "./cell.js";
import { Maze } from "./maze.js";
import { CAMaze } from "./ca_maze.js";
import { DfsMaze } from "./dfs_maze.js";
import { GameConfig } from "./config.js";

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
        let ctx = this.game.getContext();

        for (var y = 0; y < this.game.maxY; y++) {
            for (var x = 0; x < this.game.maxX; x++) {
                let c = this.getCell(x, y);
                ctx.fillStyle = c.colorString;

                // Note: raw x and y values are scaled up in proportion to the width of walls. This lets us internally
                // treat the grid as if each cell were a point, but give the actual displayed cell some width.
                ctx.fillRect(x * GameConfig.CELL_SIZE, y * GameConfig.CELL_SIZE, GameConfig.CELL_SIZE, GameConfig.CELL_SIZE);
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