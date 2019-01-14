import { Game } from "./game";
import { GameGrid } from "./gamegrid";
import { Cell } from "./cell";
import { Maze } from "./maze";
import * as common from "./common";

/**
 * Builds a maze using the cellular automata method.
 * 
 * Contains a bunch of config params at the top of the functions. The currently
 * committed code uses the params of MAZE, defined at http://www.conwaylife.com/w/index.php?title=Maze.
 */
export class CAMaze implements Maze {
    readonly INIT_WALL_PROB = .5;
    readonly DEATH_MAX = 5;
    readonly DEATH_MIN = 1;
    readonly BIRTH_LIMIT = 3;
    readonly NUM_STEPS = 100;
    readonly STEP_DELAY = 10

    constructor(private game: Game, private grid: GameGrid) { }

    build() {
        for (var y = 0; y < this.game.maxY; y++) {
            for (var x = 0; x < this.game.maxX; x++) {
                this.grid.getCell(x, y).isWall = (Math.random() < this.INIT_WALL_PROB) ? true : false;
            }
        }

        this.game.render();

        // This loop gives us some time between each cellular automaton step. Not part of any final product,
        // but kind of cool to look at. 
        let renderCount = 0
        let timeout = setInterval(function () {
            if (renderCount == this.NUM_STEPS) {
                clearTimeout(timeout);
                this.renderConnectedComponents();
                return;
            }

            this.caStep();
            this.game.render();
            renderCount++;
        }.bind(this), this.STEP_DELAY)
    }

    caStep() {
        let oldGrid = this.grid.copyAllCells();
        for (var y = 0; y < this.game.maxY; y++) {
            for (var x = 0; x < this.game.maxX; x++) {
                let nbs = this.countAliveNeighbours(oldGrid, x, y);

                let cell = this.grid.getCell(x, y);
                if (cell.isWall) {
                    cell.isWall = (nbs !== this.BIRTH_LIMIT);
                } else {
                    cell.isWall = (nbs >= this.DEATH_MAX || nbs <= this.DEATH_MIN);
                }
            }
        }
    }

    /**
     * Draws the connected components in different colors.
     */
    renderConnectedComponents() {
        let visited: Array<number> = [];

        let explore = function (x: number, y: number, r: number, g: number, b: number) {
            if (visited.includes(y * this.game.maxY + x * this.game.maxX)) {
                return;
            }

            let c: Cell = this.grid.getCell(x, y);

            if (c.isWall) {
                return;
            }

            c.setColor(r, g, b);
            visited.push(y * this.game.maxY + x * this.game.maxX);

            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    // Ignore diagonals and (0,0)
                    if (Math.abs(i) === Math.abs(j)) {
                        continue;
                    }

                    let nextY = y + i;
                    let nextX = x + j;
                    if (nextX < 0 || nextY < 0 || nextY >= this.game.maxY || nextX >= this.game.maxX) {
                        continue;
                    }

                    explore(nextX, nextY, r, g, b);
                }
            }
        }.bind(this);

        for (let y = 0; y < this.game.maxY; y++) {
            for (let x = 0; x < this.game.maxX; x++) {
                explore(x, y, common.rand(255, 5), common.rand(255, 5), common.rand(255, 5));
            }
        }

        this.game.render();
    }

    private countAliveNeighbours(oldGrid: Array<Array<Cell>>, x: number, y: number) {
        let count = 0;

        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                let neighborX = x + i;
                let neighborY = y + j;

                if (i == 0 && j == 0) {
                    continue;
                }

                if (neighborX < 0 || neighborY < 0 || neighborY >= this.game.maxY || neighborX >= this.game.maxX) {
                    count = count + 1;
                }

                else if (!oldGrid[neighborY][neighborX].isWall) {
                    count = count + 1;
                }
            }
        }
        return count;
    }
}