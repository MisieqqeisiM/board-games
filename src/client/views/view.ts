export interface View {
  init(manager: ViewManager): void;
}

export class ViewManager {
  setView(view: View): void {
    console.log(view);
    this.clear();
    view.init(this);
  }

  private clear(): void {
    while (document.body.lastChild) {
      document.body.removeChild(document.body.lastChild);
    }
  }
}
