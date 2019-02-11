import * as sio from "socket.io-client";
import { Game } from "./game";

const SERVER_URL:string = "http://localhost:3000";

export class SocketService {
    private socket: SocketIOClient.Socket
    constructor(private game: Game) {
        this.socket = sio.connect(SERVER_URL);

        this.socket.on("new player", this.handleNewPlayer.bind(this));
    }

    addAsNewPlayer() {
        this.socket.emit("setup finished", {'pos': this.game.players[0].currentCell});
    }

    handleNewPlayer(data: any) {
        this.game.handleNewPlayer(data);
    }
}