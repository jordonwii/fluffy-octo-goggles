import * as sio from "socket.io-client";
import { Game } from "./game";
import { MapUtils } from "../../shared/map_utils";
import { Cell } from "src/shared/cell";
import { Orientation } from "./orientation";

const SERVER_URL:string = "http://localhost:3000";

interface PositionUpdate { id: string, o: Orientation};

export class SocketService {
    private socket: SocketIOClient.Socket
    constructor(private game: Game) {}

    init(): Promise<SocketService> {
        return new Promise<SocketService>(function(resolve, reject) {
            this.socket = sio.connect(SERVER_URL);

            this.socket.on("connect", () => resolve(this));
            this.socket.on("new player", this.handleNewPlayer.bind(this));
            this.socket.on("map", this.handleMap.bind(this));
            this.socket.on("o update", this.handleOrientationUpdate.bind(this));
        }.bind(this));
    }

    addAsNewPlayer() {
        this.socket.emit("setup finished", {'pos': this.game.mainPlayer.currentCell});
    }

    handleNewPlayer(data: any) {
        this.game.handleNewPlayer(data);
    }

    handleMap(map: boolean[][]) {
        this.game.handleMap(MapUtils.wallArrayToCellArray(map));
    }

    updateOrientation(o: Orientation) {
        this.socket.emit("o update", o);
    }

    handleOrientationUpdate(data: PositionUpdate) {
        console.log("received updated orientation for: ", data.id);
        this.game.updatePlayerOrientation(data.id, data.o);
    }
}