import { Player } from '../helpers/types';
import King from './king';

const createEmptyBoard = () => new Array(64).fill(null);

describe('King', () => {
  let king;
  let board;

  beforeEach(() => {
    king = new King(Player.White);
    board = createEmptyBoard();
  });

  it('should return all adjacent moves on an empty board', () => {
    const position = 27;
    board[position] = king;
    const moves = king.possibleMoves(position, board);
    const expectedMoves = [26, 28, 19, 35, 20, 18, 36, 34];

    expectedMoves.forEach((move) => {
      expect(moves).toContain(move);
    });
    expect(moves.length).toBe(expectedMoves.length);
  });

  it('should include an enemy piece for capture and stop further move', () => {
    const position = 27;
    board[position] = king;
    board[26] = new King(Player.Black);
    const moves = king.possibleMoves(position, board);

    expect(moves).toContain(26);
  });

  it('should not allow moves where a friendly piece is located', () => {
    const position = 27;
    board[position] = king;
    board[28] = new King(Player.White);
    const moves = king.possibleMoves(position, board);

    expect(moves).not.toContain(28);
  });

  it('should correctly handle board edges', () => {
    const position = 0;
    board[position] = king;
    const moves = king.possibleMoves(position, board);
    const expectedMoves = [1, 8, 9];

    expectedMoves.forEach((move) => {
      expect(moves).toContain(move);
    });
    expect(moves.length).toBe(expectedMoves.length);
  });

  it('should correctly handle the top-right corner', () => {
    const position = 7;
    board[position] = king;
    const moves = king.possibleMoves(position, board);
    const expectedMoves = [6, 14, 15];

    expectedMoves.forEach((move) => {
      expect(moves).toContain(move);
    });
    expect(moves.length).toBe(expectedMoves.length);
  });

  it('should correctly handle the bottom-left corner', () => {
    const position = 56;
    board[position] = king;
    const moves = king.possibleMoves(position, board);
    const expectedMoves = [48, 49, 57];

    expectedMoves.forEach((move) => {
      expect(moves).toContain(move);
    });
    expect(moves.length).toBe(expectedMoves.length);
  });

  it('should correctly handle the bottom-right corner', () => {
    const position = 63;
    board[position] = king;
    const moves = king.possibleMoves(position, board);
    const expectedMoves = [54, 55, 62];

    expectedMoves.forEach((move) => {
      expect(moves).toContain(move);
    });
    expect(moves.length).toBe(expectedMoves.length);
  });

  it('should correctly handle the top edge (non-corner)', () => {
    const position = 3;
    board[position] = king;
    const moves = king.possibleMoves(position, board);
    const expectedMoves = [2, 4, 11, 12, 10];

    expectedMoves.forEach((move) => {
      expect(moves).toContain(move);
    });
    expect(moves.length).toBe(expectedMoves.length);
  });

  it('should correctly handle the left edge (non-corner)', () => {
    const position = 24;
    board[position] = king;
    const moves = king.possibleMoves(position, board);
    const expectedMoves = [16, 17, 25, 32, 33];

    expectedMoves.forEach((move) => {
      expect(moves).toContain(move);
    });
    expect(moves.length).toBe(expectedMoves.length);
  });

  it('should correctly handle the right edge (non-corner)', () => {
    const position = 31;
    board[position] = king;
    const moves = king.possibleMoves(position, board);
    const expectedMoves = [22, 23, 30, 38, 39];

    expectedMoves.forEach((move) => {
      expect(moves).toContain(move);
    });
    expect(moves.length).toBe(expectedMoves.length);
  });

  it('should correctly handle the bottom edge (non-corner)', () => {
    const position = 59;
    board[position] = king;
    const moves = king.possibleMoves(position, board);
    const expectedMoves = [50, 51, 58, 52, 60];

    expectedMoves.forEach((move) => {
      expect(moves).toContain(move);
    });
    expect(moves.length).toBe(expectedMoves.length);
  });

  it('should include all 8 adjacent squares if occupied by enemy pieces', () => {
    const position = 27;
    board[position] = king;
    const adjacentPositions = [26, 28, 19, 35, 20, 18, 36, 34];
    adjacentPositions.forEach((pos) => {
      board[pos] = new King(Player.Black);
    });
    const moves = king.possibleMoves(position, board);

    expect(moves).toEqual(expect.arrayContaining(adjacentPositions));
    expect(moves.length).toBe(adjacentPositions.length);
  });

  it('should allow capture of enemies and disallow moves to friendly pieces when surrounded', () => {
    const position = 27;
    board[position] = king;
    board[26] = new King(Player.Black);
    board[28] = new King(Player.White);
    board[19] = new King(Player.Black);
    board[35] = new King(Player.White);
    board[20] = new King(Player.Black);
    board[18] = new King(Player.White);
    board[36] = new King(Player.Black);
    board[34] = new King(Player.White);

    const moves = king.possibleMoves(position, board);
    const expectedMoves = [26, 19, 20, 36];

    expect(moves).toEqual(expect.arrayContaining(expectedMoves));
    expect(moves.length).toBe(expectedMoves.length);
  });

  it('should handle a king near the top edge with limited moves', () => {
    const position = 9;
    board[position] = king;
    const moves = king.possibleMoves(position, board);
    const expectedMoves = [0, 1, 2, 8, 10, 16, 17, 18];

    expectedMoves.forEach((move) => {
      expect(moves).toContain(move);
    });
    expect(moves.length).toBe(expectedMoves.length);
  });

  it('should handle a king near the right edge with limited moves', () => {
    const position = 15;
    board[position] = king;
    const moves = king.possibleMoves(position, board);
    const expectedMoves = [6, 7, 14, 22, 23];

    expectedMoves.forEach((move) => {
      expect(moves).toContain(move);
    });
    expect(moves.length).toBe(expectedMoves.length);
  });
});
