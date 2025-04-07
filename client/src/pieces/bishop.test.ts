import { Player } from '../helpers/types';
import Bishop from './bishop';

const createEmptyBoard = () => new Array(64).fill(null);

describe('Bishop', () => {
  let bishop;
  let board;
  let position;
  
  beforeEach(() => {
    bishop = new Bishop(Player.White);
    board = createEmptyBoard();
    position = 35;
    board[position] = bishop;
  });

  it('should return correct diagonal moves on an empty board', () => {
    const moves = bishop.possibleMoves(position, board);
    const expectedMoves = [26, 17, 8, 28, 21, 14, 42, 49, 56, 44, 53, 62];
    
    expectedMoves.forEach((move) => {
      expect(moves).toContain(move);
    });
  });

  it('should stop at an enemy piece and include its position', () => {
    board[26] = new Bishop(Player.Black);
    const moves = bishop.possibleMoves(position, board);
    
    expect(moves).toContain(26);
    expect(moves).not.toContain(17);
  });

  it('should stop before a friendly piece and not include its position', () => {
    board[26] = new Bishop(Player.White);
    const moves = bishop.possibleMoves(position, board);
    
    expect(moves).not.toContain(26);
  });
});
