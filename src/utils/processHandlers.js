const { closeRedisConnection } = require("../config/redis");

function setupProcessHandlers() {
  process.on("SIGINT", async () => {
    console.log("\nReceived SIGINT. Graceful shutdown...");
    await closeRedisConnection();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("Received SIGTERM. Graceful shutdown...");
    await closeRedisConnection();
    process.exit(0);
  });
}

module.exports = { setupProcessHandlers };
