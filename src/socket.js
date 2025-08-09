const { setupProcessHandlers } = require("./utils/processHandlers");
const SocketHandlers = require("./socketHandlers");

module.exports = (io) => {
  const handlers = new SocketHandlers(io);

  io.on("connection", (client) => {
    console.log("connected : " + client.id);
    client.emit("connected", { id: client.id });

    client.on("disconnect", () => handlers.handleDisconnect(client));
    client.on("selectOpponent", (data) =>
      handlers.handleSelectOpponent(client, data)
    );
    client.on("moves", (data) => handlers.handleMoves(data));
    client.on("gameResult", (data) => handlers.handleGameResult(data));
    client.on("newGame", (data) => handlers.handleNewGame(data));
    client.on("leaveGame", (data) => handlers.handleLeaveGame(data));
    client.on("updateNotation", (data) => handlers.handleUpdateNotation(data));
  });
};

setupProcessHandlers();
