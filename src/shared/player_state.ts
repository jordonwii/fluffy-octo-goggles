import { Orientation } from "src/public/js/orientation";

export class Point {
    constructor(readonly x: number, readonly y: number) {};
}
export class PlayerState {
    constructor(public orientation: Orientation, public p: Point) {}
}