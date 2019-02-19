import { RenderableGameGrid } from "./renderablegamegrid";
import { Player } from "./player";
import { GameConfig } from "../../shared/config";
import * as PIXI from "pixi.js";
import { Orientation } from "./orientation";
import { SocketService, StateUpdate } from "./socket_service";
import { Cell } from "src/shared/cell";
import { PlayerState } from "../../shared/player_state";

const sandTexture = "../assets/path.jpg";
const wallTexture = "../assets/wall.jpg";
const pacmanOpen = "../assets/pacman_open.png";
const pacmanClosed = "../assets/pacman_closed.png";

export const TOP_OFFSET = Math.round(window.innerHeight - GameConfig.RENDERED_MAZE_HEIGHT) / 2;
export const LEFT_OFFSET = Math.round(window.innerWidth - GameConfig.RENDERED_MAZE_WIDTH) / 2;

/**
 * Class for managing the game. Assumes the document is ready at construction time.
 */
export class Game {
    maxY: number;
    maxX: number;
    grid: RenderableGameGrid;
    mainPlayer: Player;
    otherPlayers: Map<string, Player>;
    app: PIXI.Application;
    socketService: SocketService;
    initComplete: boolean = false;

    constructor() {
        this.initPixi();
        this.socketService = new SocketService(this);
        this.mainPlayer = new Player(this, "", true);
        this.otherPlayers = new Map<string, Player>();
    }

    public init(): Promise<void> {
        return new Promise((resolve, reject) => {
            let texturePromise = this.initTextures();
            let socketPromise = this.socketService.init()

            Promise.all([texturePromise, socketPromise]).then(() => {
                this.mainPlayer.setId(this.socketService.getId())
                this.socketService.addAsNewPlayer();
                this.initComplete = true;
                resolve();
            });
        });
    }

    private initTextures(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            window.document.body.appendChild(this.app.view);

            PIXI.loader
                .add(sandTexture)
                .add(wallTexture)
                .add(pacmanOpen)
                .add(pacmanClosed)
                .load(() => {
                    this.grid.init();
                    this.mainPlayer.init();
                    this.mainPlayer.setPosition();
                    this.grid.render();

                    this.addEventHandlers();
                    this.app.ticker.add(this.render.bind(this));
                    resolve();
                });
        })

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

    public handleNewPlayer(data) {
        console.log("got new player", data);
        let p: Player = new Player(this, data.id);
        this.otherPlayers.set(data.id, p);
        p.init();
        p.setPosition(data.x, data.y);
    }

    public handleMap(data: Cell[][]) {
        console.log("Got a new map: ", data);
        this.grid = new RenderableGameGrid(this, data);
    }

    public updatePlayerState(ps: PlayerState) {
        this.socketService.updatePlayerState(ps);
    }

    public updateStates(states: StateUpdate & object) {
        if (!this.initComplete) return;

        for (let id in states) {
            if (id == this.mainPlayer.getId()) {
                continue;
            }

            let state: PlayerState = states[id];
            let p: Player = this.otherPlayers.get(id);
            if (!p) {
                this.handleNewPlayer({
                    id: id,
                    x: state.p.x,
                    y: state.p.y
                });
            } else {
                p.setNextOrientation(state.orientation);

                if (Math.abs(p.currentCell.getX() - state.p.x) > 1 || Math.abs(p.currentCell.getY() - state.p.y) > 1) {
                    p.setPosition(state.p.x, state.p.y);
                }
            }

        }
    }

    public removePlayer(id: string) {
        let p: Player = this.otherPlayers.get(id);

        if (!p) {
            console.log("tried to delete non-existent player.");
            return;
        }

        p.remove();
        this.otherPlayers.delete(id);
    }

    render() {
        this.mainPlayer.render();
        for (let p of this.otherPlayers.values()) {
            p.render();

        }
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
            this.mainPlayer.setNextOrientation(o);
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

        this.maxX = Math.floor(GameConfig.RENDERED_MAZE_WIDTH / GameConfig.CELL_SIZE);
        this.maxY = Math.floor(GameConfig.RENDERED_MAZE_HEIGHT / GameConfig.CELL_SIZE);
    }
}