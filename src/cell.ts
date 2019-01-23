/**
 * Represents an invididual maze cell. 
 * 
 * Defaults to be colored white, but this can be changed.
 */
export class Cell {
    colorString: string;
    _isWall: boolean;

    constructor(private x: number, private y: number, isWall: boolean) {
        this.isWall = isWall;
    }

    get isWall() {
        return this._isWall;
    }

    set isWall(isWall: boolean) {
        this.colorString = isWall ? "#000000" : "#FFFFFF";
        this._isWall = isWall;
    }

    getX(): number {
        return this.x;
    }

    getY(): number {
        return this.y;
    }

    setColor(r: number, g: number, b: number) {
        this.colorString = 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }
}