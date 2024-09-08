// @ts-nocheck
// TODO: Update to TypeScript
import 'dotenv/config';

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
import sequelize from './database';
import instanceRoutes from './routes/instances';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import defineAssociations from './models/associations';


const app = express();
const port = Number(process.env.SERVER_PORT) || 8080;

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

app.use(cors({ origin: "*", credentials: true }));
app.use(headerConfig);
app.use(express.json());
app.use("/api", express.static(path.join(__dirname, "dummy")));
app.use("/api/instances", instanceRoutes);

export default app;


const server = http.createServer(app).listen(port, async (e) => {
  console.log("listening on " + port);
  defineAssociations();
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
  socket.on("OSC_JOIN_REQUEST", async (data) =>
    await onOscJoinRequest({ socket, data, assignedClientSlotIndex, io })
  );
  socket.on("OSC_HOST_MESSAGE", async (data) =>
    await onOscHostMessage({
      socket,
      data,
      io,
    })
  );

  socket.on("OSC_CTRL_MESSAGE", async (data) =>
    await onOscCtrlMessage({ socket, data, assignedClientSlotIndex, io })
  );

  socket.on("USER_JOIN_REQUEST", async (data) => {
    assignedClientSlotIndex = await onUserJoinRequest({ socket, data, assignedClientSlotIndex, io });
  });

  socket.on("disconnect", async () =>
    await onDisconnect({ socket, assignedClientSlotIndex, io })
  );

  socket.on("connect_failed", (err) => {
    console.log("connect failed!", err);
  });

  socket.on("error", (err) => {
    console.log("there was an error on the connection!", err);
  });
});
