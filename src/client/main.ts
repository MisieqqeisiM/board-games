import { io, Socket } from './libs.ts';
import { ActionListener, EventListener, RollAction } from "../common/game.ts";
import { ClientToServer, ServerToClient } from "../common/common.ts";

const socket: Socket<ServerToClient, ClientToServer> = io({autoConnect: false, transports: ["websocket"]});

socket.on("connect", ()=> {
    console.log("hello");
});

socket.on("_init", (state) => {
    console.log(state);
});

socket.on("roll", (roll) => {
    console.log(roll);
});

socket.connect();

socket.emit('roll', new RollAction());

