export class HTMLBoard {
  private element: HTMLDivElement;

  constructor(wrapper: HTMLElement, n: number) {
    this.element = document.createElement('div');
    for (let x = 0; x < n; x++) {
      for (let y = 0; y < n; y++) {
        const field = document.createElement('div');
        field.classList.add('field');
        field.style.top = `${y * 50 + 6}px`;
        field.style.left = `${x * 50 + 6}px`;
        this.element.appendChild(field);
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
      this.element.classList.add('dragged');
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
