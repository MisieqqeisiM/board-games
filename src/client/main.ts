import { LocalState, RollAction } from '../common/game.ts';
import { Client } from './client.ts';

let state: LocalState | undefined;

const client = new Client({
  event: (e) => {
    if (!state) throw new Error('event before init');
    e.accept(state);
  },
  init: (s) => {
    state = new LocalState(s);
  },
});

client.action(new RollAction());
