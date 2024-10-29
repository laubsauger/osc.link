import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import http from "http";
import cors from "cors";
import sequelize from "./database";
import instanceRoutes from "./routes/instances";
import defineAssociations from "./models/associations";
import createSocketServer from "./socket-server";

/**
 * This file sets up
 * 1. an express server for api routes,
 * 2. a socket.io server for websocket messages to pass through.
 */

const app = express();
const port = Number(process.env.SERVER_PORT) || 8080;

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [];
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (mobile apps, curl reqs)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          `The CORS policy for this site does not allow access from the specified Origin: ${origin}.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use((req: Request, res: Response, next: NextFunction) => {
  res.append("Access-Control-Allow-Credentials", "true");
  res.append(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,PATCH,OPTIONS"
  );
  res.append(
    "Access-Control-Allow-Headers",
    "Origin, Content-Type, Accept, Authorization, X-Requested-With"
  );
  next();
});
app.use(express.json());
app.use("/api/instances", instanceRoutes);

export const server = http.createServer(app).listen(port, async () => {
  console.log("listening on " + port);
  // setup DB
  defineAssociations();
  await sequelize.sync();
});

createSocketServer(server, allowedOrigins);

export default app;