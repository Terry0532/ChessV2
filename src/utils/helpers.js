const admin = require("firebase-admin");

const updateUserPlayHistory = async (player1Uid, player2Uid, result) => {
  try {
    const player1Updates = { played: admin.firestore.FieldValue.increment(1) };
    const player2Updates = { played: admin.firestore.FieldValue.increment(1) };

    if (result === "Stalemate Draw" || result === "Draw") {
      player1Updates.draw = admin.firestore.FieldValue.increment(1);
      player2Updates.draw = admin.firestore.FieldValue.increment(1);
    } else if (result === "White Won") {
      player1Updates.won = admin.firestore.FieldValue.increment(1);
      player2Updates.lost = admin.firestore.FieldValue.increment(1);
    } else if (result === "Black Won") {
      player2Updates.won = admin.firestore.FieldValue.increment(1);
      player1Updates.lost = admin.firestore.FieldValue.increment(1);
    }

    await Promise.all([
      admin
        .firestore()
        .collection("users")
        .doc(player1Uid)
        .update(player1Updates),
      admin
        .firestore()
        .collection("users")
        .doc(player2Uid)
        .update(player2Updates),
    ]);

    console.log(
      `Updated play history for players ${player1Uid} and ${player2Uid}`
    );
  } catch (error) {
    console.error("Error updating user play history:", error);
  }
};

const getAndRemoveGameFromRTDB = async (
  gameId,
  getPlayerInGameFn,
  gameData
) => {
  try {
    const gameRef = admin.database().ref(`liveGames/${gameId}`);
    const gameSnap = await gameRef.once("value");
    const rtdbGameData = gameSnap.val();

    if (rtdbGameData) {
      await gameRef.remove();
      return rtdbGameData;
    } else {
      const player1Data = await getPlayerInGameFn(gameData.player1);
      const player2Data = await getPlayerInGameFn(gameData.player2);

      if (player1Data && player2Data) {
        return {
          whitePlayer: player1Data.uid,
          blackPlayer: player2Data.uid,
          startedAt: null,
          whoseTurn:
            gameData.whose_turn === gameData.player1
              ? player1Data.uid
              : player2Data.uid,
          moves: gameData.moves || [],
          winner: gameData.game_winner,
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting and removing game from RTDB:", error);
    return null;
  }
};

const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const createNewGame = async (
  whitePlayerId,
  whitePlayerUid,
  blackPlayerId,
  blackPlayerUid,
  setPlayerInGameFn,
  setGameDataFn
) => {
  const gameId = uuidv4();

  await setPlayerInGameFn(whitePlayerId, {
    gameId: gameId,
    uid: whitePlayerUid,
  });

  await setPlayerInGameFn(blackPlayerId, {
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

  await setGameDataFn(gameId, gameData);

  await admin.database().ref(`liveGames/${gameId}`).set({
    whitePlayer: whitePlayerUid,
    blackPlayer: blackPlayerUid,
    startedAt: Date.now(),
    whoseTurn: whitePlayerUid,
    moves: [],
    winner: null,
  });

  return { gameId, gameData };
};

const getOpponentId = (userId, gameData) => {
  return userId === gameData.player1 ? gameData.player2 : gameData.player1;
};

module.exports = {
  updateUserPlayHistory,
  getAndRemoveGameFromRTDB,
  createNewGame,
  getOpponentId,
};
