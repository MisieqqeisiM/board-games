import {
  ClientToServer,
  ServerToClient,
  Translator,
} from '../common/common.ts';
import { Action, ACTIONS, Event, EVENTS, State } from '../common/game.ts';
import { io, Socket } from './libs.ts';

export interface EventReceiver {
  event(e: Event): void;
  init(s: State): void;
}

export class Client {
  private static readonly EVENT_TRANSLATOR = new Translator<Event>(EVENTS);
  private static readonly ACTION_TRANSLATOR = new Translator<Event>(ACTIONS);

  private socket: Socket<ServerToClient, ClientToServer>;

  constructor(receiver: EventReceiver) {
    this.socket = io({ autoConnect: false, transports: ['websocket'] });

    this.socket.on('connect', () => {
      console.log('hello');
    });

    this.socket.on('init', (s) => {
      receiver.init(s);
    });

    this.socket.on('event', (id, data) => {
      const e = Client.EVENT_TRANSLATOR.from(id, data);
      if (e === null) throw new Error('unexpected event');
      receiver.event(e);
    });

    this.socket.connect();
  }

  public action(a: Action) {
    const [id, data] = Client.ACTION_TRANSLATOR.to(a) ?? (() => {
      throw new Error('unexpected action');
    })();
    this.socket.emit('action', id, data);
  }
}
