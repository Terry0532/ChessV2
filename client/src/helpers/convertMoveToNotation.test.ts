import Bishop from '../pieces/bishop';
import King from '../pieces/king';
import Knight from '../pieces/knight';
import Pawn from '../pieces/pawn';
import Queen from '../pieces/queen';
import Rook from '../pieces/rook';
import { convertMoveToNotation } from './convertMoveToNotation';
import { Player } from './types';

const emptyBoard = Array(64).fill(null);

let oldBoard = [];
let newBoard = [];

describe('convertMoveToNotation', () => {
  beforeEach(() => {
    oldBoard = [...emptyBoard];
    newBoard = [...emptyBoard];
  });

  describe("castle", () => {
    it('should return "0-0" for white king-side castling', () => {
      oldBoard[60] = new King(Player.White);
  
      expect(
        convertMoveToNotation(
          60, 62, oldBoard, false, "white", [1], oldBoard, false
        )
      ).toBe("0-0");
    });
  
    it('should return "0-0" for black king-side castling', () => {
      oldBoard[4] = new King(Player.Black);
  
      expect(
        convertMoveToNotation(
          4, 6, oldBoard, false, "black", [1], oldBoard, false
        )
      ).toBe("0-0");
    });
  
    it('should return "0-0-0" for white queen-side castling', () => {
      oldBoard[60] = new King(Player.White);
  
      expect(
        convertMoveToNotation(
          60, 58, oldBoard, false, "white", [1], oldBoard, false
        )
      ).toBe('0-0-0');
    });
  
    it('should return "0-0-0" for black queen-side castling', () => {
      oldBoard[4] = new King(Player.Black);
  
      expect(
        convertMoveToNotation(
          4, 2, oldBoard, false, "black", [1], oldBoard, false
        )
      ).toBe('0-0-0');
    });
  });

  describe('Pawn', () => {
    it('should show file of origin and file of capture for pawn captures', () => {
      oldBoard[51] = new Pawn(Player.White);
      oldBoard[42] = new Pawn(Player.Black);

      expect(
        convertMoveToNotation(
          51, 42, oldBoard, false, "white", [1], oldBoard, false
        )
      ).toBe("dxc3");
    });

    it("should be able to enpassant", () => {
      oldBoard[28] = new Pawn(Player.White);
      oldBoard[21] = {};
      oldBoard[29] = new Pawn(Player.Black);
      newBoard[21] = new Pawn(Player.White);

      expect(
        convertMoveToNotation(
          28, 21, oldBoard, true, "white", [1], newBoard, false
        )
      ).toBe("exf6");
    });

    it("move pawn to empty square", () => {
      oldBoard[48] = new Pawn(Player.White);
      oldBoard[40] = {};
      newBoard[40] = new Pawn(Player.White);

      expect(
        convertMoveToNotation(
          48, 40, oldBoard, false, "white", [1], newBoard, false
        )
      ).toBe("a3");
    });

    it("move 2 squares", () => {
      oldBoard[48] = new Pawn(Player.White);
      oldBoard[32] = {};
      newBoard[32] = new Pawn(Player.White);

      expect(
        convertMoveToNotation(
          48, 32, oldBoard, false, "white", [1], newBoard, false
        )
      ).toBe("a4");
    });

    it("promotion", () => {
      oldBoard[10] = new Pawn(Player.White);
      oldBoard[3] = new Knight(Player.Black);
      newBoard[3] = new Queen(Player.White);

      expect(
        convertMoveToNotation(
          10, 3, oldBoard, false, "white", [1], newBoard, true
        )
      ).toBe("cxd8=Q");
    });
  });

  describe('King', () => {
    it("should to be able to move", () => {
      oldBoard[0] = new King(Player.White);
      oldBoard[1] = {};
      newBoard[1] = new King(Player.White);

      expect(
        convertMoveToNotation(
          0, 1, oldBoard, false, "white", [1], newBoard, false
        )
      ).toBe("Kb8");
    });

    it("should to be able to capture", () => {
      oldBoard[0] = new King(Player.White);
      oldBoard[1] = new King(Player.Black);
      newBoard[1] = new King(Player.White);

      expect(
        convertMoveToNotation(
          0, 1, oldBoard, false, "white", [1], newBoard, false
        )
      ).toBe("Kxb8");
    });
  });

  describe('Bishop', () => {
    it("should to be able to move", () => {
      oldBoard[0] = new Bishop(Player.White);
      oldBoard[63] = {};
      newBoard[63] = new Bishop(Player.White);

      expect(
        convertMoveToNotation(
          0, 63, oldBoard, false, "white", [1], newBoard, false
        )
      ).toBe("Bh1");
    });

    it("should to be able to capture", () => {
      oldBoard[0] = new Bishop(Player.White);
      oldBoard[63] = new Bishop(Player.Black);
      newBoard[63] = new Bishop(Player.White);

      expect(
        convertMoveToNotation(
          0, 63, oldBoard, false, "white", [1], newBoard, false
        )
      ).toBe("Bxh1");
    });
  });

  describe('Knight', () => {
    it("should to be able to move", () => {
      oldBoard[0] = new Knight(Player.White);
      oldBoard[10] = {};
      newBoard[10] = new Knight(Player.White);

      expect(
        convertMoveToNotation(
          0, 10, oldBoard, false, "white", [1], newBoard, false
        )
      ).toBe("Nc7");
    });

    it("should to be able to capture", () => {
      oldBoard[0] = new Knight(Player.White);
      oldBoard[10] = new Knight(Player.Black);
      newBoard[10] = new Knight(Player.White);

      expect(
        convertMoveToNotation(
          0, 10, oldBoard, false, "white", [1], newBoard, false
        )
      ).toBe("Nxc7");
    });
  });

  describe('Queen', () => {
    it("should to be able to move", () => {
      oldBoard[0] = new Queen(Player.White);
      oldBoard[2] = {};
      newBoard[2] = new Queen(Player.White);

      expect(
        convertMoveToNotation(
          0, 2, oldBoard, false, "white", [1], newBoard, false
        )
      ).toBe("Qc8");
    });

    it("should to be able to capture", () => {
      oldBoard[0] = new Queen(Player.White);
      oldBoard[2] = new Queen(Player.Black);
      newBoard[2] = new Queen(Player.White);

      expect(
        convertMoveToNotation(
          0, 2, oldBoard, false, "white", [1], newBoard, false
        )
      ).toBe("Qxc8");
    });
  });

  describe('Rook', () => {
    it("should to be able to move", () => {
      oldBoard[0] = new Rook(Player.White);
      oldBoard[2] = {};
      newBoard[2] = new Rook(Player.White);

      expect(
        convertMoveToNotation(
          0, 2, oldBoard, false, "white", [1], newBoard, false
        )
      ).toBe("Rc8");
    });

    it("should to be able to capture", () => {
      oldBoard[0] = new Rook(Player.White);
      oldBoard[2] = new Rook(Player.Black);
      newBoard[2] = new Rook(Player.White);

      expect(
        convertMoveToNotation(
          0, 2, oldBoard, false, "white", [1], newBoard, false
        )
      ).toBe("Rxc8");
    });
  });

  describe('Check and checkmate', () => {
    it('should append # for checkmate', () => {
      oldBoard[0] = new Queen(Player.White);
      oldBoard[7] = {};

      expect(
        convertMoveToNotation(
          0, 7, oldBoard, false, 'white', [], oldBoard, false
        )
      ).toBe('Qh8#');
    });

    it('should append + for check', () => {
      oldBoard[0] = new Queen(Player.White);
      oldBoard[1] = {};
      oldBoard[17] = new King(Player.Black);
      newBoard[17] = new King(Player.Black);
      newBoard[1] = new Queen(Player.White);

      expect(
        convertMoveToNotation(
          0, 1, oldBoard, false, 'white', [1], newBoard, false
        )
      ).toBe('Qb8+');
    });
  });
});
