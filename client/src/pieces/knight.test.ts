import { Player } from '../helpers/types';
import Knight from './knight';

const createEmptyBoard = () => new Array(64).fill(null);

describe('Knight', () => {
  let knight;
  let board;

  beforeEach(() => {
    knight = new Knight(Player.White);
    board = createEmptyBoard();
  });

  it('should return correct moves for knight from a central position', () => {
    const position = 27;
    board[position] = knight;
    const moves = knight.possibleMoves(position, board);
    const expectedMoves = [10, 12, 17, 21, 33, 37, 42, 44];

    expect(moves).toEqual(expect.arrayContaining(expectedMoves));
    expect(moves.length).toBe(expectedMoves.length);
  });

  it('should allow capturing enemy pieces on all possible moves', () => {
    const position = 27;
    board[position] = knight;
    const enemyPositions = [10, 12, 17, 21, 33, 37, 42, 44];
    enemyPositions.forEach((pos) => {
      board[pos] = new Knight(Player.Black);
    });
    const moves = knight.possibleMoves(position, board);

    expect(moves).toEqual(expect.arrayContaining(enemyPositions));
    expect(moves.length).toBe(enemyPositions.length);
  });

  it('should not include moves where friendly pieces are located', () => {
    const position = 27;
    board[position] = knight;
    const friendlyPositions = [10, 12, 17, 21, 33, 37, 42, 44];
    friendlyPositions.forEach((pos) => {
      board[pos] = new Knight(Player.White);
    });
    const moves = knight.possibleMoves(position, board);

    expect(moves).toEqual([]);
  });

  it('should handle board edges and corners correctly', () => {
    const edgePositions = [
      { pos: 0, expected: [10, 17] },
      { pos: 7, expected: [13, 22] },
      { pos: 56, expected: [41, 50] },
      { pos: 63, expected: [46, 53] },
      { pos: 8, expected: [18, 25, 2] },
      { pos: 16, expected: [1, 10, 26, 33] },
      { pos: 24, expected: [9, 18, 34, 41] },
      { pos: 32, expected: [17, 26, 42, 49] },
      { pos: 40, expected: [25, 34, 50, 57] },
      { pos: 48, expected: [33, 42, 58] },
      { pos: 55, expected: [38, 45, 61] },
      { pos: 47, expected: [30, 37, 53, 62] },
      { pos: 39, expected: [22, 29, 45, 54] },
      { pos: 31, expected: [14, 21, 37, 46] },
      { pos: 23, expected: [6, 13, 29, 38] },
      { pos: 15, expected: [5, 21, 30] },
    ];

    edgePositions.forEach(({ pos, expected }) => {
      board = createEmptyBoard();
      board[pos] = knight;
      const moves = knight.possibleMoves(pos, board);

      expect(moves).toEqual(expect.arrayContaining(expected));
      expect(moves.length).toBe(expected.length);
    });
  });

  it('should handle midpoints of top and bottom edges', () => {
    const edgePositions = [
      { pos: 3, expected: [13, 18, 9, 20] },
      { pos: 4, expected: [10, 19, 21, 14] },
      { pos: 59, expected: [44, 53, 42, 49] },
      { pos: 60, expected: [43, 54, 45, 50] },
    ];

    edgePositions.forEach(({ pos, expected }) => {
      board = createEmptyBoard();
      board[pos] = knight;
      const moves = knight.possibleMoves(pos, board);

      expect(moves).toEqual(expect.arrayContaining(expected));
      expect(moves.length).toBe(expected.length);
    });
  });
});
