import { ChessPiece, Player } from '../helpers/types';
import Piece from './piece';

export default class Pawn extends Piece {
	initialPositions: { 1: number[]; 2: number[]; };
	name: ChessPiece;

	constructor(player: Player) {
		super(
			player, 
			(
				player === Player.White
					? "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg" 
					: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg"
			)
		);
		this.initialPositions = {
			1: [48, 49, 50, 51, 52, 53, 54, 55],
			2: [8, 9, 10, 11, 12, 13, 14, 15]
		}
		this.name = ChessPiece.Pawn;
	}

	possibleMoves(src: number, squares, enpassant: boolean, lastTurnPawnPosition: number): number[] {
		const highLightMoves: number[] = [];
		if (this.player === 1 && ((src - 7) > 0 || (src - 9) > 0)) {
			if (squares[src - 8] === null && squares[src - 16] === null && this.initialPositions[this.player].indexOf(src) !== -1) {
				highLightMoves.push((src - 8));
				highLightMoves.push((src - 16));
			} else if (squares[src - 8] === null) {
				highLightMoves.push((src - 8));
			}
			if (squares[src - 9] !== null && src % 8 !== 0 && squares[src - 9].player === 2) {
				highLightMoves.push((src - 9));
			}
			if (squares[src - 7] !== null && (src + 1) % 8 !== 0 && squares[src - 7].player === 2) {
				highLightMoves.push((src - 7));
			}
			if (enpassant && squares[src - 1] !== null && src % 8 !== 0 && squares[src - 1].player === 2 && (src - 1) === lastTurnPawnPosition) {
				highLightMoves.push((src - 9));
			}
			if (enpassant && squares[src + 1] !== null && (src + 1) % 8 !== 0 && squares[src + 1].player === 2 && (src + 1) === lastTurnPawnPosition) {
				highLightMoves.push((src - 7));
			}
		} else if (this.player === 2 && ((src + 7) < 64 || (src + 9) < 64)) {
			if (squares[src + 8] === null && squares[src + 16] === null && this.initialPositions[this.player].indexOf(src) !== -1) {
				highLightMoves.push((src + 8));
				highLightMoves.push((src + 16));
			} else if (squares[src + 8] === null) {
				highLightMoves.push((src + 8));
			}
			if (squares[src + 9] !== null && (src + 1) % 8 !== 0 && squares[src + 9].player === 1) {
				highLightMoves.push((src + 9));
			}
			if (squares[src + 7] !== null && src % 8 !== 0 && squares[src + 7].player === 1) {
				highLightMoves.push((src + 7));
			}
			if (enpassant && squares[src - 1] !== null && src % 8 !== 0 && squares[src - 1].player === 1 && (src - 1) === lastTurnPawnPosition) {
				highLightMoves.push((src + 7));
			}
			if (enpassant && squares[src + 1] !== null && (src + 1) % 8 !== 0 && squares[src + 1].player === 1 && (src + 1) === lastTurnPawnPosition) {
				highLightMoves.push((src + 9));
			}
		}
		return highLightMoves;
	}

	possibleCaptureMoves(src: number, squares): number[] {
		const moves: number[] = [];
		if (this.player === 1 && (src - 7) > -1 && (src - 9) > -1) {
			if (src % 8 !== 0 && (src + 1) % 8 !== 0 && squares[src - 9] === null) {
				moves.push((src - 9));
			} else if (src % 8 !== 0 && (src + 1) % 8 !== 0 && squares[src - 9].player === 2) {
				moves.push((src - 9));
			}
			if (src % 8 !== 0 && (src + 1) % 8 !== 0 && squares[src - 7] === null) {
				moves.push((src - 7));
			} else if (src % 8 !== 0 && (src + 1) % 8 !== 0 && squares[src - 7].player === 2) {
				moves.push((src - 7));
			}
			if (src % 8 === 0 && squares[src - 7] === null) {
				moves.push((src - 7));
			} else if (src % 8 === 0 && squares[src - 7].player === 2) {
				moves.push((src - 7));
			}
			if ((src + 1) % 8 === 0 && squares[src - 9] === null) {
				moves.push((src - 9));
			} else if ((src + 1) % 8 === 0 && squares[src - 9].player === 2) {
				moves.push((src - 9));
			}
		}
		if (this.player === 2 && (src + 7) < 64 && (src + 9) < 64) {
			if (src % 8 !== 0 && (src + 1) % 8 !== 0 && squares[src + 9] === null) {
				moves.push((src + 9));
			} else if (src % 8 !== 0 && (src + 1) % 8 !== 0 && squares[src + 9].player === 1) {
				moves.push((src + 9));
			}
			if (src % 8 !== 0 && (src + 1) % 8 !== 0 && squares[src + 7] === null) {
				moves.push((src + 7));
			} else if (src % 8 !== 0 && (src + 1) % 8 !== 0 && squares[src + 7].player === 1) {
				moves.push((src + 7));
			}
			if (src % 8 === 0 && squares[src + 9] === null) {
				moves.push((src + 9));
			} else if (src % 8 === 0 && squares[src + 9].player === 1) {
				moves.push((src + 9));
			}
			if ((src + 1) % 8 === 0 && squares[src + 7] === null) {
				moves.push((src + 7));
			} else if ((src + 1) % 8 === 0 && squares[src + 7].player === 1) {
				moves.push((src + 7));
			}
		}
		return moves;
	}
}
