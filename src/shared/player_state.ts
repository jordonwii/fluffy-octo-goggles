import { Orientation } from "src/public/js/orientation";
import { PlayerColor } from "./player_color";

export class Point {
    constructor(readonly x: number, readonly y: number) {};
}
export class PlayerState {
    constructor(public orientation: Orientation, public p: Point, public color: PlayerColor) {}
}

export class InitialPlayerState {
    constructor(public id: string, public p: Point, public color: PlayerColor) {}
}