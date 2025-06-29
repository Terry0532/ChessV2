import React from "react";
import "../index.css";
import { Theme } from "../helpers/types";
import AnimatedPiece from "./AnimatedPiece";

type BoardProps = {
  squares: any;
  onClick: (i: number) => void;
  disabled: boolean;
  rotateBoard: string;
  theme: Theme;
  animatingMove?: { from: number; to: number; piece: any } | null;
  onAnimationComplete?: () => void;
};

const Board: React.FC<BoardProps> = ({
  squares,
  onClick,
  disabled,
  rotateBoard,
  theme,
  animatingMove,
  onAnimationComplete,
}) => {
  const isEven = (num: number) => {
    return num % 2 === 0;
  };

  const renderSquare = (i: number, squareShade: string) => {
    const squareStyle =
      animatingMove && i === animatingMove.from
        ? { ...squares[i].style, backgroundImage: "none" }
        : squares[i]
        ? squares[i].style
        : null;

    return (
      <div key={i} className="button">
        <button
          className={"square " + squareShade + " " + rotateBoard}
          onClick={() => onClick(i)}
          style={squareStyle}
          disabled={disabled}
          data-testid={"board-square-" + i}
        ></button>
      </div>
    );
  };

  const board = [];
  for (let i = 0; i < 8; i++) {
    const squareRows = [];
    for (let j = 0; j < 8; j++) {
      const squareShade =
        (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j))
          ? `light-square ${theme}`
          : `dark-square ${theme}`;
      squareRows.push(renderSquare(i * 8 + j, squareShade));
    }
    board.push(
      <div key={i} className="board-row" data-testid={"board-row-" + i}>
        {squareRows}
      </div>
    );
  }

  return (
    <div data-testid="board-container" className={rotateBoard}>
      {board}
      {animatingMove && (
        <AnimatedPiece
          piece={animatingMove.piece}
          fromPosition={animatingMove.from}
          toPosition={animatingMove.to}
          onAnimationComplete={onAnimationComplete}
          boardSize={8}
          squareSize={48}
        />
      )}
    </div>
  );
};

export default Board;
