import React, { useEffect, useReducer, useState } from "react";
import "../index.css";
import Board from "../components/board";
import NewUser from "./NewUser";
import ShowUsers from "./ShowUsers";
import { gameReducer, initialGameState } from "../components/gameReducer";
import { PlayerAction, Theme } from "../helpers/types";
import { Socket } from "socket.io-client";
import { Button, ButtonGroup } from "react-bootstrap";
import { useAuth } from "../firebase/AuthContext";
import { signOutUser } from "../firebase/auth";
import { executeMove, handleGameResult, handlePieceSelection } from "../helpers/chessGameLogic";
import GameInfo from "../components/GameInfo";
import { createSocketEventHandlers } from "../helpers/socketEventHandlers";
import ChessIconsCredit from "../components/ChessIconsCredit";

const Game = ({ socket }: { socket: Socket }) => {
  const [gameState, dispatchGameAction] = useReducer(gameReducer, initialGameState);
  const { currentUser, loading, updateTheme, theme, updateSocketId } = useAuth();
  const [themeButtonVariant, setThemeButtonVariant] = useState<"light" | "dark">("light");
  const [animatingMove, setAnimatingMove] = useState<{ from: number; to: number; piece: any } | null>(null);

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
    let board = structuredClone(gameState.squares); //???
    const newSquares = gameState.tempSquares.concat();

    if (gameState.currentPlayerAction === PlayerAction.SELECT_PIECE) {
      handlePieceSelection(targetPosition, gameState, dispatchGameAction, squares);
    } 
    else if (gameState.currentPlayerAction === PlayerAction.EXECUTE_MOVE) {
      setAnimatingMove({
        from: gameState.sourceSelection,
        to: targetPosition,
        piece: squares[gameState.sourceSelection]
      });
      return;
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
        false,
        board
      );
    }
  };

  const handleAnimationComplete = () => {
    if (animatingMove) {
      executeMove(
        gameState,
        gameState.squares.concat(),
        dispatchGameAction,
        animatingMove.to,
        gameState.whiteRemainingPieces,
        gameState.blackRemainingPieces,
        emitGameEvent,
        structuredClone(gameState.squares)
      ).then(([squares, isEnpassantPossible, whiteRemainingPieces, blackRemainingPieces]) => {
        if (squares) {
          handleGameResult(
            gameState,
            [],
            squares,
            animatingMove.to,
            dispatchGameAction,
            emitGameEvent,
            blackRemainingPieces,
            whiteRemainingPieces,
            isEnpassantPossible,
            structuredClone(gameState.squares)
          );
          setAnimatingMove(null);
        }
      });
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
                animatingMove={animatingMove}
                onAnimationComplete={handleAnimationComplete}
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
