import * as sio from "socket.io-client";
import { Game } from "./game";
import { MapUtils } from "../../shared/map_utils";
import { Cell } from "src/shared/cell";
import { Orientation } from "./orientation";
import { PlayerState } from "../../shared/player_state";

const SERVER_URL:string = "http://localhost:3000";

export interface StateUpdate {
    [index: string]: PlayerState;
}

export class SocketService {
    private socket: SocketIOClient.Socket
    constructor(private game: Game) {}

    init(): Promise<SocketService> {
        return new Promise<SocketService>(function(resolve, reject) {
            this.socket = sio.connect(SERVER_URL);

            this.socket.on("connect", () => resolve(this));
            this.socket.on("disconnect client", this.handleDisconnect.bind(this));
            this.socket.on("new player", this.handleNewPlayer.bind(this));
            this.socket.on("map", this.handleMap.bind(this));
            this.socket.on("states", this.handleStateUpdate.bind(this));
        }.bind(this));
    }

    getId() {
        return this.socket.id;
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

    updatePlayerState(ps: PlayerState) {
        this.socket.emit("state update", ps);
    }

    handleDisconnect(id: string) {
        this.game.removePlayer(id);
    }

    handleStateUpdate(states: StateUpdate & object) {
        console.log("received updated states: ", states);
        this.game.updateStates(states);
    }
}