import {
  Dice,
  DiceState,
  DiceUpdate,
  LocalDice,
} from '../../components/dice/dice.ts';

export interface ActionListener {
  roll(action: RollAction): void;
}

export interface Action {
  accept(listener: ActionListener): void;
}

export interface EventListener {
  roll(event: RollEvent): void;
}

export interface Event {
  accept(listener: EventListener): void;
}

export interface Notifier {
  sendEvent(player: Player, event: Event): void;
}

export type Player = number;

export class State {
  constructor(public dice: DiceState) {}
}

export class GlobalState {
  players: number = 0;
  dice: Dice = new Dice();

  constructor(private notifier: Notifier) {}

  public canAddPlayer(): boolean {
    return true;
  }

  public addPlayer(): Player {
    return this.players++;
  }

  private sendToAllPlayers(event: Event): void {
    for (let i = 0; i < this.players; i++) {
      this.notifier.sendEvent(i, event);
    }
  }

  public apply(player: Player, action: Action) {
    action.accept({
      roll: (roll) => this.onRoll(player, roll),
    });
  }

  private onRoll(_player: Player, _action: RollAction) {
    const diceUpdate = this.dice.roll();
    this.sendToAllPlayers(new RollEvent(diceUpdate));
  }

  public getState(): State {
    return new State(this.dice.getState());
  }
}

export class RollAction implements Action {
  accept(listener: ActionListener): void {
    listener.roll(this);
  }
}

class RollEvent implements Event {
  constructor(public diceUpdate: DiceUpdate) {}

  accept(listener: EventListener): void {
    listener.roll(this);
  }
}

export class LocalState implements EventListener {
  public readonly dice: LocalDice;

  constructor(state: State) {
    this.dice = new LocalDice(state.dice);
  }

  roll(event: RollEvent): void {
    this.dice.update(event.diceUpdate);
  }
}

export const ACTIONS = [RollAction];
export const EVENTS = [RollEvent];
