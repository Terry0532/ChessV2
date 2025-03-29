import Bishop from './bishop';

const createEmptyBoard = () => new Array(64).fill(null);

describe('Bishop', () => {
  let bishop;
  
  beforeEach(() => {
    bishop = new Bishop(1);
  });

  test('should return correct diagonal moves on an empty board', () => {
    const squares = createEmptyBoard();
    const src = 35;
    squares[src] = bishop;
    const moves = bishop.possibleMoves(src, squares);
    const expectedMoves = [26, 17, 8, 28, 21, 14, 42, 49, 56, 44, 53, 62];
    
    expectedMoves.forEach((move) => {
      expect(moves).toContain(move);
    });
  });

  test('should stop at an enemy piece and include its position', () => {
    const squares = createEmptyBoard();
    const src = 35;
    squares[src] = bishop;
    
    const enemyBishop = new Bishop(2);
    squares[26] = enemyBishop;
    
    const moves = bishop.possibleMoves(src, squares);
    
    expect(moves).toContain(26);
    expect(moves).not.toContain(17);
  });

  test('should stop before a friendly piece and not include its position', () => {
    const squares = createEmptyBoard();
    const src = 35;
    squares[src] = bishop;
    
    const friendlyPiece = new Bishop(1);
    squares[26] = friendlyPiece;
    
    const moves = bishop.possibleMoves(src, squares);
    
    expect(moves).not.toContain(26);
  });
});
