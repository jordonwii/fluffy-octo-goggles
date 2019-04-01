/**
 * This file contains definitions of all of the socket.io endpoints. It's
 * shared across client+server. Do not use add an endpoint without definining it here.
 */

// Regular updates of all player states
export const PLAYER_STATE_UPDATES = "states";


// Emission of map data to a client
export const MAP = "map";

// Fires when a client finishes initial setup and we can set up their state on the server.
export const CLIENT_SETUP_FINISHED = "setup finished";

// Fires when a client sends an update on their state. Broadcast to other clients.
export const CLIENT_STATE_UPDATE = "state update";

// Fires when a new player has finished setup. Broadcast to other clients.
export const NEW_PLAYER = "new player";

// Fires when a client disconnects. Broadcast to other clients.
export const CLIENT_DISCONNECTED = "client disconnected";