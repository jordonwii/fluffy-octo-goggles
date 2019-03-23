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
     * Evaluates whether placing a path at cell c would create a four cell loop.
     * 
     * For example, this would return true:
     * W W W
     * P P W
     * P c W
     * 
     * @param c cell to consider
     */
    createsFourCellLoop(c: Cell) {
        // If we get a cell over the edge of the map, we can't create a 4 cell loop with
        // that cell.
        let isWallOrOffEdge = (cell: Cell) => (cell === null || cell.isWall);

        // Each entry in this array is a triple of relative-offsets, centered at the corners.
        let triples = [
            // (-1, 0) and (-1, -1) are counted in the c2, c3 defs below
            [[-1, 0], [-1, -1], [0, -1]],
            [[0, -1], [1, -1], [1, 0]],
            [[1, 0], [1, 1], [0, 1]],
            [[0, 1], [-1, 1], [-1, 0]]
        ];

        for (let triple of triples) {
            // If any one of these three cells is a wall (or over the edge of the map),
            // then we can't create a 4-cell loop by converting the input cell to a path.
            let foundWallOrEdge = false;
            for (let pair of triple) {
                let compareCell = this.grid.getCell(c.getX() + pair[0], c.getY() + pair[1]);
                if (isWallOrOffEdge(compareCell)) {
                    foundWallOrEdge = true;
                    break;
                }
            }

            if (!foundWallOrEdge) {
                return true;
            }
        }

        return false;
    }
}