import { Player } from '../helpers/types';
import Queen from './queen';

const createEmptyBoard = () => new Array(64).fill(null);

describe('Queen', () => {
  let queen;
  let board;
  let position;

  beforeEach(() => {
    queen = new Queen(Player.White);
    board = createEmptyBoard();
    position = 27;
    board[position] = queen;    
  });

  test('should return all valid vertical, horizontal, and diagonal moves from a central position on an empty board', () => {
    const moves = queen.possibleMoves(position, board);
    const expectedMoves = [
      19, 11, 3, 35, 43, 51, 59,
      26, 25, 24, 28, 29, 30, 31, 
      18, 9, 0, 20, 13, 6, 34, 41, 48, 36, 45, 54
    ];

    expectedMoves.forEach((move) => {
      expect(moves).toContain(move);
    });
  });

  test('should stop vertical movement when blocked by a friendly piece', () => {
    board[19] = new Queen(Player.White);
    const moves = queen.possibleMoves(position, board);

    expect(moves).not.toContain(19);
    expect(moves).not.toContain(11);
  });

  test('should allow capturing an enemy piece in a diagonal direction and then stop further moves in that direction', () => {
    board[18] = new Queen(Player.Black);
    const moves = queen.possibleMoves(position, board);

    expect(moves).toContain(18);
    expect(moves).not.toContain(9);
  });
});
