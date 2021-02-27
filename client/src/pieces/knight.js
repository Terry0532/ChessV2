import Piece from './piece.js';

export default class Knight extends Piece {
    constructor(player) {
        super(player, (player === 1 ? "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg" : "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg"));
        this.name = "Knight";
    }

    possibleMoves(src, squares) {
        const highLightMoves = [];
        if (src - 17 > -1 && squares[src - 17] === null && src % 8 !== 0) {
            highLightMoves.push((src - 17));
        }
        if (src - 17 > -1 && squares[src - 17] !== null && squares[src - 17].player === 2 && src % 8 !== 0 && squares[src].player === 1) {
            highLightMoves.push((src - 17));
        }
        if (src - 17 > -1 && squares[src - 17] !== null && squares[src - 17].player === 1 && src % 8 !== 0 && squares[src].player === 2) {
            highLightMoves.push((src - 17));
        }
        if (src - 10 > -1 && src % 8 !== 0 && (src - 1) % 8 !== 0 && squares[src - 10] === null && src % 8 !== 0) {
            highLightMoves.push((src - 10));
        }
        if (src - 10 > -1 && src % 8 !== 0 && (src - 1) % 8 !== 0 && squares[src - 10] !== null && squares[src - 10].player === 2 && src % 8 !== 0 && squares[src].player === 1) {
            highLightMoves.push((src - 10));
        }
        if (src - 10 > -1 && src % 8 !== 0 && (src - 1) % 8 !== 0 && squares[src - 10] !== null && squares[src - 10].player === 1 && src % 8 !== 0 && squares[src].player === 2) {
            highLightMoves.push((src - 10));
        }
        if (src + 6 < 64 && squares[src + 6] === null && src % 8 !== 0 && (src - 1) % 8 !== 0) {
            highLightMoves.push((src + 6));
        }
        if (src + 6 < 64 && squares[src + 6] !== null && squares[src + 6].player === 2 && src % 8 !== 0 && (src - 1) % 8 !== 0 && squares[src].player === 1) {
            highLightMoves.push((src + 6));
        }
        if (src + 6 < 64 && squares[src + 6] !== null && squares[src + 6].player === 1 && src % 8 !== 0 && (src - 1) % 8 !== 0 && squares[src].player === 2) {
            highLightMoves.push((src + 6));
        }
        if (src + 15 < 64 && squares[src + 15] === null && src % 8 !== 0) {
            highLightMoves.push((src + 15));
        }
        if (src + 15 < 64 && squares[src + 15] !== null && squares[src + 15].player === 2 && src % 8 !== 0 && squares[src].player === 1) {
            highLightMoves.push((src + 15));
        }
        if (src + 15 < 64 && squares[src + 15] !== null && squares[src + 15].player === 1 && src % 8 !== 0 && squares[src].player === 2) {
            highLightMoves.push((src + 15));
        }
        if (src - 15 > -1 && squares[src - 15] === null && (src + 1) % 8 !== 0) {
            highLightMoves.push((src - 15));
        }
        if (src - 15 > -1 && squares[src - 15] !== null && squares[src - 15].player === 2 && (src + 1) % 8 !== 0 && squares[src].player === 1) {
            highLightMoves.push((src - 15));
        }
        if (src - 15 > -1 && squares[src - 15] !== null && squares[src - 15].player === 1 && (src + 1) % 8 !== 0 && squares[src].player === 2) {
            highLightMoves.push((src - 15));
        }
        if (src - 6 > -1 && squares[src - 6] === null && (src + 1) % 8 !== 0 && (src + 2) % 8 !== 0) {
            highLightMoves.push((src - 6));
        }
        if (src - 6 > -1 && squares[src - 6] !== null && squares[src - 6].player === 2 && (src + 1) % 8 !== 0 && (src + 2) % 8 !== 0 && squares[src].player === 1) {
            highLightMoves.push((src - 6));
        }
        if (src - 6 > -1 && squares[src - 6] !== null && squares[src - 6].player === 1 && (src + 1) % 8 !== 0 && (src + 2) % 8 !== 0 && squares[src].player === 2) {
            highLightMoves.push((src - 6));
        }
        if (src + 10 < 64 && squares[src + 10] === null && (src + 2) % 8 !== 0 && (src + 1) % 8 !== 0) {
            highLightMoves.push((src + 10));
        }
        if (src + 10 < 64 && squares[src + 10] !== null && squares[src + 10].player === 2 && (src + 2) % 8 !== 0 && (src + 1) % 8 !== 0 && squares[src].player === 1) {
            highLightMoves.push((src + 10));
        }
        if (src + 10 < 64 && squares[src + 10] !== null && squares[src + 10].player === 1 && (src + 2) % 8 !== 0 && (src + 1) % 8 !== 0 && squares[src].player === 2) {
            highLightMoves.push((src + 10));
        }
        if (src + 17 < 64 && squares[src + 17] === null && (src + 1) % 8 !== 0) {
            highLightMoves.push((src + 17));
        }
        if (src + 17 < 64 && squares[src + 17] !== null && squares[src + 17].player === 2 && (src + 1) % 8 !== 0 && squares[src].player === 1) {
            highLightMoves.push((src + 17));
        }
        if (src + 17 < 64 && squares[src + 17] !== null && squares[src + 17].player === 1 && (src + 1) % 8 !== 0 && squares[src].player === 2) {
            highLightMoves.push((src + 17));
        }
        return highLightMoves;
    }
}