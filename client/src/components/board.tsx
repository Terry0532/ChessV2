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

  const files =
    rotateBoard === "rotate"
      ? ["h", "g", "f", "e", "d", "c", "b", "a"]
      : ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks =
    rotateBoard === "rotate"
      ? ["1", "2", "3", "4", "5", "6", "7", "8"]
      : ["8", "7", "6", "5", "4", "3", "2", "1"];
  const board = [];
  const topFileLabels = (
    <div key="top-files" className="file-labels-row">
      <div className="rank-label-space"></div>
      {files.map((file, index) => (
        <div key={`top-${file}`} className={`file-label ${theme} ${rotateBoard}`}>
          {file}
        </div>
      ))}
      <div className="rank-label-space"></div>
    </div>
  );
  board.push(topFileLabels);

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
      <div key={i} className="board-row-with-labels" data-testid={"board-row-" + i}>
        <div className={`rank-label ${theme} ${rotateBoard}`}>{ranks[i]}</div>
        <div className="board-row">{squareRows}</div>
        <div className={`rank-label ${theme} ${rotateBoard}`}>{ranks[i]}</div>
      </div>
    );
  }

  const bottomFileLabels = (
    <div key="bottom-files" className="file-labels-row">
      <div className="rank-label-space"></div>
      {files.map((file) => (
        <div key={`bottom-${file}`} className={`file-label ${theme} ${rotateBoard}`}>
          {file}
        </div>
      ))}
      <div className="rank-label-space"></div>
    </div>
  );
  board.push(bottomFileLabels);

  return (
    <div
      data-testid="board-container"
      className={`board-with-coordinates ${rotateBoard}`}
    >
      {board}
      {animatingMove && (
        <AnimatedPiece
          piece={animatingMove.piece}
          fromPosition={animatingMove.from}
          toPosition={animatingMove.to}
          onAnimationComplete={onAnimationComplete}
          boardSize={8}
          squareSize={48}
          isRotated={rotateBoard === "rotate"}
        />
      )}
    </div>
  );
};

export default Board;
