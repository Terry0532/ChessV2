require('dotenv').config();
const admin = require("firebase-admin");
const serviceAccount = require(process.env.KEY_PATH);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL
});

module.exports = (io) => {
  let sockets = {};
  let players = {};
  let games = {};
  let inGamePlayers = {};

  io.on("connection", (client) => {
    console.log("connected : " + client.id);
    client.emit("connected", { "id": client.id });

    client.on('disconnect', () => {
      console.log("disconnect : " + client.id);
      io.to(inGamePlayers[client.id].game_id).emit('toLobby', {});
      players[sockets[games[sockets[client.id].game_id].player1].name].played--;
      players[sockets[games[sockets[client.id].game_id].player2].name].played--;
      io.sockets.connected[client.id === games[sockets[client.id].game_id].player1 
        ? games[sockets[client.id].game_id].player2 
        : games[sockets[client.id].game_id].player1].leave(sockets[client.id].game_id);
      delete games[sockets[client.id].game_id];
    });

    client.on('selectOpponent', async (data) => {
      const whitePlayerId = client.id;
      const whitePlayerUid = data.myUid;
      const blackPlayerId = data.id;
      const blackPlayerUid = data.uid;

      if (!inGamePlayers[whitePlayerId] && !inGamePlayers[blackPlayerId]) {
        const gameId = uuidv4();
        inGamePlayers[whitePlayerId] = {};
        inGamePlayers[blackPlayerId] = {};

        inGamePlayers[whitePlayerId].gameId = gameId;
        inGamePlayers[whitePlayerId].uid = whitePlayerUid;
        inGamePlayers[blackPlayerId].gameId = gameId;
        inGamePlayers[blackPlayerId].uid = blackPlayerUid;

        await admin.database().ref(`liveGames/${gameId}`).set({
          whitePlayer: whitePlayerUid,
          blackPlayer: blackPlayerUid,
          startedAt: Date.now(),
          whoseTurn:  whitePlayerUid,
          moves: [],
          winner: null,
        });

        games[gameId] = {
          player1: whitePlayerId,
          player2: blackPlayerId,
          whose_turn: whitePlayerId,
          game_status: "ongoing",
          game_winner: null,
          moves: [],
        };
        io.sockets.connected[whitePlayerId].join(gameId);
        io.sockets.connected[blackPlayerId].join(gameId);
        // io.emit('excludePlayers', [client.id, data.id]);
        io.to(gameId).emit('gameStarted', { status: true, game_id: gameId, game_data: games[gameId] });
      } 
      else {
        client.emit("alreadyInGame", [data.id])
      }
    });

    client.on("moves", async (data) => {
      const opponentId = data.userId === games[data.gameId].player1 
        ? games[data.gameId].player2 
        : games[data.gameId].player1;

      await admin.database().ref(`liveGames/${ data.gameId }/whoseTurn`).set(inGamePlayers[opponentId].uid);

      io.to(opponentId).emit(
        "updateGameData", 
        { 
          selectedPiece: data.selectedPiece, 
          targetPosition: data.targetPosition,
          promotionPiece: data.promotionPiece
        }
      );
    });

    client.on("gameResult", async (data) => {
      const opponentId = data.userId === games[data.gameId].player1 
        ? games[data.gameId].player2 
        : games[data.gameId].player1;
      if (data.result === "Stalemate Draw") {
        // players[games[data.gameId][games[data.gameId].player1].name].draw++;
        // players[games[data.gameId][games[data.gameId].player2].name].draw++;
        games[data.gameId].game_status = "draw";
        io.to(opponentId).emit("gameover", { result: data.result });
      }
      else if (data.result === "Draw") {
        // players[games[data.gameId][games[data.gameId].player1].name].draw++;
        // players[games[data.gameId][games[data.gameId].player2].name].draw++;
        games[data.gameId].game_status = "draw";
        io.to(opponentId).emit("gameover", { result: data.result });
      }
      else if (data.result === "White Won") {
        games[data.gameId].game_winner = games[data.gameId].whose_turn === games[data.gameId].player1 
          ? games[data.gameId].player2 
          : games[data.gameId].player1;
        games[data.gameId].game_winner = games[data.gameId].player1;
        games[data.gameId].game_status = "finished";
        // await admin.database().ref(`liveGames/${ data.gameId }/winner`).set(inGamePlayers[games[data.gameId].game_winner].uid);
        // players[games[data.gameId][games[data.gameId].game_winner].name].won++;
        io.to(opponentId).emit("gameover", { result: data.result });
      }
      else if (data.result === "Black Won") {
        games[data.gameId].game_winner = games[data.gameId].whose_turn === games[data.gameId].player1 
          ? games[data.gameId].player2 
          : games[data.gameId].player1;
        games[data.gameId].game_status = "finished";
        // await admin.database().ref(`liveGames/${ data.gameId }/winner`).set(inGamePlayers[games[data.gameId].game_winner].uid);
        // players[games[data.gameId][games[data.gameId].game_winner].name].won++;
        io.to(opponentId).emit("gameover", { result: data.result });
      }
    });

    client.on("newGame", async (data) => {
      const opponentId = data.userId === games[data.gameId].player1 
        ? games[data.gameId].player2 : games[data.gameId].player1;

      if (data.askOpponent) {
        const gameId = uuidv4();

        const whoseTurn = games[data.gameId][data.userId].side === "white" 
          ? opponentId : data.userId;
        const otherPlayerId = whoseTurn === games[data.gameId].player1 
          ? games[data.gameId].player2 
          : games[data.gameId].player1;

        const previousGameRef = admin.database().ref(`liveGames/${data.gameId}`);
        const gameSnap = await previousGameRef.once('value');
        const gameData = gameSnap.val();

        await admin.firestore().collection('archivedGames').doc(gameId).set({
          metadata: gameData.metadata,
          moves: Object.values(gameData.moves || []),
          result: data.result,
          finishedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        await previousGameRef.remove();

        games[gameId] = {
          player1: games[data.gameId].player1,
          player2: games[data.gameId].player2,
          whose_turn: whoseTurn,
          game_status: "ongoing",
          game_winner: null,
        };
        await admin.database().ref(`liveGames/${gameId}`).set({
          whitePlayer: whitePlayerUid,
          blackPlayer: blackPlayerUid,
          startedAt: Date.now(),
          whoseTurn:  whitePlayerUid,
          moves: [],
          winner: null,
        });
        io.sockets.connected[games[data.gameId].player1].join(gameId);
        io.sockets.connected[games[data.gameId].player2].join(gameId);

        io.to(gameId).emit('nextGameData', { game_id: gameId, game_data: games[gameId] });

        io.sockets.connected[games[data.gameId].player1].leave(data.gameId);
        io.sockets.connected[games[data.gameId].player2].leave(data.gameId);
        delete games[data.gameId];
        delete inGamePlayers[games[data.gameId].player1];
        delete inGamePlayers[games[data.gameId].player2];
      }
      else {
        io.to(opponentId).emit("continueGame");
      }
    });

    client.on("leaveGame", (data) => {
      const opponentId = data.userId === games[data.gameId].player1 
        ? games[data.gameId].player2 
        : games[data.gameId].player1;
      io.to(opponentId).emit("toLobby");
      io.sockets.connected[data.userId].leave(data.gameId);
      io.sockets.connected[opponentId].leave(data.gameId);
      delete games[data.gameId];
      delete inGamePlayers[data.userId];
      delete inGamePlayers[opponentId];
    });

    client.on("askDraw", (data) => {
      const opponentId = data.userId === games[data.gameId].player1 
        ? games[data.gameId].player2 
        : games[data.gameId].player1;
      io.to(opponentId).emit("drawButton");
    });

    //feel like this should be in moves
    client.on("updateNotation", (data) => {
      admin.database().ref(`liveGames/${ data.gameId }/moves`).push(data.move);
      games[data.gameId].moves.push(data.move);
    });
  });

  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
  }
}
