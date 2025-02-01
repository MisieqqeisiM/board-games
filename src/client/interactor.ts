import { BoardInteractor, Piece } from '../../components/board/board.ts';
import { LocalState, PieceMoveAction } from '../common/game.ts';
import { Client } from './client.ts';

export class LocalInteractor implements BoardInteractor {
  constructor(private state: LocalState, private client: Client) {}

  getLocalPlayer(): number | null {
    return 1;
  }
  getCurrentTurn(): number {
    return this.state.turn;
  }
  canMovePiece(piece: Piece): boolean {
    return this.state.board.canMovePiece(piece);
  }
  getLegalMoves(piece: Piece): [number, number][] {
    return [];
  }

  movePiece(pieceId: number, x: number, y: number) {
    this.client.action(new PieceMoveAction(pieceId, x, y));
  }
}
