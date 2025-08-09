const admin = require("./config/firebase");
const {
  updateUserPlayHistory,
  getAndRemoveGameFromRTDB,
  createNewGame,
  getOpponentId,
} = require("./utils/helpers");
const {
  setGameData,
  getGameData,
  deleteGameData,
  setPlayerInGame,
  getPlayerInGame,
  deletePlayerInGame,
} = require("./config/redis");

class SocketHandlers {
  constructor(io) {
    this.io = io;
  }

  async handleDisconnect(client) {
    console.log("disconnect : " + client.id);

    try {
      const playerData = await getPlayerInGame(client.id);
      if (playerData) {
        const gameData = await getGameData(playerData.gameId);
        if (gameData) {
          this.io.to(playerData.gameId).emit("toLobby", {});
          this.io.sockets.connected[gameData.player1].leave(playerData.gameId);
          this.io.sockets.connected[gameData.player2].leave(playerData.gameId);

          await deletePlayerInGame(gameData.player1);
          await deletePlayerInGame(gameData.player2);
          await deleteGameData(playerData.gameId);
        }
      }
    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
  }

  async handleSelectOpponent(client, data) {
    const whitePlayerId = client.id;
    const whitePlayerUid = data.myUid;
    const blackPlayerId = data.socketId;
    const blackPlayerUid = data.uid;

    try {
      const whitePlayerInGame = await getPlayerInGame(whitePlayerId);
      const blackPlayerInGame = await getPlayerInGame(blackPlayerId);

      if (!whitePlayerInGame && !blackPlayerInGame) {
        const { gameId, gameData } = await createNewGame(
          whitePlayerId,
          whitePlayerUid,
          blackPlayerId,
          blackPlayerUid,
          setPlayerInGame,
          setGameData
        );

        this.io.sockets.connected[whitePlayerId].join(gameId);
        this.io.sockets.connected[blackPlayerId].join(gameId);
        this.io.to(gameId).emit("gameStarted", {
          status: true,
          game_id: gameId,
          game_data: gameData,
        });
      } else {
        client.emit("alreadyInGame", [data.id]);
      }
    } catch (error) {
      console.error("Error in selectOpponent:", error);
      // client.emit('error', { message: 'Failed to start game' });
    }
  }

  async handleMoves(data) {
    try {
      const gameData = await getGameData(data.gameId);
      if (!gameData) {
        console.error("Game not found:", data.gameId);
        // client.emit('error', { message: 'Game not found' });
        return;
      }

      const opponentId = getOpponentId(data.userId, gameData);
      const opponentPlayerData = await getPlayerInGame(opponentId);

      if (opponentPlayerData) {
        await admin
          .database()
          .ref(`liveGames/${data.gameId}/whoseTurn`)
          .set(opponentPlayerData.uid);

        gameData.whose_turn = opponentId;
        await setGameData(data.gameId, gameData);

        this.io.to(opponentId).emit("updateGameData", {
          selectedPiece: data.selectedPiece,
          targetPosition: data.targetPosition,
          promotionPiece: data.promotionPiece,
        });
      }
    } catch (error) {
      console.error("Error in moves:", error);
    }
  }

  async handleGameResult(data) {
    try {
      const gameData = await getGameData(data.gameId);

      if (!gameData) {
        console.error("Game not found:", data.gameId);
        // client.emit('error', { message: 'Game not found' });
        return;
      }

      if (data.result === "Stalemate Draw" || data.result === "Draw") {
        gameData.game_status = "draw";
      } else if (data.result === "White Won") {
        gameData.game_winner = gameData.player1;
        gameData.game_status = "finished";
      } else if (data.result === "Black Won") {
        gameData.game_winner = gameData.player2;
        gameData.game_status = "finished";
      }

      const previousGameData = await getAndRemoveGameFromRTDB(
        data.gameId,
        getPlayerInGame,
        gameData
      );

      if (previousGameData) {
        await updateUserPlayHistory(
          previousGameData.whitePlayer,
          previousGameData.blackPlayer,
          data.result
        );
      }

      await setGameData(data.gameId, gameData);
      this.io
        .to(getOpponentId(data.userId, gameData))
        .emit("gameover", { result: data.result });
    } catch (error) {
      console.error("Error in gameResult:", error);
    }
  }

  async handleNewGame(data) {
    try {
      const gameData = await getGameData(data.gameId);
      if (!gameData) {
        console.error("Game not found:", data.gameId);
        // client.emit('error', { message: 'Game not found' });
        return;
      }

      if (data.askOpponent) {
        const player1Data = await getPlayerInGame(gameData.player1);
        const player2Data = await getPlayerInGame(gameData.player2);

        if (!player1Data || !player2Data) {
          console.error("Player data not found");
          // client.emit('error', { message: 'Player data not found' });
          return;
        }

        const { gameId: newGameId, gameData: newGameData } =
          await createNewGame(
            gameData.player2,
            player1Data.uid,
            gameData.player1,
            player2Data.uid,
            setPlayerInGame,
            setGameData
          );

        this.io.sockets.connected[gameData.player1].join(newGameId);
        this.io.sockets.connected[gameData.player2].join(newGameId);

        this.io.to(newGameId).emit("nextGameData", {
          game_id: newGameId,
          game_data: newGameData,
        });

        this.io.sockets.connected[gameData.player1].leave(data.gameId);
        this.io.sockets.connected[gameData.player2].leave(data.gameId);

        await deleteGameData(data.gameId);
      } else {
        this.io.to(getOpponentId(data.userId, gameData)).emit("continueGame");
      }
    } catch (error) {
      console.error("Error in newGame:", error);
      // client.emit('error', { message: 'Failed to start new game' });
    }
  }

  async handleLeaveGame(data) {
    try {
      const gameData = await getGameData(data.gameId);
      if (!gameData) {
        console.error("Game not found:", data.gameId);
        // client.emit('error', { message: 'Game not found' });
        return;
      }

      const opponentId = getOpponentId(data.userId, gameData);

      const previousGameData = await getAndRemoveGameFromRTDB(
        data.gameId,
        getPlayerInGame,
        gameData
      );

      if (previousGameData) {
        const result =
          data.userId === gameData.player1 ? "Black Won" : "White Won";

        await updateUserPlayHistory(
          previousGameData.whitePlayer,
          previousGameData.blackPlayer,
          result
        );
      }

      this.io.to(opponentId).emit("toLobby");
      this.io.sockets.connected[data.userId].leave(data.gameId);
      this.io.sockets.connected[opponentId].leave(data.gameId);

      await admin.database().ref(`liveGames/${data.gameId}`).remove();
      await deleteGameData(data.gameId);
      await deletePlayerInGame(data.userId);
      await deletePlayerInGame(opponentId);
    } catch (error) {
      console.error("Error in leaveGame:", error);
    }
  }

  async handleUpdateNotation(data) {
    const gameData = await getGameData(data.gameId);

    if (!gameData) {
      console.error("Game not found:", data.gameId);
      // client.emit('error', { message: 'Game not found' });
      return;
    }

    this.io
      .to(getOpponentId(data.userId, gameData))
      .emit("updateNotation", { move: data.move });

    try {
      await admin
        .database()
        .ref(`liveGames/${data.gameId}/moves`)
        .push(data.move);

      const gameData = await getGameData(data.gameId);
      if (gameData) {
        gameData.moves.push(data.move);
        await setGameData(data.gameId, gameData);
      }
    } catch (error) {
      console.error("Error in updateNotation:", error);
    }
  }
}

module.exports = SocketHandlers;
