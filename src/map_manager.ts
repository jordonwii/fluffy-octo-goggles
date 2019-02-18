import { GameGrid } from "./shared/gamegrid";
import * as fs from "fs";
import { GameConfig } from "./shared/config";
import { Cell } from "./shared/cell";
import { MapUtils } from "./shared/map_utils";

const MAP_FILE_PATH: string = "map.json";

export class MapManager {
    grid: GameGrid;
    wallArray: boolean[][];
    private mapLoaded = false;

    initMap(): Promise<GameGrid> {
        // TODO: implement a lock file here.
        return new Promise(function(resolve, reject) { 
            fs.readFile(MAP_FILE_PATH, (err, data) => {
                if (err !== null) {
                    if (err.code === 'ENOENT') {
                        console.log("No map file found.");
                        this.createInitialMap();
                        this.saveMap();

                    } else {
                        reject(err);
                    }
                } else {
                    this.wallArray = JSON.parse(data.toString());
                    this.grid = new GameGrid(this.wallArray[0].length, this.wallArray.length, MapUtils.wallArrayToCellArray(this.wallArray));
                    console.log("successfully loaded existing map.");
                }

                resolve(this.grid);
                this.mapLoaded = true;
            });
        }.bind(this));
    }

    createInitialMap() {
        console.log("Creating initial map...");
        this.grid = new GameGrid(Math.floor(GameConfig.RENDERED_MAZE_WIDTH/GameConfig.CELL_SIZE), Math.floor(GameConfig.RENDERED_MAZE_HEIGHT/GameConfig.CELL_SIZE));
        this.grid.build();
    }

    saveMap() {
        fs.writeFile(MAP_FILE_PATH, JSON.stringify(this.createSaveableData()), (err) => {
            if (err) {
                console.error("Map save failed. Error: ", err, "Map: ", this.grid);
            }

            console.log("Saved map.");
        })
    }

    private createSaveableData() {
        return this.grid.copyAllCells().map((cellCol: Cell[]) => cellCol.map((c: Cell) => c.isWall));
    }
}