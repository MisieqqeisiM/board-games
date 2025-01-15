import { LocalDiceObserver } from './dice.ts';

export class HTMLDice implements LocalDiceObserver {
  private element: HTMLDivElement;

  constructor(private wrapper: HTMLElement, onClick: () => void) {
    this.element = document.createElement('div');
    this.element.classList.add('dice');
    this.element.addEventListener('click', (_) => onClick());
    this.element.innerText = '';
    wrapper.appendChild(this.element);
  }

  onRoll(): void {
    this.element.innerText = 'the dice is rolling...';
  }

  onUpdate(rolledValue: number): void {
    this.element.innerText = `${rolledValue}`;
  }
}
