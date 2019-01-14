import {GameGrid} from "./gamegrid";
import {GameConfig} from "./config";
import * as PIXI from "pixi.js"; 
import * as sandTexture from "./assets/path.jpg";
import * as wallTexture from "./assets/wall.jpg";


/**
 * Class for managing the game. Assumes the document is ready at construction time.
 */
export class Game {
    maxY: number;
    maxX: number;
    grid: GameGrid;
    app: PIXI.Application;

    constructor() {
        this.initPixi();
        this.grid = new GameGrid(this);
    }

    public buildMaze() {
        this.grid.build();
    }

    public init(callback: Function) {
        window.document.body.appendChild(this.app.view);

        PIXI.loader
            .add(sandTexture)
            .add(wallTexture)
            .load(callback);

    }

    public addPath(): PIXI.Sprite {
        return this.addSprite(sandTexture.toString())
    }

    public addWall(): PIXI.Sprite {
        return this.addSprite(wallTexture.toString())
    }

    render() {
        this.grid.render();
    }

    private addSprite(texture: string): PIXI.Sprite {
        let sprite = new PIXI.Sprite(
            PIXI.loader.resources[texture].texture
        );
        sprite.width = GameConfig.CELL_SIZE;
        sprite.height = GameConfig.CELL_SIZE;

        this.app.stage.addChild(sprite);
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