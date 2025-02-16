import { LoginView } from './views/login.ts';
import { ViewManager } from './views/view.ts';

globalThis.onload = () => {
  const manager = new ViewManager();

  manager.setView(new LoginView());
};
