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
  // admin.database().ref('testConnection').set({ status: 'connected', timestamp: Date.now() })
  // .then(() => {
  //   console.log('Firebase Admin SDK connected and test write succeeded.');
  // })
  // .catch((err) => {
  //   console.error('Firebase Admin SDK connection failed:', err);
  // });

  io.on("connection", (client) => {
    console.log("connected : " + client.id);
    client.emit("connected", { "id": client.id });

    //check the username is taken or not
    // client.on('checkUserDetail', (data) => {
    //   var flag = false;
    //   for (var id in sockets) {
    //     if (sockets[id].name === data.name) {
    //       flag = true;
    //       break;
    //     }
    //   }
    //   if (!flag) {
    //     sockets[client.id] = {
    //       name: data.name,
    //       is_playing: false,
    //       game_id: null
    //     };

    //     var flag1 = false;
    //     for (id in players) {
    //       if (id === data.name) {
    //         flag1 = true;
    //         break;
    //       }
    //     }
    //     if (!flag1) {
    //       players[data.name] = {
    //         played: 0,
    //         won: 0,
    //         draw: 0
    //       };
    //     }

    //   }
    //   // client.emit('checkUserDetailResponse', !flag);
    // });

    //respond with current online users
    // client.on('getOpponents', () => {
    //   var response = [];
    //   for (var id in sockets) {
    //     if (id !== client.id && !sockets[id].is_playing) {
    //       response.push({
    //         id: id,
    //         name: sockets[id].name,
    //         played: players[sockets[id].name].played,
    //         won: players[sockets[id].name].won,
    //         draw: players[sockets[id].name].draw
    //       });
    //     }
    //   }
    //   client.emit('getOpponentsResponse', response);
    //   client.broadcast.emit('newOpponentAdded', {
    //     id: client.id,
    //     name: sockets[client.id].name,
    //     played: players[sockets[client.id].name].played,
    //     won: players[sockets[client.id].name].won,
    //     draw: players[sockets[client.id].name].draw
    //   });
    // });

    client.on('disconnect', () => {
      console.log("disconnect : " + client.id);
      io.to(inGamePlayers[client.id].game_id).emit('toLobby', {});
      players[sockets[games[sockets[client.id].game_id].player1].name].played--;
      players[sockets[games[sockets[client.id].game_id].player2].name].played--;
      io.sockets.connected[client.id === games[sockets[client.id].game_id].player1 
        ? games[sockets[client.id].game_id].player2 
        : games[sockets[client.id].game_id].player1].leave(sockets[client.id].game_id);
      delete games[sockets[client.id].game_id];
      // if (typeof sockets[client.id] !== "undefined") {
      //   if (sockets[client.id].is_playing && games[sockets[client.id].game_id] !== undefined) {
      //     io.to(sockets[client.id].game_id).emit('toLobby', {});
      //     players[sockets[games[sockets[client.id].game_id].player1].name].played--;
      //     players[sockets[games[sockets[client.id].game_id].player2].name].played--;
      //     io.sockets.connected[client.id === games[sockets[client.id].game_id].player1 
      //       ? games[sockets[client.id].game_id].player2 
      //       : games[sockets[client.id].game_id].player1].leave(sockets[client.id].game_id);
      //     delete games[sockets[client.id].game_id];
      //   }
      // }
      // delete sockets[client.id];
      // client.broadcast.emit('opponentDisconnected', {
      //   id: client.id
      // });
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
        // sockets[data.id].is_playing = true;
        // sockets[client.id].is_playing = true;
        // sockets[data.id].game_id = gameId;
        // sockets[client.id].game_id = gameId;
        // players[sockets[data.id].name].played = players[sockets[data.id].name].played + 1;
        // players[sockets[client.id].name].played = players[sockets[client.id].name].played + 1;

        inGamePlayers[whitePlayerId].gameId = gameId;
        inGamePlayers[whitePlayerId].uid = whitePlayerUid;
        inGamePlayers[blackPlayerId].gameId = gameId;
        inGamePlayers[blackPlayerId].uid = blackPlayerUid;

        await admin.database().ref(`games/${gameId}`).set({
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
          // moves: [],
        };
        // games[gameId][client.id] = {
        //   name: sockets[client.id].name,
        //   side: "white",
        //   played: players[sockets[client.id].name].played,
        //   won: players[sockets[client.id].name].won,
        //   draw: players[sockets[client.id].name].draw
        // };
        // games[gameId][data.id] = {
        //   name: sockets[data.id].name,
        //   side: "black",
        //   played: players[sockets[data.id].name].played,
        //   won: players[sockets[data.id].name].won,
        //   draw: players[sockets[data.id].name].draw
        // };
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

      await admin.database().ref(`games/${ data.gameId }/whoseTurn`).set(inGamePlayers[opponentId].uid);

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
        await admin.database().ref(`games/${ data.gameId }/winner`).set(inGamePlayers[games[data.gameId].game_winner].uid);
        // players[games[data.gameId][games[data.gameId].game_winner].name].won++;
        io.to(opponentId).emit("gameover", { result: data.result });
      }
      else if (data.result === "Black Won") {
        games[data.gameId].game_winner = games[data.gameId].whose_turn === games[data.gameId].player1 
          ? games[data.gameId].player2 
          : games[data.gameId].player1;
        games[data.gameId].game_status = "finished";
        await admin.database().ref(`games/${ data.gameId }/winner`).set(inGamePlayers[games[data.gameId].game_winner].uid);
        // players[games[data.gameId][games[data.gameId].game_winner].name].won++;
        io.to(opponentId).emit("gameover", { result: data.result });
      }
    });

    client.on("newGame", (data) => {
      const opponentId = data.userId === games[data.gameId].player1 
        ? games[data.gameId].player2 : games[data.gameId].player1;

      if (data.askOpponent) {
        const gameId = uuidv4();

        // sockets[games[data.gameId].player1].game_id = gameId;
        // sockets[games[data.gameId].player2].game_id = gameId;
        // players[sockets[games[data.gameId].player1].name].played = 
        //   players[sockets[games[data.gameId].player1].name].played + 1;
        // players[sockets[games[data.gameId].player2].name].played = 
        //   players[sockets[games[data.gameId].player2].name].played + 1;

        const whoseTurn = games[data.gameId][data.userId].side === "white" 
          ? opponentId : data.userId;
        const otherPlayerId = whoseTurn === games[data.gameId].player1 
          ? games[data.gameId].player2 : games[data.gameId].player1;

        games[gameId] = {
          player1: games[data.gameId].player1,
          player2: games[data.gameId].player2,
          whose_turn: whoseTurn,
          game_status: "ongoing",
          game_winner: null,
        };
        // games[gameId][whoseTurn] = {
        //   name: sockets[whoseTurn].name,
        //   side: "white",
        //   played: players[sockets[whoseTurn].name].played,
        //   won: players[sockets[whoseTurn].name].won,
        //   draw: players[sockets[whoseTurn].name].draw
        // };
        // games[gameId][otherPlayerId] = {
        //   name: sockets[otherPlayerId].name,
        //   side: "black",
        //   played: players[sockets[otherPlayerId].name].played,
        //   won: players[sockets[otherPlayerId].name].won,
        //   draw: players[sockets[otherPlayerId].name].draw
        // };
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
      // sockets[data.userId].is_playing = false;
      // sockets[data.userId].game_id = null;
      // sockets[opponentId].is_playing = false;
      // sockets[opponentId].game_id = null;
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
      admin.database().ref(`games/${ data.gameId }/moves`).push(data.move);
    });
  });

  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
  }
}
