import { RenderableGameGrid } from "./renderablegamegrid";
import * as PIXI from "pixi.js";
import { Cell } from "../../shared/cell";
import { Game } from "./game";
import { rand } from "./common";
import { GameConfig } from "../../shared/config";
import { Orientation } from "./orientation";

export class Player {
    sprite: PIXI.extras.AnimatedSprite;
    currentCell: Cell;
    animating: boolean = false;
    currentOrientation: Orientation = Orientation.NONE;
    nextOrientation: Orientation = Orientation.NONE;


    constructor(private game: Game) { }

    init() {
        this.sprite = this.game.addPlayer();
        let bounds = this.sprite.getBounds();
        this.sprite.pivot.set(bounds.width / 2 / this.sprite.scale.x, bounds.height / 2 / this.sprite.scale.y);

        this.game.app.stage.addChild(this.sprite);

        this.sprite.loop = true;
        this.sprite.animationSpeed = GameConfig.PACMAN_ANIMATION_SPEED;
        this.sprite.play();


        let grid: RenderableGameGrid = this.game.grid;

        // Pick some random starting point.
        let haveValidPos = false;
        while (!haveValidPos) {
            let x = rand(this.game.maxX - 1);
            let y = rand(this.game.maxY - 1);

            let cell: Cell = grid.getCell(x, y);
            if (!cell.isWall) {
                haveValidPos = true;
                this.currentCell = cell;
            }
        }
        this.sprite.x = this.scaleCellValue(this.currentCell.getX());
        this.sprite.y = this.scaleCellValue(this.currentCell.getY());
    }

    render() {
        // If we finished our previous animation, set the animating value accordingly.
        if (this.animating && this.sprite.x == this.scaleCellValue(this.currentCell.getX()) && this.sprite.y == this.scaleCellValue(this.currentCell.getY())) {
            this.animating = false;
        };

        // If we're still moving between cells, just do the movement and nothing else.
        // An orientation changes triggered between cells is only applied once we get to the next cell.
        if (this.animating) {
            this.animateMovement();
        } else {
            // Apply any orientation changes
            let prevOrientation = this.currentOrientation;
            if (this.nextOrientation != Orientation.NONE) {
                this.currentOrientation = this.nextOrientation;
                this.nextOrientation = Orientation.NONE;
            }

            // Find the next cell.
            let nextCell: Cell;
            switch (this.currentOrientation) {
                case Orientation.UP:
                    nextCell = this.game.grid.getCell(this.currentCell.getX(), this.currentCell.getY() - 1);
                    break;
                case Orientation.DOWN:
                    nextCell = this.game.grid.getCell(this.currentCell.getX(), this.currentCell.getY() + 1);
                    break;
                case Orientation.LEFT:
                    nextCell = this.game.grid.getCell(this.currentCell.getX() - 1, this.currentCell.getY());
                    break;
                case Orientation.RIGHT:
                    nextCell = this.game.grid.getCell(this.currentCell.getX() + 1, this.currentCell.getY());
                    break;
            }

            // If the cell our next orientation is facing is a wall, reset our orientation to the previous value.
            if (!nextCell || nextCell.isWall) {
                this.currentOrientation = prevOrientation;
                return;
            }

            // Start animating to the next cell.
            this.rotateToOrientation();
            this.currentCell = nextCell;
            this.animating = true;
            // We need this animateMovement call here or we'll drop a frame every time we center on a cell.
            this.animateMovement();
        }
    }


    setNextOrientation(o: Orientation) {
        this.nextOrientation = o;
    }

    private animateMovement() {
        let animationAmount = GameConfig.CELL_SIZE / GameConfig.MOVEMENT_ANIMATION_FRAMES;
        switch (this.currentOrientation) {
            case Orientation.UP:
                this.sprite.y -= animationAmount;
                break;
            case Orientation.DOWN:
                this.sprite.y += animationAmount;
                break;
            case Orientation.LEFT:
                this.sprite.x -= animationAmount;
                break;
            case Orientation.RIGHT:
                this.sprite.x += animationAmount;
                break;
        }
    }

    /** Scales a {@type Cell} x or y value to the appropriate pixel value for the player sprite. */
    private scaleCellValue(value: number) {
        // Note: this assumes the sprite is square.
        return value * GameConfig.CELL_SIZE + this.sprite.width / 2;
    }

    private rotateToOrientation() {
        if (this.currentOrientation === Orientation.NONE) {
            return;
        }

        let angle: number;
        switch (this.currentOrientation) {
            case Orientation.UP:
                angle = 3 * Math.PI / 2;
                break;
            case Orientation.DOWN:
                angle = Math.PI / 2;
                break;
            case Orientation.LEFT:
                angle = Math.PI;
                break;
            case Orientation.RIGHT:
                angle = 0;
                break;
        }

        this.sprite.rotation = angle;
    }
}