import initialiseChessBoard from "../helpers/initialiseChessBoard";

export enum Player { White = 1, Black = 2 };
export enum PlayerAction { SELECT_PIECE, SELECT_PROMOTION_PIECE, EXECUTE_MOVE };

export interface GameState {
  squares: any[],
  whiteFallenSoldiers: any[],
  blackFallenSoldiers: any[],
  player: Player,
  sourceSelection: number,
  status: string,
  turn: string,
  whiteRemainingPieces: number,
  blackRemainingPieces: number,
  lastTurnPawnPosition: any,
  firstMove: any,
  highLightMoves: number[],
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
  newGameButton: string,
  leaveButton: string,
  continueGame: boolean,
  hideResignButton: string,
  hideDrawButton: string,
  offlineMode: boolean,
  currentPlayerAction: PlayerAction
};

export type GameAction =
  | ["connected", string]
  | ["updateGameData", boolean]
  | ["opponentLeft"]
  | ["gameover", string]
  | ["continueGame"]
  | ["nextGameData", { rotateBoard: string; gameId: string, gameData: any }]
  | ["newGame"]
  | ["startOfflineGame"]
  | ["updateStatus", string]
  | ["selectPiece", any]
  | ["convertPawn", { squares: any[]; disabled: boolean; }]
  | ["wrongMove", any[]]
  | [
      "enpassant",
      {
        squares: any[];
        whiteFallenSoldiers: any;
        blackFallenSoldiers: any;
        disabled: boolean;
      }
    ]
  | [
      "moves",
      {
        squares: any[];
        firstMove: boolean | undefined;
        lastTurnPawnPosition: number;
        disabled: boolean;
      }
    ]
  | [
      "addToFallenSoldierList",
      { whiteFallenSoldiers: any; blackFallenSoldiers: any; }
    ]
  | [
      "updateBoard",
      { 
        squares: any[]; tempSquares: any[]; i: number; selectedPawnPosition: number;
      }
    ]
  | ["moveKing", { squares: any[]; i: number; disabled: boolean; }]
  | ["moveRook", { squares: any[]; i: number; disabled: boolean; }]
  | ["gameResult", string]
  | ["updatePieces", { whiteRemainingPieces: number; blackRemainingPieces: number; }]
  | ["registrationConfirmation", boolean]
  | ["hideDrawButton"]
  | ["toLobby"]
  | ["gameStartConfirmation", { game_data: any; status: boolean; game_id: string; }]
  | [
      "movePiece", 
      { 
        squares: any[]; 
        canEnpassant?: boolean;
        castle?: boolean;
        disabled: boolean;
        firstMove?: boolean;
        piece: string;
        targetPosition: number;
        selectedPiece: number;
        lastTurnPawnPosition?: number;
        whiteFallenSoldiers: any;
        blackFallenSoldiers: any;
        whiteRemainingPieces: number; 
        blackRemainingPieces: number;
        promotionPiece?: any;
      }
    ];


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
  offlineMode: false
};

export const gameReducer = (gameState: GameState, gameAction: GameAction) => {
  let blackKingPosition: number;
  let whiteKingPosition: number;
  let whiteKingFirstMove: boolean;
  let blackKingFirstMove: boolean;
  let whiteRookFirstMoveLeft: boolean;
  let whiteRookFirstMoveRight: boolean;
  let blackRookFirstMoveLeft: boolean;
  let blackRookFirstMoveRight: boolean;

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
        hideDrawButton: ""
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
        highLightMoves: newValue.highLightMoves
      };

    case "convertPawn":
      return { 
        ...changeTurn(gameState), 
        status: "", 
        convertPawnPosition: undefined, 
        // sourceSelection: -1, 
        currentPlayerAction: PlayerAction.SELECT_PIECE,
        squares: newValue.squares,
        disabled: newValue.disabled
      };

    case "wrongMove":
      return {
        ...gameState,
        status: "Wrong selection. Choose valid source and destination again.",
        // sourceSelection: -1,
        currentPlayerAction: PlayerAction.SELECT_PIECE,
        squares: newValue,
        highLightMoves: []
      };

    case "enpassant":
      return {
        ...changeTurn(gameState),
        status: "",
        highLightMoves: [],
        // sourceSelection: -1,
        currentPlayerAction: PlayerAction.SELECT_PIECE,
        squares: newValue.squares,
        whiteFallenSoldiers: newValue.whiteFallenSoldiers,
        blackFallenSoldiers: newValue.blackFallenSoldiers,
        disabled: newValue.disabled
      };

    case "moves":
      return {
        ...changeTurn(gameState),
        status: "",
        highLightMoves: [],
        // sourceSelection: -1,
        currentPlayerAction: PlayerAction.SELECT_PIECE,
        squares: newValue.squares,
        firstMove: newValue.firstMove,
        lastTurnPawnPosition: newValue.lastTurnPawnPosition,
        disabled: newValue.disabled
      };

    case "addToFallenSoldierList":
      return {
        ...gameState,
        whiteFallenSoldiers: newValue.whiteFallenSoldiers,
        blackFallenSoldiers: newValue.blackFallenSoldiers
      };

    case "updateBoard"://only used for update board with promotion choice
      return {
        ...gameState,
        sourceSelection: newValue.selectedPawnPosition,
        currentPlayerAction: PlayerAction.SELECT_PROMOTION_PIECE,
        status: "",
        highLightMoves: [],
        tempSquares: newValue.squares,
        squares: newValue.tempSquares,
        convertPawnPosition: newValue.i,
      };

    case "moveKing":
      whiteKingPosition = gameState.whiteKingPosition;
      blackKingPosition = gameState.blackKingPosition;

      if (gameState.turn === "white") {
        whiteKingPosition = newValue.i;
      }
      else if (gameState.turn === "black") {
        blackKingPosition = newValue.i;
      }

      whiteKingFirstMove = gameState.whiteKingFirstMove;
      blackKingFirstMove = gameState.blackKingFirstMove;

      if (
        newValue.squares[newValue.i].name === "King" &&
        gameState.sourceSelection === 60 &&
        newValue.squares[newValue.i].player === 1
      ) {
        whiteKingFirstMove = false;
      }
      else if (
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
        currentPlayerAction: PlayerAction.SELECT_PIECE,
        status: "",
        whiteKingFirstMove,
        blackKingFirstMove,
        highLightMoves: [],
        disabled: newValue.disabled
      };

    case "moveRook":
      //to record if rook has been moved or not. for castle.
      whiteRookFirstMoveLeft = gameState.whiteRookFirstMoveLeft;
      whiteRookFirstMoveRight = gameState.whiteRookFirstMoveRight;
      blackRookFirstMoveLeft = gameState.blackRookFirstMoveLeft;
      blackRookFirstMoveRight = gameState.blackRookFirstMoveRight;
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
        sourceSelection: -1,
        currentPlayerAction: PlayerAction.SELECT_PROMOTION_PIECE,
        squares: newValue.squares,
        status: "",
        highLightMoves: [],
        disabled: newValue.disabled
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

    case "movePiece":
      let squares = newValue.squares;
      whiteKingPosition = gameState.whiteKingPosition;
      blackKingPosition = gameState.blackKingPosition;
      whiteKingFirstMove = gameState.whiteKingFirstMove;
      blackKingFirstMove = gameState.blackKingFirstMove;
      whiteRookFirstMoveLeft = gameState.whiteRookFirstMoveLeft;
      whiteRookFirstMoveRight = gameState.whiteRookFirstMoveRight;
      blackRookFirstMoveLeft = gameState.blackRookFirstMoveLeft;
      blackRookFirstMoveRight = gameState.blackRookFirstMoveRight;

      if (newValue.piece === "pawn" && newValue.canEnpassant) {
        squares[newValue.targetPosition] = squares[newValue.selectedPiece];
        squares[gameState.lastTurnPawnPosition] = null;
        squares[newValue.selectedPiece] = null;
      }
      else if (newValue.piece === "king" && newValue.castle) {
        if (newValue.targetPosition === 58) {
          squares = movePiece(newValue.targetPosition, squares, newValue.selectedPiece);
          squares = movePiece(59, squares, 56);
        }
        else if (newValue.targetPosition === 62) {
          squares = movePiece(newValue.targetPosition, squares, newValue.selectedPiece);
          squares = movePiece(61, squares, 63);
        }
        else if (newValue.targetPosition === 2) {
          squares = movePiece(newValue.targetPosition, squares, newValue.selectedPiece);
          squares = movePiece(3, squares, 0);
        }
        else if (newValue.targetPosition === 6) {
          squares = movePiece(newValue.targetPosition, squares, newValue.selectedPiece);
          squares = movePiece(5, squares, 7);
        }
      }
      else if (newValue.piece === "promotion") {
        squares = movePiece(newValue.targetPosition, squares, newValue.selectedPiece);
        squares[newValue.targetPosition] = newValue.promotionPiece;
        squares[newValue.selectedPiece] = null;
      }
      else {
        squares = movePiece(newValue.targetPosition, squares, newValue.selectedPiece);
      }

      if (newValue.piece === "king") {
        if (gameState.turn === "white") {
          whiteKingPosition = newValue.targetPosition;
        }
        else {
          blackKingPosition = newValue.targetPosition;
        }

        if (
          newValue.selectedPiece === 60 &&
          newValue.squares[newValue.targetPosition].player === Player.White
        ) {
          whiteKingFirstMove = false;
        }
        else if (
          newValue.selectedPiece === 4 &&
          newValue.squares[newValue.targetPosition].player === Player.Black
        ) {
          blackKingFirstMove = false;
        }
      }
      else if (newValue.piece === "rook") {
        if (
          newValue.selectedPiece === 56 &&
          newValue.squares[newValue.targetPosition].player === Player.White
        ) {
          whiteRookFirstMoveLeft = false;
        }
        if (
          newValue.selectedPiece === 63 &&
          newValue.squares[newValue.targetPosition].player === Player.White
        ) {
          whiteRookFirstMoveRight = false;
        }
        if (
          newValue.selectedPiece === 0 &&
          newValue.squares[newValue.targetPosition].player === Player.Black
        ) {
          blackRookFirstMoveLeft = false;
        }
        if (
          newValue.selectedPiece === 7 &&
          newValue.squares[newValue.targetPosition].player === Player.Black
        ) {
          blackRookFirstMoveRight = false;
        }
      }

      return {
        ...changeTurn(gameState),
        status: "",
        highLightMoves: [],
        // sourceSelection: -1,
        currentPlayerAction: PlayerAction.SELECT_PIECE,
        squares: newValue.squares,
        whiteFallenSoldiers: newValue.whiteFallenSoldiers,
        blackFallenSoldiers: newValue.blackFallenSoldiers,
        disabled: newValue.disabled,
        firstMove: newValue.firstMove,
        lastTurnPawnPosition: newValue.lastTurnPawnPosition,
        whiteRemainingPieces: newValue.whiteRemainingPieces,
        blackRemainingPieces: newValue.blackRemainingPieces,
        whiteKingPosition,
        blackKingPosition,
        whiteKingFirstMove,
        blackKingFirstMove,
        whiteRookFirstMoveLeft,
        whiteRookFirstMoveRight,
        blackRookFirstMoveLeft,
        blackRookFirstMoveRight,
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
        hideDrawButton: ""
      };

    case "startOfflineGame":
      return { ...gameState, startGame: true, offlineMode: true };

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

const movePiece = (i: number, squares: any[], sourceSelection: number) => {
  squares[i] = squares[sourceSelection];
  squares[sourceSelection] = null;
  return squares;
}
