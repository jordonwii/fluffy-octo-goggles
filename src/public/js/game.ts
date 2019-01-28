import { GameGrid } from "./gamegrid";
import { Player } from "./player";
import { GameConfig } from "./config";
import * as PIXI from "pixi.js";
import { Orientation } from "./orientation";

const sandTexture = "../assets/path.jpg";
const wallTexture = "../assets/wall.jpg";
const pacmanOpen = "../assets/pacman_open.png";
const pacmanClosed = "../assets/pacman_closed.png";

/**
 * Class for managing the game. Assumes the document is ready at construction time.
 */
export class Game {
    maxY: number;
    maxX: number;
    grid: GameGrid;
    player: Player;
    app: PIXI.Application;

    constructor() {
        this.initPixi();
        this.grid = new GameGrid(this);
        this.player = new Player(this);
    }

    public buildMaze() {
        this.grid.build();
    }

    public init(callback: Function) {
        window.document.body.appendChild(this.app.view);

        PIXI.loader
            .add(sandTexture)
            .add(wallTexture)
            .add(pacmanOpen)
            .add(pacmanClosed)
            .load(function () {
                this.initLoadComplete(callback);
            }.bind(this));
    }

    private initLoadComplete(callback: Function) {
        this.grid.init();
        this.player.init();
        this.grid.render();

        this.addEventHandlers();
        this.app.ticker.add(this.render.bind(this));

        callback();
    }

    public addPath(): PIXI.Sprite {
        return this.addSprite(sandTexture.toString());
    }

    public addWall(): PIXI.Sprite {
        return this.addSprite(wallTexture.toString());
    }

    public addPlayer(): PIXI.extras.AnimatedSprite {
        let sprite = new PIXI.extras.AnimatedSprite([
            PIXI.loader.resources[pacmanOpen.toString()].texture,
            PIXI.loader.resources[pacmanClosed.toString()].texture
        ]);
        sprite.width = GameConfig.CELL_SIZE;
        sprite.height = GameConfig.CELL_SIZE;
        return sprite;
    }

    render() {
        this.player.render();
    }

    private addEventHandlers() {
        window.addEventListener("keydown", this.handleKeyDown.bind(this));
    }

    private handleKeyDown(e: KeyboardEvent) {
        let o: Orientation = Orientation.NONE;
        switch (e.key) {
            case "ArrowUp":
                o = Orientation.UP;
                break;
            case "ArrowDown":
                o = Orientation.DOWN;
                break;
            case "ArrowLeft":
                o = Orientation.LEFT;
                break;
            case "ArrowRight":
                o = Orientation.RIGHT;
                break;
        }

        if (o != Orientation.NONE) {
            this.player.setNextOrientation(o);
        }
    }

    private addSprite(texture: string): PIXI.Sprite {
        let sprite = new PIXI.Sprite(
            PIXI.loader.resources[texture].texture
        );
        sprite.width = GameConfig.CELL_SIZE;
        sprite.height = GameConfig.CELL_SIZE;
        return sprite;

    }

    private initPixi() {
        this.app = new PIXI.Application({
            backgroundColor: 0,
            autoResize: true,
        });

        this.app.renderer.view.style.position = "absolute";
        this.app.renderer.view.style.display = "block";
        this.app.renderer.resize(window.innerWidth, window.innerHeight);

        this.maxX = Math.round(window.innerWidth / GameConfig.CELL_SIZE);
        this.maxY = Math.round(window.innerHeight / GameConfig.CELL_SIZE);
    }
}