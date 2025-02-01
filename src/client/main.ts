import { HTMLBoard } from '../../components/board/board-html.ts';
import { LocalBoard } from '../../components/board/board.ts';
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

    state.board.subscribe(new HTMLBoard(document.body));
    state.dice.subscribe(
      new HTMLDice(document.body, () => client.action(new RollAction())),
    );
  },
});

client.action(new RollAction());
