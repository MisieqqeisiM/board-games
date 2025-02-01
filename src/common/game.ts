import { Board, LocalBoard, Piece } from '../../components/board/board.ts';
import {
  Dice,
  DiceState,
  DiceUpdate,
  LocalDice,
} from '../../components/dice/dice.ts';

export interface ActionListener {
  roll(action: RollAction): void;
  movePiece(action: PieceMoveAction): void;
}

export interface Action {
  accept(listener: ActionListener): void;
}

export interface EventListener {
  roll(event: RollEvent): void;
  movePiece(event: PieceMoveEvent): void;
}

export interface Event {
  accept(listener: EventListener): void;
}

export interface Notifier {
  sendEvent(player: Player, event: Event): void;
}

export type Player = number;

export class State {
  constructor(
    public readonly dice: DiceState,
    public readonly board: Board,
    public readonly turn: number,
  ) {}
}

export class GlobalState {
  players: number = 0;
  turn: number = 0;
  dice: Dice = new Dice();
  board: Board = new Board();

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
      movePiece: (movePiece) => this.onPieceMove(player, movePiece),
    });
  }

  private onRoll(_player: Player, _action: RollAction) {
    const diceUpdate = this.dice.roll();
    this.sendToAllPlayers(new RollEvent(diceUpdate, _player));
  }
  private onPieceMove(player: Player, action: PieceMoveAction) {
    const event = new PieceMoveEvent(action.pieceId, action.x, action.y);
    this.sendToAllPlayers(event);
  }

  public getState(): State {
    return new State(this.dice.getState(), this.board, this.turn);
  }
}

export class RollAction implements Action {
  accept(listener: ActionListener): void {
    listener.roll(this);
  }
}

export class PieceMoveAction implements Action {
  constructor(
    public readonly pieceId: number,
    public readonly x: number,
    public readonly y: number,
  ) {}
  accept(listener: ActionListener): void {
    listener.movePiece(this);
  }
}

export class RollEvent implements Event {
  constructor(public diceUpdate: DiceUpdate, public readonly roller: number) {}

  accept(listener: EventListener): void {
    listener.roll(this);
  }
}

class PieceMoveEvent implements Event {
  constructor(
    public readonly pieceId: number,
    public readonly x: number,
    public readonly y: number,
  ) {}

  accept(listener: EventListener): void {
    listener.movePiece(this);
  }
}

export class LocalState implements EventListener {
  public readonly dice: LocalDice;
  public readonly board: LocalBoard;
  public readonly turn: number;

  constructor(state: State) {
    this.dice = new LocalDice(state.dice);
    this.board = new LocalBoard(state.board);
    this.turn = state.turn;
  }

  roll(event: RollEvent): void {
    this.dice.update(event.diceUpdate);
    this.board.updateMoveValue(event.diceUpdate.result);
  }

  movePiece(event: PieceMoveEvent): void {
    this.board.movePiece(event.pieceId, event.x, event.y);
  }
}

export const ACTIONS = [RollAction, PieceMoveAction];
export const EVENTS = [RollEvent, PieceMoveEvent];
