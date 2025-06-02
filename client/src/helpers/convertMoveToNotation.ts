import { getAllPossibleMoves } from "../pages/game";
import { ChessPiece } from "./types";

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const getSquareNotation = (index: number, onlyFile: boolean = false): string => {
  const row = Math.floor(index / 8);
  const col = index % 8;
  const file = files[col];
  const rank = 8 - row;
  return `${ file }${ !onlyFile ? rank : "" }`;
};

const getPieceNotation = (name: string): string => {
  switch(name) {
    case ChessPiece.King:
      return 'K';
    case ChessPiece.Bishop:
      return 'B';
    case ChessPiece.Knight:
      return 'N';
    case ChessPiece.Queen:
      return 'Q';
    case ChessPiece.Rook:
      return 'R';
    default:
      return '';
  }
};

export const convertMoveToNotation = (
  from: number, 
  to: number, 
  oldBoard: any, 
  canEnpassant: boolean, 
  turn: string, 
  nextPlayerValidatedMoves: number[], 
  newBoard: any,
  isPormotion: boolean
): string => {
  if (oldBoard[from].name === ChessPiece.King && (Math.abs(to - from) === 2)) {
    if (turn === "white") {
      if (to === 62) {
        return "0-0";
      }
      else {
        return "0-0-0";
      }
    }
    else {
      if (to === 2) {
        return "0-0-0";
      }
      else {
        return "0-0";
      }
    }
  }

  let toSquare = getSquareNotation(to);
  let pieceNotation = getPieceNotation(oldBoard[from].name);

  if ((oldBoard[to].name || canEnpassant) && oldBoard[from].name === ChessPiece.Pawn) {
    pieceNotation += getSquareNotation(from, true);
    pieceNotation += "x";
  }
  else if (oldBoard[to].name) {
    pieceNotation += "x";
  }

  if (isPormotion) {
    toSquare += "=" + getPieceNotation(newBoard[to].name);
  }

  if (nextPlayerValidatedMoves.length === 0) {
    toSquare += "#";
  }
  else {
    const allPossibleMoves = getAllPossibleMoves(newBoard, newBoard[to].player);

    if (
      allPossibleMoves.some(
        (index: number) => (
          (newBoard[index]?.name === ChessPiece.King) 
          && (newBoard[index].player !== newBoard[to].player)
        )
      )
    ) {
      toSquare += "+";
    }
  }
  
  return `${ pieceNotation }${ toSquare }`;
};
