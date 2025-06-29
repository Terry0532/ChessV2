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
const HOST = "127.0.0.1";

app.use(express.static(path.join(__dirname, "client", "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

// server.listen(PORT, "0.0.0.0");
server.listen(PORT);
// server.listen(4444, process.env.OPENSHIFT_NODEJS_IP || process.env.IP || '127.0.0.1')
console.log("listening to port : " + PORT);

require("./socket")(io);
