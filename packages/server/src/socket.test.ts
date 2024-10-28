import { Server, Socket as ServerSocketType } from "socket.io";
import { Socket as ClientSocket } from "socket.io-client";
import { io } from "socket.io-client";
import { createServer, Server as HTTPServer } from "http";
import sequelize from "./database";
import defineAssociations from "./models/associations";
import Instance from "./models/Instance";
import Admin from "./models/Admin";
import {
  onOscJoinRequest,
  onOscHostMessage,
  onOscCtrlMessage,
  onDisconnect,
  onUserJoinRequest,
} from "./socket";

jest.setTimeout(100); // Set default timeout to 100 ms

describe("Socket Server", () => {
  let ioServer: Server, serverSocket: ServerSocketType;
  let clientSocket: ClientSocket;
  let ctrlSocket: ClientSocket;
  let httpServer: HTTPServer;
  let testInstance: Instance;
  let testAdmin: Admin;

  beforeAll(async () => {
    // setup DB
    defineAssociations();
    await sequelize.sync();
    await Admin.destroy({ where: {}, truncate: true });
    await Instance.destroy({ where: {}, truncate: true });

    try {
      testAdmin = await Admin.create({
        id: 'clerk-user-id',
        email: 'admin@osc.link'
      });

      testInstance = await testAdmin.createInstance({
        name: "test",
        description: "description",
        settings: {
          slots: 4,
        },
      });
      console.log("TEST INSTANCE", testInstance.id)
    } catch (e) {
      console.error(e);
    }

    httpServer = createServer();
    ioServer = new Server(httpServer);
    await new Promise<void>((resolve, reject) => {
      httpServer.listen(() => {
        const address = httpServer.address();
        const port =
          typeof address === "object" && address !== null ? address.port : "";
        clientSocket = io(`http://localhost:${port}`);
        ctrlSocket = io(`http://localhost:${port}`);
        ioServer.on("connection", (socket: ServerSocketType) => {
          serverSocket = socket;
          socket.on(
            "OSC_JOIN_REQUEST",
            async (data) => {
              try {
                await onOscJoinRequest({ socket, data, io: ioServer });
              } catch (error) {
                console.error("Error handling OSC_JOIN_REQUEST:", error);
              }
            }
          );
          socket.on(
            "USER_JOIN_REQUEST",
            async (data) => {
              try {
                await onUserJoinRequest({ socket, data, io: ioServer });
              } catch (error) {
                console.error("Error handling USER_JOIN_REQUEST:", error);
              }
            }
          );
          socket.on(
            "OSC_HOST_MESSAGE",
            async (data) => {
              try {
                await onOscHostMessage({ socket, data, io: ioServer });
              } catch (error) {
                console.error("Error handling OSC_HOST_MESSAGE:", error);
              }
            }
          );
          socket.on(
            "OSC_CTRL_MESSAGE",
            async (data) => {
              try {
                await onOscCtrlMessage({
                  socket,
                  data,
                  io: ioServer,
                });
              } catch (error) {
                console.error("Error handling OSC_CTRL_MESSAGE:", error);
              }
            }
          );
          socket.on(
            "disconnect",
            async () => {
              try {
                await onDisconnect({ socket, io: ioServer });
              } catch (error) {
                console.error("Error handling disconnect:", error);
              }
            }
          );
        });
        clientSocket.on("connect", resolve);
        clientSocket.on('connect_error', reject)
      });
    });
  }, 3000);

  beforeEach(() => {
    clientSocket.removeAllListeners();
    ctrlSocket.removeAllListeners();
  });

  afterAll(() => {
    ioServer.close();
    clientSocket.close();
    ctrlSocket.close();
    httpServer.close();
  });

  test("should handle OSC_JOIN_REQUEST", (done) => {
    clientSocket.on("OSC_JOIN_ACCEPTED", (data) => {
      expect(data.id).toBe(clientSocket.id);
      done();
    });
    clientSocket.emit("OSC_JOIN_REQUEST", { room: `control:${testInstance.id}` });
  });

  test("should handle USER_JOIN_REQUEST", (done) => {
    clientSocket.on("USER_JOIN_ACCEPTED", (data) => {
      expect(data.id).toBe(clientSocket.id);
      done();
    });
    clientSocket.emit("USER_JOIN_REQUEST", { room: `user:${testInstance.id}` });
  });

  test("should handle USER_JOIN_REQUEST with wantsSlot", (done) => {
    clientSocket.on("USER_JOIN_ACCEPTED", (data) => {
      expect(data.id).toBe(clientSocket.id);
      expect(data.userSlot).toBe(2);
      done();
    });
    clientSocket.emit("USER_JOIN_REQUEST", { room: `user:${testInstance.id}`, wantsSlot: 2 });
  });

  test("should handle OSC_HOST_MESSAGE", (done) => {
    clientSocket.emit("USER_JOIN_REQUEST", { room: `user:${testInstance.id}` });

    /**
     * @todo refactor so consistent arg passing
     */
    const testData = { data: { blah: "blah" }, room: `control:${testInstance.id}` };
    clientSocket.emit("OSC_HOST_MESSAGE", testData);
    clientSocket.on("OSC_HOST_MESSAGE", (data) => {
      expect(data.blah).toBe(testData.data.blah);
      done();
    });
  });

  /**
   * OSC_CTRL_MESSAGE is not really passed back to clients. It's used for the server
   * to then send to HOSTS aka Electron app.
   */
  describe("OSC_CTRL_MESSAGE handling", () => {
    beforeEach(() => {
      // need to ensure there is a user session before each of these tests
      // using a different room because we are not clearing the room before each test
      clientSocket.emit("USER_JOIN_REQUEST", { room: `user:${testInstance.id}`, wantsSlot: 0 });
      serverSocket.join(`control:${testInstance.id}`);
      clientSocket.removeAllListeners();
      ctrlSocket.removeAllListeners();
    });

    test("should emit OSC_CTRL_MESSAGE from client", (done) => {
      const testData = { message: "button", btnId: "channel1", state: 1 };
      clientSocket.emit("OSC_CTRL_MESSAGE", testData);

      ctrlSocket.on("OSC_CTRL_MESSAGE", (data) => {
        expect(data.message).toBe(testData.message);
        expect(data.btnId).toBe(testData.btnId);
        expect(data.state).toBe(testData.state);
        done();
      });
    });

    test("should handle OSC_CTRL_MESSAGE on server", (done) => {
      const testData = { message: "test control message" };
      clientSocket.emit("OSC_CTRL_MESSAGE", testData);
      serverSocket.on("OSC_CTRL_MESSAGE", (data) => {
        expect(data.message).toBe(testData.message);
      });
      ctrlSocket.on("OSC_CTRL_MESSAGE", (data) => {
        console.log("ctrlSocket OSC_CTRL_MESSAGE", data);
        done();
      });
    }, 1000);

    test("full flow: client emits OSC_CTRL_MESSAGE, server handles it, client receives response", (done) => {
      const testData = { message: "button", btnId: "channel1", state: 1, };
      clientSocket.emit("OSC_CTRL_MESSAGE", testData);

      ctrlSocket.on("OSC_CTRL_MESSAGE", (data) => {
        console.log("OSC_CTRL_MESSAGE test", data, );
        expect(data.message).toBe(testData.message);
        expect(data.btnId).toBe(testData.btnId);
        expect(data.state).toBe(testData.state);
        expect(data.client_index).toBe(0);
        done();
      });
    });
  });

  test("should handle disconnect", (done) => {
    clientSocket.on("disconnect", () => {
      expect(true).toBe(true);
      done();
    });
    clientSocket.close();
  });
});
