import Piece from './piece.js';

export default class King extends Piece {
    constructor(player) {
        super(player, (player === 1 ? "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg" : "https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg"));
        this.name = "King";
    }

    possibleMoves(src, squares) {
        const highLightMoves = [];
        //go left
        if (squares[src - 1] === null && src % 8 !== 0) {
            highLightMoves.push((src - 1));
        }
        if (squares[src - 1] !== null && src % 8 !== 0 && squares[src - 1].player === 1 && squares[src].player === 2) {
            highLightMoves.push((src - 1));
        }
        if (squares[src - 1] !== null && src % 8 !== 0 && squares[src - 1].player === 2 && squares[src].player === 1) {
            highLightMoves.push((src - 1));
        }
        //go right
        if (squares[src + 1] === null && (src + 1) % 8 !== 0) {
            highLightMoves.push((src + 1));
        }
        if (squares[src + 1] !== null && (src + 1) % 8 !== 0 && squares[src + 1].player === 1 && squares[src].player === 2) {
            highLightMoves.push((src + 1));
        }
        if (squares[src + 1] !== null && (src + 1) % 8 !== 0 && squares[src + 1].player === 2 && squares[src].player === 1) {
            highLightMoves.push((src + 1));
        }
        //go up
        if (squares[src - 8] === null && (src - 8) > -1) {
            highLightMoves.push((src - 8));
        }
        if (squares[src - 8] !== null && (src - 8) > -1 && squares[src - 8].player === 1 && squares[src].player === 2) {
            highLightMoves.push((src - 8));
        }
        if (squares[src - 8] !== null && (src - 8) > -1 && squares[src - 8].player === 2 && squares[src].player === 1) {
            highLightMoves.push((src - 8));
        }
        //go down
        if (squares[src + 8] === null && (src + 8) < 64) {
            highLightMoves.push((src + 8));
        }
        if (squares[src + 8] !== null && (src + 8) < 64 && squares[src + 8].player === 1 && squares[src].player === 2) {
            highLightMoves.push((src + 8));
        }
        if (squares[src + 8] !== null && (src + 8) < 64 && squares[src + 8].player === 2 && squares[src].player === 1) {
            highLightMoves.push((src + 8));
        }
        //go upright
        if ((src - 7) > -1 && squares[src - 7] === null && (src + 1) % 8 !== 0) {
            highLightMoves.push((src - 7));
        }
        if ((src - 7) > -1 && squares[src - 7] !== null && (src + 1) % 8 !== 0 && squares[src - 7].player === 1 && squares[src].player === 2) {
            highLightMoves.push((src - 7));
        }
        if ((src - 7) > -1 && squares[src - 7] !== null && (src + 1) % 8 !== 0 && squares[src - 7].player === 2 && squares[src].player === 1) {
            highLightMoves.push((src - 7));
        }
        //go upleft
        if ((src - 9) > -1 && squares[src - 9] === null && src % 8 !== 0) {
            highLightMoves.push((src - 9));
        }
        if ((src - 9) > -1 && squares[src - 9] !== null && src % 8 !== 0 && squares[src - 9].player === 1 && squares[src].player === 2) {
            highLightMoves.push((src - 9));
        }
        if ((src - 9) > -1 && squares[src - 9] !== null && src % 8 !== 0 && squares[src - 9].player === 2 && squares[src].player === 1) {
            highLightMoves.push((src - 9));
        }
        //go downleft
        if ((src + 7) < 64 && squares[src + 7] === null && src % 8 !== 0) {
            highLightMoves.push((src + 7));
        }
        if ((src + 7) < 64 && squares[src + 7] !== null && src % 8 !== 0 && squares[src + 7].player === 1 && squares[src].player === 2) {
            highLightMoves.push((src + 7));
        }
        if ((src + 7) < 64 && squares[src + 7] !== null && src % 8 !== 0 && squares[src + 7].player === 2 && squares[src].player === 1) {
            highLightMoves.push((src + 7));
        }
        //go downright
        if ((src + 9) < 64 && squares[src + 9] === null && (src + 1) % 8 !== 0) {
            highLightMoves.push((src + 9));
        }
        if ((src + 9) < 64 && squares[src + 9] !== null && (src + 1) % 8 !== 0 && squares[src + 9].player === 1 && squares[src].player === 2) {
            highLightMoves.push((src + 9));
        }
        if ((src + 9) < 64 && squares[src + 9] !== null && (src + 1) % 8 !== 0 && squares[src + 9].player === 2 && squares[src].player === 1) {
            highLightMoves.push((src + 9));
        }
        return highLightMoves;
    }
}