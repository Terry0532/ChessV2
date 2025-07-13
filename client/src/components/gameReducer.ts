import initialiseChessBoard from "../helpers/initialiseChessBoard";
import {
  ChessPiece,
  GameAction,
  GameState,
  Player,
  PlayerAction,
  Theme,
} from "../helpers/types";

export const initialGameState: GameState = {
  squares: initialiseChessBoard(),
  whiteFallenSoldiers: [],
  blackFallenSoldiers: [],
  player: 1,
  sourceSelection: -1,
  currentPlayerAction: PlayerAction.SELECT_PIECE,
  status: "",
  turn: "white",
  whiteRemainingPieces: 16,
  blackRemainingPieces: 16,
  lastTurnPawnPosition: undefined,
  //firstMove true means last turn enemy's pawn moved for the first time and it moved 2 squares forward. for en pasaant
  firstMove: undefined,
  highLightMoves: [],
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
  socket: null,
  registered: false,
  startGame: false,
  gameId: null,
  gameData: null,
  userId: null,
  rotateBoard: "",
  newGameButton: "New Game",
  leaveButton: "Leave Game",
  continueGame: false,
  hideResignButton: "",
  hideDrawButton: "",
  offlineMode: false,
  notation: "",
  promotionOldBoard: [],
  theme: Theme.Light,
  suggestion: "",
  moves: [],
};

export const gameReducer = (gameState: GameState, gameAction: GameAction) => {
  let isWhitePlayer: boolean;

  const [type, newValue] = gameAction;

  switch (type) {
    case "connected":
      return { ...gameState, userId: newValue };

    case "updateNotation":
      return { ...gameState, notation: newValue };

    case "updateSuggestion":
      return { ...gameState, suggestion: newValue };

    case "updateMoves":
      return { ...gameState, moves: newValue };

    case "updateGameData":
      return { ...gameState, disabled: newValue };

    case "opponentLeft":
      return { ...gameState, startGame: false, gameId: null, gameData: null };

    case "gameover":
      return {
        ...gameState,
        disabled: true,
        status: newValue,
        hideButton: "",
        hideResignButton: "none",
        hideDrawButton: "none",
      };

    case "continueGame":
      return {
        ...gameState,
        newGameButton: "Yes",
        leaveButton: "No",
        status: "Do you want to play again?",
        continueGame: true,
      };

    case "nextGameData":
      return {
        ...gameState,
        gameId: newValue.gameId,
        gameData: newValue.gameData,
        rotateBoard: newValue.rotateBoard,
        disabled: newValue.rotateBoard ? true : false,
        squares: initialiseChessBoard(),
        whiteFallenSoldiers: [],
        blackFallenSoldiers: [],
        player: 1,
        sourceSelection: -1,
        currentPlayerAction: PlayerAction.SELECT_PIECE,
        status: "",
        turn: "white",
        whiteRemainingPieces: 16,
        blackRemainingPieces: 16,
        lastTurnPawnPosition: undefined,
        firstMove: undefined,
        highLightMoves: [],
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
        hideButton: "none",
        newGameButton: "New Game",
        leaveButton: "Leave Game",
        continueGame: false,
        hideResignButton: "",
        hideDrawButton: "",
        notation: "",
        promotionOldBoard: [],
      };

    case "newGame":
      return { ...gameState, status: "Waiting for other player" };

    case "updateStatus":
      return { ...gameState, status: newValue };

    case "selectPiece":
      return {
        ...gameState,
        squares: newValue.squares,
        status: "Choose destination for the selected piece",
        sourceSelection: newValue.i,
        currentPlayerAction: PlayerAction.EXECUTE_MOVE,
        highLightMoves: newValue.highLightMoves,
      };

    case "convertPawn":
      return {
        ...changeTurn(gameState),
        status: "",
        convertPawnPosition: undefined,
        currentPlayerAction: PlayerAction.SELECT_PIECE,
        squares: newValue.squares,
        disabled: newValue.disabled,
      };

    case "wrongMove":
      return {
        ...gameState,
        status: "Wrong selection. Choose valid source and destination again.",
        currentPlayerAction: PlayerAction.SELECT_PIECE,
        squares: newValue,
        highLightMoves: [],
      };

    case "enpassant":
      return {
        ...changeTurn(gameState),
        status: "",
        highLightMoves: [],
        currentPlayerAction: PlayerAction.SELECT_PIECE,
        squares: newValue.squares,
        whiteFallenSoldiers: newValue.whiteFallenSoldiers,
        blackFallenSoldiers: newValue.blackFallenSoldiers,
        disabled: newValue.disabled,
      };

    case "moves":
      return {
        ...changeTurn(gameState),
        status: "",
        highLightMoves: [],
        currentPlayerAction: PlayerAction.SELECT_PIECE,
        squares: newValue.squares,
        firstMove: newValue.firstMove,
        lastTurnPawnPosition: newValue.lastTurnPawnPosition,
        disabled: newValue.disabled,
      };

    case "addToFallenSoldierList":
      return {
        ...gameState,
        whiteFallenSoldiers: newValue.whiteFallenSoldiers,
        blackFallenSoldiers: newValue.blackFallenSoldiers,
      };

    case "updateBoard": //only used for update board with promotion choice
      return {
        ...gameState,
        sourceSelection: newValue.selectedPawnPosition,
        currentPlayerAction: PlayerAction.SELECT_PROMOTION_PIECE,
        status: "",
        highLightMoves: [],
        tempSquares: newValue.squares,
        squares: newValue.tempSquares,
        convertPawnPosition: newValue.i,
        promotionOldBoard: newValue.board,
      };

    case "moveKing":
      isWhitePlayer = newValue.squares[newValue.i].player === Player.White;

      return {
        ...changeTurn(gameState),
        squares: newValue.squares,
        sourceSelection: -1,
        currentPlayerAction: PlayerAction.SELECT_PIECE,
        status: "",
        highLightMoves: [],
        disabled: newValue.disabled,
        ...updateKingPosition(
          gameState,
          gameState.sourceSelection,
          isWhitePlayer,
          newValue.i
        ),
      };

    case "moveRook":
      isWhitePlayer = newValue.squares[newValue.i].player === Player.White;

      return {
        ...changeTurn(gameState),
        ...(newValue.squares[newValue.i].name === ChessPiece.Rook
          ? updateRookMoveStatus(gameState, gameState.sourceSelection, isWhitePlayer)
          : {}),
        sourceSelection: -1,
        currentPlayerAction: PlayerAction.SELECT_PIECE,
        squares: newValue.squares,
        status: "",
        highLightMoves: [],
        disabled: newValue.disabled,
      };

    case "gameResult":
      return {
        ...gameState,
        disabled: true,
        status: newValue,
        hideButton: "",
        hideResignButton: "none",
        hideDrawButton: "none",
      };

    case "updatePieces":
      return {
        ...gameState,
        whiteRemainingPieces: newValue.whiteRemainingPieces,
        blackRemainingPieces: newValue.blackRemainingPieces,
      };

    case "registrationConfirmation":
      return { ...gameState, registered: newValue };

    case "hideDrawButton":
      return { ...gameState, hideDrawButton: "none" };

    case "gameStartConfirmation":
      let disabled = gameState.disabled;
      let rotateBoard = gameState.rotateBoard;

      if (newValue.game_data.whose_turn !== gameState.userId) {
        disabled = true;
        rotateBoard = "rotate";
      }

      return {
        ...gameState,
        startGame: newValue.status,
        gameId: newValue.game_id,
        gameData: newValue.game_data,
        disabled,
        rotateBoard,
      };

    case "movePiece":
      let squares = newValue.squares;

      const castling = {
        58: { rookSource: 56, rookTarget: 59 },
        62: { rookSource: 63, rookTarget: 61 },
        2: { rookSource: 0, rookTarget: 3 },
        6: { rookSource: 7, rookTarget: 5 },
      };

      if (newValue.piece === ChessPiece.Pawn && newValue.canEnpassant) {
        squares[newValue.targetPosition] = squares[newValue.selectedPiece];
        squares[gameState.lastTurnPawnPosition] = null;
        squares[newValue.selectedPiece] = null;
      } else if (newValue.piece === ChessPiece.King && newValue.castle) {
        if (castling.hasOwnProperty(newValue.targetPosition)) {
          const castlingData = castling[newValue.targetPosition];
          squares = movePiece(
            newValue.targetPosition,
            squares,
            newValue.selectedPiece
          );
          squares = movePiece(
            castlingData.rookTarget,
            squares,
            castlingData.rookSource
          );
        }
      } else if (newValue.piece === ChessPiece.Promotion) {
        squares = movePiece(
          newValue.targetPosition,
          squares,
          newValue.selectedPiece
        );
        squares[newValue.targetPosition] = newValue.promotionPiece;
        squares[newValue.selectedPiece] = null;
      } else {
        squares = movePiece(
          newValue.targetPosition,
          squares,
          newValue.selectedPiece
        );
      }

      isWhitePlayer = squares[newValue.targetPosition].player === Player.White;

      return {
        ...changeTurn(gameState),
        status: "",
        highLightMoves: [],
        currentPlayerAction: PlayerAction.SELECT_PIECE,
        squares,
        whiteFallenSoldiers: newValue.whiteFallenSoldiers,
        blackFallenSoldiers: newValue.blackFallenSoldiers,
        disabled: newValue.disabled,
        firstMove: newValue.firstMove,
        lastTurnPawnPosition: newValue.lastTurnPawnPosition,
        whiteRemainingPieces: newValue.whiteRemainingPieces,
        blackRemainingPieces: newValue.blackRemainingPieces,
        ...(newValue.piece === ChessPiece.Rook
          ? updateRookMoveStatus(gameState, newValue.selectedPiece, isWhitePlayer)
          : {}),
        ...(newValue.piece === ChessPiece.King
          ? updateKingPosition(
              gameState,
              newValue.selectedPiece,
              isWhitePlayer,
              newValue.targetPosition
            )
          : {}),
      };

    case "toLobby":
      return {
        ...gameState,
        squares: initialiseChessBoard(),
        whiteFallenSoldiers: [],
        blackFallenSoldiers: [],
        player: 1,
        sourceSelection: -1,
        currentPlayerAction: PlayerAction.SELECT_PIECE,
        status: "",
        turn: "white",
        whiteRemainingPieces: 16,
        blackRemainingPieces: 16,
        lastTurnPawnPosition: undefined,
        firstMove: undefined,
        highLightMoves: [],
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
        newGameButton: "New Game",
        leaveButton: "Leave Game",
        continueGame: false,
        hideResignButton: "",
        hideDrawButton: "",
        notation: "",
        promotionOldBoard: [],
      };

    case "startOfflineGame":
      return { ...gameState, startGame: true, offlineMode: true };

    case "changeTheme":
      return { ...gameState, theme: newValue };

    default:
      return gameState;
  }
};

const changeTurn = (gameState: GameState) => {
  return {
    ...gameState,
    player: gameState.player === 1 ? 2 : 1,
    turn: gameState.turn === "white" ? "black" : "white",
  };
};

const movePiece = (i: number, squares: any[], sourceSelection: number) => {
  squares[i] = squares[sourceSelection];
  squares[sourceSelection] = null;
  return squares;
};

//to record if rook has been moved or not. for castle.
const updateRookMoveStatus = (
  gameState: GameState,
  selectedPiece: number,
  isWhitePlayer: boolean
) => {
  return {
    whiteRookFirstMoveLeft:
      selectedPiece === 56 && isWhitePlayer
        ? false
        : gameState.whiteRookFirstMoveLeft,
    whiteRookFirstMoveRight:
      selectedPiece === 63 && isWhitePlayer
        ? false
        : gameState.whiteRookFirstMoveRight,
    blackRookFirstMoveLeft:
      selectedPiece === 0 && !isWhitePlayer
        ? false
        : gameState.blackRookFirstMoveLeft,
    blackRookFirstMoveRight:
      selectedPiece === 7 && !isWhitePlayer
        ? false
        : gameState.blackRookFirstMoveRight,
  };
};

const updateKingPosition = (
  gameState: GameState,
  selectedPosition: number,
  isWhitePlayer: boolean,
  targetPosition: number
) => {
  return {
    whiteKingPosition: isWhitePlayer ? targetPosition : gameState.whiteKingPosition,
    blackKingPosition: !isWhitePlayer ? targetPosition : gameState.blackKingPosition,
    whiteKingFirstMove:
      selectedPosition === 60 && isWhitePlayer
        ? false
        : gameState.whiteKingFirstMove,
    blackKingFirstMove:
      selectedPosition === 4 && !isWhitePlayer
        ? false
        : gameState.blackKingFirstMove,
  };
};
