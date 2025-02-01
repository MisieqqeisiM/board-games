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

  private readonly COLORED: Map<string, [number, number][]> = new Map([
    ['green', [[0, 4], [1, 5], [2, 5], [3, 5], [4, 5]]],
    ['red', [[6, 0], [5, 1], [5, 2], [5, 3], [5, 4]]],
    ['yellow', [[10, 6], [9, 5], [8, 5], [7, 5], [6, 5]]],
    ['blue', [[4, 10], [5, 9], [5, 8], [5, 7], [5, 6]]],
  ]);

  constructor(
    wrapper: HTMLElement,
    private readonly interactor: BoardInteractor,
  ) {
    const n = 11;
    this.element = document.createElement('div');
    const fields: ObjectMap<[number, number], HTMLDivElement> = new ObjectMap(
      (k) => k.toString(),
    );

    for (let x = 0; x < n; x++) {
      for (let y = 0; y < n; y++) {
        if (this.isLegalFieldPosition(x, y)) {
          const field = document.createElement('div');
          field.classList.add('field');
          field.style.top = `${y * this.SIZE + this.OFFSET}px`;
          field.style.left = `${x * this.SIZE + this.OFFSET}px`;
          field.classList.add('gray');
          fields.set([x, y], field);
          this.element.appendChild(field);
        }
      }
    }

    this.COLORED.forEach((coloredFields, color) =>
      coloredFields.forEach((field) => {
        const f = fields.get(field);
        f?.classList.remove('gray');
        f?.classList.add(color);
      })
    );

    this.element.style.width = `${n * this.SIZE + this.OFFSET}px`;
    this.element.style.height = `${n * this.SIZE + this.OFFSET}px`;
    this.element.classList.add('board');
    wrapper.appendChild(this.element);
  }

  createPiece(piece: LocalPiece): PieceObserver {
    return new HTMLPiece(
      this.element,
      this,
      piece.piece,
      piece.piece.x,
      piece.piece.y,
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
}

class HTMLPiece implements PieceObserver {
  private element: HTMLDivElement;
  private x: number;
  private y: number;
  private dragX: number = 0;
  private dragY: number = 0;

  private centerX: number = 0;
  private centerY: number = 0;

  constructor(
    wrapper: HTMLElement,
    private readonly board: HTMLBoard,
    private readonly piece: Piece,
    x: number,
    y: number,
    color: string,
    private readonly boardInteractor: BoardInteractor,
  ) {
    this.element = document.createElement('div');
    this.element.classList.add('piece', color);

    this.x = 50 * x + 3 + 25;
    this.y = 50 * y + 3 + 25;
    this.setPosition(this.x, this.y);
    wrapper.appendChild(this.element);
  }

  onMovabilityUpdate(): void {
    this.setMovable(this.boardInteractor.canMovePiece(this.piece));
  }

  onMove(x: number, y: number): void {
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
  }

  private onMouseUp = () => {
    const field = this.board.getField(this.centerX, this.centerY);
    this.release();
    if (field !== null) {
      this.boardInteractor.movePiece(this.piece.id, field[0], field[1]);
      this.onMove(field[0], field[1])
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
    this.dragX = e.pageX;
    this.dragY = e.pageY;
  };

  private setPosition(x: number, y: number) {
    this.centerX = x - 25;
    this.centerY = y - 25;
    this.element.style.transform = `translate(${x}px, ${y}px)`;
  }
}
