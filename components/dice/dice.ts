export class DiceUpdate {
  constructor(public result: number) {}
}

export class DiceState {
  constructor(public result: number) {}
}

export class Dice {
  private result = 1;

  public roll(): DiceUpdate {
    this.result = Math.floor(Math.random() * 6) + 1;
    return new DiceUpdate(this.result);
  }

  public getState(): DiceState {
    return new DiceState(this.result);
  }
}

export interface LocalDiceObserver {
  onRoll(): void;
  onUpdate(rolledValue: number): void;
}

export class LocalDice {
  private result = 1;
  private observers: LocalDiceObserver[] = [];

  constructor(state: DiceState) {
    this.result = state.result;
  }

  public subscribe(observer: LocalDiceObserver) {
    this.observers.push(observer);
  }

  public update(state: DiceUpdate) {
    this.result = state.result;
    this.observers.forEach((x) => x.onUpdate(state.result));
  }

  public roll() {
    this.observers.forEach((x) => x.onRoll());
  }
}
