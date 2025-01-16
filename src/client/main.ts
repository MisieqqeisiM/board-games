import { HTMLBoard } from '../../components/board/board-html.ts';
import { HTMLDice } from '../../components/dice/dice-html.ts';
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
    // state.dice.addObserver(
    //   new HTMLDice(document.body, () => client.action(new RollAction())),
    // );
  },
});

new HTMLBoard(document.body, 5);

client.action(new RollAction());
