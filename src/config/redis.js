require("dotenv").config();
const redis = require("redis");

const redisClient = redis.createClient({
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.connect().catch(console.error);

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
  await redisClient.setEx(`player:${playerId}`, 3600, JSON.stringify(gameData));
};

const getPlayerInGame = async (playerId) => {
  const data = await redisClient.get(`player:${playerId}`);
  return data ? JSON.parse(data) : null;
};

const deletePlayerInGame = async (playerId) => {
  await redisClient.del(`player:${playerId}`);
};

const closeRedisConnection = async () => {
  try {
    await redisClient.quit();
    console.log("Redis connection closed.");
  } catch (error) {
    console.error("Error closing Redis connection:", error);
  }
};

module.exports = {
  setGameData,
  getGameData,
  deleteGameData,
  setPlayerInGame,
  getPlayerInGame,
  deletePlayerInGame,
  closeRedisConnection,
};
