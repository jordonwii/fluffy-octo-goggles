import { Cell } from "./cell";
import { Maze } from "./maze";
import { DfsMaze } from "./dfs_maze";

export class GameGrid {
    cells: Array<Array<Cell>> = [];
    isBuilt: boolean = false;

    constructor(private maxX: number, private maxY: number, cellArray?: Cell[][]) {
        if (cellArray !== undefined && (cellArray.length !== maxY || cellArray[0].length !== maxX)) {
            throw new TypeError("Max dimensions don't match actual array dimensions: provided: (" + maxX + ", " + maxY + ") actual: (" + cellArray[0].length + ", " + cellArray.length + ").");
        }

        if (cellArray !== undefined) {
            this.cells = Array.from(cellArray);
            this.isBuilt = true;
        } else {
            for (let y = 0; y < maxY; y++) {
                this.cells[y] = new Array<Cell>(maxX);

                for (let x = 0; x < maxX; x++) {
                    this.cells[y][x] = new Cell(x, y, true);
                }
            }
        }
    }

    public build() {
        if (this.isBuilt) {
            return;
        }
        let m: Maze = new DfsMaze(this);
        m.build();

        this.isBuilt = true;
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