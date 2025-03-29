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
    
    expectedMoves.forEach((move) => {
      expect(moves).toContain(move);
    });
    expect(moves.length).toBe(expectedMoves.length);
  });
  
  it('should allow capturing an enemy piece', () => {
    const position = 27;
    board[position] = knight;
    board[10] = new Knight(Player.Black);
    const moves = knight.possibleMoves(position, board);
    
    expect(moves).toContain(10);
  });
  
  it('should not include moves where a friendly piece is located', () => {
    const position = 27;
    board[position] = knight;
    board[12] = new Knight(Player.White);
    const moves = knight.possibleMoves(position, board);
    
    expect(moves).not.toContain(12);
  });
  
  it('should correctly handle board edges', () => {
    const position = 0;
    board[position] = knight;
    const moves = knight.possibleMoves(position, board);
    const expectedMoves = [10, 17];
    
    expectedMoves.forEach((move) => {
      expect(moves).toContain(move);
    });
    expect(moves.length).toBe(expectedMoves.length);
  });
});
