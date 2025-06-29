import { GameAction, GameState } from "../helpers/types";
import React, { useState } from "react";
import FallenSoldierBlock from "./fallensoldiers";
import { Button } from "react-bootstrap";
import { getButtonVariant } from "../helpers/chessGameLogic";
import { useChessAI } from "../hooks/useChessAI";

type GameInfoPorps = {
  gameState: GameState;
  emitGameEvent: (event: string, data?: any) => void;
  dispatchGameAction: React.Dispatch<GameAction>;
};

const GameInfo: React.FC<GameInfoPorps> = ({
  gameState,
  emitGameEvent,
  dispatchGameAction,
}) => {
  const { getSuggestion, loading: aiLoading, error } = useChessAI();
  const [totalHelpCount, setTotalHelpCount] = useState<number>(0);
  const maxHelpCount = 3;

  const newGame = () => {
    if (gameState.offlineMode) {
      dispatchGameAction([
        "nextGameData",
        {
          rotateBoard: "",
          gameId: null,
          gameData: null,
        },
      ]);
    } else if (gameState.continueGame) {
      emitGameEvent("newGame", { askOpponent: true });
    } else {
      emitGameEvent("newGame", { askOpponent: false });
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

  const handleAISuggestion = async () => {
    try {
      if (totalHelpCount < maxHelpCount) {
        if (aiLoading) {
          dispatchGameAction(["updateSuggestion", "AI is thinking..."]);
        } else {
          setTotalHelpCount(totalHelpCount + 1);
          const suggestion = await getSuggestion(gameState.moves);
          dispatchGameAction(["updateSuggestion", "Suggestion: " + suggestion]);
        }
      } else {
        dispatchGameAction(["updateSuggestion", "Max help count reached"]);
      }
    } catch (error) {
      console.error("Failed to get AI suggestion:", error);
    }
  };

  return (
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
      <p className={gameState.theme}>{gameState.suggestion || error}</p>
      <div className={"game-status " + gameState.theme} data-testid="game-status">
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
      {gameState.offlineMode && (
        <Button
          onClick={handleAISuggestion}
          variant={getButtonVariant(gameState.theme)}
          style={{ marginLeft: 5 }}
        >
          {aiLoading
            ? "Loading..."
            : `Suggestion (${totalHelpCount}/${maxHelpCount})`}
        </Button>
      )}
    </div>
  );
};

export default GameInfo;
