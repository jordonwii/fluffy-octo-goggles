/**
 * Represents an invididual maze cell. 
 * 
 * Defaults to be colored white, but this can be changed.
 */
export class Cell {
    colorString: string;
    _isWall: boolean;

    constructor(isWall: boolean) {
        this.isWall = isWall;
    }

    get isWall() {
        return this._isWall;
    }

    set isWall(isWall: boolean) {
        this.colorString = isWall ? "#000000" : "#FFFFFF";
        this._isWall = isWall;
    }

    setColor(r: number, g: number, b: number) {
        this.colorString = 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }
}