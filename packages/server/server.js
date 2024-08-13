const express = require("express");
const http = require("http");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { onConnection } = require("./socket"); // Adjust the path as necessary

const app = express();
const port = Number(process.env.PORT) || 8080;

const headerConfig = (req, res, next) => {
  // allow external requests
  // if (process.env.NODE_ENV === 'production') {
  //   const origin = req.headers.origin;
  //   if (crossOriginDomainsProd.indexOf(origin) > -1) {
  //     res.append('Access-Control-Allow-Origin', origin);
  //   }
  // } else {
  //   const origin = req.headers.origin;
  //   if (crossOriginDomainsTest.indexOf(origin) > -1) {
  //     res.append('Access-Control-Allow-Origin', origin);
  //   }
  // }

  // Access-Control-Allow-Credentials
  res.append("Access-Control-Allow-Credentials", "true");
  // allow rest http verbs
  res.append(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,PATCH,OPTIONS"
  );
  // allow content type header
  res.append(
    "Access-Control-Allow-Headers",
    "Origin, Content-Type, Accept, Authorization, X-Requested-With"
  );
  next();
};

app.use(cors({ origin: "*" }));
app.use(headerConfig);
app.use("/api", express.static(path.join(__dirname, "dummy")));

const server = http.createServer(app).listen(port, (e) => {
  console.log("listening on " + port);
});
let io = require("socket.io")({
  cors: true,
}).listen(server);

/**
 * Register all socket event handlers. There should only be one "connection" handler.
 */
io.on("connection", (socket) => {
  let assignedClientSlotIndex = false;
  socket.on("OSC_JOIN_REQUEST", (data) =>
    onOscJoinRequest(socket, data, assignedClientSlotIndex)
  );
  socket.on("OSC_HOST_MESSAGE", (data) => onOscHostMessage(socket, data));
  socket.on("OSC_CTRL_MESSAGE", (data) => onOscCtrlMessage(socket, data));
  socket.on("disconnect", () => onDisconnect(socket, assignedClientSlotIndex));

  socket.on("USER_JOIN_REQUEST", (data) =>
    onUserJoinRequest(socket, data, assignedClientSlotIndex)
  );

  socket.on("connect_failed", (err) => {
    console.log("connect failed!", err);
  });

  socket.on("error", (err) => {
    console.log("there was an error on the connection!", err);
  });
});
