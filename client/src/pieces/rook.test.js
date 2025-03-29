import { Player } from '../helpers/types';
import Rook from './rook';

const createEmptyBoard = () => new Array(64).fill(null);

describe('Rook', () => {
  let rook;
  let board;
  let position;

  beforeEach(() => {
    rook = new Rook(Player.White);
    board = createEmptyBoard();
    position = 27;
    board[position] = rook;
  });

  it('should return correct vertical and horizontal moves on an empty board', () => {
    const moves = rook.possibleMoves(position, board);
    const expectedMoves = [
      19, 11, 3, 
      35, 43, 51, 59, 
      26, 25, 24, 
      28, 29, 30, 31 
    ];

    expectedMoves.forEach((move) => {
      expect(moves).toContain(move);
    });
    expect(moves.length).toBe(expectedMoves.length);
  });

  it('should stop vertical upward movement when blocked by a friendly piece', () => {
    board[19] = new Rook(Player.White);
    const moves = rook.possibleMoves(position, board);
    
    expect(moves).not.toContain(19);
    expect(moves).not.toContain(11);
    expect(moves).not.toContain(3);
  });

  it('should allow capturing an enemy piece upward and stop further moves in that direction', () => {
    board[19] = new Rook(Player.Black);
    const moves = rook.possibleMoves(position, board);
    
    expect(moves).toContain(19);
    expect(moves).not.toContain(11);
    expect(moves).not.toContain(3);
  });

  it('should stop vertical downward movement when blocked by a friendly piece', () => {
    board[35] = new Rook(Player.White);
    const moves = rook.possibleMoves(position, board);
    
    expect(moves).not.toContain(35);
    expect(moves).not.toContain(43);
    expect(moves).not.toContain(51);
    expect(moves).not.toContain(59);
  });

  it('should allow capturing an enemy piece downward and stop further moves in that direction', () => {
    board[35] = new Rook(Player.Black);
    const moves = rook.possibleMoves(position, board);
    
    expect(moves).toContain(35);
    expect(moves).not.toContain(43);
    expect(moves).not.toContain(51);
    expect(moves).not.toContain(59);
  });

  it('should stop horizontal movement to the left when blocked by a friendly piece', () => {
    board[26] = new Rook(Player.White);
    const moves = rook.possibleMoves(position, board);
    
    expect(moves).not.toContain(26);
    expect(moves).not.toContain(25);
    expect(moves).not.toContain(24);
  });

  it('should allow capturing an enemy piece to the left and then stop further movement', () => {
    board[26] = new Rook(Player.Black);
    const moves = rook.possibleMoves(position, board);
    
    expect(moves).toContain(26);
    expect(moves).not.toContain(25);
    expect(moves).not.toContain(24);
  });

  it('should stop horizontal movement to the right when blocked by a friendly piece', () => {
    board[28] = new Rook(Player.White);
    const moves = rook.possibleMoves(position, board);
    
    expect(moves).not.toContain(28);
    expect(moves).not.toContain(29);
    expect(moves).not.toContain(30);
    expect(moves).not.toContain(31);
  });

  it('should allow capturing an enemy piece to the right and then stop further movement', () => {
    board[28] = new Rook(Player.Black);
    const moves = rook.possibleMoves(position, board);
    
    expect(moves).toContain(28);
    expect(moves).not.toContain(29);
    expect(moves).not.toContain(30);
    expect(moves).not.toContain(31);
  });
});
