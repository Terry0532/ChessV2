export enum Player { White = 1, Black = 2 };

export enum PlayerAction { SELECT_PIECE, SELECT_PROMOTION_PIECE, EXECUTE_MOVE };

export enum ChessPiece {
  Pawn = "Pawn",
  King = "King",
  Bishop = "Bishop",
  Knight = "Knight",
  Queen = "Queen",
  Rook = "Rook",
  Promotion = "Promotion"
};

export enum Theme { Dark = "dark", Light = "light", System = "system" };

export enum GameMode { Online, Offline };

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
  currentPlayerAction: PlayerAction,
  notation: string,
  promotionOldBoard: any[],
  theme: Theme,
  suggestion: string,
  moves: string[]
};

export type GameAction =
  | ["connected", string]
  | ["updateNotation", string]
  | ["updateGameData", boolean]
  | ["updateSuggestion", string]
  | ["updateMoves", string[]]
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
      squares: any[]; tempSquares: any[]; i: number; selectedPawnPosition: number; board: any[]
    }
  ]
  | ["moveKing", { squares: any[]; i: number; disabled: boolean; }]
  | ["moveRook", { squares: any[]; i: number; disabled: boolean; }]
  | ["gameResult", string]
  | ["updatePieces", { whiteRemainingPieces: number; blackRemainingPieces: number; }]
  | ["registrationConfirmation", boolean]
  | ["changeTheme", Theme]
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
      piece: ChessPiece;
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

export type Opponent = {
  uid: string;
  socketId: string;
  name: string;
  played: number;
  won: number;
  draw: number;
};

export type UserStatus = {
  state: string;
  displayName: string;
  lastChanged: number;
  socketId: string;
};
