export class HTMLBoard {
  private element: HTMLDivElement;
  private static readonly CYCLE = [
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

  private static rotate([x, y]: [number, number]): [number, number] {
    return [y, 10 - x];
  }

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
    new HTMLPiece(this.element, 75 + 3, 75 + 3);
    wrapper.appendChild(this.element);
  }
}

class HTMLPiece {
  private element: HTMLDivElement;
  private x: number;
  private y: number;
  private dragX: number = 0;
  private dragY: number = 0;

  private onMouseUp = (_: MouseEvent) => {
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

  constructor(private wrapper: HTMLElement, x: number, y: number) {
    this.element = document.createElement('div');
    this.element.classList.add('piece');

    this.element.addEventListener('mousedown', (e) => {
      document.addEventListener('mouseup', this.onMouseUp);
      document.addEventListener('mousemove', this.onDrag);
      this.dragX = e.pageX;
      this.dragY = e.pageY;
    });

    this.x = x;
    this.y = y;
    this.setPosition(x, y);
    wrapper.appendChild(this.element);
  }
}
