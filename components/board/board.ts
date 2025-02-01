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

type Position = [number, number];

const START: Position = [6, 0];

function rotate([x, y]: Position): Position {
  return [y, 10 - x];
}

export class BoardDto {
  constructor(public readonly pieces: PieceDto[]) {}
}

export class Board {
  constructor(public readonly pieces: Piece[]) {}

  static newBoard(): Board {
    let base = BASE;
    const pieces = [];
    let nextPieceId = 0;
    for (let player = 0; player < 4; player++) {
      for (const [x, y] of base) {
        pieces.push(new Piece(nextPieceId, x, y, x, y, player));
        nextPieceId++;
      }
      base = base.map(rotate);
    }
    return new Board(pieces);
  }

  static fromDto(dto: BoardDto): Board {
    return new Board(dto.pieces.map((pieceDto) => Piece.fromDto(pieceDto)));
  }

  public toDto() {
    return new BoardDto(this.pieces.map((p) => p.toDto()));
  }

  movePiece(pieceId: number, x: number, y: number): void {
    this.pieces.find((p) => p.id == pieceId)?.moveTo(x, y);
  }

  isValidMove(
    pieceId: number,
    target: Position,
    moveValue: number,
  ): boolean {
    const piece = this.pieces.find((p) => p.id == pieceId);
    if (piece === undefined) return false;
    return this.getLegalMoves(piece, moveValue).some((p) =>
      p[0] == target[0] && p[1] == target[1]
    );
  }

  private playerCycle(player: number): Position[] {
    let cycle = CYCLE;
    for (let i = 0; i < player; i++) {
      cycle = cycle.map(rotate);
    }
    return cycle;
  }

  private playerStart(player: number): Position {
    let start = START;
    for (let i = 0; i < player; i++) {
      start = rotate(start);
    }
    return start;
  }

  playerHasPieceAt(player: number, position: Position): boolean {
    return this.pieces.some((p) => p.player === player && p.isAt(position));
  }

  getLegalMoves(piece: Piece, moveValue: number): Position[] {
    return this.getCandidateMoves(piece, moveValue).filter((pos) =>
      !this.playerHasPieceAt(piece.player, pos)
    );
  }

  private getCandidateMoves(piece: Piece, moveValue: number): Position[] {
    if (piece.inBase() && moveValue == 6) {
      return [this.playerStart(piece.player)];
    } else if (piece.inBase()) {
      return [];
    }

    const cycle = this.playerCycle(piece.player);

    const currentIndex = cycle.findIndex((p) => piece.isAt(p));
    const targetIndex = currentIndex + moveValue;
    if (targetIndex >= cycle.length) return [];
    return [cycle[targetIndex]];
  }
}

export class PieceDto {
  constructor(
    public readonly id: number,
    public readonly baseX: number,
    public readonly baseY: number,
    public x: number,
    public y: number,
    public player: number,
  ) {}
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

  static fromDto(dto: PieceDto): Piece {
    return new Piece(dto.id, dto.baseX, dto.baseY, dto.x, dto.y, dto.player);
  }

  toDto(): PieceDto {
    return new PieceDto(
      this.id,
      this.baseX,
      this.baseY,
      this.x,
      this.y,
      this.player,
    );
  }

  isAt(position: Position) {
    return this.x == position[0] && this.y == position[1];
  }

  moveTo(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  inBase(): boolean {
    return this.x == this.baseX && this.y == this.baseY;
  }
}

export interface BoardObserver {
  createPiece(piece: LocalPiece): PieceObserver;
}

export class LocalBoard {
  private pieces: LocalPiece[] = [];
  private observers: BoardObserver[] = [];
  private moveValue: number | null = 0;

  constructor(private readonly board: Board) {
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
    return this.getLegalMoves(piece).length > 0;
  }

  public movePiece(pieceId: number, x: number, y: number) {
    if (this.moveValue == null) return;
    if (!this.board.isValidMove(pieceId, [x, y], this.moveValue)) return;
    this.takePieceAt(x, y);
    this.moveLocalPiece(this.getPieceById(pieceId)!, x, y);
    this.pieces.forEach((piece) => piece.onMovabilityUpdate());
  }

  private takePieceAt(x: number, y: number) {
    const piece = this.pieces.find((p) => p.piece.isAt([x, y]));
    if (piece != null) {
      this.moveLocalPiece(piece, piece.piece.baseX, piece.piece.baseY);
    }
  }

  private moveLocalPiece(piece: LocalPiece, x: number, y: number): void {
    this.board.movePiece(piece.piece.id, x, y);
    piece.move(x, y);
  }

  public getLegalMoves(piece: Piece): Position[] {
    if (this.moveValue !== null) {
      return this.board.getLegalMoves(piece, this.moveValue);
    } else {
      return [];
    }
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
