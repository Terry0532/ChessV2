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
});
