import { GameGrid } from "./gamegrid";
import { GameConfig } from "./config";
import { Cell } from "./cell";
import { Maze } from "./maze";
import * as common from "../public/js/common";

const UP = 0;
const RIGHT = 1;
const DOWN = 2;
const LEFT = 3;

/**
 * Builds a maze using DFS.
 * 
 * Code here is kinda gross, but I don't really like the mazes it produces, anyway.
 */
export class DfsMaze implements Maze {
    length: number = 0;

    constructor(private grid: GameGrid) { }

    build() {
        this.dfs(common.rand(this.grid.getMaxX() - 1), common.rand(this.grid.getMaxY() - 1));

    }

    dfs(x: number, y: number) {
        let c: Cell = this.grid.getCell(x, y);
        if (this.length > GameConfig.DFS_PATH_SIZE || c === null || !c.isWall || this.createsFourCellLoop(c)) {
            return;
        }

        c.isWall = false;
        this.length += 1
        var possibleDirs = [];
        if (y > 0) {
            possibleDirs.push(UP);
        }

        if (y + 1 < this.grid.getMaxY()) {
            possibleDirs.push(DOWN);
        }

        if (x > 0) {
            possibleDirs.push(LEFT);
        }

        if (x + 1 < this.grid.getMaxX()) {
            possibleDirs.push(RIGHT);
        }
        if (possibleDirs.length == 0) {
            return;
        }

        while (possibleDirs.length > 0 && this.length < GameConfig.DFS_PATH_SIZE) {
            var dirIndex = common.rand(possibleDirs.length);
            var nextX = x;
            var nextY = y;

            switch (possibleDirs[dirIndex]) {
                case UP:
                    nextY = y - 1;
                    break;
                case DOWN:
                    nextY = y + 1;
                    break;
                case LEFT:
                    nextX = x - 1;
                    break;
                case RIGHT:
                    nextX += 1;
                    break;
            }
            possibleDirs.splice(dirIndex, 1);

            this.dfs(nextX, nextY);
        }
        return;
    }

    getNeighbors(x, y): Array<Cell> {
        let result: Array<Cell> = [];

        if (x > 0)
            result.push(this.grid.getCell(x - 1, y));
        if (x + 1 < this.grid.getMaxX())
            result.push(this.grid.getCell(x + 1, y));
        if (y > 0)
            result.push(this.grid.getCell(x, y - 1));
        if (y + 1 < this.grid.getMaxY())
            result.push(this.grid.getCell(x, y + 1));
        return result;
    }

    /**
     * Evaluates whether placing a path at cell C would create a four cell loop.
     * 
     * For example, this would return true:
     * W W W
     * P P W
     * P c W
     * @param c cell to consider
     */
    createsFourCellLoop(c: Cell) {
        let isWallOrOffEdge = (cell: Cell) => cell === null || cell.isWall;
        let triples = [
            // (-1, -1) and (0, -1) are counted in the c2, c3 defs below
            [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1]
        ];

        let c1 = null;
        let c2 = this.grid.getCell(c.getX() - 1, c.getY() - 1);
        let c3 = this.grid.getCell(c.getX(), c.getY() - 1);
        for (let i = 2; i < triples.length; i++) {
            c1 = c2;
            c2 = c3;
            let nextPoint = triples.shift();
            c3 = this.grid.getCell(c.getX() + nextPoint[0], c.getY() + nextPoint[1]);

            if (!isWallOrOffEdge(c1) && !isWallOrOffEdge(c2) && !isWallOrOffEdge(c3)) {
                return true;
            }
        }

        return false;
    }
}