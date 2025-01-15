import { Server } from 'https://deno.land/x/socket_io@0.2.1/mod.ts';
import { serveDir } from 'https://deno.land/std@0.224.0/http/file_server.ts';

import { GlobalState, Player } from '../common/game.ts';
import { ClientToServer, ServerToClient } from '../common/common.ts';
import { RemoteClient } from './remote_client.ts';

if (import.meta.main) {
  const io = new Server<
    ClientToServer,
    ServerToClient,
    Record<string | number | symbol, never>,
    Record<string | number | symbol, never>
  >();

  const players: Map<Player, RemoteClient> = new Map();

  const state = new GlobalState({
    sendEvent: (player, event) => {
      const client = players.get(player);
      client?.event(event);
    },
  });

  io.on('connection', (socket) => {
    console.log(`socket ${socket.id} connected`);
    if (!state.canAddPlayer()) {
      socket.disconnect();
      return;
    }
    const player = state.addPlayer();
    const client = new RemoteClient(socket, {
      action(a) {
        state.apply(player, a);
      },
      disconnect() {
        players.delete(player);
      },
    });

    players.set(player, client);
    client.init(state.getState());
  });

  Deno.serve({
    handler: io.handler((req, _) => serveDir(req, { fsRoot: 'client' })),
    port: 3000,
  });
}
