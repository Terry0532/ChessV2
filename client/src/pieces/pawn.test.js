import { Player } from '../helpers/types';
import Pawn from './pawn';

const createEmptyBoard = () => new Array(64).fill(null);

describe('Pawn', () => {
  let whitePawn;
  let blackPawn;
  let board;
  let enpassant;
  let lastTurnPawnPosition;

  beforeEach(() => {
    whitePawn = new Pawn(Player.White);
    blackPawn = new Pawn(Player.Black);
    board = createEmptyBoard();
    enpassant = false;
    lastTurnPawnPosition = -1;
  });

  it('should move one square forward for white pawn if square is empty', () => {
    const position = 48;
    board[position] = whitePawn;
    const moves = whitePawn.possibleMoves(position, board, enpassant, lastTurnPawnPosition);
    expect(moves).toContain(40);
  });

  it('should move one square forward for black pawn if square is empty', () => {
    const position = 8;
    board[position] = blackPawn;
    const moves = blackPawn.possibleMoves(position, board, enpassant, lastTurnPawnPosition);
    expect(moves).toContain(16);
  });

  it('should move two squares forward from the starting position for white pawn', () => {
    const position = 48;
    board[position] = whitePawn;
    const moves = whitePawn.possibleMoves(position, board, enpassant, lastTurnPawnPosition);
    expect(moves).toContain(40);
    expect(moves).toContain(32);
  });

  it('should move two squares forward from the starting position for black pawn', () => {
    const position = 8;
    board[position] = blackPawn;
    const moves = blackPawn.possibleMoves(position, board, enpassant, lastTurnPawnPosition);
    expect(moves).toContain(16);
    expect(moves).toContain(24);
  });

  it('should capture an enemy piece diagonally for white pawn', () => {
    const position = 36;
    board[position] = whitePawn;
    board[27] = new Pawn(Player.Black);
    const moves = whitePawn.possibleCaptureMoves(position, board);
    expect(moves).toContain(27);
  });

  it('should capture an enemy piece diagonally for black pawn', () => {
    const position = 20;
    board[position] = blackPawn;
    board[29] = new Pawn(Player.White);
    const moves = blackPawn.possibleCaptureMoves(position, board);
    expect(moves).toContain(29);
  });

  it('should allow en passant', () => {
    const position = 28;
    board[position] = whitePawn;
    board[27] = new Pawn(Player.Black);
    enpassant = true;
    lastTurnPawnPosition = 27;
    const moves = whitePawn.possibleMoves(position, board, enpassant, lastTurnPawnPosition);
    expect(moves).toContain(19);
    expect(moves).toContain(20);
  });

  it('should not move forward if blocked by another piece for white pawn', () => {
    const position = 48;
    board[position] = whitePawn;
    board[40] = new Pawn(Player.White);
    const moves = whitePawn.possibleMoves(position, board, enpassant, lastTurnPawnPosition);
    expect(moves).not.toContain(40);
  });

  it('should not move forward if blocked by another piece for black pawn', () => {
    const position = 8;
    board[position] = blackPawn;
    board[16] = new Pawn(Player.Black);
    const moves = blackPawn.possibleMoves(position, board, enpassant, lastTurnPawnPosition);
    expect(moves).not.toContain(16);
  });

  it('should not capture on the left or right edge for white pawn', () => {
    const position = 40;
    board[position] = whitePawn;
    const moves = whitePawn.possibleCaptureMoves(position, board);
    expect(moves).not.toContain(32);

    const positionRightEdge = 47; 
    board[positionRightEdge] = whitePawn;
    const movesRightEdge = whitePawn.possibleCaptureMoves(positionRightEdge, board);
    expect(movesRightEdge).not.toContain(55);
  });

  it('should not capture on the left or right edge for black pawn', () => {
    const position = 55; 
    board[position] = blackPawn;
    const moves = blackPawn.possibleCaptureMoves(position, board);
    expect(moves).not.toContain(47);

    const positionRightEdge = 40;
    board[positionRightEdge] = blackPawn;
    const movesRightEdge = blackPawn.possibleCaptureMoves(positionRightEdge, board);
    expect(movesRightEdge).not.toContain(32);
  });
});
