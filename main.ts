import { Server, Socket } from "https://deno.land/x/socket_io@0.2.1/mod.ts";
import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";

import { GlobalState, Player } from "./src/common/game.ts";
import { ClientToServer, ServerToClient } from "./src/common/common.ts";


type PlayerSocket = Socket<
  ClientToServer,
  ServerToClient,
  Record<string | number | symbol, never>,
  Record<string | number | symbol, never>
>;

if (import.meta.main) {
  const io = new Server<
    ClientToServer,
    ServerToClient,
    Record<string | number | symbol, never>,
    Record<string | number | symbol, never>
  >();

  const players : Map<Player, PlayerSocket> = new Map();

  const state = new GlobalState({
    sendEvent: (player, event) => {
      const socket = players.get(player);
      event.accept({
        roll: (roll) => {
          socket?.emit('roll', roll);
        }
      });
    }
  });

  io.on('connection', (socket) => {
    console.log(`socket ${socket.id} connected`);
    if(!state.canAddPlayer()) {
      socket.disconnect();
      return;
    }
    const player = state.addPlayer();

    socket.on('roll', (roll) => {
      state.onRoll(player, roll);
    });

    socket.on('disconnect', (_) => {
      players.delete(player);
    });

    players.set(player, socket);
    socket.emit('_init', state.getState());
  });

  Deno.serve({
    handler: io.handler((req, _) => serveDir(req, { fsRoot: 'client' })),
    port: 3000
  });
}
