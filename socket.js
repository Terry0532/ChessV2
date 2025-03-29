module.exports = (io) => {
  let sockets = {};
  let players = {};
  let games = {};

  io.on("connection", client => {
    console.log("connected : " + client.id);
    client.emit("connected", { "id": client.id });

    //check the username is taken or not
    client.on('checkUserDetail', data => {
      var flag = false;
      for (var id in sockets) {
        if (sockets[id].name === data.name) {
          flag = true;
          break;
        }
      }
      if (!flag) {
        sockets[client.id] = {
          name: data.name,
          is_playing: false,
          game_id: null
        };

        var flag1 = false;
        for (id in players) {
          if (id === data.name) {
            flag1 = true;
            break;
          }
        }
        if (!flag1) {
          players[data.name] = {
            played: 0,
            won: 0,
            draw: 0
          };
        }

      }
      client.emit('checkUserDetailResponse', !flag);
    });

    //respond with current online users
    client.on('getOpponents', () => {
      var response = [];
      for (var id in sockets) {
        if (id !== client.id && !sockets[id].is_playing) {
          response.push({
            id: id,
            name: sockets[id].name,
            played: players[sockets[id].name].played,
            won: players[sockets[id].name].won,
            draw: players[sockets[id].name].draw
          });
        }
      }
      client.emit('getOpponentsResponse', response);
      client.broadcast.emit('newOpponentAdded', {
        id: client.id,
        name: sockets[client.id].name,
        played: players[sockets[client.id].name].played,
        won: players[sockets[client.id].name].won,
        draw: players[sockets[client.id].name].draw
      });
    });

    client.on('disconnect', () => {
      console.log("disconnect : " + client.id);
      if (typeof sockets[client.id] !== "undefined") {
        if (sockets[client.id].is_playing && games[sockets[client.id].game_id] !== undefined) {
          io.to(sockets[client.id].game_id).emit('opponentLeft', {});
          players[sockets[games[sockets[client.id].game_id].player1].name].played--;
          players[sockets[games[sockets[client.id].game_id].player2].name].played--;
          io.sockets.connected[client.id === games[sockets[client.id].game_id].player1 
            ? games[sockets[client.id].game_id].player2 
            : games[sockets[client.id].game_id].player1].leave(sockets[client.id].game_id);
          delete games[sockets[client.id].game_id];
        }
      }
      delete sockets[client.id];
      client.broadcast.emit('opponentDisconnected', {
        id: client.id
      });
    });

    client.on('selectOpponent', (data) => {
      if (sockets[data.id] && !sockets[data.id].is_playing && !sockets[client.id].is_playing) {
        var gameId = uuidv4();
        sockets[data.id].is_playing = true;
        sockets[client.id].is_playing = true;
        sockets[data.id].game_id = gameId;
        sockets[client.id].game_id = gameId;
        players[sockets[data.id].name].played = players[sockets[data.id].name].played + 1;
        players[sockets[client.id].name].played = players[sockets[client.id].name].played + 1;

        games[gameId] = {
          player1: client.id,
          player2: data.id,
          whose_turn: client.id,
          game_status: "ongoing", // "ongoing","won","draw"
          game_winner: null // winner_id if status won
        };
        games[gameId][client.id] = {
          name: sockets[client.id].name,
          side: "white",
          played: players[sockets[client.id].name].played,
          won: players[sockets[client.id].name].won,
          draw: players[sockets[client.id].name].draw
        };
        games[gameId][data.id] = {
          name: sockets[data.id].name,
          side: "black",
          played: players[sockets[data.id].name].played,
          won: players[sockets[data.id].name].won,
          draw: players[sockets[data.id].name].draw
        };
        io.sockets.connected[client.id].join(gameId);
        io.sockets.connected[data.id].join(gameId);
        io.emit('excludePlayers', [client.id, data.id]);
        io.to(gameId).emit('gameStarted', { status: true, game_id: gameId, game_data: games[gameId] });
      } else {
        client.emit("alreadyInGame", [data.id])
      }
    });

    //sending moves between players
    client.on("moves", (data) => {
      const opponentId = data.userId === games[data.gameId].player1 
        ? games[data.gameId].player2 
        : games[data.gameId].player1;

      io.to(opponentId).emit(
        "updateGameData", 
        { 
          selectedPiece: data.selectedPiece, 
          targetPosition: data.targetPosition,
          promotionPiece: data.promotionPiece
        }
      );
    });

    //send the game result to opponent
    client.on("gameResult", data => {
      const opponentId = data.userId === games[data.gameId].player1 ? games[data.gameId].player2 : games[data.gameId].player1;
      if (data.result === "Stalemate Draw") {
        players[games[data.gameId][games[data.gameId].player1].name].draw++;
        players[games[data.gameId][games[data.gameId].player2].name].draw++;
        games[data.gameId].game_status = "draw";
        io.to(opponentId).emit("gameover", { result: data.result });
      }
      else if (data.result === "Draw") {
        players[games[data.gameId][games[data.gameId].player1].name].draw++;
        players[games[data.gameId][games[data.gameId].player2].name].draw++;
        games[data.gameId].game_status = "draw";
        io.to(opponentId).emit("gameover", { result: data.result });
      }
      else if (data.result === "White Won") {
        games[data.gameId].game_winner = games[data.gameId].whose_turn === games[data.gameId].player1 ? games[data.gameId].player2 : games[data.gameId].player1;
        games[data.gameId].game_status = "won";
        players[games[data.gameId][games[data.gameId].game_winner].name].won++;
        io.to(opponentId).emit("gameover", { result: data.result });
      }
      else if (data.result === "Black Won") {
        games[data.gameId].game_winner = games[data.gameId].whose_turn === games[data.gameId].player1 ? games[data.gameId].player2 : games[data.gameId].player1;
        games[data.gameId].game_status = "won";
        players[games[data.gameId][games[data.gameId].game_winner].name].won++;
        io.to(opponentId).emit("gameover", { result: data.result });
      }
    });

    //check if both players want to rematch
    client.on("newGame", data => {
      const opponentId = data.userId === games[data.gameId].player1 
        ? games[data.gameId].player2 : games[data.gameId].player1;

      if (data.check) {
        const gameId = uuidv4();
        sockets[games[data.gameId].player1].game_id = gameId;
        sockets[games[data.gameId].player2].game_id = gameId;
        players[sockets[games[data.gameId].player1].name].played = 
          players[sockets[games[data.gameId].player1].name].played + 1;
        players[sockets[games[data.gameId].player2].name].played = 
          players[sockets[games[data.gameId].player2].name].played + 1;

        const whoseTurn = games[data.gameId][data.userId].side === "white" 
          ? opponentId : data.userId;
        const otherPlayerId = whoseTurn === games[data.gameId].player1 
          ? games[data.gameId].player2 : games[data.gameId].player1;

        games[gameId] = {
          player1: games[data.gameId].player1,
          player2: games[data.gameId].player2,
          whose_turn: whoseTurn,
          game_status: "ongoing", // "ongoing","won","draw"
          game_winner: null // winner_id if status won
        };
        games[gameId][whoseTurn] = {
          name: sockets[whoseTurn].name,
          side: "white",
          played: players[sockets[whoseTurn].name].played,
          won: players[sockets[whoseTurn].name].won,
          draw: players[sockets[whoseTurn].name].draw
        };
        games[gameId][otherPlayerId] = {
          name: sockets[otherPlayerId].name,
          side: "black",
          played: players[sockets[otherPlayerId].name].played,
          won: players[sockets[otherPlayerId].name].won,
          draw: players[sockets[otherPlayerId].name].draw
        };
        io.sockets.connected[games[data.gameId].player1].join(gameId);
        io.sockets.connected[games[data.gameId].player2].join(gameId);

        io.to(gameId).emit('nextGameData', { game_id: gameId, game_data: games[gameId] });

        io.sockets.connected[games[data.gameId].player1].leave(data.gameId);
        io.sockets.connected[games[data.gameId].player2].leave(data.gameId);
        delete games[data.gameId];
      }
      else {
        io.to(opponentId).emit("continueGame");
      }
    });

    client.on("leaveGame", data => {
      const opponentId = data.userId === games[data.gameId].player1 
        ? games[data.gameId].player2 : games[data.gameId].player1;
      io.to(opponentId).emit("toLobby");
      sockets[data.userId].is_playing = false;
      sockets[data.userId].game_id = null;
      sockets[opponentId].is_playing = false;
      sockets[opponentId].game_id = null;
      io.sockets.connected[data.userId].leave(data.gameId);
      io.sockets.connected[opponentId].leave(data.gameId);
      delete games[data.gameId];
    });

    client.on("askDraw", data => {
      const opponentId = data.userId === games[data.gameId].player1 ? games[data.gameId].player2 : games[data.gameId].player1;
      io.to(opponentId).emit("drawButton");
    });
  });

  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
  }
}
