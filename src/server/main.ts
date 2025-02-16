import { Server } from 'https://deno.land/x/socket_io@0.2.1/mod.ts';
import { serveDir } from 'https://deno.land/std@0.224.0/http/file_server.ts';
import { create, verify } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';

import { GlobalState, Player } from '../common/game.ts';
import {
  ClientToServer,
  ServerToClient,
  SocketData,
} from '../common/common.ts';
import { RemoteClient } from './remote_client.ts';

import { Application, Router } from 'https://deno.land/x/oak@v17.1.4/mod.ts';
import { context } from 'https://deno.land/x/esbuild@v0.21.2/mod.js';

if (import.meta.main) {
  const key = await crypto.subtle.generateKey(
    { name: 'HMAC', hash: 'SHA-512' },
    true,
    ['sign', 'verify'],
  );

  const io = new Server<
    ClientToServer,
    ServerToClient,
    Record<string | number | symbol, never>,
    SocketData
  >();

  const players: Map<Player, RemoteClient> = new Map();

  const state = new GlobalState({
    sendEvent: (player, event) => {
      const client = players.get(player);
      client?.event(event);
    },
  });

  io.on('connection', async (socket) => {
    console.log(`socket ${socket.id} connected`);
    const token = socket.handshake.auth.token as string | null;
    if (!token) {
      socket.disconnect();
      return;
    }
    try {
      const payload = await verify<{ name: string }>(token, key);
      console.log(payload);
    } catch {
      socket.disconnect();
      return;
    }
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

  const app = new Application();
  const router = new Router();

  router.get('/login', async (ctx) => {
    const name = ctx.request.url.searchParams.get('name');
    if (!name) {
      ctx.response.status = 400;
      return;
    }
    const jwt = await create({ alg: 'HS512', typ: 'JWT' }, { name }, key);
    ctx.response.body = jwt;
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  app.use(async (ctx, next) => {
    const root = `${Deno.cwd()}/client`;
    try {
      await ctx.send({ root });
    } catch {
      next();
    }
  });

  Deno.serve({
    handler: io.handler(async (req, _) => {
      return await app.handle(req) || new Response(null, { status: 404 });
    }),
    port: 3000,
  });
}
