import errorHandler from "errorhandler";
import * as sio from "socket.io";
import { createServer, Server } from 'http';
import app from "./app";
import { MapManager } from "./map_manager";
import { GameGrid } from "./shared/gamegrid";
import { Cell } from "./shared/cell";
import { PlayerState, Point, InitialPlayerState } from "./shared/player_state";
import { Orientation } from "./public/js/orientation";
import { MAP, CLIENT_SETUP_FINISHED, PLAYER_STATE_UPDATES, CLIENT_STATE_UPDATE, NEW_PLAYER, CLIENT_DISCONNECTED } from "./shared/events";

const NO_LOAD_ARG = "noload";

/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());

/**
 * Start Express server.
 */

export class FluffyOctoServer {
  server: Server;
  io: sio.Server;
  mapManager: MapManager;
  states: Map<string, PlayerState>;

  constructor() {
    this.server = createServer(app);
    this.io = sio.listen(this.server)
    this.mapManager = new MapManager();
    this.states = new Map<string, PlayerState>();
  }

  initAndRun() {
    let noLoad = false;
    if (process.argv.length > 2 && process.argv[2] == NO_LOAD_ARG) {
      noLoad = true;
    }
    this.mapManager.initMap(!noLoad).then(this.startServer.bind(this));
    this.io.on("connect", this.handleConnection.bind(this));
    setInterval(this.emitPlayerStates.bind(this), 100);
  }

  private startServer() {
    this.server.listen(app.get("port"), () => {
      console.log(
        "  App is running at http://localhost:%d in %s mode",
        app.get("port"),
        app.get("env")
      );
      console.log("  Press CTRL-C to stop\n");
    });
  }

  private handleConnection(socket: sio.Socket) {
    console.log('Connected client.');
    socket.emit(MAP, this.mapManager.wallArray);

    this.addSocketEvents(socket);
  }

  private addSocketEvents(socket: sio.Socket) {
    socket.on(CLIENT_SETUP_FINISHED, (initialState: InitialPlayerState) => {
      console.log("setup finished: ", initialState);
      this.states.set(socket.id, new PlayerState(Orientation.NONE, initialState.p, initialState.color))
      socket.broadcast.emit(NEW_PLAYER, initialState);
    });

    socket.on(CLIENT_STATE_UPDATE, (ps: PlayerState) => {
      console.log("Got state update for id %s: %s", socket.id, ps);
      this.states.set(socket.id, new PlayerState(
        ps.orientation,
        new Point(ps.p.x, ps.p.y),
        ps.color
      ));
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected');
      this.states.delete(socket.id);
      socket.broadcast.emit(CLIENT_DISCONNECTED, socket.id);
    });
  }

  private emitPlayerStates() {
    console.log("emitting states: ", this.states);
    let out = {}

    for (let [id, ps] of this.states.entries()) {
      out[id] = ps;
    }

    this.io.emit(PLAYER_STATE_UPDATES, out);
  }
}

let server: FluffyOctoServer = new FluffyOctoServer();
server.initAndRun();
export default server;
