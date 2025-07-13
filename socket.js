require("dotenv").config();
const admin = require("firebase-admin");
const serviceAccount = require(process.env.KEY_PATH);
const redis = require("redis");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.connect().catch(console.error);

module.exports = (io) => {
  const setGameData = async (gameId, gameData) => {
    await redisClient.setEx(`game:${gameId}`, 3600, JSON.stringify(gameData));
  };

  const getGameData = async (gameId) => {
    const data = await redisClient.get(`game:${gameId}`);
    return data ? JSON.parse(data) : null;
  };

  const deleteGameData = async (gameId) => {
    await redisClient.del(`game:${gameId}`);
  };

  const setPlayerInGame = async (playerId, gameData) => {
    await redisClient.setEx(
      `player:${playerId}`,
      3600,
      JSON.stringify(gameData)
    );
  };

  const getPlayerInGame = async (playerId) => {
    const data = await redisClient.get(`player:${playerId}`);
    return data ? JSON.parse(data) : null;
  };

  const deletePlayerInGame = async (playerId) => {
    await redisClient.del(`player:${playerId}`);
  };

  io.on("connection", (client) => {
    console.log("connected : " + client.id);
    client.emit("connected", { id: client.id });

    client.on("disconnect", async () => {
      console.log("disconnect : " + client.id);

      try {
        const playerData = await getPlayerInGame(client.id);
        if (playerData) {
          const gameData = await getGameData(playerData.gameId);
          if (gameData) {
            io.to(playerData.gameId).emit("toLobby", {});
            io.sockets.connected[gameData.player1].leave(playerData.gameId);
            io.sockets.connected[gameData.player2].leave(playerData.gameId);

            await deletePlayerInGame(gameData.player1);
            await deletePlayerInGame(gameData.player2);
            await deleteGameData(playerData.gameId);
          }
        }
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });

    client.on("selectOpponent", async (data) => {
      const whitePlayerId = client.id;
      const whitePlayerUid = data.myUid;
      const blackPlayerId = data.socketId;
      const blackPlayerUid = data.uid;

      try {
        const whitePlayerInGame = await getPlayerInGame(whitePlayerId);
        const blackPlayerInGame = await getPlayerInGame(blackPlayerId);

        if (!whitePlayerInGame && !blackPlayerInGame) {
          const gameId = uuidv4();

          await setPlayerInGame(whitePlayerId, {
            gameId: gameId,
            uid: whitePlayerUid,
          });

          await setPlayerInGame(blackPlayerId, {
            gameId: gameId,
            uid: blackPlayerUid,
          });

          const gameData = {
            player1: whitePlayerId,
            player2: blackPlayerId,
            whose_turn: whitePlayerId,
            game_status: "ongoing",
            game_winner: null,
            moves: [],
          };

          await setGameData(gameId, gameData);

          await admin.database().ref(`liveGames/${gameId}`).set({
            whitePlayer: whitePlayerUid,
            blackPlayer: blackPlayerUid,
            startedAt: Date.now(),
            whoseTurn: whitePlayerUid,
            moves: [],
            winner: null,
          });

          io.sockets.connected[whitePlayerId].join(gameId);
          io.sockets.connected[blackPlayerId].join(gameId);
          io.to(gameId).emit("gameStarted", {
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
    });

    client.on("moves", async (data) => {
      try {
        const gameData = await getGameData(data.gameId);
        if (!gameData) {
          console.error("Game not found:", data.gameId);
          // client.emit('error', { message: 'Game not found' });
          return;
        }

        const opponentId =
          data.userId === gameData.player1
            ? gameData.player2
            : gameData.player1;
        const opponentPlayerData = await getPlayerInGame(opponentId);

        if (opponentPlayerData) {
          await admin
            .database()
            .ref(`liveGames/${data.gameId}/whoseTurn`)
            .set(opponentPlayerData.uid);

          gameData.whose_turn = opponentId;
          await setGameData(data.gameId, gameData);

          io.to(opponentId).emit("updateGameData", {
            selectedPiece: data.selectedPiece,
            targetPosition: data.targetPosition,
            promotionPiece: data.promotionPiece,
          });
        }
      } catch (error) {
        console.error("Error in moves:", error);
      }
    });

    client.on("gameResult", async (data) => {
      try {
        const gameData = await getGameData(data.gameId);

        if (!gameData) {
          console.error("Game not found:", data.gameId);
          // client.emit('error', { message: 'Game not found' });
          return;
        }

        const opponentId =
          data.userId === gameData.player1
            ? gameData.player2
            : gameData.player1;

        if (data.result === "Stalemate Draw" || data.result === "Draw") {
          gameData.game_status = "draw";
        } else if (data.result === "White Won") {
          gameData.game_winner = gameData.player1;
          gameData.game_status = "finished";
        } else if (data.result === "Black Won") {
          gameData.game_winner = gameData.player2;
          gameData.game_status = "finished";
        }

        const previousGameRef = admin
          .database()
          .ref(`liveGames/${data.gameId}`);
        const gameSnap = await previousGameRef.once("value");
        const previousGameData = gameSnap.val();

        if (previousGameData) {
          await admin
            .firestore()
            .collection("archivedGames")
            .doc(data.gameId)
            .set({
              whitePlayer: previousGameData.whitePlayer,
              blackPlayer: previousGameData.blackPlayer,
              moves: Object.values(previousGameData.moves || []),
              result: data.result,
              startedAt: previousGameData.startedAt,
              finishedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          await previousGameRef.remove();
        }

        await setGameData(data.gameId, gameData);
        io.to(opponentId).emit("gameover", { result: data.result });
      } catch (error) {
        console.error("Error in gameResult:", error);
      }
    });

    client.on("newGame", async (data) => {
      try {
        const gameData = await getGameData(data.gameId);
        if (!gameData) {
          console.error("Game not found:", data.gameId);
          // client.emit('error', { message: 'Game not found' });
          return;
        }

        const opponentId =
          data.userId === gameData.player1
            ? gameData.player2
            : gameData.player1;

        if (data.askOpponent) {
          const player1Data = await getPlayerInGame(gameData.player1);
          const player2Data = await getPlayerInGame(gameData.player2);

          if (!player1Data || !player2Data) {
            console.error("Player data not found");
            // client.emit('error', { message: 'Player data not found' });
            return;
          }

          const newGameId = uuidv4();

          const newGameData = {
            player1: gameData.player2,
            player2: gameData.player1,
            whose_turn: gameData.player2,
            game_status: "ongoing",
            game_winner: null,
            moves: [],
          };

          await setPlayerInGame(gameData.player1, {
            gameId: newGameId,
            uid: player1Data.uid,
          });

          await setPlayerInGame(gameData.player2, {
            gameId: newGameId,
            uid: player2Data.uid,
          });

          await setGameData(newGameId, newGameData);

          await admin.database().ref(`liveGames/${newGameId}`).set({
            whitePlayer: player1Data.uid,
            blackPlayer: player2Data.uid,
            startedAt: Date.now(),
            whoseTurn: whoseTurnUid,
            moves: [],
            winner: null,
          });

          io.sockets.connected[gameData.player1].join(newGameId);
          io.sockets.connected[gameData.player2].join(newGameId);

          io.to(gameId).emit("nextGameData", {
            game_id: newGameId,
            game_data: newGameData,
          });

          io.sockets.connected[gameData.player1].leave(data.gameId);
          io.sockets.connected[gameData.player2].leave(data.gameId);

          await deleteGameData(data.gameId);
        } else {
          io.to(opponentId).emit("continueGame");
        }
      } catch (error) {
        console.error("Error in newGame:", error);
        // client.emit('error', { message: 'Failed to start new game' });
      }
    });

    client.on("leaveGame", async (data) => {
      try {
        const gameData = await getGameData(data.gameId);
        if (!gameData) {
          console.error("Game not found:", data.gameId);
          // client.emit('error', { message: 'Game not found' });
          return;
        }

        const opponentId =
          data.userId === gameData.player1
            ? gameData.player2
            : gameData.player1;

        io.to(opponentId).emit("toLobby");
        io.sockets.connected[data.userId].leave(data.gameId);
        io.sockets.connected[opponentId].leave(data.gameId);

        await admin.database().ref(`liveGames/${data.gameId}`).remove();
        await deleteGameData(data.gameId);
        await deletePlayerInGame(data.userId);
        await deletePlayerInGame(opponentId);
      } catch (error) {
        console.error("Error in leaveGame:", error);
      }
    });

    client.on("updateNotation", async (data) => {
      const gameData = await getGameData(data.gameId);

      if (!gameData) {
        console.error("Game not found:", data.gameId);
        // client.emit('error', { message: 'Game not found' });
        return;
      }

      const opponentId =
        data.userId === gameData.player1 ? gameData.player2 : gameData.player1;
      io.to(opponentId).emit("updateNotation", { move: data.move });

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
    });
  });

  const uuidv4 = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };
};
