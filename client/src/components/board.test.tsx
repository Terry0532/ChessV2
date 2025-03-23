import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Board from './board';
import initialiseChessBoard from '../helpers/initialiseChessBoard';
import '@testing-library/jest-dom/extend-expect';

const renderComponent = (
  onClick: () => void, squares: any[], disabled: boolean = false, rotateBoard: string = ""
) => {
  render(
    <Board squares={squares} onClick={onClick} disabled={disabled} rotateBoard={rotateBoard} />
  );
};

describe("board", () => {
  const onClick = jest.fn();
  const squares = initialiseChessBoard();
  
  it("should be able to click on chess board", () => {
    renderComponent(onClick, squares);

    fireEvent.click(screen.getByTestId("board-square-0"));

    expect(onClick).toHaveBeenCalled();
  });

  it("should not be able to click on chess board if disabled", () => {
    renderComponent(onClick, squares, true);

    fireEvent.click(screen.getByTestId("board-square-0"));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("should be able to rotate chess board", () => {
    renderComponent(onClick, squares, true, "rotate");

    expect(screen.getByTestId("board-container")).toHaveClass("rotate");
    for (let index = 0; index < 64; index++) {
      expect(screen.getByTestId("board-square-" + index)).toHaveClass("rotate");
    }
  });
});
