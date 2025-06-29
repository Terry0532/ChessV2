import Bishop from "../pieces/bishop";
import Knight from "../pieces/knight";
import Queen from "../pieces/queen";
import Rook from "../pieces/rook";
import { convertMoveToNotation } from "./convertMoveToNotation";
import { ChessPiece, GameAction, GameState, Player, PlayerAction, Theme } from "./types";

export const canEnpassant = (
  selectedPawnPosition: number, lastTurnPawnPosition: number, pawnFirstMove: boolean
) => {
  let enpassant = false;
  if (
    selectedPawnPosition - 1 === lastTurnPawnPosition ||
    selectedPawnPosition + 1 === lastTurnPawnPosition
  ) {
    if (pawnFirstMove) {
      enpassant = true;
    }
  }
  return enpassant;
};

export const dehighlight = (squares: any[], highLightMoves: number[]) => {
  console.log(squares)
  console.log(highLightMoves)
  for (let index = 0; index < highLightMoves.length; index++) {
    const element = highLightMoves[index];

    if (squares[element].name !== undefined) {
      squares[element].setBackgroundColor("");
    } 
    else {
      squares[element] = null;
    }
  }
  return squares;
}

export const movePiece = (i: number, squares: any[], sourceSelection: number) => {
  squares[i] = squares[sourceSelection];
  squares[sourceSelection] = null;
  return squares;
}

//to check if selected piece can move or not, e.g., if they move seleced piece and it will end up in checkmate
export const validateMoves = (
  squares: any[], possibleMoves: number[], i: number, turn: string, whiteKingPosition: number, blackKingPosition: number
) => {
  const selectedPiece = i;
  let isKing = false;
  if (squares[selectedPiece].name === "King") {
    isKing = true;
  }

  const newList: number[] = [];

  for (let i = 0; i < possibleMoves.length; i++) {
    let simulatedBoard = squares.concat();
    simulatedBoard[possibleMoves[i]] = simulatedBoard[selectedPiece];
    simulatedBoard[selectedPiece] = null;

    if (!isKing) {
      if (turn === "white") {
        if (!getAllPossibleMoves(simulatedBoard, Player.Black).includes(whiteKingPosition)) {
          newList.push(possibleMoves[i]);
        }
      } 
      else if (turn === "black") {
        if (!getAllPossibleMoves(simulatedBoard, Player.White).includes(blackKingPosition)
        ) {
          newList.push(possibleMoves[i]);
        }
      }
    } 
    else if (isKing) {
      if (turn === "white") {
        if (!getAllPossibleMoves(simulatedBoard, Player.Black).includes(possibleMoves[i])) {
          newList.push(possibleMoves[i]);
        }
      } 
      else if (turn === "black") {
        if (!getAllPossibleMoves(simulatedBoard, Player.White).includes(possibleMoves[i])) {
          newList.push(possibleMoves[i]);
        }
      }
    }
  }

  return newList;
};

export const getAllPossibleMoves = (squares: any[], player: Player) => {
  const allPossibleMoves: number[] = [];
  
  for (let i = 0; i < squares.length; i++) {
    const piece = squares[i];
    if (piece !== null && piece.player === player) {
      const possibleMoves = piece.name === "Pawn"
        ? piece.possibleCaptureMoves(i, squares)
        : piece.possibleMoves(i, squares);
      
      for (let j = 0; j < possibleMoves.length; j++) {
        allPossibleMoves.push(possibleMoves[j]);
      }
    }
  }
  
  allPossibleMoves.sort();
  const uniqueMoves: number[] = [];
  for (let i = 0; i < allPossibleMoves.length; i++) {
    if (allPossibleMoves[i] !== allPossibleMoves[i + 1]) {
      uniqueMoves.push(allPossibleMoves[i]);
    }
  }
  
  return uniqueMoves;
};

export const getButtonVariant = (theme: Theme) => {
  return theme === Theme.Light ? "outline-primary" : "outline-info";
};

export const addToFallenSoldierList = (
  i: number, squares: any[], whiteFallenSoldiers: string[], blackFallenSoldiers: string[], dispatch: (action: any) => void
) => {
  if (squares[i] !== null) {
    if (squares[i].player === Player.White) {
      whiteFallenSoldiers.push(squares[i]);
    } 
    else if (squares[i].player === Player.Black) {
      blackFallenSoldiers.push(squares[i]);
    }
  }
  dispatch(["addToFallenSoldierList", { whiteFallenSoldiers, blackFallenSoldiers }]);
};

export const handlePieceSelection = (
  targetPosition: number,
  gameState: any,
  dispatchGameAction: (action: any) => void,
  squares: any,
) => {
  let highLightMoves: number[] = [];

  if (!squares[targetPosition] || squares[targetPosition].player !== gameState.player) {
    dispatchGameAction([
      "updateStatus", "Wrong selection. Choose player " + gameState.player + " pieces."
    ]);

    if (squares[targetPosition]) {
      squares[targetPosition].setBackgroundColor("");
    }
  }
  else {
    squares[targetPosition].setBackgroundColor();

    if (squares[targetPosition].name === ChessPiece.Pawn) {
      highLightMoves = validateMoves(
        squares,
        squares[targetPosition].possibleMoves(
          targetPosition,
          squares,
          canEnpassant(
            targetPosition, gameState.lastTurnPawnPosition, gameState.firstMove
          ),
          gameState.lastTurnPawnPosition
        ),
        targetPosition,
        gameState.turn,
        gameState.whiteKingPosition,
        gameState.blackKingPosition,
      );
    }
    else if (squares[targetPosition].name === ChessPiece.King) {
      //check if castle is possible and add possible moves to highLightMoves array
      if (targetPosition === 4 || targetPosition === 60) {
        if (gameState.turn === "white" && gameState.whiteKingFirstMove) {
          const allPossibleMovesBlack = getAllPossibleMoves(squares, Player.Black);
          if (
            gameState.whiteRookFirstMoveLeft &&
            squares[57] === null &&
            squares[58] === null &&
            squares[59] === null &&
            !allPossibleMovesBlack.some((element: number) =>
              [57, 58, 59].includes(element)
            )
          ) {
            highLightMoves.push(58);
          }
          if (
            gameState.whiteRookFirstMoveRight &&
            squares[61] === null &&
            squares[62] === null &&
            !allPossibleMovesBlack.some((element: number) =>
              [61, 62].includes(element)
            )
          ) {
            highLightMoves.push(62);
          }
        }
        else if (
          gameState.turn === "black" &&
          gameState.blackKingFirstMove
        ) {
          const allPossibleMovesWhite = getAllPossibleMoves(squares, Player.White);
          if (
            gameState.blackRookFirstMoveLeft &&
            squares[1] === null &&
            squares[2] === null &&
            squares[3] === null &&
            !allPossibleMovesWhite.some((element: number) =>
              [1, 2, 3].includes(element)
            )
          ) {
            highLightMoves.push(2);
          }
          if (
            gameState.blackRookFirstMoveRight &&
            squares[5] === null &&
            squares[6] === null &&
            !allPossibleMovesWhite.some((element: number) =>
              [5, 6].includes(element)
            )
          ) {
            highLightMoves.push(6);
          }
        }
      }

      highLightMoves = highLightMoves.concat(
        squares[targetPosition].possibleMoves(targetPosition, squares)
      );
      highLightMoves = validateMoves(
        squares,
        highLightMoves,
        targetPosition,
        gameState.turn,
        gameState.whiteKingPosition,
        gameState.blackKingPosition,
      );
    }
    else {
      highLightMoves = validateMoves(
        squares,
        squares[targetPosition].possibleMoves(targetPosition, squares),
        targetPosition,
        gameState.turn,
        gameState.whiteKingPosition,
        gameState.blackKingPosition,
      );
    }

    for (let index = 0; index < highLightMoves.length; index++) {
      const element = highLightMoves[index];
      if (squares[element] !== null) {
        squares[element].setBackgroundColor();
      }
      else {
        squares.splice(element, 1, {
          style: { backgroundColor: "RGB(111,143,114)" },
        });
      }
    }

    dispatchGameAction(["selectPiece", { squares, i: targetPosition, highLightMoves }]);
  }
};

export const handleGameResult = (
  gameState: GameState, newSquares: any, squares: any, targetPosition: number, dispatchGameAction: React.Dispatch<GameAction>,
  emitGameEvent: (event: string, data?: any) => void, blackRemainingPieces: number, whiteRemainingPieces: number,
  isEnpassantPossible: boolean, board: any
) => {
  let nextPlayerValidatedMoves: number[] = [];
  const turn = gameState.turn === "white" ? "black" : "white";
  const player = gameState.turn === "white" ? Player.Black : Player.White;
  const isPromotion = gameState.currentPlayerAction === PlayerAction.SELECT_PROMOTION_PIECE;
  const newBoard = isPromotion ? newSquares : squares;
  const newTargetPosition = isPromotion ? gameState.convertPawnPosition : targetPosition;

  for (let i = 0; i < newBoard.length; i++) {
    if (newBoard[i] !== null) {
      if (newBoard[i].player === player) {
        if (newBoard[i].name === ChessPiece.Pawn) {
          nextPlayerValidatedMoves = nextPlayerValidatedMoves.concat(
            validateMoves(
              newBoard,
              newBoard[i].possibleMoves(i, newBoard),
              i,
              turn,
              gameState.whiteKingPosition,
              gameState.blackKingPosition,
            )
          );
        } 
        else if (newBoard[i].name === ChessPiece.King) {
          nextPlayerValidatedMoves = nextPlayerValidatedMoves.concat(
            validateMoves(
              newBoard,
              newBoard[i].possibleMoves(i, newBoard),
              i,
              turn,
              gameState.whiteKingPosition,
              gameState.blackKingPosition,
            )
          );
        } 
        else {
          nextPlayerValidatedMoves = nextPlayerValidatedMoves.concat(
            validateMoves(
              newBoard,
              newBoard[i].possibleMoves(i, newBoard),
              i,
              turn,
              gameState.whiteKingPosition,
              gameState.blackKingPosition
            )
          );
        }
      }
    }
  }
  const kingPosition = turn === "white"
    ? gameState.whiteKingPosition
    : gameState.blackKingPosition;

  //if next play doesn't have any possible moves then winner or stalemate
  if (nextPlayerValidatedMoves.length === 0) {
    let result: string;

    if (!newBoard[newTargetPosition].possibleMoves(newTargetPosition, newBoard).includes(kingPosition)) {
      result = "Stalemate Draw";
    } 
    else {
      result = turn === "white" ? "Black Won" : "White Won";
    }

    dispatchGameAction(["gameResult", result]);

    if (!gameState.offlineMode) {
      emitGameEvent("gameResult", { result });
    }
  }

  //other ways to draw
  if (blackRemainingPieces < 3 && whiteRemainingPieces < 3) {
    const result = "Draw";
    let temp: boolean | undefined = undefined;
    let temp2: boolean | undefined = false;
    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] !== null && newBoard[i].name === ChessPiece.Bishop) {
        if (
          [
            1, 3, 5, 7, 8, 10, 12, 14, 17, 19, 21, 23, 24, 26, 28, 30,
            33, 35, 37, 39, 40, 42, 44, 46, 49, 51, 53, 55, 56, 58, 60, 62
          ].includes(i)
        ) {
          if (newBoard[i].player === 1) {
            temp = true;
          } else {
            temp2 = true;
          }
        } 
        else {
          if (newBoard[i].player === 1) {
            temp = false;
          } else {
            temp2 = false;
          }
        }
      }
    }

    //king and bishop versus king and bishop with the bishops on the same color
    if (temp === temp2) {
      dispatchGameAction(["gameResult", result]);

      if (!gameState.offlineMode) {
        emitGameEvent("gameResult", { result });
      }
    }

    //king and bishop versus king, king and knight versus king draw
    if (
      (blackRemainingPieces === 2 && whiteRemainingPieces === 1)
      || (blackRemainingPieces === 1 && whiteRemainingPieces === 2)
    ) {
      let temp: boolean = false;
      for (let i = 0; i < newBoard.length; i++) {
        if (newBoard[i] !== null) {
          if (
            newBoard[i].name === ChessPiece.Bishop ||
            newBoard[i].name === ChessPiece.Knight
          ) {
            temp = true;
          }
        }
      }
      if (temp) {
        dispatchGameAction(["gameResult", result]);

        if (!gameState.offlineMode) {
          emitGameEvent("gameResult", { result });
        }
      }
    }

    //king versus king draw
    if (blackRemainingPieces === 1 && whiteRemainingPieces === 1) {
      dispatchGameAction(["gameResult", result]);

      if (!gameState.offlineMode) {
        emitGameEvent("gameResult", { result });
      }
    }
  }

  const move = convertMoveToNotation(
    gameState.sourceSelection,
    newTargetPosition,
    isPromotion ? gameState.promotionOldBoard : board,
    isEnpassantPossible,
    gameState.turn,
    nextPlayerValidatedMoves,
    newBoard,
    isPromotion
  );
  dispatchGameAction(["updateNotation", move]);
  if (!gameState.offlineMode) {
    emitGameEvent("updateNotation", { move });
  }
  else {
    if (gameState.suggestion) {
      dispatchGameAction(["updateSuggestion", ""]);
    }
    dispatchGameAction(["updateMoves", [...gameState.moves, move]]);
  }
};

export const executeMove = async (
  gameState: GameState, squares: any, dispatchGameAction: React.Dispatch<GameAction>,
  targetPosition: number, whiteRemainingPieces: number, blackRemainingPieces: number,
  emitGameEvent: (event: string, data?: any) => void, board: any
): Promise<[any, boolean, number, number]> => {
  //dehighlight selected piece
  squares[gameState.sourceSelection].setBackgroundColor("");

  const whiteFallenSoldiers = gameState.whiteFallenSoldiers;
  const blackFallenSoldiers = gameState.blackFallenSoldiers;

  let isEnpassantPossible: boolean;

  if (squares[gameState.sourceSelection].name === ChessPiece.Pawn) {
    squares = dehighlight(squares, gameState.highLightMoves);
    isEnpassantPossible = canEnpassant(
      gameState.sourceSelection, gameState.lastTurnPawnPosition, gameState.firstMove
    );

    //if en passant is available and player decided to use it, else proceed without it
    if (
      isEnpassantPossible
      && squares[targetPosition] == null
      && (
        gameState.lastTurnPawnPosition - 8 === targetPosition || gameState.lastTurnPawnPosition + 8 === targetPosition
      )
    ) {
      //add captured piece to fallen soldier list
      if (squares[gameState.lastTurnPawnPosition].player === Player.White) {
        whiteFallenSoldiers.push(
          squares[gameState.lastTurnPawnPosition]
        );
        whiteRemainingPieces -= 1;
      }
      else {
        blackFallenSoldiers.push(
          squares[gameState.lastTurnPawnPosition]
        );
        blackRemainingPieces -= 1;
      }

      //move player selected piece to target position
      squares[targetPosition] = squares[gameState.sourceSelection];
      squares[gameState.lastTurnPawnPosition] = null;
      squares[gameState.sourceSelection] = null;

      dispatchGameAction([
        "enpassant",
        { squares, whiteFallenSoldiers, blackFallenSoldiers, disabled: !gameState.offlineMode }
      ]);

      if (!gameState.offlineMode) {
        emitGameEvent(
          "moves",
          { selectedPiece: gameState.sourceSelection, targetPosition }
        );
      }
    }
    else {
      //check if current pawn is moving for the first time and moving 2 squares forward
      let firstMove: boolean;
      if (
        (squares[gameState.sourceSelection].player === Player.White)
        && (targetPosition === gameState.sourceSelection - 16)
      ) {
        firstMove = true;
      }
      else if (
        (squares[gameState.sourceSelection].player === Player.Black)
        && (targetPosition === gameState.sourceSelection + 16)
      ) {
        firstMove = true;
      }

      //update number of pieces
      if (squares[targetPosition] !== null) {
        if (gameState.turn === "white") {
          blackRemainingPieces -= 1;
        }
        else {
          whiteRemainingPieces -= 1;
        }
      }
      addToFallenSoldierList(
        targetPosition, squares, whiteFallenSoldiers, blackFallenSoldiers, dispatchGameAction
      );
      squares = movePiece(targetPosition, squares, gameState.sourceSelection);

      //to convert pawn that reach other side of the chess board
      if ([0, 1, 2, 3, 4, 5, 6, 7, 56, 57, 58, 59, 60, 61, 62, 63].includes(targetPosition)) {
        const tempSquares = squares.concat();

        //give player choice to convert their pawn and highlight those choices
        if (gameState.turn === "white") {
          tempSquares[10] = new Knight(Player.White).setBackgroundColor();
          tempSquares[11] = new Bishop(Player.White).setBackgroundColor();
          tempSquares[12] = new Rook(Player.White).setBackgroundColor();
          tempSquares[13] = new Queen(Player.White).setBackgroundColor();
        }
        else if (gameState.turn === "black") {
          tempSquares[50] = new Knight(Player.Black).setBackgroundColor();
          tempSquares[51] = new Bishop(Player.Black).setBackgroundColor();
          tempSquares[52] = new Rook(Player.Black).setBackgroundColor();
          tempSquares[53] = new Queen(Player.Black).setBackgroundColor();
        }

        //update chess board with convert choices and save chess board without choices in this.state.tempSquares
        dispatchGameAction([
          "updateBoard",
          { squares, tempSquares, i: targetPosition, selectedPawnPosition: gameState.sourceSelection, board }
        ]);
        return;
      }
      else {
        dispatchGameAction([
          "moves", { squares, firstMove, lastTurnPawnPosition: targetPosition, disabled: !gameState.offlineMode }
        ]);

        if (!gameState.offlineMode) {
          emitGameEvent(
            "moves",
            { selectedPiece: gameState.sourceSelection, targetPosition }
          );
        }
      }
    }
  }
  else if (squares[gameState.sourceSelection].name === ChessPiece.King) {
    squares = dehighlight(squares, gameState.highLightMoves);
    //for castling
    if (
      (targetPosition === 2 || targetPosition === 6 || targetPosition === 58 || targetPosition === 62)
      && (gameState.whiteKingFirstMove || gameState.blackKingFirstMove)
    ) {
      if (targetPosition === 58) {
        squares = movePiece(targetPosition, squares, gameState.sourceSelection);
        squares = movePiece(59, squares, 56);
      }
      if (targetPosition === 62) {
        squares = movePiece(targetPosition, squares, gameState.sourceSelection);
        squares = movePiece(61, squares, 63);
      }
      if (targetPosition === 2) {
        squares = movePiece(targetPosition, squares, gameState.sourceSelection);
        squares = movePiece(3, squares, 0);
      }
      if (targetPosition === 6) {
        squares = movePiece(targetPosition, squares, gameState.sourceSelection);
        squares = movePiece(5, squares, 7);
      }

      //to record king has been moved or not. for castle
      dispatchGameAction(["moveKing", { i: targetPosition, squares, disabled: !gameState.offlineMode }]);

      if (!gameState.offlineMode) {
        emitGameEvent(
          "moves",
          { selectedPiece: gameState.sourceSelection, targetPosition }
        );
      }
    }
    else {
      //update number of pieces
      if (squares[targetPosition] !== null) {
        if (gameState.turn === "white") {
          blackRemainingPieces -= 1;
        }
        else {
          whiteRemainingPieces -= 1;
        }
      }
      addToFallenSoldierList(
        targetPosition, squares, whiteFallenSoldiers, blackFallenSoldiers, dispatchGameAction
      );
      squares = movePiece(targetPosition, squares, gameState.sourceSelection);

      //to record king has been moved or not. for castle
      dispatchGameAction(["moveKing", { i: targetPosition, squares, disabled: !gameState.offlineMode }]);

      if (!gameState.offlineMode) {
        emitGameEvent(
          "moves",
          { selectedPiece: gameState.sourceSelection, targetPosition }
        );
      }
    }
  }
  else {
    squares = dehighlight(squares, gameState.highLightMoves);
    //update number of pieces
    if (squares[targetPosition] !== null) {
      if (gameState.turn === "white") {
        blackRemainingPieces -= 1;
      } else {
        whiteRemainingPieces -= 1;
      }
    }
    addToFallenSoldierList(
      targetPosition, squares, whiteFallenSoldiers, blackFallenSoldiers, dispatchGameAction
    );
    squares = movePiece(targetPosition, squares, gameState.sourceSelection);

    dispatchGameAction(["moveRook", { i: targetPosition, squares, disabled: !gameState.offlineMode }]);

    if (!gameState.offlineMode) {
      emitGameEvent(
        "moves",
        { selectedPiece: gameState.sourceSelection, targetPosition }
      );
    }
  }

  dispatchGameAction(["updatePieces", { whiteRemainingPieces, blackRemainingPieces }]);
  return [squares, isEnpassantPossible, whiteRemainingPieces, blackRemainingPieces];
};
