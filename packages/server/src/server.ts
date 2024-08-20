// @ts-nocheck
// TODO: Update to TypeScript

const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const {
  onOscJoinRequest,
  onOscHostMessage,
  onOscCtrlMessage,
  onDisconnect,
  onUserJoinRequest,
} = require("./socket");
const { sequelize } = require('./models');
import instanceRoutes from './routes/instances';

console.log(instanceRoutes);


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
app.use(express.json());
app.use("/api", express.static(path.join(__dirname, "dummy")));
app.use("/api/instances", instanceRoutes);


const server = http.createServer(app).listen(port, async (e) => {
  console.log("listening on " + port);
  await sequelize.sync();
});
let io = require("socket.io")({
  cors: true,
}).listen(server);

/**
 * Register all socket event handlers. There should only be one "connection" handler.
 */
io.on("connection", (socket) => {
  // assignedClientSlotIndex is tied to the socket state.
  // should do via session cookie?
  let assignedClientSlotIndex = false;
  socket.on("OSC_JOIN_REQUEST", (data) =>
    onOscJoinRequest({ socket, data, assignedClientSlotIndex, io })
  );
  socket.on("OSC_HOST_MESSAGE", (data) =>
    onOscHostMessage({
      socket,
      data,
      io,
    })
  );

  socket.on("OSC_CTRL_MESSAGE", (data) =>
    onOscCtrlMessage({ socket, data, assignedClientSlotIndex, io })
  );

  socket.on("USER_JOIN_REQUEST", (data) =>
   assignedClientSlotIndex = onUserJoinRequest({ socket, data, assignedClientSlotIndex, io })
  );

  socket.on("disconnect", () =>
    onDisconnect({ socket, assignedClientSlotIndex, io })
  );

  socket.on("connect_failed", (err) => {
    console.log("connect failed!", err);
  });

  socket.on("error", (err) => {
    console.log("there was an error on the connection!", err);
  });
});
