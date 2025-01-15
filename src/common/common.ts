import { State, ActionListener, EventListener } from "./game.ts";

export interface ServerToClient extends EventListener {
    _init(state: State) : void;
};

export interface ClientToServer extends ActionListener {
}