import {GameGrid} from "./gamegrid";
import {GameConfig} from "./config";
import * as PIXI from "pixi.js"; 


/**
 * Class for managing the game. Assumes the document is ready at construction time.
 */
export class Game {
    maxY: number;
    maxX: number;
    grid: GameGrid;

    constructor(private canvas: HTMLCanvasElement, private ctx: CanvasRenderingContext2D) {
        this.initCanvas();

        this.grid = new GameGrid(this);
    }

    public buildMaze() {
        this.grid.build();
    }

    render() {
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.grid.render();
    }

    getContext(): CanvasRenderingContext2D {
        return this.ctx;
    }

    /**
     * Initializes the canvas.
     */
    private initCanvas() {
        // Scale up the canvas by the DPR, then scale back down with CSS.
        // www.html5rocks.com/en/tutorials/canvas/hidpi
        var dpr = window.devicePixelRatio || 1;

        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;

        this.canvas.style.width = window.innerWidth + "px";
        this.canvas.style.height = window.innerHeight + "px";

        this.ctx.scale(dpr, dpr);

        this.maxX = Math.round(window.innerWidth / GameConfig.CELL_SIZE);
        this.maxY = Math.round(window.innerHeight / GameConfig.CELL_SIZE);
    }
}