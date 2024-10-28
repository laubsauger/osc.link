import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import http from "http";
import cors from "cors";
import {
  onOscJoinRequest,
  onOscHostMessage,
  onOscCtrlMessage,
  onDisconnect,
  onUserJoinRequest,
} from "./socket";
import sequelize from "./database";
import instanceRoutes from "./routes/instances";
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import defineAssociations from "./models/associations";
import { Socket, Server } from "socket.io";

const app = express();
const port = Number(process.env.SERVER_PORT) || 8080;

const headerConfig = (req: Request, res: Response, next: NextFunction) => {
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

const allowedOrigins = ["https://beta.osc.link", "https://osc.link"];
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (mobile apps, curl reqs)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(headerConfig);
app.use(express.json());
app.use("/api/instances", instanceRoutes);

export default app;

const server = http.createServer(app).listen(port, async () => {
  console.log("listening on " + port);
  defineAssociations();
  await sequelize.sync();
});

let io = new Server({
  cors: {
    origin: ["https://beta.osc.link", "https://osc.link"],
    methods: ["GET", "POST"],
    credentials: true,
  },
}).listen(server);

/**
 * Register all socket event handlers. There should only be one "connection" handler.
 */
io.on("connection", (socket: Socket) => {
  // assignedClientSlotIndex is tied to the socket state.
  socket.on(
    "OSC_JOIN_REQUEST",
    async (data) => await onOscJoinRequest({ socket, data, io })
  );
  socket.on(
    "OSC_HOST_MESSAGE",
    async (data) =>
      await onOscHostMessage({
        socket,
        data,
        io,
      })
  );

  socket.on(
    "OSC_CTRL_MESSAGE",
    async (data) =>
      await onOscCtrlMessage({ socket, data, io })
  );

  socket.on("USER_JOIN_REQUEST", async (data) => {
    const assignedClientSlotIndex = await onUserJoinRequest({
      socket,
      data,
      io,
    });
    socket.data.assignedClientSlotIndex = assignedClientSlotIndex;
  });

  socket.on(
    "disconnect",
    async () => await onDisconnect({ socket, io })
  );

  socket.on("connect_failed", (err) => {
    console.log("connect failed!", err);
  });

  socket.on("error", (err) => {
    console.log("there was an error on the connection!", err);
  });
});
