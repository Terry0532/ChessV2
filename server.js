const path = require("path");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    credentials: true,
  },
});
const PORT = process.env.PORT || 4445;

app.use(express.static(path.join(__dirname, "client", "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

server.listen(PORT, () => {
  console.log("listening to port : " + PORT);
});

process.on("SIGINT", () => {
  console.log("\nReceived SIGINT. Closing server...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

require("./socket")(io);
