import { Cell } from "./cell";


export class MapUtils {

    static wallArrayToCellArray(wallArray: boolean[][]): Cell[][] {
        let cellArray: Cell[][] = new Array<Array<Cell>>(wallArray.length);

        for (let y = 0; y < wallArray.length; y++) {
            cellArray[y] = new Array<Cell>();

            for (let [x, isWall] of wallArray[y].entries()) {
                cellArray[y][x] = new Cell(x, y, isWall);
            }
        }
        return cellArray;
    }
}