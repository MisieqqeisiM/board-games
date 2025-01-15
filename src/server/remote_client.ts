import {
  ClientToServer,
  ServerToClient,
  Translator,
} from '../common/common.ts';
import { Action, ACTIONS, Event, EVENTS, State } from '../common/game.ts';
import { Socket } from 'https://deno.land/x/socket_io@0.2.1/mod.ts';

export interface ActionReceiver {
  action(a: Action): void;
  disconnect(): void;
}

export type PlayerSocket = Socket<
  ClientToServer,
  ServerToClient,
  Record<string | number | symbol, never>,
  Record<string | number | symbol, never>
>;

export class RemoteClient {
  private static readonly EVENT_TRANSLATOR = new Translator<Event>(EVENTS);
  private static readonly ACTION_TRANSLATOR = new Translator<Event>(ACTIONS);

  constructor(private socket: PlayerSocket, receiver: ActionReceiver) {
    socket.on('action', (id, data) => {
      const a = RemoteClient.ACTION_TRANSLATOR.from(id, data);
      if (a === null) throw new Error('unexpected action');
      if (a !== null) receiver.action(a);
    });

    socket.on('disconnect', (_) => {
      receiver.disconnect();
    });
  }

  public event(e: Event) {
    const [id, data] = RemoteClient.EVENT_TRANSLATOR.to(e) ?? (() => {
      throw new Error('unexpected event');
    })();
    this.socket.emit('event', id, data);
  }

  public init(s: State) {
    this.socket.emit('init', s);
  }
}
