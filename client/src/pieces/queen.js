import Piece from './piece.js';

export default class Queen extends Piece {
    constructor(player) {
        super(player, (player === 1 ? "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg" : "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg"));
        this.name = "Queen";
    }

    possibleMoves(src, squares) {
        const highLightMoves = [];
        let up = true;
        let down = true;
        let left = true;
        let right = true;
        let temp = src;
        let temp2 = src;
        let temp3 = src;
        let temp4 = src;
        while (up) {
            if (temp - 8 > -1) {
                if (squares[temp - 8] === null) {
                    highLightMoves.push((temp - 8));
                    temp = temp - 8;
                } else if (squares[temp - 8].player === 2 && this.player === 1) {
                    highLightMoves.push((temp - 8));
                    temp = temp - 8;
                    up = false;
                } else if (squares[temp - 8].player === 1 && this.player === 2) {
                    highLightMoves.push((temp - 8));
                    temp = temp - 8;
                    up = false;
                } else {
                    up = false
                }
            } else {
                up = false;
            }
        }
        while (down) {
            if (temp2 + 8 < 64) {
                if (squares[temp2 + 8] === null) {
                    highLightMoves.push((temp2 + 8));
                    temp2 = temp2 + 8;
                } else if (squares[temp2 + 8].player === 2 && this.player === 1) {
                    highLightMoves.push((temp2 + 8));
                    temp2 = temp2 + 8;
                    down = false;
                } else if (squares[temp2 + 8].player === 1 && this.player === 2) {
                    highLightMoves.push((temp2 + 8));
                    temp2 = temp2 + 8;
                    down = false;
                } else {
                    down = false
                }
            } else {
                down = false;
            }
        }
        while (left) {
            if (temp3 % 8 === 0) {
                left = false;
            } else {
                if (squares[temp3 - 1] === null) {
                    highLightMoves.push((temp3 - 1));
                    temp3 = temp3 - 1;
                } else if (squares[temp3 - 1].player === 2 && this.player === 1) {
                    highLightMoves.push((temp3 - 1));
                    temp3 = temp3 - 1;
                    left = false;
                } else if (squares[temp3 - 1].player === 1 && this.player === 2) {
                    highLightMoves.push((temp3 - 1));
                    temp3 = temp3 - 1;
                    left = false;
                } else {
                    left = false;
                }
            }
        }
        while (right) {
            if ((temp4 + 1) % 8 === 0) {
                right = false;
            } else {
                if (squares[temp4 + 1] === null) {
                    highLightMoves.push((temp4 + 1));
                    temp4 = temp4 + 1;
                } else if (squares[temp4 + 1].player === 2 && this.player === 1) {
                    highLightMoves.push((temp4 + 1));
                    temp4 = temp4 + 1;
                    right = false;
                } else if (squares[temp4 + 1].player === 1 && this.player === 2) {
                    highLightMoves.push((temp4 + 1));
                    temp4 = temp4 + 1;
                    right = false;
                } else {
                    right = false;
                }
            }
        }
        let leftup = true;
        let rightup = true;
        let leftdown = true;
        let rightdown = true;
        let temp5 = src;
        let temp6 = src;
        let temp7 = src;
        let temp8 = src;
        while (leftup) {
            if ((temp5 - 9) > -1) {
                if (temp5 % 8 === 0) {
                    leftup = false;
                } else {
                    if (squares[temp5 - 9] === null) {
                        highLightMoves.push((temp5 - 9));
                        temp5 = temp5 - 9;
                    } else if (squares[temp5 - 9] !== null && squares[temp5 - 9].player === 1 && squares[src].player === 2) {
                        highLightMoves.push((temp5 - 9));
                        temp5 = temp5 - 9;
                        leftup = false;
                    } else if (squares[temp5 - 9] !== null && squares[temp5 - 9].player === 2 && squares[src].player === 1) {
                        highLightMoves.push((temp5 - 9));
                        temp5 = temp5 - 9;
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
            if ((temp6 - 7) > -1) {
                if ((temp6 + 1) % 8 === 0) {
                    rightup = false;
                } else {
                    if (squares[temp6 - 7] === null) {
                        highLightMoves.push((temp6 - 7));
                        temp6 = temp6 - 7;
                    } else if (squares[temp6 - 7] !== null && squares[temp6 - 7].player === 1 && squares[src].player === 2) {
                        highLightMoves.push((temp6 - 7));
                        temp6 = temp6 - 7;
                        rightup = false;
                    } else if (squares[temp6 - 7] !== null && squares[temp6 - 7].player === 2 && squares[src].player === 1) {
                        highLightMoves.push((temp6 - 7));
                        temp6 = temp6 - 7;
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
            if ((temp7 + 7) < 64) {
                if (temp7 % 8 === 0) {
                    leftdown = false;
                } else {
                    if (squares[temp7 + 7] === null) {
                        highLightMoves.push((temp7 + 7));
                        temp7 = temp7 + 7;
                    } else if (squares[temp7 + 7] !== null && squares[temp7 + 7].player === 1 && squares[src].player === 2) {
                        highLightMoves.push((temp7 + 7));
                        temp7 = temp7 + 7;
                        leftdown = false;
                    } else if (squares[temp7 + 7] !== null && squares[temp7 + 7].player === 2 && squares[src].player === 1) {
                        highLightMoves.push((temp7 + 7));
                        temp7 = temp7 + 7;
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
            if ((temp8 + 9) < 64) {
                if ((temp8 + 1) % 8 === 0) {
                    rightdown = false;
                } else {
                    if (squares[temp8 + 9] === null) {
                        highLightMoves.push((temp8 + 9));
                        temp8 = temp8 + 9;
                    } else if (squares[temp8 + 9] !== null && squares[temp8 + 9].player === 1 && squares[src].player === 2) {
                        highLightMoves.push((temp8 + 9));
                        temp8 = temp8 + 9;
                        rightdown = false;
                    } else if (squares[temp8 + 9] !== null && squares[temp8 + 9].player === 2 && squares[src].player === 1) {
                        highLightMoves.push((temp8 + 9));
                        temp8 = temp8 + 9;
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