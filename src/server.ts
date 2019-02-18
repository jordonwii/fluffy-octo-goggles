import errorHandler from "errorhandler";
import * as sio from "socket.io";
import { createServer, Server } from 'http';
import app from "./app";
import { MapManager } from "./map_manager";
import { GameGrid } from "./shared/gamegrid";

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

function startServer() {
  server.listen(app.get("port"), () => {
    console.log(
      "  App is running at http://localhost:%d in %s mode",
      app.get("port"),
      app.get("env")
    );
    console.log("  Press CTRL-C to stop\n");
  });

  io.on('connect', (socket: any) => {
    console.log('Connected client.');
    socket.emit('map', mapManager.wallArray);
    socket.on('setup finished', (m) => {
      console.log("setup finished: ", m);
      socket.broadcast.emit('new player', { "id": socket.id, "x": m.pos.x, "y": m.pos.y });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
}

export default server;
