import { Game } from "./game.js";
import { GameGrid } from "./gamegrid.js";
import { GameConfig } from "./config.js";
import { Cell } from "./cell.js";
import { Maze } from "./maze.js";
import * as common from "./common.js";

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

    constructor(private game: Game, private grid: GameGrid) { }

    build() {
        this.dfs(common.rand(this.game.maxX-1), common.rand(this.game.maxY-1));

    }

    dfs(x: number, y: number) {
        let c: Cell = this.grid.getCell(x, y);
        if (this.length > GameConfig.DFS_PATH_SIZE || !c.isWall || this.getNeighbors(x, y).filter((x) => x === false).length > 1) {
            return;
        }

        c.isWall = false;
        this.length += 1
        var possibleDirs = [];
        if (y > 0) {
            possibleDirs.push(UP);
        }

        if (y + 1 < this.game.maxY) {
            possibleDirs.push(DOWN);
        }

        if (x > 0) {
            possibleDirs.push(LEFT);
        }

        if (x + 1 < this.game.maxX) {
            possibleDirs.push(RIGHT);
        }
        if (possibleDirs.length == 0) {
            return;
        }

        while (possibleDirs.length > 0 && this.length < GameConfig.DFS_PATH_SIZE) {
            var dirIndex = common.rand(possibleDirs.length - 1);
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

    getNeighbors(x, y) {
        var result = [];

        if (x > 0)
            result.push(this.grid.getCell(x-1, y).isWall);
        if (x + 1 < this.game.maxX)
            result.push(this.grid.getCell(x + 1, y).isWall);
        if (y > 0)
            result.push(this.grid.getCell(x, y - 1).isWall);
        if (y + 1 < this.game.maxY)
            result.push(this.grid.getCell(x, y + 1).isWall);
        return result;
    }
}