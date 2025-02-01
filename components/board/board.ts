import { parseXPendingConsumers } from 'https://deno.land/x/socket_io@0.2.1/vendor/deno.land/x/redis@v0.27.1/stream.ts';

const CYCLE: [number, number][] = [
  [6, 0],
  [6, 1],
  [6, 2],
  [6, 3],
  [6, 4],
  [7, 4],
  [8, 4],
  [9, 4],
  [10, 4],
  [10, 5],
  [10, 6],
  [9, 6],
  [8, 6],
  [7, 6],
  [6, 6],
  [6, 7],
  [6, 8],
  [6, 9],
  [6, 10],
  [5, 10],
  [4, 10],
  [4, 9],
  [4, 8],
  [4, 7],
  [4, 6],
  [3, 6],
  [2, 6],
  [1, 6],
  [0, 6],
  [0, 5],
  [0, 4],
  [1, 4],
  [2, 4],
  [3, 4],
  [4, 4],
  [4, 3],
  [4, 2],
  [4, 1],
  [4, 0],
  [5, 0],
  [5, 1],
  [5, 2],
  [5, 3],
  [5, 4],
];

const BASE: [number, number][] = [
  [8, 1],
  [9, 1],
  [8, 2],
  [9, 2],
];

const FINISH: [number, number][] = [[0, 4], [1, 5], [2, 5], [3, 5], [4, 5]];

function rotate([x, y]: [number, number]): [number, number] {
  return [y, 10 - x];
}

export class Board {
  public pieces: Piece[] = [];

  constructor() {
    let base = BASE;
    let nextPieceId = 0;
    for (let player = 0; player < 4; player++) {
      for (const [x, y] of base) {
        this.pieces.push(new Piece(nextPieceId, x, y, x, y, player));
        nextPieceId++;
      }
      base = base.map(rotate);
    }
  }
}

export class Piece {
  constructor(
    public readonly id: number,
    public readonly baseX: number,
    public readonly baseY: number,
    public x: number,
    public y: number,
    public player: number,
  ) {}
}

export interface BoardObserver {
  createPiece(piece: LocalPiece): PieceObserver;
}

export class LocalBoard {
  private pieces: LocalPiece[] = [];
  private observers: BoardObserver[] = [];
  private moveValue: number | null = null;

  constructor(board: Board) {
    this.pieces = board.pieces.map((piece) => new LocalPiece(piece));
  }

  public subscribe(observer: BoardObserver): void {
    this.observers.push(observer);
    this.pieces.forEach((piece) => {
      piece.subscribe(observer.createPiece(piece));
    });
  }

  public updateMoveValue(value: number | null) {
    this.moveValue = value;
    this.pieces.forEach((piece) => piece.onMovabilityUpdate());
  }

  private getPieceById(id: number): LocalPiece | undefined {
    return this.pieces.find((localPiece) => localPiece.piece.id === id);
  }

  public canMovePiece(piece: Piece): boolean {
    return this.moveValue === 6;
  }

  public movePiece(pieceId: number, x: number, y: number) {
    this.getPieceById(pieceId)?.move(x, y);
  }
}

export interface PieceObserver {
  onMovabilityUpdate(): void;
  onMove(x: number, y: number): void;
}

export class LocalPiece {
  private observers: PieceObserver[] = [];

  constructor(public readonly piece: Piece) {}

  public subscribe(observer: PieceObserver) {
    this.observers.push(observer);
  }

  public move(x: number, y: number) {
    this.observers.forEach((o) => o.onMove(x, y));
  }

  public onMovabilityUpdate() {
    this.observers.forEach((o) => o.onMovabilityUpdate());
  }
}

export interface BoardInteractor {
  getLocalPlayer(): number | null;
  getCurrentTurn(): number;
  canMovePiece(piece: Piece): boolean;
  getLegalMoves(piece: Piece): [number, number][];
  movePiece(pieceId: number, x: number, y: number): void;
}
