import { RenderableGameGrid } from "./renderablegamegrid";
import { Player } from "./player";
import { GameConfig } from "../../shared/config";
import * as PIXI from "pixi.js";
import { Orientation } from "./orientation";
import { SocketService, StateUpdate } from "./socket_service";
import { Cell } from "src/shared/cell";
import { PlayerState, InitialPlayerState, Point } from "../../shared/player_state";
import { PlayerColor } from "../../shared/player_color";

const sandTexture = "../assets/path.jpg";
const wallTexture = "../assets/wall.jpg";
const pacmanOpen = "../assets/pacman_open.png";
const pacmanClosed = "../assets/pacman_closed.png";
const pacmanOpenRed = "../assets/pacman_open_red.png";
const pacmanClosedRed = "../assets/pacman_closed_red.png";
const pacmanOpenBlue = "../assets/pacman_open_blue.png";
const pacmanClosedBlue = "../assets/pacman_closed_blue.png";

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

    lastSyncedState: PlayerState = null;
    initComplete: boolean = false;

    constructor() {
        this.initPixi();
        this.socketService = new SocketService(this);
        this.mainPlayer = new Player(this, "", (Math.random() > 0.5) ? PlayerColor.BLUE : PlayerColor.RED, true);
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
                .add(pacmanOpenRed)
                .add(pacmanClosedRed)
                .add(pacmanOpenBlue)
                .add(pacmanClosedBlue)
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

    public addPlayer(color: PlayerColor): PIXI.extras.AnimatedSprite {

        let openTexture, closedTexture:  string;
        switch (color) {
            case PlayerColor.DEFAULT:
              openTexture = pacmanOpen;
              closedTexture = pacmanClosed;
              break;
            case PlayerColor.RED:
              openTexture = pacmanOpenRed;
              closedTexture = pacmanClosedRed;
              break;
            case PlayerColor.BLUE:
              openTexture = pacmanOpenBlue;
              closedTexture = pacmanClosedBlue;
              break;
        }
        let sprite = new PIXI.extras.AnimatedSprite([
            PIXI.loader.resources[openTexture].texture,
            PIXI.loader.resources[closedTexture].texture
        ]);
        sprite.width = GameConfig.CELL_SIZE;
        sprite.height = GameConfig.CELL_SIZE;
        return sprite;
    }

    public handleNewPlayer(data: InitialPlayerState) {
        if (data.id == this.mainPlayer.getId()) {
            return;
        }
        console.log("got new player", data);
        let p: Player = new Player(this, data.id, data.color);
        this.otherPlayers.set(data.id, p);
        p.init();
        p.setPosition(data.p.x, data.p.y);
    }

    public handleMap(data: Cell[][]) {
        console.log("Got a new map: ", data);
        this.grid = new RenderableGameGrid(this, data);
    }

    public updatePlayerState(ps: PlayerState) {
        if (this.lastSyncedState === null || ps.orientation != this.lastSyncedState.orientation || ps.p.x != this.lastSyncedState.p.x || ps.p.y != this.lastSyncedState.p.y) {
            this.lastSyncedState = ps;
            this.socketService.updatePlayerState(ps);
        }
    }

    public updateStates(states: StateUpdate) {
        if (!this.initComplete) return;

        for (let id in states) {
            if (id == this.mainPlayer.getId()) {
                continue;
            }


            let state: PlayerState = states[id];
            let p: Player = this.otherPlayers.get(id);
            if (!p) {
                console.log("Creating new player %s to (%s, %s)", id, state.p.x, state.p.y);
                this.handleNewPlayer(new InitialPlayerState(
                    id,
                    new Point(state.p.x, state.p.y),
                    state.color
                ));
            } else {
                console.log("Updating player %s to (%s, %s)", id, state.p.x, state.p.y);
                p.setNextOrientation(state.orientation);

                if (Math.abs(p.currentCell.getX() - state.p.x) > 1 || Math.abs(p.currentCell.getY() - state.p.y) > 1) {
                    console.log("Player position out of sync, resetting.");
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