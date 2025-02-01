import {
  BoardInteractor,
  BoardObserver,
  LocalPiece,
  Piece,
  PieceObserver,
} from './board.ts';

const COLORS = [
  'red',
  'green',
  'blue',
  'yellow',
];

class ObjectMap<K, V, IK = string> {
  private map: Map<IK, V> = new Map();

  constructor(private readonly keyGetter: (k: K) => IK) {}

  get(key: K): V | undefined {
    return this.map.get(this.keyGetter(key));
  }
  set(key: K, value: V) {
    this.map.set(this.keyGetter(key), value);
  }
}

export class HTMLBoard implements BoardObserver {
  private readonly SIZE = 50;
  private readonly OFFSET = 6;

  private element: HTMLDivElement;

  private highlightedFields: HTMLElement[] = [];

  private readonly fields: ObjectMap<[number, number], HTMLDivElement> =
    new ObjectMap(
      (k) => k.toString(),
    );

  private readonly STARTS: Map<string, [number, number]> = new Map([
    ['green', [0, 4]],
    ['red', [6, 0]],
    ['yellow', [10, 6]],
    ['blue', [4, 10]],
  ]);
  private readonly FINISHES: Map<string, [number, number][]> = new Map([
    ['green', [[1, 5], [2, 5], [3, 5], [4, 5]]],
    ['red', [[5, 1], [5, 2], [5, 3], [5, 4]]],
    ['yellow', [[9, 5], [8, 5], [7, 5], [6, 5]]],
    ['blue', [[5, 9], [5, 8], [5, 7], [5, 6]]],
  ]);

  constructor(
    wrapper: HTMLElement,
    private readonly interactor: BoardInteractor,
  ) {
    const n = 11;
    this.element = document.createElement('div');

    for (let x = 0; x < n; x++) {
      for (let y = 0; y < n; y++) {
        if (this.isLegalFieldPosition(x, y)) {
          const field = document.createElement('div');
          field.classList.add('field');
          field.style.top = `${y * this.SIZE + this.OFFSET}px`;
          field.style.left = `${x * this.SIZE + this.OFFSET}px`;
          field.classList.add('gray');
          this.fields.set([x, y], field);
          this.element.appendChild(field);
        }
      }
    }

    this.STARTS.forEach((field, color) => {
      this.fields.get(field)?.classList.remove('gray');
      this.fields.get(field)?.classList.add(color);
    });

    this.FINISHES.forEach((finishFields, color) =>
      finishFields.forEach((field) => {
        const f = this.fields.get(field);
        f?.classList.remove('gray');
        f?.classList.add(color);
        f?.classList.add('small');
      })
    );

    this.element.style.width = `${n * this.SIZE + this.OFFSET}px`;
    this.element.style.height = `${n * this.SIZE + this.OFFSET}px`;
    this.element.classList.add('board');
    wrapper.appendChild(this.element);
  }

  createPiece(piece: LocalPiece): PieceObserver {
    this.setFieldOccupied(piece.piece.x, piece.piece.y);
    return new HTMLPiece(
      this.element,
      this,
      piece.piece,
      COLORS[piece.piece.player],
      this.interactor,
    );
  }

  private isLegalFieldPosition(x: number, y: number): boolean {
    return (((x >= 4 && x <= 6) || (y >= 4 && y <= 6)) && (x != 5 || y != 5));
  }

  getField(x: number, y: number): [number, number] | null {
    const fx = Math.round((x - this.OFFSET) / this.SIZE);
    const fy = Math.round((y - this.OFFSET) / this.SIZE);
    if (this.isLegalFieldPosition(fx, fy)) {
      return [fx, fy];
    } else {
      return null;
    }
  }

  private isFinish(x: number, y: number) {
    return this.FINISHES.values()
      .some((fields) => fields.some((f) => x == f[0] && y == f[1]));
  }

  setFieldFree(x: number, y: number): void {
    if (this.isFinish(x, y)) {
      this.fields.get([x, y])?.classList.add('small');
    }
  }

  setFieldOccupied(x: number, y: number): void {
    if (this.isFinish(x, y)) {
      this.fields.get([x, y])?.classList.remove('small');
    }
  }

  highlightLegalMoves(piece: Piece): void {
    const legalMoves = this.interactor.getLegalMoves(piece);
    const elements = legalMoves.map((pos) => this.fields.get(pos)!);
    elements.forEach((element) => this.highlight(element));
    this.highlightedFields = elements;
  }

  hideLegalMoves(): void {
    this.highlightedFields.forEach((element) => this.unhighlight(element));
    this.highlightedFields = [];
  }

  highlight(element: HTMLElement) {
    element.classList.add('big');
  }
  unhighlight(element: HTMLElement) {
    element.classList.remove('big');
  }
}

class HTMLPiece implements PieceObserver {
  private element: HTMLDivElement;
  private x: number;
  private y: number;

  private pieceX: number;
  private pieceY: number;

  private dragX: number = 0;
  private dragY: number = 0;

  private centerX: number = 0;
  private centerY: number = 0;

  constructor(
    wrapper: HTMLElement,
    private readonly board: HTMLBoard,
    private readonly piece: Piece,
    color: string,
    private readonly boardInteractor: BoardInteractor,
  ) {
    this.element = document.createElement('div');
    this.element.classList.add('piece', color);

    this.pieceX = piece.x;
    this.pieceY = piece.y;

    this.x = 50 * piece.x + 3 + 25;
    this.y = 50 * piece.y + 3 + 25;
    this.setPosition(this.x, this.y);
    wrapper.appendChild(this.element);
    this.element.addEventListener("click", this.onClick);
  }

  onMovabilityUpdate(): void {
    this.setMovable(this.boardInteractor.canMovePiece(this.piece));
  }

  onMove(x: number, y: number): void {
    this.board.setFieldFree(this.pieceX, this.pieceY);
    this.board.setFieldOccupied(x, y);
    this.pieceX = x;
    this.pieceY = y;
    this.x = 50 * x + 3 + 25;
    this.y = 50 * y + 3 + 25;
    this.release();
  }

  private setMovable(movable: boolean) {
    if (movable) {
      this.element.classList.add('draggable');
      this.element.addEventListener('mousedown', this.onMouseDown);
    } else {
      this.element.classList.remove('draggable');
      this.element.removeEventListener('mousedown', this.onMouseDown);
    }
  }
  private release() {
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('mousemove', this.onDrag);
    this.element.classList.remove('dragged');
    this.setPosition(this.x, this.y);
    this.board.hideLegalMoves();
  }

  private onMouseUp = () => {
    const field = this.board.getField(this.centerX, this.centerY);
    this.release();
    if (field !== null) {
      this.boardInteractor.movePiece(this.piece.id, field[0], field[1]);
    }
  };

  private onDrag = (e: MouseEvent) => {
    this.element.classList.add('dragged');
    this.setPosition(
      e.pageX - this.dragX + this.x,
      e.pageY - this.dragY + this.y,
    );
  };

  private onMouseDown = (e: MouseEvent) => {
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('mousemove', this.onDrag);
    this.board.highlightLegalMoves(this.piece);
    this.dragX = e.pageX;
    this.dragY = e.pageY;
  };

  private onClick = () => {
    const moves = this.boardInteractor.getLegalMoves(this.piece);
    console.log(moves)
    if (moves.length === 1) {
      this.boardInteractor.movePiece(this.piece.id, moves[0][0], moves[0][1]);
    }
  };

  private setPosition(x: number, y: number) {
    this.centerX = x - 25;
    this.centerY = y - 25;
    this.element.style.transform = `translate(${x}px, ${y}px)`;
  }
}
