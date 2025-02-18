/* eslint-disable no-unused-expressions */
import React, { useEffect, useReducer } from "react";
import "../index.css";
import Board from "./board";
import FallenSoldierBlock from "./fallensoldiers";
import Queen from "../pieces/queen.js";
import Knight from "../pieces/knight.js";
import Bishop from "../pieces/bishop.js";
import Rook from "../pieces/rook.js";
import NewUser from "./NewUser";
import ShowUsers from "./ShowUsers";
import { gameReducer, initialGameState, Player } from "./gameReducer";
import { socket } from '../socket.js';

const Game = () => {
  const [gameState, dispatchGameAction] = useReducer(gameReducer, initialGameState);

  const emitGameEvent = (event: string, additionalData = {}) => {
    const payload = {
      userId: gameState.userId,
      gameId: gameState.gameId,
      ...additionalData
    };
    socket.emit(event, payload);
  }
  
  const newGame = () => {
    if (gameState.continueGame) {
      emitGameEvent("newGame", { check: true });
    }
    else {
      emitGameEvent("newGame", { check: false });
      dispatchGameAction(["newGame"]);
    }
  };

  const disconnect = () => {
    emitGameEvent("leaveGame", { check: false });
  };

  const resignButton = () => {
    if (gameState.disabled) {
      const result = gameState.turn === "white" ? "White Won" : "Black Won";
      dispatchGameAction(["gameover", result]);
      emitGameEvent("gameResult", { result });
    }
  };

  const drawButton = () => {
    dispatchGameAction(["gameResult", "Draw"]);
    emitGameEvent("askDraw");
  };

  const handleBoardClick = (i: number, check: boolean) => {
    let squares = gameState.squares;
    let whiteRemainingPieces = gameState.whiteRemainingPieces;
    let blackRemainingPieces = gameState.blackRemainingPieces;
    if (gameState.sourceSelection === -1) {
      let highLightMoves: number[] = [];
      if (!squares[i] || squares[i].player !== gameState.player) {
        dispatchGameAction(["updateStatus", "Wrong selection. Choose player " + gameState.player + " pieces."]);
        if (squares[i]) {
          squares[i].style = { ...squares[i].style, backgroundColor: "" };
        }
        emitGameEvent("moves", { i, changeTurn: false, check });
      } 
      else {
        //highlight selected piece
        squares[i].style = {
          ...squares[i].style,
          backgroundColor: "RGB(111,143,114)",
        };

        //check if castle is possible and add possible moves to highLightMoves array
        if (i === 4 || i === 60) {
          if (gameState.turn === "white" && gameState.whiteKingFirstMove) {
            if (
              gameState.whiteRookFirstMoveLeft &&
              squares[57] === null &&
              squares[58] === null &&
              squares[59] === null &&
              !gameState.allPossibleMovesBlack.some((element: number) =>
                [57, 58, 59].includes(element)
              )
            ) {
              highLightMoves.push(58);
            }
            if (
              gameState.whiteRookFirstMoveRight &&
              squares[61] === null &&
              squares[62] === null &&
              !gameState.allPossibleMovesBlack.some((element: number) =>
                [61, 62].includes(element)
              )
            ) {
              highLightMoves.push(62);
            }
          } 
          else if (
            gameState.turn === "black" &&
            gameState.blackKingFirstMove
          ) {
            if (
              gameState.blackRookFirstMoveLeft &&
              squares[1] === null &&
              squares[2] === null &&
              squares[3] === null &&
              !gameState.allPossibleMovesWhite.some((element: number) =>
                [1, 2, 3].includes(element)
              )
            ) {
              highLightMoves.push(2);
            }
            if (
              gameState.blackRookFirstMoveRight &&
              squares[5] === null &&
              squares[6] === null &&
              !gameState.allPossibleMovesWhite.some((element: number) =>
                [5, 6].includes(element)
              )
            ) {
              highLightMoves.push(6);
            }
          }
        }

        //highlight possible moves
        if (squares[i].name === "Pawn") {
          const canEnpassant = enpassant(i);
          highLightMoves = checkMovesVer2(
            squares,
            squares[i].possibleMoves(i, squares, canEnpassant, gameState.lastTurnPawnPosition),
            i,
            gameState.turn
          );
        } 
        else if (squares[i].name === "King") {
          highLightMoves = highLightMoves.concat(
            squares[i].possibleMoves(i, squares)
          );
          highLightMoves = checkMovesVer2(
            squares,
            highLightMoves,
            i,
            gameState.turn
          );
        } 
        else {
          highLightMoves = checkMovesVer2(
            squares,
            squares[i].possibleMoves(i, squares),
            i,
            gameState.turn
          );
        }

        for (let index = 0; index < highLightMoves.length; index++) {
          const element = highLightMoves[index];
          if (squares[element] !== null) {
            squares[element].style = {
              ...squares[element].style,
              backgroundColor: "RGB(111,143,114)",
            };
          } else {
            squares.splice(element, 1, {
              style: { backgroundColor: "RGB(111,143,114)" },
            });
          }
        }

        dispatchGameAction(["selectPiece", { squares, i, highLightMoves }]);
        emitGameEvent("moves", { i, changeTurn: false, check });
      }
    } 
    else if (gameState.sourceSelection === -2) {
      //to convert pawn that reach other side of the chess board
      if ([10, 11, 12, 13, 50, 51, 52, 53].includes(i)) {
        //dehighlight
        if (gameState.turn === "white") {
          squares[10].style = { ...squares[10].style, backgroundColor: "" };
          squares[11].style = { ...squares[11].style, backgroundColor: "" };
          squares[12].style = { ...squares[12].style, backgroundColor: "" };
          squares[13].style = { ...squares[13].style, backgroundColor: "" };
        } else if (gameState.turn === "black") {
          squares[50].style = { ...squares[50].style, backgroundColor: "" };
          squares[51].style = { ...squares[51].style, backgroundColor: "" };
          squares[52].style = { ...squares[52].style, backgroundColor: "" };
          squares[53].style = { ...squares[53].style, backgroundColor: "" };
        }

        //convert pawn to player selected piece
        const newSquares = gameState.tempSquares;
        newSquares[gameState.convertPawnPosition] = squares[i];
        dispatchGameAction(["convertPawn", newSquares]);
        emitGameEvent("moves", { i, changeTurn: true, check });
      } 
      else {
        dispatchGameAction(["wrongMove", squares]);
        emitGameEvent("moves", { i, changeTurn: false, check });
      }
    } 
    else if (gameState.sourceSelection > -1) {
      //dehighlight selected piece
      squares[gameState.sourceSelection].style = {
        ...squares[gameState.sourceSelection].style,
        backgroundColor: "",
      };

      const whiteFallenSoldiers = gameState.whiteFallenSoldiers;
      const blackFallenSoldiers = gameState.blackFallenSoldiers;

      if (squares[gameState.sourceSelection].name === "Pawn") {
        squares = dehighlight(squares);
        const canEnpassant = enpassant(gameState.sourceSelection);
        if (gameState.highLightMoves.includes(i)) {
          //if en passant is available and player decided to use it, else proceed without it
          if (
            canEnpassant &&
            squares[i] == null &&
            (gameState.lastTurnPawnPosition - 8 === i ||
              gameState.lastTurnPawnPosition + 8 === i)
          ) {
            //add captured piece to fallen soldier list
            if (squares[gameState.lastTurnPawnPosition].player === 1) {
              whiteFallenSoldiers.push(
                squares[gameState.lastTurnPawnPosition]
              );
              whiteRemainingPieces -= 1;
            } else {
              blackFallenSoldiers.push(
                squares[gameState.lastTurnPawnPosition]
              );
              blackRemainingPieces -= 1;
            }

            //move player selected piece to target position
            squares[i] = squares[gameState.sourceSelection];
            squares[gameState.lastTurnPawnPosition] = null;
            squares[gameState.sourceSelection] = null;

            //update the possible moves in order to check if next player can castle or not
            const allPossibleMovesWhite = getAllPossibleMoves(squares, Player.White);
            const allPossibleMovesBlack = getAllPossibleMoves(squares, Player.Black);
            dispatchGameAction([
              "enpassant",
              { squares, whiteFallenSoldiers, blackFallenSoldiers, allPossibleMovesWhite, allPossibleMovesBlack }
            ]);
            emitGameEvent("moves", { i, changeTurn: true, check });
          } 
          else {
            //check if current pawn is moving for the first time and moving 2 squares forward
            let firstMove;
            if (squares[gameState.sourceSelection].name === "Pawn") {
              if (
                squares[gameState.sourceSelection].player === 1 &&
                i === gameState.sourceSelection - 16
              ) {
                firstMove = true;
              } else if (
                squares[gameState.sourceSelection].player === 2 &&
                i === gameState.sourceSelection + 16
              ) {
                firstMove = true;
              }
            }

            //record current pawn position for next turn to check en passant rule
            let lastTurnPawnPosition = i;
            //update number of pieces
            if (squares[i] !== null) {
              if (gameState.turn === "white") {
                blackRemainingPieces -= 1;
              } else {
                whiteRemainingPieces -= 1;
              }
            }
            addToFallenSoldierList(i, squares, whiteFallenSoldiers, blackFallenSoldiers);
            squares = movePiece(i, squares, gameState.sourceSelection);

            //update the possible moves in order to check if next player can castle or not
            const allPossibleMovesWhite = getAllPossibleMoves(squares, Player.White);
            const allPossibleMovesBlack = getAllPossibleMoves(squares, Player.Black);
            //to convert pawn that reach other side of the chess board
            if ([0, 1, 2, 3, 4, 5, 6, 7, 56, 57, 58, 59, 60, 61, 62, 63].includes(i)) {
              const tempSquares = squares.concat();
              //give player choice to convert their pawn and highlight those choices
              if (gameState.turn === "white") {
                tempSquares[10] = new Knight(1);
                tempSquares[10].style = {
                  ...tempSquares[10].style,
                  backgroundColor: "RGB(111,143,114)",
                };
                tempSquares[11] = new Bishop(1);
                tempSquares[11].style = {
                  ...tempSquares[11].style,
                  backgroundColor: "RGB(111,143,114)",
                };
                tempSquares[12] = new Rook(1);
                tempSquares[12].style = {
                  ...tempSquares[12].style,
                  backgroundColor: "RGB(111,143,114)",
                };
                tempSquares[13] = new Queen(1);
                tempSquares[13].style = {
                  ...tempSquares[13].style,
                  backgroundColor: "RGB(111,143,114)",
                };
              } 
              else if (gameState.turn === "black") {
                tempSquares[50] = new Knight(2);
                tempSquares[50].style = {
                  ...tempSquares[50].style,
                  backgroundColor: "RGB(111,143,114)",
                };
                tempSquares[51] = new Bishop(2);
                tempSquares[51].style = {
                  ...tempSquares[51].style,
                  backgroundColor: "RGB(111,143,114)",
                };
                tempSquares[52] = new Rook(2);
                tempSquares[52].style = {
                  ...tempSquares[52].style,
                  backgroundColor: "RGB(111,143,114)",
                };
                tempSquares[53] = new Queen(2);
                tempSquares[53].style = {
                  ...tempSquares[53].style,
                  backgroundColor: "RGB(111,143,114)",
                };
              }
              
              //update chess board with convert choices and save chess board without choices in this.state.tempSquares
              dispatchGameAction(["updateBoard", { squares, tempSquares, i }]);
              emitGameEvent("moves", { i, changeTurn: false, check });
            } 
            else {
              dispatchGameAction([
                "moves", 
                { squares, firstMove, lastTurnPawnPosition, allPossibleMovesWhite, allPossibleMovesBlack }
              ]);
              emitGameEvent("moves", { i, changeTurn: true, check });
            }
          }
        } 
        else {
          dispatchGameAction(["wrongMove", squares]);
          emitGameEvent("moves", { i, changeTurn: false, check });
        }
      } 
      else if (squares[gameState.sourceSelection].name === "King") {
        squares = dehighlight(squares);
        //for castling
        if (
          gameState.highLightMoves.includes(i) &&
          (i === 2 || i === 6 || i === 58 || i === 62) &&
          (gameState.whiteKingFirstMove || gameState.blackKingFirstMove)
        ) {
          if (i === 58) {
            squares = movePiece(i, squares, gameState.sourceSelection);
            squares = movePiece(59, squares, 56);
          }
          if (i === 62) {
            squares = movePiece(i, squares, gameState.sourceSelection);
            squares = movePiece(61, squares, 63);
          }
          if (i === 2) {
            squares = movePiece(i, squares, gameState.sourceSelection);
            squares = movePiece(3, squares, 0);
          }
          if (i === 6) {
            squares = movePiece(i, squares, gameState.sourceSelection);
            squares = movePiece(5, squares, 7);
          }

          //to record king has been moved or not. for castle
          dispatchGameAction(["moveKing", { i, squares }]);
          emitGameEvent("moves", { i, changeTurn: true, check });
        } 
        else if (gameState.highLightMoves.includes(i)) {
          //update number of pieces
          if (squares[i] !== null) {
            if (gameState.turn === "white") {
              blackRemainingPieces -= 1;
            } 
            else {
              whiteRemainingPieces -= 1;
            }
          }
          addToFallenSoldierList(i, squares, whiteFallenSoldiers, blackFallenSoldiers);
          squares = movePiece(i, squares, gameState.sourceSelection);

          //to record king has been moved or not. for castle
          dispatchGameAction(["moveKing", { i, squares }]);
          emitGameEvent("moves", { i, changeTurn: true, check });
        } else {
          dispatchGameAction(["wrongMove", squares]);
          emitGameEvent("moves", { i, changeTurn: false, check });
        }
      } 
      else {
        squares = dehighlight(squares);
        if (gameState.highLightMoves.includes(i)) {
          //update number of pieces
          if (squares[i] !== null) {
            if (gameState.turn === "white") {
              blackRemainingPieces -= 1;
            } else {
              whiteRemainingPieces -= 1;
            }
          }
          addToFallenSoldierList(i, squares, whiteFallenSoldiers, blackFallenSoldiers);
          squares = movePiece(i, squares, gameState.sourceSelection);

          //update the possible moves in order to check if next player can castle or not
          const allPossibleMovesWhite = getAllPossibleMoves(squares, Player.White);
          const allPossibleMovesBlack = getAllPossibleMoves(squares, Player.Black);
          dispatchGameAction(["moveRook", { i, squares, allPossibleMovesWhite, allPossibleMovesBlack }]);
          emitGameEvent("moves", { i, changeTurn: true, check });
        } else {
          dispatchGameAction(["wrongMove", squares]);
          emitGameEvent("moves", { i, changeTurn: false, check });
        }
      }

      if (check) {
        //for game result
        //to record next player's possible moves
        let temp: number[] = [];
        const turn = gameState.turn === "white" ? "black" : "white";
        const player = gameState.turn === "white" ? 2 : 1;
        for (let i = 0; i < squares.length; i++) {
          if (squares[i] !== null) {
            if (squares[i].player === player) {
              if (squares[i].name === "Pawn") {
                temp = temp.concat(
                  checkMovesVer2(
                    squares,
                    squares[i].possibleMoves(i, squares),
                    i,
                    turn
                  )
                );
              } else if (squares[i].name === "King") {
                temp = temp.concat(
                  checkMovesVer2(
                    squares,
                    squares[i].possibleMoves(i, squares),
                    i,
                    turn
                  )
                );
              } else {
                temp = temp.concat(
                  checkMovesVer2(
                    squares,
                    squares[i].possibleMoves(i, squares),
                    i,
                    turn
                  )
                );
              }
            }
          }
        }
        const kingPosition =
          turn === "white"
            ? gameState.whiteKingPosition
            : gameState.blackKingPosition;

        //if next play doesn't have any possible moves then winner or stalemate
        if (temp.length === 0) {
          if (!squares[i].possibleMoves(i, squares).includes(kingPosition)) {
            const result = "Stalemate Draw";
            dispatchGameAction(["gameResult", result]);
            emitGameEvent("gameResult", { result });
          } else {
            const result = turn === "white" ? "Black Won" : "White Won";
            dispatchGameAction(["gameResult", result]);
            emitGameEvent("gameResult", { result });
          }
        }

        //other ways to draw
        if (blackRemainingPieces < 3 && whiteRemainingPieces < 3) {
          const result = "Draw";
          let temp: boolean | undefined = undefined;
          let temp2: boolean | undefined = false;
          for (let i = 0; i < squares.length; i++) {
            if (squares[i] !== null && squares[i].name === "Bishop") {
              if (
                [
                  1, 3, 5, 7, 8, 10, 12, 14, 17, 19, 21, 23, 24, 26, 28, 30,
                  33, 35, 37, 39, 40, 42, 44, 46, 49, 51, 53, 55, 56, 58, 60, 62
                ].includes(i)
              ) {
                if (squares[i].player === 1) {
                  temp = true;
                } else {
                  temp2 = true;
                }
              } 
              else {
                if (squares[i].player === 1) {
                  temp = false;
                } else {
                  temp2 = false;
                }
              }
            }
          }

          //king and bishop versus king and bishop with the bishops on the same color
          if (temp === temp2) {
            dispatchGameAction(["gameResult", result]);
            emitGameEvent("gameResult", { result });
          }

          //king and bishop versus king, king and knight versus king draw
          if (
            (blackRemainingPieces === 2 && whiteRemainingPieces === 1) 
            || (blackRemainingPieces === 1 && whiteRemainingPieces === 2)
          ) {
            let temp: boolean = false;
            for (let i = 0; i < squares.length; i++) {
              if (squares[i] !== null) {
                if (
                  squares[i].name === "Bishop" ||
                  squares[i].name === "Knight"
                ) {
                  temp = true;
                }
              }
            }
            if (temp) {
              dispatchGameAction(["gameResult", result]);
              emitGameEvent("gameResult", { result });
            }
          }

          //king versus king draw
          if (blackRemainingPieces === 1 && whiteRemainingPieces === 1) {
            dispatchGameAction(["gameResult", result]);
            emitGameEvent("gameResult", { result });
          }
        }
      }

      dispatchGameAction(["updatePieces", { whiteRemainingPieces, blackRemainingPieces }]);
    }
  }

  const enpassant = (selectedPawnPosition: number) => {
    let enpassant = false;
    if (
      selectedPawnPosition - 1 === gameState.lastTurnPawnPosition ||
      selectedPawnPosition + 1 === gameState.lastTurnPawnPosition
    ) {
      if (gameState.firstMove) {
        enpassant = true;
      }
    }
    return enpassant;
  };

  const dehighlight = (squares: any[]) => {
    for (let index = 0; index < gameState.highLightMoves.length; index++) {
      const element = gameState.highLightMoves[index];
      if (
        squares[element].name === "Pawn" ||
        squares[element].name === "Knight" ||
        squares[element].name === "Rook" ||
        squares[element].name === "Bishop" ||
        squares[element].name === "Queen" ||
        squares[element].name === "King"
      ) {
        squares[element].style = {
          ...squares[element].style,
          backgroundColor: "",
        };
      } else {
        squares[element] = null;
      }
    }
    return squares;
  }

  const addToFallenSoldierList = (
    i: number, squares: any[], whiteFallenSoldiers: string[], blackFallenSoldiers: string[]
  ) => {
    if (squares[i] !== null) {
      if (squares[i].player === 1) {
        whiteFallenSoldiers.push(squares[i]);
      } else if (squares[i].player === 2) {
        blackFallenSoldiers.push(squares[i]);
      }
    }
    dispatchGameAction(["addToFallenSoldierList", { whiteFallenSoldiers, blackFallenSoldiers }]);
  }

  const movePiece = (i: number, squares: any[], sourceSelection: number) => {
    squares[i] = squares[sourceSelection];
    squares[sourceSelection] = null;
    return squares;
  }

  const getAllPossibleMoves = (squares: any[], player: Player) => {
    const allPossibleMoves: number[] = [];
    
    for (let i = 0; i < squares.length; i++) {
      const piece = squares[i];
      if (piece !== null && piece.player === player) {
        const tempArray = piece.name === "Pawn"
          ? piece.possibleCaptureMoves(i, squares)
          : piece.possibleMoves(i, squares);
        
        for (let j = 0; j < tempArray.length; j++) {
          allPossibleMoves.push(tempArray[j]);
        }
      }
    }
    
    allPossibleMoves.sort();
    const uniqueMoves: number[] = [];
    for (let i = 0; i < allPossibleMoves.length; i++) {
      if (allPossibleMoves[i] !== allPossibleMoves[i + 1]) {
        uniqueMoves.push(allPossibleMoves[i]);
      }
    }
    
    return uniqueMoves;
  };  

  //to check if selected piece can move or not, e.g., if they move seleced piece and it will end up in checkmate
  const checkMovesVer2 = (squares: any[], highLightMoves: number[], i: number, turn: string) => {
    const selectedPiece = i;
    let king = false;
    if (squares[selectedPiece].name === "King") {
      king = true;
    }
    const newList: number[] = [];
    for (let i = 0; i < highLightMoves.length; i++) {
      let temp = squares.concat();
      temp[highLightMoves[i]] = temp[selectedPiece];
      temp[selectedPiece] = null;
      if (!king) {
        if (turn === "white") {
          if (!getAllPossibleMoves(temp, Player.Black).includes(gameState.whiteKingPosition)) {
            newList.push(highLightMoves[i]);
          }
        } 
        else if (turn === "black") {
          if (!getAllPossibleMoves(temp, Player.White).includes(gameState.blackKingPosition)
          ) {
            newList.push(highLightMoves[i]);
          }
        }
      } 
      else if (king) {
        if (turn === "white") {
          if (!getAllPossibleMoves(temp, Player.Black).includes(highLightMoves[i])) {
            newList.push(highLightMoves[i]);
          }
        } 
        else if (turn === "black") {
          if (!getAllPossibleMoves(temp, Player.White).includes(highLightMoves[i])) {
            newList.push(highLightMoves[i]);
          }
        }
      }
    }
    return newList;
  };

  useEffect(() => {
    function onConnect(data: any) {
      dispatchGameAction(["connected", data.id]);
    }
    function updateBoard() {
      dispatchGameAction(["updateGameData", false]);
    }
    function opponentLeft() {
      dispatchGameAction(["opponentLeft"]);
    }
    function continueGame() {
      dispatchGameAction(["continueGame"]);
    }
    function disconnectButton() {
      alert("Opponent left");
      emitGameEvent("leaveGame", { check: true });
    }
    function drawButton() {
      if (window.confirm("Draw?")) {
        dispatchGameAction(["gameover", "Draw"]);
        emitGameEvent("gameResult", { result: "Draw" });
      }
    }
    function updateGameData(data: any) {
      if (data.turn === gameState.userId) {
        dispatchGameAction(["updateGameData", false]);
      }
      handleBoardClick(data.i, false);
    }
    function gameover(data: any) {
      dispatchGameAction(["gameover", data.result]);
    }

    socket.on("connected", onConnect);
    socket.on("updateGameData", updateGameData);
    socket.on("updateBoard", updateBoard);
    socket.on("opponentLeft", opponentLeft);
    socket.on("gameover", gameover);
    socket.on("continueGame", continueGame);
    socket.on("disconnectButton", disconnectButton);
    socket.on("drawButton", drawButton);

    return () => {
      socket.off("connected", onConnect);
      socket.off("updateGameData", updateGameData);
      socket.off("updateBoard", updateBoard);
      socket.off("opponentLeft", opponentLeft);
      socket.off("gameover", gameover);
      socket.off("continueGame", continueGame);
      socket.off("disconnectButton", disconnectButton);
      socket.off("drawButton", drawButton);
    };
    // eslint-disable-next-line
  }, [gameState]);

  return (
    <div>
      {gameState.startGame ? (
        <div>
          <div className="game">
            <div className="game-board">
              <Board
                squares={gameState.squares}
                onClick={(i: number) => handleBoardClick(i, true)}
                disabled={gameState.disabled}
                rotateBoard={gameState.rotateBoard}
              />
            </div>
            <div className="game-info">
              <h3>Turn</h3>
              <div
                id="player-turn-box"
                style={{ backgroundColor: gameState.turn }}
              ></div>
              <div className="game-status">{gameState.status}</div>
              <div className="fallen-soldier-block">
                {
                  <FallenSoldierBlock
                    whiteFallenSoldiers={gameState.whiteFallenSoldiers}
                    blackFallenSoldiers={gameState.blackFallenSoldiers}
                  />
                }
              </div>
              <button
                onClick={newGame}
                disabled={gameState.disableNewGameButton}
                style={{ display: gameState.hideButton }}
              >
                {gameState.newGameButton}
              </button>
              <button
                onClick={disconnect}
                disabled={gameState.disableLeaveGameButton}
                style={{ display: gameState.hideButton }}
              >
                {gameState.leaveButton}
              </button>
              <button
                onClick={resignButton}
                style={{ display: gameState.hideResignButton }}
              >
                Resign
              </button>
              <button
                onClick={drawButton}
                style={{ display: gameState.hideDrawButton }}
              >
                Draw
              </button>
            </div>
          </div>
          <div className="icons-attribution">
            <div>
              {" "}
              <small>
                {" "}
                Chess Icons And Favicon (extracted) By en:User:Cburnett [
                <a href="http://www.gnu.org/copyleft/fdl.html">GFDL</a>,{" "}
                <a href="http://creativecommons.org/licenses/by-sa/3.0/">
                  CC-BY-SA-3.0
                </a>
                ,{" "}
                <a href="http://opensource.org/licenses/bsd-license.php">
                  BSD
                </a>{" "}
                or <a href="http://www.gnu.org/licenses/gpl.html">GPL</a>],{" "}
                <a href="https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces">
                  via Wikimedia Commons
                </a>{" "}
              </small>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {gameState.registered ? (
            <ShowUsers
              socket={socket}
              gameStartConfirmation={(data: any) => dispatchGameAction(["gameStartConfirmation", data])}
              gameState={gameState}
            />
          ) : (
            <div>
              {socket !== null ? (
                <NewUser
                  socket={socket}
                  registrationConfirmation={(data) => dispatchGameAction(["registrationConfirmation", data])}
                />
              ) : (
                <p>Loading...</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Game;
