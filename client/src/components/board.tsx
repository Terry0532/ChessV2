import React from 'react';
import '../index.css';

type BoardProps = {
  squares: any;
  onClick: (i: number) => void;
  disabled: boolean;
  rotateBoard: string;
};

const Board: React.FC<BoardProps> = ({ squares, onClick, disabled, rotateBoard }) => {
  const isEven = (num: number) => {
    return num % 2 === 0;
  };

  const renderSquare = (i: number, squareShade: string) => {
    return (
      <div className="button">
        <button
          className={"square " + squareShade + " " + rotateBoard}
          onClick={() => onClick(i)}
          style={squares[i] ? squares[i].style : null}
          disabled={disabled}
        ></button>
      </div>
    );
  };

  const board = [];
  for (let i = 0; i < 8; i++) {
    const squareRows = [];
    for (let j = 0; j < 8; j++) {
      const squareShade = (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j)) ? "light-square" : "dark-square";
      squareRows.push(renderSquare((i * 8) + j, squareShade));
    }
    board.push(<div className="board-row">{squareRows}</div>);
  }

  return (
    <div className={rotateBoard}>
      {board}
    </div>
  );
};

export default Board;
