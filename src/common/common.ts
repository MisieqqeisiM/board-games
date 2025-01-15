import { State } from './game.ts';

export interface ServerToClient {
  event(id: number, data: object): void;
  init(state: State): void;
}

export interface ClientToServer {
  action(id: number, data: object): void;
}

export class Translator<T extends object> {
  // deno-lint-ignore no-explicit-any
  constructor(private readonly types: { new (...args: any[]): T }[]) {}

  public from(id: number, data: object): T | null {
    if (id >= this.types.length) return null;
    Object.setPrototypeOf(data, this.types[id].prototype);
    return data as T;
  }

  public to(t: T): [number, object] | null {
    for (let i = 0; i < this.types.length; i++) {
      if (t.constructor === this.types[i]) {
        return [i, t];
      }
    }
    return null;
  }
}
