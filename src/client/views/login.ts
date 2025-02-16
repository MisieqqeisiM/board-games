import { GameView } from './game.ts';
import { View, ViewManager } from './view.ts';

export class LoginView implements View {
  init(manager: ViewManager) {
    const token = getCookie('token');
    if (token.length != 0) {
      manager.setView(new GameView(token));
    } else {
      const input = document.createElement('input');
      input.setAttribute('type', 'text');
      const button = document.createElement('button');
      button.innerText = 'login';
      button.addEventListener('click', async () => {
        button.disabled = true;
        const response = await fetch(new Request(`/login?name=${input.value}`));
        const token = await response.text();
        setCookie('token', token, 10);
        manager.setView(new GameView(token));
      });
      document.body.appendChild(input);
      document.body.appendChild(button);
    }
  }
}

function getCookie(cname: string): string {
  const name = cname + '=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trimStart();
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

function setCookie(cname: string, cvalue: string, exdays: number) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  const expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}
