import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { SocketServerMock } from 'socket.io-mock-ts';
import Game from './game';
import Pawn from '../pieces/pawn';
import { Player } from '../helpers/types';
import Rook from '../pieces/rook';
import Knight from '../pieces/knight';
import Bishop from '../pieces/bishop';
import Queen from '../pieces/queen';
import King from '../pieces/king';

const socket = new SocketServerMock();
const client = socket.clientMock;
const pieceDefaultPositions = [
  { piece: Pawn, player: Player.White, positions: [48, 49, 50, 51, 52, 53, 54, 55] },
  { piece: Pawn, player: Player.Black, positions: [8, 9, 10, 11, 12, 13, 14, 15] },
  { piece: Rook, player: Player.White, positions: [56, 63] },
  { piece: Rook, player: Player.Black, positions: [0, 7] },
  { piece: Knight, player: Player.White, positions: [57, 62] },
  { piece: Knight, player: Player.Black, positions: [1, 6] },
  { piece: Bishop, player: Player.White, positions: [58, 61] },
  { piece: Bishop, player: Player.Black, positions: [2, 5] },
  { piece: Queen, player: Player.White, positions: [59] },
  { piece: Queen, player: Player.Black, positions: [3] },
  { piece: King, player: Player.White, positions: [60] },
  { piece: King, player: Player.Black, positions: [4] }
];

const clickBoard = (index: number) => {
  fireEvent.click(screen.getByTestId("board-square-" + index));
};

const playGame = () => {
  clickBoard(52);
  clickBoard(36);
  clickBoard(1);
  clickBoard(18);
  clickBoard(59);
  clickBoard(45);
  clickBoard(8);
  clickBoard(24);
  clickBoard(61);
  clickBoard(34);
  clickBoard(24);
  clickBoard(32);
  clickBoard(45);
  clickBoard(13);
};

const expectPieceAtPosition = (
  pieceClass: any, player: Player, positions: number[]
) => {
  const pieceUrl = new pieceClass(player).style.backgroundImage;
  positions.forEach((position) => {
    expect(screen.getByTestId(`board-square-${ position }`)).toHaveStyle(
      `background-image: ${ pieceUrl }`
    );
  });
};

global.structuredClone = (val) => JSON.parse(JSON.stringify(val));

describe("Game", () => {
  beforeEach(() => {
    render(<Game />);
  });

  describe("offline mode", () => {
    beforeEach(() => {
      fireEvent.click(screen.getByTestId("offline-mode-button"));
    });

    it("shoule ba able to start offline single player game", () => {
      expect(screen.getByTestId("game-board")).toBeInTheDocument();
      
      pieceDefaultPositions.forEach(({ piece, player, positions }) => {
        expectPieceAtPosition(piece, player, positions);
      });
    });

    it("should only have leave game button", () => {
      expect(screen.getByTestId("leave-game-button")).toBeInTheDocument();
    });

    it("should be able to leave game", () => {
      fireEvent.click(screen.getByTestId("leave-game-button"));

      expect(screen.queryByTestId("game-board")).not.toBeInTheDocument();
      expect(screen.getByTestId("online-mode-button")).toBeInTheDocument();
      expect(screen.getByTestId("offline-mode-button")).toBeInTheDocument();
    });

    it("should be able to play offline game", () => {
      playGame();

      expect(screen.getByTestId("game-status")).toHaveTextContent("White Won");
    });

    it("should display new game button after gameover", () => {
      playGame();

      expect(screen.getByTestId("new-game-button")).toHaveStyle("display: inline-block");
    });

    it("should be able to start a new game with new game button", () => {
      playGame();

      expect(screen.getByTestId("new-game-button")).toHaveStyle("display: inline-block");

      fireEvent.click(screen.getByTestId("new-game-button"));
      
      expect(screen.getByTestId("new-game-button")).toHaveStyle("display: none");
      expect(screen.getByTestId("game-board")).toBeInTheDocument();

      pieceDefaultPositions.forEach(({ piece, player, positions }) => {
        expectPieceAtPosition(piece, player, positions);
      });
    });

    it("should display correct turn color", () => {
      expect(screen.getByTestId("player-turn-box")).toHaveStyle("background-color: white");
      
      clickBoard(52);
      clickBoard(36);
      
      expect(screen.getByTestId("player-turn-box")).toHaveStyle("background-color: black");
    });

    describe("algebraic notation", () => {
      let algebraicNotation: HTMLElement;

      beforeEach(() => {
        algebraicNotation = screen.queryByTestId("algebraic-notation");  
      });

      it("should display correct pawn move, capture, promotion, and enpassant notation", () => {
        clickBoard(52);
        clickBoard(36);
        expect(algebraicNotation).toHaveTextContent("e4");
        clickBoard(11);
        clickBoard(27);
        expect(algebraicNotation).toHaveTextContent("d5");
        clickBoard(36);
        clickBoard(27);
        expect(algebraicNotation).toHaveTextContent("exd5");
        clickBoard(12);
        clickBoard(28);
        expect(algebraicNotation).toHaveTextContent("e5");
        clickBoard(27);
        clickBoard(20);
        expect(algebraicNotation).toHaveTextContent("dxe6");
        clickBoard(4);
        clickBoard(12);
        expect(algebraicNotation).toHaveTextContent("Ke7");
        clickBoard(20);
        clickBoard(13);
        expect(algebraicNotation).toHaveTextContent("exf7");
        clickBoard(12);
        clickBoard(11);
        expect(algebraicNotation).toHaveTextContent("Kd7");
        clickBoard(13);
        clickBoard(6);
        clickBoard(13);
        expect(algebraicNotation).toHaveTextContent("fxg8=Q");
      });
      
      it("should display other pieces move, capture, and check correctly", () => {
        clickBoard(62);
        clickBoard(45);
        expect(algebraicNotation).toHaveTextContent("Nf3");
        clickBoard(12);
        clickBoard(28);
        expect(algebraicNotation).toHaveTextContent("e5");
        clickBoard(45);
        clickBoard(28);
        expect(algebraicNotation).toHaveTextContent("Nxe5");
        clickBoard(5);
        clickBoard(33);
        expect(algebraicNotation).toHaveTextContent("Bb4");
        clickBoard(52);
        clickBoard(36);
        expect(algebraicNotation).toHaveTextContent("e4");
        clickBoard(4);
        clickBoard(5);
        expect(algebraicNotation).toHaveTextContent("Kf8");
        clickBoard(61);
        clickBoard(34);
        expect(algebraicNotation).toHaveTextContent("Bc4");
        clickBoard(3);
        clickBoard(21);
        expect(algebraicNotation).toHaveTextContent("Qf6");
        clickBoard(63);
        clickBoard(61);
        expect(algebraicNotation).toHaveTextContent("Rf1");
        clickBoard(21);
        clickBoard(53);
        expect(algebraicNotation).toHaveTextContent("Qxf2+");
        clickBoard(61);
        clickBoard(53);
        expect(algebraicNotation).toHaveTextContent("Rxf2");
        clickBoard(33);
        clickBoard(51);
        expect(algebraicNotation).toHaveTextContent("Bxd2+");
      });
      
      it("should display castling correctly", () => {
        clickBoard(62);
        clickBoard(45);
        expect(algebraicNotation).toHaveTextContent("Nf3");
        clickBoard(11);
        clickBoard(27);
        expect(algebraicNotation).toHaveTextContent("d5");
        clickBoard(52);
        clickBoard(36);
        expect(algebraicNotation).toHaveTextContent("e4");
        clickBoard(2);
        clickBoard(47);
        expect(algebraicNotation).toHaveTextContent("Bh3");
        clickBoard(61);
        clickBoard(16);
        expect(algebraicNotation).toHaveTextContent("Ba6");
        clickBoard(1);
        clickBoard(16);
        expect(algebraicNotation).toHaveTextContent("Nxa6");
        clickBoard(60);
        clickBoard(62);
        expect(algebraicNotation).toHaveTextContent("0-0");
        clickBoard(3);
        clickBoard(19);
        expect(algebraicNotation).toHaveTextContent("Qd6");
        clickBoard(59);
        clickBoard(60);
        expect(algebraicNotation).toHaveTextContent("Qe1");
        clickBoard(4);
        clickBoard(2);
        expect(algebraicNotation).toHaveTextContent("0-0-0");
      });

      it("should display checkmate", () => {
        playGame();

        expect(algebraicNotation).toHaveTextContent("Qxf7#");
      });
    });
  });

  describe("online mode", () => {
    beforeEach(() => {
      fireEvent.click(screen.getByTestId("online-mode-button"));
    });
    
    it("should allow user to enter a name and enter game lobby", () => {
      
    });
  });
});
