import React, { useState } from "react";
import { Modal, ListGroup, Badge, Button } from "react-bootstrap";
import { ArchivedGame } from "../firebase/firestore";

interface GameHistoryModalProps {
  show: boolean;
  onHide: () => void;
  gameHistory: ArchivedGame[];
  currentUserUid: string;
}

const GameHistoryModal: React.FC<GameHistoryModalProps> = ({
  show,
  onHide,
  gameHistory,
  currentUserUid,
}) => {
  const [showMovesModal, setShowMovesModal] = useState(false);
  const [selectedGameMoves, setSelectedGameMoves] = useState<string[]>([]);

  const formatDate = (timestamp: any) => {
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    return new Date(timestamp).toLocaleDateString();
  };

  const getResultBadgeVariant = (
    result: string,
    uid: string,
    blackPlayer: string,
    whitePlayer: string
  ) => {
    const isUserBlack = blackPlayer === uid;
    const isUserWhite = whitePlayer === uid;

    if (result === "Draw") return "secondary";
    if (
      (result === "White Won" && isUserWhite) ||
      (result === "Black Won" && isUserBlack)
    ) {
      return "success";
    }
    return "danger";
  };

  const handleShowMoves = (moves: string[]) => {
    setSelectedGameMoves(moves);
    setShowMovesModal(true);
  };

  const exportToPGN = (game: ArchivedGame) => {
    const date = new Date(game.finishedAt.seconds * 1000);
    const formattedDate = date.toISOString().split("T")[0].replace(/-/g, ".");

    let pgnResult = "*";
    if (game.result === "checkmate") {
      pgnResult = game.moves.length % 2 === 1 ? "1-0" : "0-1";
    } else if (game.result === "draw" || game.result === "stalemate") {
      pgnResult = "1/2-1/2";
    }

    const pgn =
      '[Event "Chess Game"]\n' +
      '[Site "ChessV2"]\n' +
      '[Date "' +
      formattedDate +
      '"]\n' +
      '[Round "1"]\n' +
      '[White "' +
      game.whitePlayer +
      '"]\n' +
      '[Black "' +
      game.blackPlayer +
      '"]\n' +
      '[Result "' +
      pgnResult +
      '"]\n' +
      '[WhiteElo "?"]\n' +
      '[BlackElo "?"]\n' +
      '[PlyCount "' +
      game.moves.length +
      '"]\n' +
      '[EventDate "' +
      formattedDate +
      '"]\n\n' +
      formatMovesForPGN(game.moves) +
      " " +
      pgnResult;

    const blob = new Blob([pgn], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chess-game-${game.id}.pgn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatMovesForPGN = (moves: string[]): string => {
    let pgnMoves = "";
    for (let i = 0; i < moves.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = moves[i];
      const blackMove = moves[i + 1] || "";

      if (blackMove) {
        pgnMoves += `${moveNumber}. ${whiteMove} ${blackMove} `;
      } else {
        pgnMoves += `${moveNumber}. ${whiteMove} `;
      }
    }
    return pgnMoves.trim();
  };

  const formatMovesPairs = (moves: string[]) => {
    const pairs = [];
    for (let i = 0; i < moves.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = moves[i];
      const blackMove = moves[i + 1] || "";
      pairs.push({ moveNumber, whiteMove, blackMove });
    }
    return pairs;
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Game History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {gameHistory.length === 0 ? (
            <p>No games found.</p>
          ) : (
            <ListGroup>
              {gameHistory.map((game) => (
                <ListGroup.Item
                  key={game.id}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <div>
                      <strong>
                        vs{" "}
                        {game.blackPlayer === currentUserUid
                          ? game.whitePlayer
                          : game.blackPlayer}
                      </strong>
                    </div>
                    <small className="text-muted">
                      {formatDate(game.finishedAt)} •{" "}
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 text-decoration-underline me-2"
                        style={{ fontSize: "inherit", color: "#0d6efd" }}
                        onClick={() => handleShowMoves(game.moves)}
                      >
                        {game.moves.length} moves
                      </Button>
                      •{" "}
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 text-decoration-underline"
                        style={{ fontSize: "inherit", color: "#28a745" }}
                        onClick={() => exportToPGN(game)}
                      >
                        Export PGN
                      </Button>
                    </small>
                  </div>
                  <div className="text-end">
                    <Badge
                      bg={getResultBadgeVariant(
                        game.result,
                        currentUserUid,
                        game.blackPlayer,
                        game.whitePlayer
                      )}
                      className="mb-1"
                    >
                      {game.result}
                    </Badge>
                    <br />
                    <small className="text-muted">
                      You played as{" "}
                      {game.blackPlayer === currentUserUid ? "Black" : "White"}
                    </small>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showMovesModal} onHide={() => setShowMovesModal(false)} size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Game Moves</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="moves-container">
            {formatMovesPairs(selectedGameMoves).map((movePair) => (
              <div
                key={movePair.moveNumber}
                className="d-flex align-items-center mb-2"
              >
                <div
                  className="me-3"
                  style={{ minWidth: "30px", fontWeight: "bold" }}
                >
                  {movePair.moveNumber}.
                </div>
                <div className="me-3" style={{ minWidth: "60px" }}>
                  {movePair.whiteMove}
                </div>
                <div
                  style={{
                    minWidth: "60px",
                    color: movePair.blackMove ? "inherit" : "#6c757d",
                  }}
                >
                  {movePair.blackMove || "—"}
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMovesModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default GameHistoryModal;
