import { HTMLBoard } from '../../../components/board/board-html.ts';
import { HTMLDice } from '../../../components/dice/dice-html.ts';
import { LocalState, RollAction } from '../../common/game.ts';
import { Client } from '../client.ts';
import { LocalInteractor } from '../interactor.ts';
import { View } from './view.ts';

export class GameView implements View {
  constructor(private token: string) {}

  init() {
    let state: LocalState | undefined;

    const client = new Client({
      event: (e) => {
        if (!state) throw new Error('event before init');
        e.accept(state);
      },
      init: (s) => {
        state = new LocalState(s);

        const interactor = new LocalInteractor(state, client);
        document.body.innerHTML = '';
        state.board.subscribe(new HTMLBoard(document.body, interactor));
        state.dice.subscribe(
          new HTMLDice(document.body, () => client.action(new RollAction())),
        );
      },
    }, this.token);
  }
}
