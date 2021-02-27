/* eslint-disable no-unused-expressions */
import React from 'react';
import '../index.css';
import Board from './board.js';
import FallenSoldierBlock from './fallensoldiers';
import initialiseChessBoard from '../helpers/initialiseChessBoard';
import Queen from '../pieces/queen';
import Knight from '../pieces/knight';
import Bishop from '../pieces/bishop';
import Rook from '../pieces/rook';
import socketIOClient from "socket.io-client";
import NewUser from "./NewUser";
import ShowUsers from "./ShowUsers";

export default class Game extends React.Component {
    constructor() {
        super();
        this.state = {
            squares: initialiseChessBoard(),
            whiteFallenSoldiers: [],
            blackFallenSoldiers: [],
            player: 1,
            sourceSelection: -1,
            status: '',
            turn: 'white',
            white: 16,
            black: 16,
            lastTurnPawnPosition: undefined,
            //firstMove true means last turn enemy's pawn moved for the first time and it moved 2 squares forward. for en pasaant
            firstMove: undefined,
            highLightMoves: [],
            //for castle
            allPossibleMovesWhite: [],
            allPossibleMovesBlack: [],
            whiteKingFirstMove: true,
            blackKingFirstMove: true,
            whiteRookFirstMoveLeft: true,
            whiteRookFirstMoveRight: true,
            blackRookFirstMoveLeft: true,
            blackRookFirstMoveRight: true,
            //record king's position
            whiteKingPosition: 60,
            blackKingPosition: 4,
            //convert pawn
            tempSquares: [],
            convertPawnPosition: undefined,
            //new game button
            disabled: false,
            hideButton: "none",
            endpoint: "http://127.0.0.1:4444",
            socket: null,
            registered: false,
            startGame: false,
            gameId: null,
            gameData: null,
            userId: null,
            rotateBoard: "",
            disableNewGameButton: false,
            newGameButton: "New Game",
            leaveButton: "Leave Game",
            disableLeaveGameButton: false,
            continueGame: false
        }
    }

    componentDidMount() {
        //make connection with server
        const { endpoint } = this.state;
        const socket = socketIOClient();
        socket.on("connected", data => {
            this.setState({ socket: socket, userId: data.id });
        });
        socket.on("updateGameData", data => {
            if (data.turn === this.state.userId) {
                this.setState({ disabled: false });
            }
            this.handleClick2(data.i, false);
        });
        socket.on("updateBoard", () => {
            this.setState({ disabled: true });
        });
        socket.on("opponentLeft", () => {
            this.setState({ startGame: false, gameId: null, gameData: null });
        });
        socket.on("gameover", data => {
            this.setState({
                disabled: true,
                status: data.result,
                hideButton: ""
            });
        });
        socket.on("continueGame", () => {
            this.setState({ newGameButton: "Yes", leaveButton: "No", status: "Do you want to play again?", continueGame: true });
        });
        socket.on("disconnectButton", () => {
            alert("Opponent left");
            this.state.socket.emit("leaveGame", { gameId: this.state.gameId, userId: this.state.userId, check: true });
        });
        socket.on("toLobby", () => {
            //reset game
            this.setState({
                squares: initialiseChessBoard(),
                whiteFallenSoldiers: [],
                blackFallenSoldiers: [],
                player: 1,
                sourceSelection: -1,
                status: '',
                turn: 'white',
                white: 16,
                black: 16,
                lastTurnPawnPosition: undefined,
                firstMove: undefined,
                highLightMoves: [],
                allPossibleMovesWhite: [],
                allPossibleMovesBlack: [],
                whiteKingFirstMove: true,
                blackKingFirstMove: true,
                whiteRookFirstMoveLeft: true,
                whiteRookFirstMoveRight: true,
                blackRookFirstMoveLeft: true,
                blackRookFirstMoveRight: true,
                whiteKingPosition: 60,
                blackKingPosition: 4,
                tempSquares: [],
                convertPawnPosition: undefined,
                disabled: false,
                hideButton: "none",
                startGame: false,
                gameId: null,
                gameData: null,
                rotateBoard: "",
                disableNewGameButton: false,
                newGameButton: "New Game",
                leaveButton: "Leave Game",
                disableLeaveGameButton: false,
                continueGame: false
            });
        });
        socket.on("nextGameData", data => {
            if (data.game_data.whose_turn !== this.state.userId) {
                this.setState({
                    squares: initialiseChessBoard(),
                    whiteFallenSoldiers: [],
                    blackFallenSoldiers: [],
                    player: 1,
                    sourceSelection: -1,
                    status: '',
                    turn: 'white',
                    white: 16,
                    black: 16,
                    lastTurnPawnPosition: undefined,
                    firstMove: undefined,
                    highLightMoves: [],
                    allPossibleMovesWhite: [],
                    allPossibleMovesBlack: [],
                    whiteKingFirstMove: true,
                    blackKingFirstMove: true,
                    whiteRookFirstMoveLeft: true,
                    whiteRookFirstMoveRight: true,
                    blackRookFirstMoveLeft: true,
                    blackRookFirstMoveRight: true,
                    whiteKingPosition: 60,
                    blackKingPosition: 4,
                    tempSquares: [],
                    convertPawnPosition: undefined,
                    disabled: true,
                    hideButton: "none",
                    gameId: data.game_id,
                    gameData: data.game_data,
                    rotateBoard: "rotate",
                    disableNewGameButton: false,
                    newGameButton: "New Game",
                    leaveButton: "Leave Game",
                    disableLeaveGameButton: false,
                    continueGame: false
                });
            } else {
                this.setState({
                    squares: initialiseChessBoard(),
                    whiteFallenSoldiers: [],
                    blackFallenSoldiers: [],
                    player: 1,
                    sourceSelection: -1,
                    status: '',
                    turn: 'white',
                    white: 16,
                    black: 16,
                    lastTurnPawnPosition: undefined,
                    firstMove: undefined,
                    highLightMoves: [],
                    allPossibleMovesWhite: [],
                    allPossibleMovesBlack: [],
                    whiteKingFirstMove: true,
                    blackKingFirstMove: true,
                    whiteRookFirstMoveLeft: true,
                    whiteRookFirstMoveRight: true,
                    blackRookFirstMoveLeft: true,
                    blackRookFirstMoveRight: true,
                    whiteKingPosition: 60,
                    blackKingPosition: 4,
                    tempSquares: [],
                    convertPawnPosition: undefined,
                    disabled: false,
                    hideButton: "none",
                    gameId: data.game_id,
                    gameData: data.game_data,
                    rotateBoard: "",
                    disableNewGameButton: false,
                    newGameButton: "New Game",
                    leaveButton: "Leave Game",
                    disableLeaveGameButton: false,
                    continueGame: false
                });
            }
        });
    }

    newGame = () => {
        if (this.state.continueGame) {
            this.state.socket.emit("newGame", { userId: this.state.userId, gameId: this.state.gameId, check: true });
        }
        if (!this.state.continueGame) {
            this.state.socket.emit("newGame", { userId: this.state.userId, gameId: this.state.gameId, check: false });
            this.setState({ disableNewGameButton: true, status: "Waiting for other player", disableLeaveGameButton: true });
        }
    }

    disconnect = () => {
        this.state.socket.emit("leaveGame", { gameId: this.state.gameId, userId: this.state.userId, check: false });
    }

    handleClick2(i, check) {
        let squares = this.state.squares;
        let white = this.state.white;
        let black = this.state.black;
        if (this.state.sourceSelection === -1) {
            let highLightMoves = [];
            if (!squares[i] || squares[i].player !== this.state.player) {
                this.setState({ status: "Wrong selection. Choose player " + this.state.player + " pieces." });
                squares[i] ? squares[i].style = { ...squares[i].style, backgroundColor: "" } : null;
                this.state.socket.emit("moves", { gameId: this.state.gameId, "i": i, changeTurn: false, userId: this.state.userId, check: check });
            } else {
                //highlight selected piece
                squares[i].style = { ...squares[i].style, backgroundColor: "RGB(111,143,114)" }; // Emerald from http://omgchess.blogspot.com/2015/09/chess-board-color-schemes.html
                //check if castle is possible and add possible moves to highLightMoves array
                if (i === 4 || i === 60) {
                    if (this.state.turn === "white" && this.state.whiteKingFirstMove) {
                        if (
                            this.state.whiteRookFirstMoveLeft &&
                            squares[57] === null &&
                            squares[58] === null &&
                            squares[59] === null &&
                            !this.state.allPossibleMovesBlack.some(element => [57, 58, 59].includes(element))
                        ) {
                            highLightMoves.push(58);
                        }
                        if (
                            this.state.whiteRookFirstMoveRight &&
                            squares[61] === null &&
                            squares[62] === null &&
                            !this.state.allPossibleMovesBlack.some(element => [61, 62].includes(element))
                        ) {
                            highLightMoves.push(62);
                        }
                    } else if (this.state.turn === "black" && this.state.blackKingFirstMove) {
                        if (
                            this.state.blackRookFirstMoveLeft &&
                            squares[1] === null &&
                            squares[2] === null &&
                            squares[3] === null &&
                            !this.state.allPossibleMovesWhite.some(element => [1, 2, 3].includes(element))
                        ) {
                            highLightMoves.push(2);
                        }
                        if (
                            this.state.blackRookFirstMoveRight &&
                            squares[5] === null &&
                            squares[6] === null &&
                            !this.state.allPossibleMovesWhite.some(element => [5, 6].includes(element))
                        ) {
                            highLightMoves.push(6);
                        }
                    }
                }
                //highlight possible moves
                if (squares[i].name === "Pawn") {
                    const enpassant = this.enpassant(i);
                    highLightMoves = this.checkMovesVer2(squares, squares[i].possibleMoves(i, squares, enpassant, this.state.lastTurnPawnPosition), i, this.state.turn);
                } else if (squares[i].name === "King") {
                    highLightMoves = highLightMoves.concat(squares[i].possibleMoves(i, squares));
                    highLightMoves = this.checkMovesVer2(squares, highLightMoves, i, this.state.turn);

                } else {
                    highLightMoves = this.checkMovesVer2(squares, squares[i].possibleMoves(i, squares), i, this.state.turn);
                }
                for (let index = 0; index < highLightMoves.length; index++) {
                    const element = highLightMoves[index];
                    if (squares[element] !== null) {
                        squares[element].style = { ...squares[element].style, backgroundColor: "RGB(111,143,114)" };
                    } else {
                        squares.splice(element, 1, { style: { backgroundColor: "RGB(111,143,114)" } });
                    }
                }
                this.setState({
                    squares: squares,
                    status: "Choose destination for the selected piece",
                    sourceSelection: i,
                    highLightMoves: highLightMoves
                });
                this.state.socket.emit("moves", { gameId: this.state.gameId, "i": i, changeTurn: false, userId: this.state.userId, check: check });
            }
        } else if (this.state.sourceSelection === -2) {
            //to convert pawn that reach other side of the chess board
            if ([10, 11, 12, 13, 50, 51, 52, 53].includes(i)) {
                //dehighlight
                if (this.state.turn === "black") {
                    squares[10].style = { ...squares[10].style, backgroundColor: "" };
                    squares[11].style = { ...squares[11].style, backgroundColor: "" };
                    squares[12].style = { ...squares[12].style, backgroundColor: "" };
                    squares[13].style = { ...squares[13].style, backgroundColor: "" };
                } else if (this.state.turn === "white") {
                    squares[50].style = { ...squares[50].style, backgroundColor: "" };
                    squares[51].style = { ...squares[51].style, backgroundColor: "" };
                    squares[52].style = { ...squares[52].style, backgroundColor: "" };
                    squares[53].style = { ...squares[53].style, backgroundColor: "" };
                }
                //convert pawn to player selected piece
                const newSquares = this.state.tempSquares;
                newSquares[this.state.convertPawnPosition] = squares[i];
                this.setState({
                    squares: newSquares,
                    status: "",
                    convertPawnPosition: undefined,
                    sourceSelection: -1
                });
                this.state.socket.emit("moves", { gameId: this.state.gameId, "i": i, changeTurn: true, userId: this.state.userId, check: check });
            } else {
                this.wrongMove(squares, "Wrong selection. Choose valid source and destination again.");
                this.state.socket.emit("moves", { gameId: this.state.gameId, "i": i, changeTurn: false, userId: this.state.userId, check: check });
            }
        } else if (this.state.sourceSelection > -1) {
            //dehighlight selected piece
            squares[this.state.sourceSelection].style = { ...squares[this.state.sourceSelection].style, backgroundColor: "" };

            const whiteFallenSoldiers = this.state.whiteFallenSoldiers;
            const blackFallenSoldiers = this.state.blackFallenSoldiers;

            if (squares[this.state.sourceSelection].name === "Pawn") {
                squares = this.dehighlight(squares);
                const enpassant = this.enpassant(this.state.sourceSelection);
                if (this.state.highLightMoves.includes(i)) {
                    //if en passant is available and player decided to use it, else proceed without it
                    if (enpassant && squares[i] == null && (this.state.lastTurnPawnPosition - 8 === i || this.state.lastTurnPawnPosition + 8 === i)) {
                        //add captured piece to fallen soldier list
                        if (squares[this.state.lastTurnPawnPosition].player === 1) {
                            whiteFallenSoldiers.push(squares[this.state.lastTurnPawnPosition]);
                            white = white - 1;
                        }
                        else {
                            blackFallenSoldiers.push(squares[this.state.lastTurnPawnPosition]);
                            black = black - 1;
                        }
                        //move player selected piece to target position
                        squares[i] = squares[this.state.sourceSelection];
                        squares[this.state.lastTurnPawnPosition] = null;
                        squares[this.state.sourceSelection] = null;
                        //update the possible moves in order to check if next player can castle or not
                        const allPossibleMovesWhite = this.allPossibleMovesWhite(squares);
                        const allPossibleMovesBlack = this.allPossibleMovesBlack(squares);
                        this.changeTurn();
                        this.setState({
                            sourceSelection: -1,
                            squares: squares,
                            whiteFallenSoldiers: whiteFallenSoldiers,
                            blackFallenSoldiers: blackFallenSoldiers,
                            status: '',
                            highLightMoves: [],
                            allPossibleMovesWhite: allPossibleMovesWhite,
                            allPossibleMovesBlack: allPossibleMovesBlack
                        });
                        this.state.socket.emit("moves", { gameId: this.state.gameId, "i": i, changeTurn: true, userId: this.state.userId, check: check });
                    } else {
                        //check if current pawn is moving for the first time and moving 2 squares forward
                        let firstMove;
                        if (squares[this.state.sourceSelection].name === "Pawn") {
                            if (squares[this.state.sourceSelection].player === 1 && i === this.state.sourceSelection - 16) {
                                firstMove = true;
                            } else if (squares[this.state.sourceSelection].player === 2 && i === this.state.sourceSelection + 16) {
                                firstMove = true;
                            }
                        }
                        //record current pawn position for next turn to check en passant rule
                        let lastTurnPawnPosition = i;
                        //update number of pieces
                        if (squares[i] !== null) {
                            if (this.state.turn === "white") {
                                black = black - 1;
                            } else {
                                white = white - 1;
                            }
                        }
                        this.addToFallenSoldierList(i, squares, whiteFallenSoldiers, blackFallenSoldiers);
                        squares = this.movePiece(i, squares, this.state.sourceSelection);
                        this.changeTurn();
                        //update the possible moves in order to check if next player can castle or not
                        const allPossibleMovesWhite = this.allPossibleMovesWhite(squares);
                        const allPossibleMovesBlack = this.allPossibleMovesBlack(squares);
                        //to convert pawn that reach other side of the chess board
                        if ([0, 1, 2, 3, 4, 5, 6, 7, 56, 57, 58, 59, 60, 61, 62, 63].includes(i)) {
                            const tempSquares = squares.concat();
                            //give player choice to convert their pawn and highlight those choices
                            if (this.state.turn === "white") {
                                tempSquares[10] = new Knight(1);
                                tempSquares[10].style = { ...tempSquares[10].style, backgroundColor: "RGB(111,143,114)" };
                                tempSquares[11] = new Bishop(1);
                                tempSquares[11].style = { ...tempSquares[11].style, backgroundColor: "RGB(111,143,114)" };
                                tempSquares[12] = new Rook(1);
                                tempSquares[12].style = { ...tempSquares[12].style, backgroundColor: "RGB(111,143,114)" };
                                tempSquares[13] = new Queen(1);
                                tempSquares[13].style = { ...tempSquares[13].style, backgroundColor: "RGB(111,143,114)" };
                            } else if (this.state.turn === "black") {
                                tempSquares[50] = new Knight(2);
                                tempSquares[50].style = { ...tempSquares[50].style, backgroundColor: "RGB(111,143,114)" };
                                tempSquares[51] = new Bishop(2);
                                tempSquares[51].style = { ...tempSquares[51].style, backgroundColor: "RGB(111,143,114)" };
                                tempSquares[52] = new Rook(2);
                                tempSquares[52].style = { ...tempSquares[52].style, backgroundColor: "RGB(111,143,114)" };
                                tempSquares[53] = new Queen(2);
                                tempSquares[53].style = { ...tempSquares[53].style, backgroundColor: "RGB(111,143,114)" };
                            }
                            //update chess board with convert choices and save chess board without choices in this.state.tempSquares
                            this.setState({
                                sourceSelection: -2,
                                tempSquares: squares,
                                squares: tempSquares,
                                status: "",
                                highLightMoves: [],
                                convertPawnPosition: i
                            });
                        } else {
                            this.setState({
                                sourceSelection: -1,
                                squares: squares,
                                status: "",
                                firstMove: firstMove,
                                lastTurnPawnPosition: lastTurnPawnPosition,
                                highLightMoves: [],
                                allPossibleMovesWhite: allPossibleMovesWhite,
                                allPossibleMovesBlack: allPossibleMovesBlack
                            });
                            this.state.socket.emit("moves", { gameId: this.state.gameId, "i": i, changeTurn: true, userId: this.state.userId, check: check });
                        }
                    }
                } else {
                    this.wrongMove(squares, "Wrong selection. Choose valid source and destination again.");
                    this.state.socket.emit("moves", { gameId: this.state.gameId, "i": i, changeTurn: false, userId: this.state.userId, check: check });
                }
            } else if (squares[this.state.sourceSelection].name === "King") {
                squares = this.dehighlight(squares);
                //for castling
                if (this.state.highLightMoves.includes(i) && (i === 2 || i === 6 || i === 58 || i === 62) && (this.state.whiteKingFirstMove || this.state.blackKingFirstMove)) {
                    if (i === 58) {
                        squares = this.movePiece(i, squares, this.state.sourceSelection);
                        squares = this.movePiece(59, squares, 56);
                    }
                    if (i === 62) {
                        squares = this.movePiece(i, squares, this.state.sourceSelection);
                        squares = this.movePiece(61, squares, 63);
                    }
                    if (i === 2) {
                        squares = this.movePiece(i, squares, this.state.sourceSelection);
                        squares = this.movePiece(3, squares, 0);
                    }
                    if (i === 6) {
                        squares = this.movePiece(i, squares, this.state.sourceSelection);
                        squares = this.movePiece(5, squares, 7);
                    }
                    //to record king has been moved or not. for castle
                    let whiteKingFirstMove = this.state.whiteKingFirstMove;
                    let blackKingFirstMove = this.state.blackKingFirstMove;
                    if (squares[i].name === "King" && this.state.sourceSelection === 60 && squares[i].player === 1) {
                        whiteKingFirstMove = false;
                    }
                    if (squares[i].name === "King" && this.state.sourceSelection === 4 && squares[i].player === 2) {
                        blackKingFirstMove = false;
                    }
                    this.kingPosition(i);
                    this.changeTurn();
                    this.setState({
                        sourceSelection: -1,
                        squares: squares,
                        status: '',
                        highLightMoves: [],
                        whiteKingFirstMove: whiteKingFirstMove,
                        blackKingFirstMove: blackKingFirstMove
                    });
                    this.state.socket.emit("moves", { gameId: this.state.gameId, "i": i, changeTurn: true, userId: this.state.userId, check: check });
                } else if (this.state.highLightMoves.includes(i)) {
                    //update number of pieces
                    if (squares[i] !== null) {
                        if (this.state.turn === "white") {
                            black = black - 1;
                        } else {
                            white = white - 1;
                        }
                    }
                    this.addToFallenSoldierList(i, squares, whiteFallenSoldiers, blackFallenSoldiers);
                    squares = this.movePiece(i, squares, this.state.sourceSelection);
                    this.kingPosition(i);
                    this.changeTurn();
                    //to record king has been moved or not. for castle
                    let whiteKingFirstMove = this.state.whiteKingFirstMove;
                    let blackKingFirstMove = this.state.blackKingFirstMove;
                    if (squares[i].name === "King" && this.state.sourceSelection === 60 && squares[i].player === 1) {
                        whiteKingFirstMove = false;
                    }
                    if (squares[i].name === "King" && this.state.sourceSelection === 4 && squares[i].player === 2) {
                        blackKingFirstMove = false;
                    }
                    this.setState({
                        sourceSelection: -1,
                        squares: squares,
                        status: '',
                        highLightMoves: [],
                        whiteKingFirstMove: whiteKingFirstMove,
                        blackKingFirstMove: blackKingFirstMove
                    });
                    this.state.socket.emit("moves", { gameId: this.state.gameId, "i": i, changeTurn: true, userId: this.state.userId, check: check });
                } else {
                    this.wrongMove(squares, "Wrong selection. Choose valid source and destination again.");
                    this.state.socket.emit("moves", { gameId: this.state.gameId, "i": i, changeTurn: false, userId: this.state.userId, check: check });
                }
            } else {
                squares = this.dehighlight(squares);
                if (this.state.highLightMoves.includes(i)) {
                    //update number of pieces
                    if (squares[i] !== null) {
                        if (this.state.turn === "white") {
                            black = black - 1;
                        } else {
                            white = white - 1;
                        }
                    }
                    this.addToFallenSoldierList(i, squares, whiteFallenSoldiers, blackFallenSoldiers);
                    squares = this.movePiece(i, squares, this.state.sourceSelection);
                    this.changeTurn();
                    //to record if rook has been moved or not. for castle.
                    let whiteRookFirstMoveLeft = this.state.whiteRookFirstMoveLeft;
                    let whiteRookFirstMoveRight = this.state.whiteRookFirstMoveRight;
                    let blackRookFirstMoveLeft = this.state.blackRookFirstMoveLeft;
                    let blackRookFirstMoveRight = this.state.blackRookFirstMoveRight;
                    if (squares[i].name === "Rook" && this.state.sourceSelection === 56 && squares[i].player === 1) {
                        whiteRookFirstMoveLeft = false;
                    }
                    if (squares[i].name === "Rook" && this.state.sourceSelection === 63 && squares[i].player === 1) {
                        whiteRookFirstMoveRight = false;
                    }
                    if (squares[i].name === "Rook" && this.state.sourceSelection === 0 && squares[i].player === 2) {
                        blackRookFirstMoveLeft = false;
                    }
                    if (squares[i].name === "Rook" && this.state.sourceSelection === 7 && squares[i].player === 2) {
                        blackRookFirstMoveRight = false;
                    }
                    //update the possible moves in order to check if next player can castle or not
                    const allPossibleMovesWhite = this.allPossibleMovesWhite(squares);
                    const allPossibleMovesBlack = this.allPossibleMovesBlack(squares);
                    this.setState({
                        sourceSelection: -1,
                        squares: squares,
                        status: '',
                        highLightMoves: [],
                        whiteRookFirstMoveLeft: whiteRookFirstMoveLeft,
                        whiteRookFirstMoveRight: whiteRookFirstMoveRight,
                        blackRookFirstMoveLeft: blackRookFirstMoveLeft,
                        blackRookFirstMoveRight: blackRookFirstMoveRight,
                        allPossibleMovesWhite: allPossibleMovesWhite,
                        allPossibleMovesBlack: allPossibleMovesBlack
                    });
                    this.state.socket.emit("moves", { gameId: this.state.gameId, "i": i, changeTurn: true, userId: this.state.userId, check: check });
                } else {
                    this.wrongMove(squares, "Wrong selection. Choose valid source and destination again.");
                    this.state.socket.emit("moves", { gameId: this.state.gameId, "i": i, changeTurn: false, userId: this.state.userId, check: check });
                }
            }

            if (check) {
                //for game result
                //to record next player's possible moves
                let temp = [];
                const turn = this.state.turn === "white" ? "black" : "white";
                const player = this.state.turn === "white" ? 2 : 1;
                for (let i = 0; i < squares.length; i++) {
                    if (squares[i] !== null) {
                        if (squares[i].player === player) {
                            if (squares[i].name === "Pawn") {
                                temp = temp.concat(this.checkMovesVer2(squares, squares[i].possibleMoves(i, squares), i, turn))
                            } else if (squares[i].name === "King") {
                                temp = temp.concat(this.checkMovesVer2(squares, squares[i].possibleMoves(i, squares), i, turn));
                            } else {
                                temp = temp.concat(this.checkMovesVer2(squares, squares[i].possibleMoves(i, squares), i, turn));
                            }
                        }
                    }
                }
                const kingPosition = turn === "white" ? this.state.whiteKingPosition : this.state.blackKingPosition;
                //if next play doesn't have any possible moves then winner or stalemate
                if (temp.length === 0) {
                    if (!squares[i].possibleMoves(i, squares).includes(kingPosition)) {
                        this.setState({
                            disabled: true,
                            status: "Stalemate Draw",
                            hideButton: ""
                        });
                        this.state.socket.emit("gameResult", { gameId: this.state.gameId, userId: this.state.userId, result: "Stalemate Draw" });
                    } else {
                        const status = turn === "white" ? "Black Won" : "White Won";
                        this.setState({
                            disabled: true,
                            status: status,
                            hideButton: ""
                        });
                        this.state.socket.emit("gameResult", { gameId: this.state.gameId, userId: this.state.userId, result: status });
                    }
                }
                //other ways to draw
                if (black < 3 && white < 3) {
                    let temp = undefined;
                    let temp2 = false;
                    for (let i = 0; i < squares.length; i++) {
                        if (squares[i] !== null) {
                            if (squares[i].name === "Bishop") {
                                if ([1, 3, 5, 7, 8, 10, 12, 14, 17, 19, 21, 23, 24, 26, 28, 30, 33, 35, 37, 39, 40, 42, 44, 46, 49, 51, 53, 55, 56, 58, 60, 62].includes(i)) {
                                    if (squares[i].player === 1) {
                                        temp = true;
                                    } else {
                                        temp2 = true;
                                    }
                                } else {
                                    if (squares[i].player === 1) {
                                        temp = false;
                                    } else {
                                        temp2 = false;
                                    }
                                }
                            }
                        }
                    }
                    //king and bishop versus king and bishop with the bishops on the same color
                    if (temp === temp2) {
                        this.setState({
                            disabled: true,
                            status: "Draw",
                            hideButton: ""
                        });
                        this.state.socket.emit("gameResult", { gameId: this.state.gameId, userId: this.state.userId, result: "Draw" });
                    }
                    //king and bishop versus king, king and knight versus king draw
                    if ((black === 2 && white === 1) || (black === 1 && white === 2)) {
                        let temp = undefined;
                        for (let i = 0; i < squares.length; i++) {
                            if (squares[i] !== null) {
                                if (squares[i].name === "Bishop" || squares[i].name === "Knight") {
                                    temp = true;
                                }
                            }
                        }
                        if (temp) {
                            this.setState({
                                disabled: true,
                                status: "Draw",
                                hideButton: ""
                            });
                            this.state.socket.emit("gameResult", { gameId: this.state.gameId, userId: this.state.userId, result: "Draw" });
                        }
                    }
                    //king versus king draw
                    if (black === 1 && white === 1) {
                        this.setState({
                            disabled: true,
                            status: "Draw",
                            hideButton: ""
                        });
                        this.state.socket.emit("gameResult", { gameId: this.state.gameId, userId: this.state.userId, result: "Draw" });
                    }
                }
            }

            //update how many pieces left
            this.setState({
                white: white,
                black: black
            })
        }
    }

    handleClick(i) {
        this.handleClick2(i, true);
    }

    //to determine if its possible to do en passant capture
    enpassant(selectedPawnPosition) {
        let enpassant = false;
        if (selectedPawnPosition - 1 === this.state.lastTurnPawnPosition || selectedPawnPosition + 1 === this.state.lastTurnPawnPosition) {
            if (this.state.firstMove) {
                enpassant = true;
            }
        }
        return enpassant;
    }

    //dehighlight possible moves
    dehighlight(squares) {
        for (let index = 0; index < this.state.highLightMoves.length; index++) {
            const element = this.state.highLightMoves[index];
            if (squares[element].name === "Pawn" || squares[element].name === "Knight" || squares[element].name === "Rook" || squares[element].name === "Bishop" || squares[element].name === "Queen" || squares[element].name === "King") {
                squares[element].style = { ...squares[element].style, backgroundColor: "" };
            } else {
                squares[element] = null;
            }
        }
        return squares;
    }

    //add captured piece to fallen soldier list
    addToFallenSoldierList(i, squares, whiteFallenSoldiers, blackFallenSoldiers) {
        if (squares[i] !== null) {
            if (squares[i].player === 1) {
                whiteFallenSoldiers.push(squares[i]);
            }
            else if (squares[i].player === 2) {
                blackFallenSoldiers.push(squares[i]);
            }
        }
        this.setState({
            whiteFallenSoldiers: whiteFallenSoldiers,
            blackFallenSoldiers: blackFallenSoldiers
        })
    }

    //move player selected piece to target position
    movePiece(i, squares, sourceSelection) {
        squares[i] = squares[sourceSelection];
        squares[sourceSelection] = null;
        return squares;
    }

    changeTurn() {
        let player = this.state.player === 1 ? 2 : 1;
        let turn = this.state.turn === 'white' ? 'black' : 'white';
        this.setState({
            player: player,
            turn: turn
        })
    }

    //display message, and reset chess board
    wrongMove(squares, status) {
        this.setState({
            status: status,
            sourceSelection: -1,
            highLightMoves: [],
            squares: squares
        });
    }

    //give it the current chess board and return the possible moves
    allPossibleMovesWhite(squares) {
        const allPossibleMovesWhite = [];
        for (let i = 0; i < squares.length; i++) {
            if (squares[i] !== null) {
                if (squares[i].player === 1) {
                    if (squares[i].name === "Pawn") {
                        let tempArray = squares[i].possibleCaptureMoves(i, squares);
                        for (let i = 0; i < tempArray.length; i++) {
                            allPossibleMovesWhite.push(tempArray[i]);
                        }
                    } else {
                        let tempArray = squares[i].possibleMoves(i, squares);
                        for (let i = 0; i < tempArray.length; i++) {
                            allPossibleMovesWhite.push(tempArray[i]);
                        }
                    }
                }
            }
        }
        allPossibleMovesWhite.sort();
        const result = [];
        for (let i = 0; i < allPossibleMovesWhite.length; i++) {
            if (allPossibleMovesWhite[i] !== allPossibleMovesWhite[i + 1]) {
                result.push(allPossibleMovesWhite[i]);
            }
        }
        return result;
    }
    allPossibleMovesBlack(squares) {
        const allPossibleMovesBlack = [];
        for (let i = 0; i < squares.length; i++) {
            if (squares[i] !== null) {
                if (squares[i].player === 2) {
                    if (squares[i].name === "Pawn") {
                        let tempArray = squares[i].possibleCaptureMoves(i, squares);
                        for (let i = 0; i < tempArray.length; i++) {
                            allPossibleMovesBlack.push(tempArray[i]);
                        }
                    } else {
                        let tempArray = squares[i].possibleMoves(i, squares);
                        for (let i = 0; i < tempArray.length; i++) {
                            allPossibleMovesBlack.push(tempArray[i]);
                        }
                    }
                }
            }
        }
        allPossibleMovesBlack.sort();
        const temp = [];
        for (let i = 0; i < allPossibleMovesBlack.length; i++) {
            if (allPossibleMovesBlack[i] !== allPossibleMovesBlack[i + 1]) {
                temp.push(allPossibleMovesBlack[i]);
            }
        }
        return temp;
    }

    //record king position
    kingPosition(i) {
        let whiteKingPosition = this.state.whiteKingPosition;
        let blackKingPosition = this.state.blackKingPosition;
        if (this.state.turn === "white") {
            whiteKingPosition = i;
        } else if (this.state.turn === "black") {
            blackKingPosition = i;
        }
        this.setState({
            whiteKingPosition: whiteKingPosition,
            blackKingPosition: blackKingPosition
        })
    }

    //to check if selected piece can move or not, e.g., if they move seleced piece and it will end up in checkmate
    checkMovesVer2(squares, highLightMoves, i, turn) {
        const selectedPiece = i;
        let king = false;
        if (squares[selectedPiece].name === "King") {
            king = true;
        }
        const newList = [];
        for (let i = 0; i < highLightMoves.length; i++) {
            let temp = squares.concat();
            temp[highLightMoves[i]] = temp[selectedPiece];
            temp[selectedPiece] = null;
            if (!king) {
                if (turn === "white") {
                    if (!this.allPossibleMovesBlack(temp).includes(this.state.whiteKingPosition)) {
                        newList.push(highLightMoves[i]);
                    }
                } else if (turn === "black") {
                    if (!this.allPossibleMovesWhite(temp).includes(this.state.blackKingPosition)) {
                        newList.push(highLightMoves[i]);
                    }
                }
            } else if (king) {
                if (turn === "white") {
                    if (!this.allPossibleMovesBlack(temp).includes(highLightMoves[i])) {
                        newList.push(highLightMoves[i]);
                    }
                } else if (turn === "black") {
                    if (!this.allPossibleMovesWhite(temp).includes(highLightMoves[i])) {
                        newList.push(highLightMoves[i]);
                    }
                }
            }
        }
        return newList;
    }

    registrationConfirmation = (data) => {
        this.setState({ registered: data });
    }

    gameStartConfirmation = (data) => {
        //if this is not this user's turn then disable chess board and set chess board to black
        if (data.game_data.whose_turn !== this.state.userId) {
            this.setState({ disabled: true, rotateBoard: "rotate" });
        }

        this.setState({ startGame: data.status, gameId: data.game_id, gameData: data.game_data });
    }

    render() {
        return (
            <div>
                {
                    this.state.startGame ?
                        <div>
                            <div className="game">
                                <div className="game-board">
                                    <Board
                                        squares={this.state.squares}
                                        onClick={(i) => this.handleClick(i)}
                                        disabled={this.state.disabled}
                                        rotateBoard={this.state.rotateBoard}
                                    />
                                </div>
                                <div className="game-info">
                                    <h3>Turn</h3>
                                    <div id="player-turn-box" style={{ backgroundColor: this.state.turn }}>
                                    </div>
                                    <div className="game-status">{this.state.status}</div>
                                    <div className="fallen-soldier-block">
                                        {<FallenSoldierBlock
                                            whiteFallenSoldiers={this.state.whiteFallenSoldiers}
                                            blackFallenSoldiers={this.state.blackFallenSoldiers}
                                        />
                                        }
                                    </div>
                                    <button onClick={this.newGame} disabled={this.state.disableNewGameButton} style={{ display: this.state.hideButton }}>{this.state.newGameButton}</button>
                                    <button onClick={this.disconnect} disabled={this.state.disableLeaveGameButton} style={{ display: this.state.hideButton }}>{this.state.leaveButton}</button>
                                </div>
                            </div>
                            <div className="icons-attribution">
                                <div> <small> Chess Icons And Favicon (extracted) By en:User:Cburnett [<a href="http://www.gnu.org/copyleft/fdl.html">GFDL</a>, <a href="http://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA-3.0</a>, <a href="http://opensource.org/licenses/bsd-license.php">BSD</a> or <a href="http://www.gnu.org/licenses/gpl.html">GPL</a>], <a href="https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces">via Wikimedia Commons</a> </small></div>
                            </div>
                        </div>
                        :
                        <div>
                            {
                                this.state.registered ?
                                    <ShowUsers socket={this.state.socket} gameStartConfirmation={this.gameStartConfirmation} />
                                    :
                                    <div>
                                        {
                                            this.state.socket !== null ?
                                                <NewUser socket={this.state.socket} registrationConfirmation={this.registrationConfirmation} />
                                                :
                                                <p>Loading...</p>
                                        }
                                    </div>
                            }
                        </div>
                }
            </div>
        );
    }
}