import http from "http";
import {
  onOscJoinRequest,
  onOscHostMessage,
  onOscCtrlMessage,
  onDisconnect,
  onUserJoinRequest,
} from "./socket";
import { Socket, Server } from "socket.io";

/**
 * Initialize and setup socket server.
 * @param server http.Server to attach socket.io server
 * @param allowedOrigins array of urls for CORS
 */
export default function createSocketServer(server: http.Server, allowedOrigins: string[]) {
  let io = new Server({
    cors: {
      origin: allowedOrigins,
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
      async (data) => await onOscCtrlMessage({ socket, data, io })
    );

    socket.on("USER_JOIN_REQUEST", async (data) => {
      await onUserJoinRequest({
        socket,
        data,
        io,
      });
    });

    socket.on("disconnect", async () => await onDisconnect({ socket, io }));

    socket.on("connect_failed", (err) => {
      console.log("connect failed!", err);
    });

    socket.on("error", (err) => {
      console.log("there was an error on the connection!", err);
    });
  });
}
