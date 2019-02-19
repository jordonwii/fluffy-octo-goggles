import errorHandler from "errorhandler";
import * as sio from "socket.io";
import { createServer, Server } from 'http';
import app from "./app";
import { MapManager } from "./map_manager";
import { GameGrid } from "./shared/gamegrid";
import { Cell } from "./shared/cell";
import { PlayerState, Point } from "./shared/player_state";
import { Orientation } from "./public/js/orientation";

/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
const server: Server = createServer(app);
let io: sio.Server = sio.listen(server);
const mapManager: MapManager = new MapManager();

let mapPromise = mapManager.initMap();

mapPromise.then(startServer);

let states: Map<string, PlayerState> = new Map<string, PlayerState>();

function startServer() {
  server.listen(app.get("port"), () => {
    console.log(
      "  App is running at http://localhost:%d in %s mode",
      app.get("port"),
      app.get("env")
    );
    console.log("  Press CTRL-C to stop\n");
  });

  setInterval(() => {
    console.log("states: ", states);
    let out = {}

    for (let [id, ps] of states.entries()) {
      out[id] = ps;
    }

    io.emit('states', out);
  }, 100)

  io.on('connect', (socket: any) => {
    console.log('Connected client.');
    socket.emit('map', mapManager.wallArray);
    socket.on('setup finished', (m) => {
      console.log("setup finished: ", m);
      states.set(socket.id, new PlayerState(Orientation.NONE, new Point(m.pos.x, m.pos.y)))
      socket.broadcast.emit('new player', { "id": socket.id, "x": m.pos.x, "y": m.pos.y });
    });

    socket.on('state update', (ps: PlayerState) => {
      console.log("Got state update for id %s: %s", socket.id, ps);
      states.set(socket.id, new PlayerState(
        ps.orientation,
        new Point(ps.p.x, ps.p.y)
      ));
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected');
      states.delete(socket.id);
      socket.broadcast.emit('disconnect client', socket.id);
    });
  });
}

export default server;
