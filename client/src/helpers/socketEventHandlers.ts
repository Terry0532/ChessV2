import { Socket } from 'socket.io-client';
import { ChessPiece, GameAction, Player } from './types';
import { canEnpassant } from './chessGameLogic';

interface SocketEventHandlersProps {
  socket: Socket;
  dispatchGameAction: React.Dispatch<GameAction>;
  gameState: any;
  currentUser: any;
  updateSocketId: (id: string) => void;
  emitGameEvent: (event: string, data: any) => void;
}

export const createSocketEventHandlers = ({
  socket,
  dispatchGameAction,
  gameState,
  currentUser,
  updateSocketId,
  emitGameEvent
}: SocketEventHandlersProps) => {
  const onConnect = (data: any) => {
    if (currentUser && data && data.id) {
      updateSocketId(data.id);
      dispatchGameAction(["connected", data.id]);
    }
  };

  const continueGame = () => {
    dispatchGameAction(["continueGame"]);
  };

  const nextGameData = (data: any) => {
    dispatchGameAction([
      "nextGameData", 
      {
        rotateBoard: data.game_data.whose_turn !== gameState.userId ? "rotate" : "",
        gameId: data.game_id,
        gameData: data.game_data
      }
    ]);
  };

  const drawButton = () => {
    if (window.confirm("Draw?")) {
      dispatchGameAction(["gameover", "Draw"]);
      emitGameEvent("gameResult", { result: "Draw" });
    }
  };

  const updateGameData = ({ selectedPiece, targetPosition, promotionPiece }) => {
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
      const isEnpassantPossible = canEnpassant(
        selectedPiece, gameState.lastTurnPawnPosition, gameState.firstMove
      );

      if (
        isEnpassantPossible
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
            canEnpassant: isEnpassantPossible,
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

  const gameover = (data: any) => {
    dispatchGameAction(["gameover", data.result]);
  };

  const toLobby = () => {
    alert("Opponent left");
    dispatchGameAction(["toLobby"]);
  };

  const onDisconnect = (reason: string) => {
    console.log('Disconnected from server:', reason);
  };

  const updateNotation = (data: any) => {
    dispatchGameAction(["updateNotation", data.move]);
  };

  const setupEventListeners = () => {
    socket.on("connected", onConnect);
    socket.on("updateGameData", updateGameData);
    socket.on("gameover", gameover);
    socket.on("continueGame", continueGame);
    socket.on("nextGameData", nextGameData);
    socket.on("drawButton", drawButton);
    socket.on("toLobby", toLobby);
    socket.on("disconnect", onDisconnect);
    socket.on("updateNotation", updateNotation);
  };

  const cleanupEventListeners = () => {
    socket.off("connected", onConnect);
    socket.off("updateGameData", updateGameData);
    socket.off("gameover", gameover);
    socket.off("continueGame", continueGame);
    socket.off("nextGameData", nextGameData);
    socket.off("drawButton", drawButton);
    socket.off("toLobby", toLobby);
    socket.off("disconnect", onDisconnect);
    socket.off("updateNotation", onDisconnect);
  };

  return { setupEventListeners, cleanupEventListeners };
};
