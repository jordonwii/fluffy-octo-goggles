import * as sio from "socket.io-client";
import { Game } from "./game";
import { MapUtils } from "../../shared/map_utils";
import { PlayerState, InitialPlayerState, Point } from "../../shared/player_state";
import { NEW_PLAYER, MAP, CLIENT_STATE_UPDATE, CLIENT_SETUP_FINISHED, CLIENT_DISCONNECTED, PLAYER_STATE_UPDATES } from "../../shared/events";

const SERVER_URL: string = window.location.host;

interface StateUpdateInterface {
    [index: string]: PlayerState;
}

// The exported version should match the interface, but also include
// methods on object.
export type StateUpdate = StateUpdateInterface & object; 

export class SocketService {
    private socket: SocketIOClient.Socket
    constructor(private game: Game) {}

    init(): Promise<SocketService> {
        return new Promise<SocketService>(function(resolve, reject) {
            this.socket = sio.connect(SERVER_URL);

            this.socket.on("connect", () => resolve(this));
            this.socket.on(CLIENT_DISCONNECTED, this.handleDisconnect.bind(this));
            this.socket.on(NEW_PLAYER, this.handleNewPlayer.bind(this));
            this.socket.on(MAP, this.handleMap.bind(this));
            this.socket.on(PLAYER_STATE_UPDATES, this.handleStateUpdate.bind(this));
        }.bind(this));
    }

    getId() {
        return this.socket.id;
    }

    addAsNewPlayer() {
        this.socket.emit(CLIENT_SETUP_FINISHED, new InitialPlayerState(null, new Point(this.game.mainPlayer.currentCell.getX(), this.game.mainPlayer.currentCell.getY()), this.game.mainPlayer.getColor()));
    }

    handleNewPlayer(data: InitialPlayerState) {
        this.game.handleNewPlayer(data);
    }

    handleMap(map: boolean[][]) {
        this.game.handleMap(MapUtils.wallArrayToCellArray(map));
    }

    updatePlayerState(ps: PlayerState) {
        this.socket.emit(CLIENT_STATE_UPDATE, ps);
    }

    handleDisconnect(id: string) {
        this.game.removePlayer(id);
    }

    handleStateUpdate(states: StateUpdate) {
        this.game.updateStates(states);
    }
}