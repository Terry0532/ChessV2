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
