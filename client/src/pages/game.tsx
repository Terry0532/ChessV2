import React, { useEffect, useReducer, useState } from "react";
import "../index.css";
import Board from "../components/board";
import Queen from "../pieces/queen";
import Knight from "../pieces/knight";
import Bishop from "../pieces/bishop";
import Rook from "../pieces/rook";
import NewUser from "./NewUser";
import ShowUsers from "./ShowUsers";
import { gameReducer, initialGameState } from "../components/gameReducer";
import { ChessPiece, Player, PlayerAction, Theme } from "../helpers/types";
import { Socket } from "socket.io-client";
import { Button, ButtonGroup } from "react-bootstrap";
import { useAuth } from "../firebase/AuthContext";
import { signOutUser } from "../firebase/auth";
import { 
  addToFallenSoldierList, canEnpassant, dehighlight, handleGameResult, handlePieceSelection, movePiece 
} from "../helpers/chessGameLogic";
import GameInfo from "../components/GameInfo";
import { createSocketEventHandlers } from "../helpers/socketEventHandlers";
import ChessIconsCredit from "../components/ChessIconsCredit";

const Game = ({ socket }: { socket: Socket }) => {
  const [gameState, dispatchGameAction] = useReducer(gameReducer, initialGameState);
  const { currentUser, loading, updateTheme, theme, updateSocketId } = useAuth();
  const [themeButtonVariant, setThemeButtonVariant] = useState<"light" | "dark">("light");

  const emitGameEvent = (event: string, additionalData = {}) => {
    const payload = {
      userId: gameState.userId,
      gameId: gameState.gameId,
      ...additionalData
    };
    socket.emit(event, payload);
  };

  const handleBoardClick = (targetPosition: number) => {
    let squares = gameState.squares.concat();
    let whiteRemainingPieces = gameState.whiteRemainingPieces;
    let blackRemainingPieces = gameState.blackRemainingPieces;
    let board = structuredClone(gameState.squares);
    let isEnpassantPossible = false;
    const newSquares = gameState.tempSquares.concat();

    if (gameState.currentPlayerAction === PlayerAction.SELECT_PIECE) {
      handlePieceSelection(targetPosition, gameState, dispatchGameAction, squares);
    } 
    else if (gameState.currentPlayerAction === PlayerAction.EXECUTE_MOVE) {
      //dehighlight selected piece
      squares[gameState.sourceSelection].setBackgroundColor("");

      const whiteFallenSoldiers = gameState.whiteFallenSoldiers;
      const blackFallenSoldiers = gameState.blackFallenSoldiers;

      if (squares[gameState.sourceSelection].name === ChessPiece.Pawn) {
        squares = dehighlight(squares, gameState.highLightMoves);
        isEnpassantPossible = canEnpassant(
          gameState.sourceSelection, gameState.lastTurnPawnPosition, gameState.firstMove
        );

        if (gameState.highLightMoves.includes(targetPosition)) {
          //if en passant is available and player decided to use it, else proceed without it
          if (
            isEnpassantPossible 
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
            addToFallenSoldierList(
              targetPosition, squares, whiteFallenSoldiers, blackFallenSoldiers, dispatchGameAction
            );
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
        squares = dehighlight(squares, gameState.highLightMoves);
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
          addToFallenSoldierList(
            targetPosition, squares, whiteFallenSoldiers, blackFallenSoldiers, dispatchGameAction
          );
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
        squares = dehighlight(squares, gameState.highLightMoves);
        if (gameState.highLightMoves.includes(targetPosition)) {
          //update number of pieces
          if (squares[targetPosition] !== null) {
            if (gameState.turn === "white") {
              blackRemainingPieces -= 1;
            } else {
              whiteRemainingPieces -= 1;
            }
          }
          addToFallenSoldierList(
            targetPosition, squares, whiteFallenSoldiers, blackFallenSoldiers, dispatchGameAction
          );
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
      handleGameResult(
        gameState,
        newSquares,
        squares,
        targetPosition,
        dispatchGameAction,
        emitGameEvent,
        blackRemainingPieces,
        whiteRemainingPieces,
        isEnpassantPossible,
        board
      );
    }
  };

  const changeTheme = (theme: Theme) => {
    dispatchGameAction(["changeTheme", theme]);
    updateTheme(theme);

    if (theme === Theme.Dark) {
      handleThemeChange(true);
    } 
    else if (theme === Theme.Light) {
      handleThemeChange(false);
    }
  };

  const handleThemeChange = (isDark: boolean) => {
    if (isDark) {
      setThemeButtonVariant("dark");
      document.body.classList.add('dark-mode');
    }
    else {
      setThemeButtonVariant("light");
      document.body.classList.remove('dark-mode');
    }
  }

  useEffect(() => {
    const socketHandlers = createSocketEventHandlers({
      socket,
      dispatchGameAction,
      gameState,
      currentUser,
      updateSocketId,
      emitGameEvent
    });
  
    socketHandlers.setupEventListeners();
  
    return () => {
      socketHandlers.cleanupEventListeners();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  useEffect(() => {
    if (!loading && theme !== gameState.theme) {
      changeTheme(theme);
    }

    if (theme === Theme.System) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const systemThemeListener = (event: MediaQueryListEvent) => {
        handleThemeChange(event.matches);
      };
      handleThemeChange(mediaQuery.matches);
      mediaQuery.addEventListener('change', systemThemeListener);
      return () => mediaQuery.removeEventListener('change', systemThemeListener);
    } 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, loading]);

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
            <GameInfo 
              gameState={gameState} 
              emitGameEvent={emitGameEvent} 
              dispatchGameAction={dispatchGameAction} 
            />
          </div>
          <ChessIconsCredit theme={gameState.theme} />
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
          variant={themeButtonVariant}
          active={gameState.theme === Theme.Light}
          onClick={() => changeTheme(Theme.Light)}
        >
          Light Mode
        </Button>
        <Button 
          variant={themeButtonVariant} 
          active={gameState.theme === Theme.Dark}
          onClick={() => changeTheme(Theme.Dark)}
        >
          Dark Mode
        </Button>
        <Button 
          variant={themeButtonVariant} 
          active={gameState.theme === Theme.System}
          onClick={() => changeTheme(Theme.System)}
        >
          Follow System
        </Button>
      </ButtonGroup>
      {currentUser && (
        <Button 
          variant={gameState.theme} 
          onClick={() => {
            signOutUser();
            if (socket.connected) {
              socket.disconnect();
            }
            // leaveGame();
            dispatchGameAction(["registrationConfirmation", false])
          }}
          style={{ marginTop: 5 }}
        >
          Log Out
        </Button>
      )}
    </div>
  );
};

export default Game;
