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

function rotate([x, y]: [number, number]): [number, number] {
  return [y, 10 - x];
}

export class Board {
  public pieces: Piece[] = [];

  constructor() {
    let base = BASE;
    for (let player = 0; player < 4; player++) {
      for (const [x, y] of base) {
        this.pieces.push(new Piece(x, y, player));
      }
      base = base.map(rotate);
    }
  }
}

export class Piece {
  constructor(public x: number, public y: number, public player: number) {}
}

export interface BoardObserver {
  createPiece(piece: LocalPiece): PieceObserver;
}

export class LocalBoard {
  private pieces: LocalPiece[] = [];
  private observers: BoardObserver[] = [];

  constructor(board: Board) {
    this.pieces = board.pieces.map((piece) => new LocalPiece(piece));
  }

  public subscribe(observer: BoardObserver): void {
    this.observers.push(observer);
    this.pieces.forEach((piece) => {
      piece.subscribe(observer.createPiece(piece));
    });
  }
}

export interface PieceObserver {
  onMove(x: number, y: number): void;
}

export class LocalPiece {
  private observers: PieceObserver[] = [];

  constructor(public readonly piece: Piece) {}

  public subscribe(observer: PieceObserver) {
    this.observers.push(observer);
  }
}
