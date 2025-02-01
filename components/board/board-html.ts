import { BoardObserver, LocalPiece, Piece, PieceObserver } from './board.ts';

const COLORS = [
  'red',
  'green',
  'blue',
  'yellow',
];

export class HTMLBoard implements BoardObserver {
  private element: HTMLDivElement;

  constructor(wrapper: HTMLElement) {
    const n = 11;
    this.element = document.createElement('div');

    for (let x = 0; x < n; x++) {
      for (let y = 0; y < n; y++) {
        if (((x >= 4 && x <= 6) || (y >= 4 && y <= 6)) && (x != 5 || y != 5)) {
          const field = document.createElement('div');
          field.classList.add('field');
          field.style.top = `${y * 50 + 6}px`;
          field.style.left = `${x * 50 + 6}px`;
          this.element.appendChild(field);
        }
      }
    }

    this.element.style.width = `${n * 50 + 6}px`;
    this.element.style.height = `${n * 50 + 6}px`;
    this.element.classList.add('board');
    wrapper.appendChild(this.element);
  }

  createPiece(piece: LocalPiece): PieceObserver {
    return new HTMLPiece(
      this.element,
      piece.piece.x,
      piece.piece.y,
      COLORS[piece.piece.player],
    );
  }
}

class HTMLPiece implements PieceObserver {
  private element: HTMLDivElement;
  private x: number;
  private y: number;
  private dragX: number = 0;
  private dragY: number = 0;

  private onMouseUp = () => {
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('mousemove', this.onDrag);
    this.element.classList.remove('dragged');
    this.setPosition(
      this.x,
      this.y,
    );
  };

  private onDrag = (e: MouseEvent) => {
    this.element.classList.add('dragged');
    this.setPosition(
      e.pageX - this.dragX + this.x,
      e.pageY - this.dragY + this.y,
    );
  };

  private setPosition(x: number, y: number) {
    this.element.style.transform = `translate(${x}px, ${y}px)`;
  }

  constructor(
    wrapper: HTMLElement,
    x: number,
    y: number,
    color: string,
  ) {
    this.element = document.createElement('div');
    this.element.classList.add('piece');
    this.element.style.backgroundColor = color;

    this.element.addEventListener('mousedown', (e) => {
      document.addEventListener('mouseup', this.onMouseUp);
      document.addEventListener('mousemove', this.onDrag);
      this.dragX = e.pageX;
      this.dragY = e.pageY;
    });

    this.x = 50 * x + 3 + 25;
    this.y = 50 * y + 3 + 25;
    this.setPosition(this.x, this.y);
    wrapper.appendChild(this.element);
  }

  onMove(x: number, y: number): void {
    this.x = 50 * x + 3 + 25;
    this.y = 50 * y + 3 + 25;
    this.onMouseUp();
  }
}
