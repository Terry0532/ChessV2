import Piece from './piece.js';

export default class Bishop extends Piece {
    constructor(player) {
        super(player, (player === 1 ? "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg" : "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg"));
        this.name = "Bishop";
    }

    possibleMoves(src, squares) {
        const highLightMoves = [];
        let leftup = true;
        let rightup = true;
        let leftdown = true;
        let rightdown = true;
        let temp = src;
        let temp2 = src;
        let temp3 = src;
        let temp4 = src;
        while (leftup) {
            if ((temp - 9) > -1) {
                if (temp % 8 === 0) {
                    leftup = false;
                } else {
                    if (squares[temp - 9] === null) {
                        highLightMoves.push((temp - 9));
                        temp = temp - 9;
                    } else if (squares[temp - 9] !== null && squares[temp - 9].player === 1 && squares[src].player === 2) {
                        highLightMoves.push((temp - 9));
                        temp = temp - 9;
                        leftup = false;
                    } else if (squares[temp - 9] !== null && squares[temp - 9].player === 2 && squares[src].player === 1) {
                        highLightMoves.push((temp - 9));
                        temp = temp - 9;
                        leftup = false;
                    } else {
                        leftup = false;
                    }
                }
            } else {
                leftup = false;
            }
        }
        while (rightup) {
            if ((temp2 - 7) > -1) {
                if ((temp2 + 1) % 8 === 0) {
                    rightup = false;
                } else {
                    if (squares[temp2 - 7] === null) {
                        highLightMoves.push((temp2 - 7));
                        temp2 = temp2 - 7;
                    } else if (squares[temp2 - 7] !== null && squares[temp2 - 7].player === 1 && squares[src].player === 2) {
                        highLightMoves.push((temp2 - 7));
                        temp2 = temp2 - 7;
                        rightup = false;
                    } else if (squares[temp2 - 7] !== null && squares[temp2 - 7].player === 2 && squares[src].player === 1) {
                        highLightMoves.push((temp2 - 7));
                        temp2 = temp2 - 7;
                        rightup = false;
                    } else {
                        rightup = false;
                    }
                }
            } else {
                rightup = false;
            }
        }
        while (leftdown) {
            if ((temp3 + 7) < 64) {
                if (temp3 % 8 === 0) {
                    leftdown = false;
                } else {
                    if (squares[temp3 + 7] === null) {
                        highLightMoves.push((temp3 + 7));
                        temp3 = temp3 + 7;
                    } else if (squares[temp3 + 7] !== null && squares[temp3 + 7].player === 1 && squares[src].player === 2) {
                        highLightMoves.push((temp3 + 7));
                        temp3 = temp3 + 7;
                        leftdown = false;
                    } else if (squares[temp3 + 7] !== null && squares[temp3 + 7].player === 2 && squares[src].player === 1) {
                        highLightMoves.push((temp3 + 7));
                        temp3 = temp3 + 7;
                        leftdown = false;
                    } else {
                        leftdown = false;
                    }
                }
            } else {
                leftdown = false;
            }
        }
        while (rightdown) {
            if ((temp4 + 9) < 64) {
                if ((temp4 + 1) % 8 === 0) {
                    rightdown = false;
                } else {
                    if (squares[temp4 + 9] === null) {
                        highLightMoves.push((temp4 + 9));
                        temp4 = temp4 + 9;
                    } else if (squares[temp4 + 9] !== null && squares[temp4 + 9].player === 1 && squares[src].player === 2) {
                        highLightMoves.push((temp4 + 9));
                        temp4 = temp4 + 9;
                        rightdown = false;
                    } else if (squares[temp4 + 9] !== null && squares[temp4 + 9].player === 2 && squares[src].player === 1) {
                        highLightMoves.push((temp4 + 9));
                        temp4 = temp4 + 9;
                        rightdown = false;
                    } else {
                        rightdown = false;
                    }
                }
            } else {
                rightdown = false;
            }
        }
        return highLightMoves;
    }
}