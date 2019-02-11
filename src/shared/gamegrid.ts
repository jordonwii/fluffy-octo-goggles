import { Cell } from "./cell";
import { Maze } from "./maze";
import { DfsMaze } from "./dfs_maze";

export class GameGrid {
    cells: Array<Array<Cell>> = [];

    constructor(private maxX: number, private maxY: number) {
        for (let y = 0; y < maxY; y++) {
            this.cells[y] = new Array<Cell>(maxX);

            for (let x = 0; x < maxX; x++) {
                this.cells[y][x] = new Cell(x, y, true);
            }
        }
    }

    public build() {
        let m: Maze = new DfsMaze(this);
        m.build();
    }

    public getCell(x: number, y: number): Cell {
        if (y > this.cells.length - 1 || x > this.cells[y].length - 1) {
            return null;
        }
        return this.cells[y][x];
    }

    public copyAllCells(): Array<Array<Cell>> {
        return this.cells.map((row) => Array.from(row));
    }

    public getMaxX() { return this.maxX; }
    public getMaxY() { return this.maxY; }
}