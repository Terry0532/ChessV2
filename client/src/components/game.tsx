/* eslint-disable no-unused-expressions */
import React, { useEffect, useReducer } from "react";
import "../index.css";
import Board from "./board";
import FallenSoldierBlock from "./fallensoldiers";
import Queen from "../pieces/queen";
import Knight from "../pieces/knight";
import Bishop from "../pieces/bishop";
import Rook from "../pieces/rook";
import NewUser from "./NewUser";
import ShowUsers from "./ShowUsers";
import { gameReducer, initialGameState } from "./gameReducer";
import { ChessPiece, Player, PlayerAction, Theme } from "../helpers/types";
import { convertMoveToNotation } from "../helpers/convertMoveToNotation";
import { Socket } from "socket.io-client";
import { Button, ButtonGroup } from "react-bootstrap";
import { useAuth } from "../firebase/AuthContext";
import { signOutUser } from "../firebase/auth";

const Game = ({ socket }: { socket: Socket }) => {
  const [gameState, dispatchGameAction] = useReducer(gameReducer, initialGameState);
  const { currentUser, loading } = useAuth();

  const emitGameEvent = (event: string, additionalData = {}) => {
    const payload = {
      userId: gameState.userId,
      gameId: gameState.gameId,
      ...additionalData
    };
    socket.emit(event, payload);
  }
  
  const newGame = () => {
    if (gameState.offlineMode) {
      dispatchGameAction(["nextGameData", {
        rotateBoard: "", gameId: null, gameData: null
      }]);
    }
    else if (gameState.continueGame) {
      emitGameEvent("newGame", { check: true });
    }
    else {
      emitGameEvent("newGame", { check: false });
      dispatchGameAction(["newGame"]);
    }
  };

  const leaveGame = () => {
    emitGameEvent("leaveGame", { check: false });
    dispatchGameAction(["toLobby"]);
  };

  const resignButton = () => {
    const result = gameState.rotateBoard === "rotate" ? "White Won" : "Black Won";
    dispatchGameAction(["gameover", result]);
    emitGameEvent("gameResult", { result });
  };

  const drawButton = () => {
    dispatchGameAction(["gameResult", "Draw"]);
    emitGameEvent("askDraw");
  };

  const handleBoardClick = (targetPosition: number) => {
    let squares = gameState.squares.concat();
    let whiteRemainingPieces = gameState.whiteRemainingPieces;
    let blackRemainingPieces = gameState.blackRemainingPieces;
    let board = structuredClone(gameState.squares);
    let canEnpassant = false;
    const newSquares = gameState.tempSquares.concat();

    if (gameState.currentPlayerAction === PlayerAction.SELECT_PIECE) {
      let highLightMoves: number[] = [];

      if (!squares[targetPosition] || squares[targetPosition].player !== gameState.player) {
        dispatchGameAction([
          "updateStatus", "Wrong selection. Choose player " + gameState.player + " pieces."
        ]);

        if (squares[targetPosition]) {
          squares[targetPosition].setBackgroundColor("");
        }
      } 
      else {
        squares[targetPosition].setBackgroundColor();

        if (squares[targetPosition].name === ChessPiece.Pawn) {
          const canEnpassant = enpassant(targetPosition);
          highLightMoves = validateMoves(
            squares,
            squares[targetPosition].possibleMoves(targetPosition, squares, canEnpassant, gameState.lastTurnPawnPosition),
            targetPosition,
            gameState.turn
          );
        } 
        else if (squares[targetPosition].name === ChessPiece.King) {
          //check if castle is possible and add possible moves to highLightMoves array
          if (targetPosition === 4 || targetPosition === 60) {
            if (gameState.turn === "white" && gameState.whiteKingFirstMove) {
              const allPossibleMovesBlack = getAllPossibleMoves(squares, Player.Black);
              if (
                gameState.whiteRookFirstMoveLeft &&
                squares[57] === null &&
                squares[58] === null &&
                squares[59] === null &&
                !allPossibleMovesBlack.some((element: number) =>
                  [57, 58, 59].includes(element)
                )
              ) {
                highLightMoves.push(58);
              }
              if (
                gameState.whiteRookFirstMoveRight &&
                squares[61] === null &&
                squares[62] === null &&
                !allPossibleMovesBlack.some((element: number) =>
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
              const allPossibleMovesWhite = getAllPossibleMoves(squares, Player.White);
              if (
                gameState.blackRookFirstMoveLeft &&
                squares[1] === null &&
                squares[2] === null &&
                squares[3] === null &&
                !allPossibleMovesWhite.some((element: number) =>
                  [1, 2, 3].includes(element)
                )
              ) {
                highLightMoves.push(2);
              }
              if (
                gameState.blackRookFirstMoveRight &&
                squares[5] === null &&
                squares[6] === null &&
                !allPossibleMovesWhite.some((element: number) =>
                  [5, 6].includes(element)
                )
              ) {
                highLightMoves.push(6);
              }
            }
          }
          
          highLightMoves = highLightMoves.concat(
            squares[targetPosition].possibleMoves(targetPosition, squares)
          );
          highLightMoves = validateMoves(
            squares,
            highLightMoves,
            targetPosition,
            gameState.turn
          );
        } 
        else {
          highLightMoves = validateMoves(
            squares,
            squares[targetPosition].possibleMoves(targetPosition, squares),
            targetPosition,
            gameState.turn
          );
        }

        for (let index = 0; index < highLightMoves.length; index++) {
          const element = highLightMoves[index];
          if (squares[element] !== null) {
            squares[element].setBackgroundColor();
          } 
          else {
            squares.splice(element, 1, {
              style: { backgroundColor: "RGB(111,143,114)" },
            });
          }
        }

        dispatchGameAction(["selectPiece", { squares, i: targetPosition, highLightMoves }]);
      }
    } 
    else if (gameState.currentPlayerAction === PlayerAction.EXECUTE_MOVE) {
      //dehighlight selected piece
      squares[gameState.sourceSelection].setBackgroundColor("");

      const whiteFallenSoldiers = gameState.whiteFallenSoldiers;
      const blackFallenSoldiers = gameState.blackFallenSoldiers;

      if (squares[gameState.sourceSelection].name === ChessPiece.Pawn) {
        squares = dehighlight(squares);
        canEnpassant = enpassant(gameState.sourceSelection);

        if (gameState.highLightMoves.includes(targetPosition)) {
          //if en passant is available and player decided to use it, else proceed without it
          if (
            canEnpassant 
            && squares[targetPosition] == null 
            && (
              gameState.lastTurnPawnPosition - 8 === targetPosition || gameState.lastTurnPawnPosition + 8 === targetPosition
            )
          ) {
            //add captured piece to fallen soldier list
            if (squares[gameState.lastTurnPawnPosition].player === Player.White) {
              whiteFallenSoldiers.push(
                squares[gameState.lastTurnPawnPosition]
              );
              whiteRemainingPieces -= 1;
            } 
            else {
              blackFallenSoldiers.push(
                squares[gameState.lastTurnPawnPosition]
              );
              blackRemainingPieces -= 1;
            }

            //move player selected piece to target position
            squares[targetPosition] = squares[gameState.sourceSelection];
            squares[gameState.lastTurnPawnPosition] = null;
            squares[gameState.sourceSelection] = null;

            dispatchGameAction([
              "enpassant",
              { squares, whiteFallenSoldiers, blackFallenSoldiers, disabled: !gameState.offlineMode }
            ]);

            if (!gameState.offlineMode) {
              emitGameEvent(
                "moves", 
                { selectedPiece: gameState.sourceSelection, targetPosition }
              );
            }
          } 
          else {
            //check if current pawn is moving for the first time and moving 2 squares forward
            let firstMove: boolean;
            if (
              (squares[gameState.sourceSelection].player === Player.White) 
              && (targetPosition === gameState.sourceSelection - 16)
            ) {
              firstMove = true;
            } 
            else if (
              (squares[gameState.sourceSelection].player === Player.Black) 
              && (targetPosition === gameState.sourceSelection + 16)
            ) {
              firstMove = true;
            }

            //update number of pieces
            if (squares[targetPosition] !== null) {
              if (gameState.turn === "white") {
                blackRemainingPieces -= 1;
              } 
              else {
                whiteRemainingPieces -= 1;
              }
            }
            addToFallenSoldierList(targetPosition, squares, whiteFallenSoldiers, blackFallenSoldiers);
            squares = movePiece(targetPosition, squares, gameState.sourceSelection);

            //to convert pawn that reach other side of the chess board
            if ([0, 1, 2, 3, 4, 5, 6, 7, 56, 57, 58, 59, 60, 61, 62, 63].includes(targetPosition)) {
              const tempSquares = squares.concat();
              
              //give player choice to convert their pawn and highlight those choices
              if (gameState.turn === "white") {
                tempSquares[10] = new Knight(Player.White).setBackgroundColor();
                tempSquares[11] = new Bishop(Player.White).setBackgroundColor();
                tempSquares[12] = new Rook(Player.White).setBackgroundColor();
                tempSquares[13] = new Queen(Player.White).setBackgroundColor();
              } 
              else if (gameState.turn === "black") {
                tempSquares[50] = new Knight(Player.Black).setBackgroundColor();
                tempSquares[51] = new Bishop(Player.Black).setBackgroundColor();
                tempSquares[52] = new Rook(Player.Black).setBackgroundColor();
                tempSquares[53] = new Queen(Player.Black).setBackgroundColor();
              }
              
              //update chess board with convert choices and save chess board without choices in this.state.tempSquares
              dispatchGameAction([
                "updateBoard", 
                { squares, tempSquares, i: targetPosition, selectedPawnPosition: gameState.sourceSelection, board }
              ]);
              return;
            } 
            else {
              dispatchGameAction([
                "moves", { squares, firstMove, lastTurnPawnPosition: targetPosition, disabled: !gameState.offlineMode }
              ]);

              if (!gameState.offlineMode) {
                emitGameEvent(
                  "moves", 
                  { selectedPiece: gameState.sourceSelection, targetPosition }
                );
              }
            }

          }
        } 
        else {
          dispatchGameAction(["wrongMove", squares]);
          return;
        }
      } 
      else if (squares[gameState.sourceSelection].name === ChessPiece.King) {
        squares = dehighlight(squares);
        //for castling
        if (
          gameState.highLightMoves.includes(targetPosition) 
          && (targetPosition === 2 || targetPosition === 6 || targetPosition === 58 || targetPosition === 62) 
          && (gameState.whiteKingFirstMove || gameState.blackKingFirstMove)
        ) {
          if (targetPosition === 58) {
            squares = movePiece(targetPosition, squares, gameState.sourceSelection);
            squares = movePiece(59, squares, 56);
          }
          if (targetPosition === 62) {
            squares = movePiece(targetPosition, squares, gameState.sourceSelection);
            squares = movePiece(61, squares, 63);
          }
          if (targetPosition === 2) {
            squares = movePiece(targetPosition, squares, gameState.sourceSelection);
            squares = movePiece(3, squares, 0);
          }
          if (targetPosition === 6) {
            squares = movePiece(targetPosition, squares, gameState.sourceSelection);
            squares = movePiece(5, squares, 7);
          }

          //to record king has been moved or not. for castle
          dispatchGameAction(["moveKing", { i: targetPosition , squares, disabled: !gameState.offlineMode }]);

          if (!gameState.offlineMode) {
            emitGameEvent(
              "moves", 
              { selectedPiece: gameState.sourceSelection, targetPosition }
            );
          }
        } 
        else if (gameState.highLightMoves.includes(targetPosition)) {
          //update number of pieces
          if (squares[targetPosition] !== null) {
            if (gameState.turn === "white") {
              blackRemainingPieces -= 1;
            } 
            else {
              whiteRemainingPieces -= 1;
            }
          }
          addToFallenSoldierList(targetPosition, squares, whiteFallenSoldiers, blackFallenSoldiers);
          squares = movePiece(targetPosition, squares, gameState.sourceSelection);

          //to record king has been moved or not. for castle
          dispatchGameAction(["moveKing", { i: targetPosition , squares, disabled: !gameState.offlineMode }]);

          if (!gameState.offlineMode) {
            emitGameEvent(
              "moves", 
              { selectedPiece: gameState.sourceSelection, targetPosition }
            );
          }
        } else {
          dispatchGameAction(["wrongMove", squares]);
          return;
        }
      } 
      else {
        squares = dehighlight(squares);
        if (gameState.highLightMoves.includes(targetPosition)) {
          //update number of pieces
          if (squares[targetPosition] !== null) {
            if (gameState.turn === "white") {
              blackRemainingPieces -= 1;
            } else {
              whiteRemainingPieces -= 1;
            }
          }
          addToFallenSoldierList(targetPosition, squares, whiteFallenSoldiers, blackFallenSoldiers);
          squares = movePiece(targetPosition, squares, gameState.sourceSelection);

          dispatchGameAction(["moveRook", { i: targetPosition , squares, disabled: !gameState.offlineMode }]);

          if (!gameState.offlineMode) {
            emitGameEvent(
              "moves", 
              { selectedPiece: gameState.sourceSelection, targetPosition }
            );
          }
        } else {
          dispatchGameAction(["wrongMove", squares]);
          return;
        }
      }

      dispatchGameAction(["updatePieces", { whiteRemainingPieces, blackRemainingPieces }]);
    }
    else if (gameState.currentPlayerAction === PlayerAction.SELECT_PROMOTION_PIECE) {
      //to convert pawn that reach other side of the chess board
      if ([10, 11, 12, 13, 50, 51, 52, 53].includes(targetPosition)) {
        //convert pawn to player selected piece
        newSquares[gameState.convertPawnPosition] = squares[targetPosition].setBackgroundColor("");

        dispatchGameAction(["convertPawn", { squares: newSquares, disabled: !gameState.offlineMode }]);

        if (!gameState.offlineMode) {
          emitGameEvent(
            "moves", 
            { 
              selectedPiece: gameState.sourceSelection, 
              targetPosition: gameState.convertPawnPosition,
              promotionPiece: squares[targetPosition]
            }
          );
        }
      } 
      else {
        dispatchGameAction(["wrongMove", squares]);
        return;
      }
    }

    if (gameState.currentPlayerAction !== PlayerAction.SELECT_PIECE) {
      //for game result
      //to record next player's possible moves
      let nextPlayerValidatedMoves: number[] = [];
      const turn = gameState.turn === "white" ? "black" : "white";
      const player = gameState.turn === "white" ? Player.Black : Player.White;
      const isPormotion = gameState.currentPlayerAction === PlayerAction.SELECT_PROMOTION_PIECE;
      const newBoard = isPormotion ? newSquares : squares;
      const newTargetPosition = isPormotion ? gameState.convertPawnPosition : targetPosition;

      for (let i = 0; i < newBoard.length; i++) {
        if (newBoard[i] !== null) {
          if (newBoard[i].player === player) {
            if (newBoard[i].name === ChessPiece.Pawn) {
              nextPlayerValidatedMoves = nextPlayerValidatedMoves.concat(
                validateMoves(
                  newBoard,
                  newBoard[i].possibleMoves(i, newBoard),
                  i,
                  turn
                )
              );
            } 
            else if (newBoard[i].name === ChessPiece.King) {
              nextPlayerValidatedMoves = nextPlayerValidatedMoves.concat(
                validateMoves(
                  newBoard,
                  newBoard[i].possibleMoves(i, newBoard),
                  i,
                  turn
                )
              );
            } 
            else {
              nextPlayerValidatedMoves = nextPlayerValidatedMoves.concat(
                validateMoves(
                  newBoard,
                  newBoard[i].possibleMoves(i, newBoard),
                  i,
                  turn
                )
              );
            }
          }
        }
      }
      const kingPosition = turn === "white"
        ? gameState.whiteKingPosition
        : gameState.blackKingPosition;

      //if next play doesn't have any possible moves then winner or stalemate
      if (nextPlayerValidatedMoves.length === 0) {
        let result: string;

        if (!newBoard[newTargetPosition].possibleMoves(newTargetPosition, newBoard).includes(kingPosition)) {
          result = "Stalemate Draw";
        } 
        else {
          result = turn === "white" ? "Black Won" : "White Won";
        }

        dispatchGameAction(["gameResult", result]);

        if (!gameState.offlineMode) {
          emitGameEvent("gameResult", { result });
        }
      }

      //other ways to draw
      if (blackRemainingPieces < 3 && whiteRemainingPieces < 3) {
        const result = "Draw";
        let temp: boolean | undefined = undefined;
        let temp2: boolean | undefined = false;
        for (let i = 0; i < newBoard.length; i++) {
          if (newBoard[i] !== null && newBoard[i].name === ChessPiece.Bishop) {
            if (
              [
                1, 3, 5, 7, 8, 10, 12, 14, 17, 19, 21, 23, 24, 26, 28, 30,
                33, 35, 37, 39, 40, 42, 44, 46, 49, 51, 53, 55, 56, 58, 60, 62
              ].includes(i)
            ) {
              if (newBoard[i].player === 1) {
                temp = true;
              } else {
                temp2 = true;
              }
            } 
            else {
              if (newBoard[i].player === 1) {
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

          if (!gameState.offlineMode) {
            emitGameEvent("gameResult", { result });
          }
        }

        //king and bishop versus king, king and knight versus king draw
        if (
          (blackRemainingPieces === 2 && whiteRemainingPieces === 1) 
          || (blackRemainingPieces === 1 && whiteRemainingPieces === 2)
        ) {
          let temp: boolean = false;
          for (let i = 0; i < newBoard.length; i++) {
            if (newBoard[i] !== null) {
              if (
                newBoard[i].name === ChessPiece.Bishop ||
                newBoard[i].name === ChessPiece.Knight
              ) {
                temp = true;
              }
            }
          }
          if (temp) {
            dispatchGameAction(["gameResult", result]);

            if (!gameState.offlineMode) {
              emitGameEvent("gameResult", { result });
            }
          }
        }

        //king versus king draw
        if (blackRemainingPieces === 1 && whiteRemainingPieces === 1) {
          dispatchGameAction(["gameResult", result]);

          if (!gameState.offlineMode) {
            emitGameEvent("gameResult", { result });
          }
        }
      }

      dispatchGameAction([
        "updateNotation", 
        convertMoveToNotation(
          gameState.sourceSelection, 
          newTargetPosition, 
          isPormotion ? gameState.promotionOldBoard : board, 
          canEnpassant, 
          gameState.turn, 
          nextPlayerValidatedMoves, 
          newBoard,
          isPormotion
        )
      ]);
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

      if (squares[element].name !== undefined) {
        squares[element].setBackgroundColor("");
      } 
      else {
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

  //to check if selected piece can move or not, e.g., if they move seleced piece and it will end up in checkmate
  const validateMoves = (squares: any[], possibleMoves: number[], i: number, turn: string) => {
    const selectedPiece = i;
    let isKing = false;
    if (squares[selectedPiece].name === "King") {
      isKing = true;
    }

    const newList: number[] = [];

    for (let i = 0; i < possibleMoves.length; i++) {
      let simulatedBoard = squares.concat();
      simulatedBoard[possibleMoves[i]] = simulatedBoard[selectedPiece];
      simulatedBoard[selectedPiece] = null;

      if (!isKing) {
        if (turn === "white") {
          if (!getAllPossibleMoves(simulatedBoard, Player.Black).includes(gameState.whiteKingPosition)) {
            newList.push(possibleMoves[i]);
          }
        } 
        else if (turn === "black") {
          if (!getAllPossibleMoves(simulatedBoard, Player.White).includes(gameState.blackKingPosition)
          ) {
            newList.push(possibleMoves[i]);
          }
        }
      } 
      else if (isKing) {
        if (turn === "white") {
          if (!getAllPossibleMoves(simulatedBoard, Player.Black).includes(possibleMoves[i])) {
            newList.push(possibleMoves[i]);
          }
        } 
        else if (turn === "black") {
          if (!getAllPossibleMoves(simulatedBoard, Player.White).includes(possibleMoves[i])) {
            newList.push(possibleMoves[i]);
          }
        }
      }
    }

    return newList;
  };

  const receiveOpponentMove = (
    selectedPiece: number, targetPosition: number, promotionPiece: any = null
  ) => {
    let squares = gameState.squares;
    let whiteRemainingPieces = gameState.whiteRemainingPieces;
    let blackRemainingPieces = gameState.blackRemainingPieces;
    const whiteFallenSoldiers = gameState.whiteFallenSoldiers;
    const blackFallenSoldiers = gameState.blackFallenSoldiers;

    //to convert pawn that reach other side of the chess board
    if (promotionPiece) {
      if (squares[targetPosition] !== null) {
        if (gameState.turn === "white") {
          blackFallenSoldiers.push(squares[targetPosition]);
          blackRemainingPieces -= 1;
        } else {
          whiteFallenSoldiers.push(squares[targetPosition]);
          whiteRemainingPieces -= 1;
        }
      }

      dispatchGameAction([
        "movePiece",
        { 
          squares, 
          whiteFallenSoldiers, 
          blackFallenSoldiers, 
          whiteRemainingPieces, 
          blackRemainingPieces,
          disabled: false,
          piece: ChessPiece.Promotion,
          targetPosition,
          selectedPiece,
          promotionPiece
        }
      ]);
    }
    else if (squares[selectedPiece].name === ChessPiece.Pawn) {
      const canEnpassant = enpassant(selectedPiece);

      if (
        canEnpassant 
        && squares[targetPosition] === null 
        && (
          gameState.lastTurnPawnPosition - 8 === targetPosition 
          || gameState.lastTurnPawnPosition + 8 === targetPosition
        )
      ) {
        if (squares[gameState.lastTurnPawnPosition].player === Player.White) {
          whiteFallenSoldiers.push(squares[gameState.lastTurnPawnPosition]);
          whiteRemainingPieces -= 1;
        } else {
          blackFallenSoldiers.push(squares[gameState.lastTurnPawnPosition]);
          blackRemainingPieces -= 1;
        }

        dispatchGameAction([
          "movePiece",
          { 
            squares, 
            whiteFallenSoldiers, 
            blackFallenSoldiers, 
            whiteRemainingPieces, 
            blackRemainingPieces,
            disabled: false,
            piece: ChessPiece.Pawn,
            selectedPiece,
            canEnpassant,
            targetPosition
          }
        ]);
      } 
      else {
        let firstMove: boolean;
        if (
          squares[selectedPiece].player === Player.White
          && targetPosition === selectedPiece - 16
        ) {
          firstMove = true;
        } 
        else if (
          squares[selectedPiece].player === Player.Black
          && targetPosition === selectedPiece + 16
        ) {
          firstMove = true;
        }

        const lastTurnPawnPosition = targetPosition;

        if (squares[targetPosition] !== null) {
          if (gameState.turn === "white") {
            blackFallenSoldiers.push(squares[targetPosition]);
            blackRemainingPieces -= 1;
          } else {
            whiteFallenSoldiers.push(squares[targetPosition]);
            whiteRemainingPieces -= 1;
          }
        }

        dispatchGameAction([
          "movePiece",
          { 
            squares, 
            whiteFallenSoldiers, 
            blackFallenSoldiers, 
            whiteRemainingPieces, 
            blackRemainingPieces,
            disabled: false,
            firstMove,
            lastTurnPawnPosition,
            piece: ChessPiece.Pawn,
            selectedPiece,
            targetPosition
          }
        ]);
      }
    }
    else if (squares[selectedPiece].name === ChessPiece.King) {
      //for castling
      if (
        (targetPosition === 2 || targetPosition === 6 || targetPosition === 58 || targetPosition === 62) 
        && (gameState.whiteKingFirstMove || gameState.blackKingFirstMove)
      ) {
        dispatchGameAction([
          "movePiece",
          { 
            squares, 
            whiteFallenSoldiers, 
            blackFallenSoldiers, 
            whiteRemainingPieces, 
            blackRemainingPieces,
            disabled: false,
            piece: ChessPiece.King,
            targetPosition,
            selectedPiece,
            castle: true
          }
        ]);
      }
      else {
        if (squares[targetPosition] !== null) {
          if (gameState.turn === "white") {
            blackFallenSoldiers.push(squares[targetPosition]);
            blackRemainingPieces -= 1;
          } 
          else {
            whiteFallenSoldiers.push(squares[targetPosition]);
            whiteRemainingPieces -= 1;
          }
        }

        dispatchGameAction([
          "movePiece",
          { 
            squares, 
            whiteFallenSoldiers, 
            blackFallenSoldiers, 
            whiteRemainingPieces, 
            blackRemainingPieces,
            disabled: false,
            piece: ChessPiece.King,
            targetPosition,
            selectedPiece
          }
        ]);
      }
    }
    else {
      if (squares[targetPosition] !== null) {
        if (gameState.turn === "white") {
          blackFallenSoldiers.push(squares[targetPosition]);
          blackRemainingPieces -= 1;
        } else {
          whiteFallenSoldiers.push(squares[targetPosition]);
          whiteRemainingPieces -= 1;
        }
      }

      dispatchGameAction([
        "movePiece",
        { 
          squares, 
          whiteFallenSoldiers, 
          blackFallenSoldiers, 
          whiteRemainingPieces, 
          blackRemainingPieces,
          disabled: false,
          piece: squares[selectedPiece].name === ChessPiece.Rook ? ChessPiece.Rook : null,
          targetPosition,
          selectedPiece
        }
      ]);
    }
  };

  const changeTheme = (theme: Theme) => {
    dispatchGameAction(["changeTheme", theme]);

    if (theme === Theme.Dark) {
      document.body.classList.add('dark-mode');
    } 
    else {
      document.body.classList.remove('dark-mode');
    }
  };

  useEffect(() => {
    //connected to socket
    function onConnect(data: any) {
      dispatchGameAction(["connected", data.id]);
    }
    function continueGame() {
      dispatchGameAction(["continueGame"]);
    }
    function nextGameData(data: any) {
      dispatchGameAction([
        "nextGameData", 
        {
          rotateBoard: data.game_data.whose_turn !== gameState.userId ? "rotate" : "",
          gameId: data.game_id,
          gameData: data.game_data
        }
      ]);
    }
    function drawButton() {
      if (window.confirm("Draw?")) {
        dispatchGameAction(["gameover", "Draw"]);
        emitGameEvent("gameResult", { result: "Draw" });
      }
    }
    function updateGameData(data: any) {
      receiveOpponentMove(data.selectedPiece, data.targetPosition, data.promotionPiece);
    }
    function gameover(data: any) {
      dispatchGameAction(["gameover", data.result]);
    }
    function toLobby() {
      alert("Opponent left");
      dispatchGameAction(["toLobby"]);
    }

    socket.on("connected", onConnect);
    socket.on("updateGameData", updateGameData);
    socket.on("gameover", gameover);
    socket.on("continueGame", continueGame);
    socket.on("nextGameData", nextGameData);
    socket.on("drawButton", drawButton);
    socket.on("toLobby", toLobby);

    return () => {
      socket.off("connected", onConnect);
      socket.off("updateGameData", updateGameData);
      socket.off("gameover", gameover);
      socket.off("continueGame", continueGame);
      socket.off("nextGameData", nextGameData);
      socket.off("drawButton", drawButton);
      socket.off("toLobby", toLobby);
    };
    // eslint-disable-next-line
  }, [gameState]);

  return (
    <div>
      {gameState.startGame ? (
        <div>
          <div className="game">
            <div className="game-board" data-testid="game-board">
              <Board
                squares={gameState.squares}
                onClick={(i: number) => handleBoardClick(i,)}
                disabled={gameState.disabled}
                rotateBoard={gameState.rotateBoard}
                theme={gameState.theme}
              />
            </div>
            <div className="game-info">
              <h3 className={gameState.theme}>Turn</h3>
              <div
                id="player-turn-box"
                className={gameState.theme}
                style={{ backgroundColor: gameState.turn }}
                data-testid="player-turn-box"
              ></div>
              <p className={gameState.theme} data-testid="algebraic-notation">
                {gameState.notation}
              </p>
              <div 
                className={"game-status "  + gameState.theme}
                data-testid="game-status"
              >
                {gameState.status}
              </div>
              <div className="fallen-soldier-block">
                {
                  <FallenSoldierBlock
                    whiteFallenSoldiers={gameState.whiteFallenSoldiers}
                    blackFallenSoldiers={gameState.blackFallenSoldiers}
                  />
                }
              </div>
              <Button
                onClick={newGame}
                style={{ display: gameState.hideButton }}
                data-testid="new-game-button"
                variant={getButtonVariant(gameState.theme)}
              >
                {gameState.newGameButton}
              </Button>
              <Button 
                onClick={leaveGame} 
                data-testid="leave-game-button"
                variant={getButtonVariant(gameState.theme)}
              >
                {gameState.leaveButton}
              </Button>
              {!gameState.offlineMode && (
                <>
                  <Button
                    onClick={resignButton}
                    style={{ display: gameState.hideResignButton }}
                    variant={getButtonVariant(gameState.theme)}
                  >
                    Resign
                  </Button>
                  <Button
                    onClick={drawButton}
                    style={{ display: gameState.hideDrawButton }}
                    variant={getButtonVariant(gameState.theme)}
                  >
                    Draw
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="icons-attribution">
            <div>
              {" "}
              <small className={gameState.theme}>
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
                  startOfflineGame={() => dispatchGameAction(["startOfflineGame"])}
                  theme={gameState.theme}
                />
              ) : (
                <p>Loading...</p>
              )}
            </div>
          )}
        </div>
      )}
      <ButtonGroup className="theme-selector">
        <Button 
          variant={gameState.theme}
          active={gameState.theme === Theme.Light}
          onClick={() => changeTheme(Theme.Light)}
        >
          Light Mode
        </Button>
        <Button 
          variant={gameState.theme} 
          active={gameState.theme === Theme.Dark}
          onClick={() => changeTheme(Theme.Dark)}
        >
          Dark Mode
        </Button>
      </ButtonGroup>
      {/* {currentUser && (
        <Button 
          variant={gameState.theme} 
          onClick={() => {
            signOutUser();
            leaveGame();
          }}
          style={{ marginTop: 5 }}
        >
          Log Out
        </Button>
      )} */}
    </div>
  );
};

export default Game;

export const getAllPossibleMoves = (squares: any[], player: Player) => {
  const allPossibleMoves: number[] = [];
  
  for (let i = 0; i < squares.length; i++) {
    const piece = squares[i];
    if (piece !== null && piece.player === player) {
      const possibleMoves = piece.name === "Pawn"
        ? piece.possibleCaptureMoves(i, squares)
        : piece.possibleMoves(i, squares);
      
      for (let j = 0; j < possibleMoves.length; j++) {
        allPossibleMoves.push(possibleMoves[j]);
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

export const getButtonVariant = (theme: Theme) => {
  return theme === Theme.Light ? "outline-primary" : "outline-info";
};
