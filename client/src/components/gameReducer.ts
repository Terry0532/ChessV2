import initialiseChessBoard from "../helpers/initialiseChessBoard";

export enum Player { White = 1, Black = 2 };

export interface GameState {
  squares: any[],
  whiteFallenSoldiers: string[],
  blackFallenSoldiers: string[],
  player: Player,
  sourceSelection: number,
  status: string,
  turn: string,
  whiteRemainingPieces: number,
  blackRemainingPieces: number,
  lastTurnPawnPosition: any,
  firstMove: any,
  highLightMoves: number[],
  allPossibleMovesWhite: number[],
  allPossibleMovesBlack: number[],
  whiteKingFirstMove: boolean,
  blackKingFirstMove: boolean,
  whiteRookFirstMoveLeft: boolean,
  whiteRookFirstMoveRight: boolean,
  blackRookFirstMoveLeft: boolean,
  blackRookFirstMoveRight: boolean,
  whiteKingPosition: number,
  blackKingPosition: number,
  tempSquares: number[],
  convertPawnPosition: any,
  disabled: boolean,
  hideButton: string,
  socket: any,
  registered: boolean,
  startGame: boolean,
  gameId: any,
  gameData: any,
  userId: any,
  rotateBoard: string,
  disableNewGameButton: boolean,
  newGameButton: string,
  leaveButton: string,
  disableLeaveGameButton: boolean,
  continueGame: boolean,
  hideResignButton: string,
  hideDrawButton: string
};

export type GameAction =
  | ['connected', string]
  | ['updateGameData', boolean]
  | ['opponentLeft']
  | ['gameover', string]
  | ['continueGame']
  | ['newGame']
  | ['updateStatus', string]
  | ['selectPiece', any]
  | ['convertPawn', any[]]
  | ['wrongMove', any[]]
  | [
      'enpassant',
      {
        squares: any[];
        whiteFallenSoldiers: any;
        blackFallenSoldiers: any;
        allPossibleMovesWhite: number[];
        allPossibleMovesBlack: number[];
      }
    ]
  | [
      'moves',
      {
        squares: any[];
        firstMove: boolean | undefined;
        lastTurnPawnPosition: number;
        allPossibleMovesWhite: number[];
        allPossibleMovesBlack: number[];
      }
    ]
  | [
      'addToFallenSoldierList',
      { whiteFallenSoldiers: any; blackFallenSoldiers: any }
    ]
  | [
      'updateBoard',
      { squares: any[]; tempSquares: any[]; i: number }
    ]
  | [
      'moveKing',
      { squares: any[]; i: number }
    ]
  | [
      'moveRook',
      {
        squares: any[];
        i: number;
        allPossibleMovesWhite: number[];
        allPossibleMovesBlack: number[];
      }
    ]
  | ['gameResult', string]
  | ['updatePieces', { whiteRemainingPieces: number; blackRemainingPieces: number }]
  | ['registrationConfirmation', boolean]
  | ['hideDrawButton']
  | [
      'gameStartConfirmation',
      { game_data: any; status: boolean; game_id: string }
    ];


export const initialGameState: GameState = {
  squares: initialiseChessBoard(),
  whiteFallenSoldiers: [],
  blackFallenSoldiers: [],
  player: 1,
  sourceSelection: -1,
  status: "",
  turn: "white",
  whiteRemainingPieces: 16,
  blackRemainingPieces: 16,
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
  continueGame: false,
  hideResignButton: "",
  hideDrawButton: ""
};

export const gameReducer = (gameState: GameState, gameAction: GameAction) => {
  const [type, newValue] = gameAction;
  console.log(type)
  console.log(newValue)
  console.log(gameState)

  switch (type) {
    case "connected":
      return { ...gameState, userId: newValue };

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
        hideDrawButton: "none"
      };

    case "continueGame":
      return {
        ...gameState,
        newGameButton: "Yes",
        leaveButton: "No",
        status: "Do you want to play again?",
        continueGame: true
      };

    case "newGame":
      return {
        ...gameState,
        disableNewGameButton: true,
        status: "Waiting for other player",
        disableLeaveGameButton: true
      };

    case "updateStatus":
      return { ...gameState, status: newValue };

    case "selectPiece":
      return {
        ...gameState,
        squares: newValue.squares,
        status: "Choose destination for the selected piece",
        sourceSelection: newValue.i,
        highLightMoves: newValue.highLightMoves
      };

    case "convertPawn":
      return { ...changeTurn(gameState), status: "", convertPawnPosition: undefined, sourceSelection: -1, squares: newValue };

    case "wrongMove":
      return {
        ...gameState,
        status: "Wrong selection. Choose valid source and destination again.",
        sourceSelection: -1,
        squares: newValue,
        highLightMoves: []
      };

    case "enpassant":
      return {
        ...changeTurn(gameState),
        status: "",
        highLightMoves: [],
        sourceSelection: -1,
        squares: newValue.squares,
        whiteFallenSoldiers: newValue.whiteFallenSoldiers,
        blackFallenSoldiers: newValue.blackFallenSoldiers,
        allPossibleMovesWhite: newValue.allPossibleMovesWhite,
        allPossibleMovesBlack: newValue.allPossibleMovesBlack
      };

    case "moves":
      return {
        ...changeTurn(gameState),
        status: "",
        highLightMoves: [],
        sourceSelection: -1,
        squares: newValue.squares,
        firstMove: newValue.firstMove,
        lastTurnPawnPosition: newValue.lastTurnPawnPosition,
        allPossibleMovesWhite: newValue.allPossibleMovesWhite,
        allPossibleMovesBlack: newValue.allPossibleMovesBlack
      };

    case "addToFallenSoldierList":
      return {
        ...gameState,
        whiteFallenSoldiers: newValue.whiteFallenSoldiers,
        blackFallenSoldiers: newValue.blackFallenSoldiers
      };

    case "updateBoard":
      return {
        ...gameState,
        sourceSelection: -2,
        status: "",
        highLightMoves: [],
        tempSquares: newValue.squares,
        squares: newValue.tempSquares,
        convertPawnPosition: newValue.i,
      };

    case "moveKing":
      let whiteKingPosition = gameState.whiteKingPosition;
      let blackKingPosition = gameState.blackKingPosition;
      if (gameState.turn === "white") {
        whiteKingPosition = newValue.i;
      }
      else if (gameState.turn === "black") {
        blackKingPosition = newValue.i;
      }

      let whiteKingFirstMove = gameState.whiteKingFirstMove;
      let blackKingFirstMove = gameState.blackKingFirstMove;
      if (
        newValue.squares[newValue.i].name === "King" &&
        gameState.sourceSelection === 60 &&
        newValue.squares[newValue.i].player === 1
      ) {
        whiteKingFirstMove = false;
      }
      if (
        newValue.squares[newValue.i].name === "King" &&
        gameState.sourceSelection === 4 &&
        newValue.squares[newValue.i].player === 2
      ) {
        blackKingFirstMove = false;
      }

      return {
        ...changeTurn(gameState),
        whiteKingPosition,
        blackKingPosition,
        squares: newValue.squares,
        sourceSelection: -1,
        status: "",
        whiteKingFirstMove,
        blackKingFirstMove,
        highLightMoves: []
      };

    case "moveRook":
      //to record if rook has been moved or not. for castle.
      let whiteRookFirstMoveLeft = gameState.whiteRookFirstMoveLeft;
      let whiteRookFirstMoveRight = gameState.whiteRookFirstMoveRight;
      let blackRookFirstMoveLeft = gameState.blackRookFirstMoveLeft;
      let blackRookFirstMoveRight = gameState.blackRookFirstMoveRight;
      if (
        newValue.squares[newValue.i].name === "Rook" &&
        gameState.sourceSelection === 56 &&
        newValue.squares[newValue.i].player === 1
      ) {
        whiteRookFirstMoveLeft = false;
      }
      if (
        newValue.squares[newValue.i].name === "Rook" &&
        gameState.sourceSelection === 63 &&
        newValue.squares[newValue.i].player === 1
      ) {
        whiteRookFirstMoveRight = false;
      }
      if (
        newValue.squares[newValue.i].name === "Rook" &&
        gameState.sourceSelection === 0 &&
        newValue.squares[newValue.i].player === 2
      ) {
        blackRookFirstMoveLeft = false;
      }
      if (
        newValue.squares[newValue.i].name === "Rook" &&
        gameState.sourceSelection === 7 &&
        newValue.squares[newValue.i].player === 2
      ) {
        blackRookFirstMoveRight = false;
      }
      return {
        ...changeTurn(gameState),
        whiteRookFirstMoveLeft,
        whiteRookFirstMoveRight,
        blackRookFirstMoveLeft,
        blackRookFirstMoveRight,
        allPossibleMovesWhite: newValue.allPossibleMovesWhite,
        allPossibleMovesBlack: newValue.allPossibleMovesBlack,
        sourceSelection: -1,
        squares: newValue.squares,
        status: "",
        highLightMoves: []
      };

    case "gameResult":
      return {
        ...gameState,
        disabled: true,
        status: newValue,
        hideButton: "",
        hideResignButton: "none",
        hideDrawButton: "none"
      };

    case "updatePieces":
      return {
        ...gameState,
        whiteRemainingPieces: newValue.whiteRemainingPieces,
        blackRemainingPieces: newValue.blackRemainingPieces
      };

    case "registrationConfirmation":
      return { ...gameState, registered: newValue };

    case "hideDrawButton":
      return { ...gameState, hideDrawButton: "none" };

    case "gameStartConfirmation":
      if (newValue.game_data.whose_turn !== gameState.userId) {
        gameState = { ...gameState, disabled: true, rotateBoard: "rotate" };
      }
      return {
        ...gameState,
        startGame: newValue.status,
        gameId: newValue.game_id,
        gameData: newValue.game_data,
      };

    default:
      return gameState;
  }
};

const changeTurn = (gameState: GameState) => {
  return {
    ...gameState,
    player: gameState.player === 1 ? 2 : 1,
    turn: gameState.turn === "white" ? "black" : "white"
  };
};
