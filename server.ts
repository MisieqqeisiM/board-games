import { GlobalState, Player } from './common.ts'

interface NetworkPlayer {

}

class ServerState {
    private loosePlayers: Player[] = [];
    private players: Map<NetworkPlayer, Player> = new Map();

    constructor(private state: GlobalState) { }

    public connect(player: NetworkPlayer) {
        if(this.state.canAddPlayer()) {
            this.players.set(player, this.state.addPlayer());
        }
    }
    public disconnect(player: NetworkPlayer) {
        const gamePlayer = this.players.get(player);
        if(gamePlayer == null) return;
        this.loosePlayers.push(gamePlayer);
        this.players.delete(player);
    }

}