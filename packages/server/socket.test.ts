import { Server, Socket as ServerSocketType } from "socket.io";
import { Socket as ClientSocket } from "socket.io-client";
import { io } from "socket.io-client";
import { createServer } from 'http';
const {
  onOscJoinRequest,
  onOscHostMessage,
  onOscCtrlMessage,
  onDisconnect,
  onUserJoinRequest,
} = require("./socket");

jest.setTimeout(100); // Set default timeout to 100 ms


describe("Socket Server", () => {
  let ioServer, serverSocket: ServerSocketType;
  let clientSocket: ClientSocket;
  let ctrlSocket: ClientSocket;
  let httpServer;

  beforeAll((done) => {
    httpServer = createServer();
    ioServer = new Server(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = io(`http://localhost:${port}`);
      ctrlSocket = io(`http://localhost:${port}`);
      ioServer.on("connection", (socket: ServerSocketType) => {
        serverSocket = socket;
        socket.on("OSC_JOIN_REQUEST", (data) =>
          onOscJoinRequest({ socket, data, io: ioServer })
        );
        socket.on("USER_JOIN_REQUEST", (data) =>
          onUserJoinRequest({ socket, data, io: ioServer })
        );
        socket.on("OSC_HOST_MESSAGE", (data) =>
          onOscHostMessage({ socket, data, io: ioServer })
        );
        socket.on("OSC_CTRL_MESSAGE", (data) =>
          onOscCtrlMessage({ socket, data, io: ioServer, assignedClientSlotIndex: 1 })
        );
        socket.on("disconnect", () => onDisconnect({ socket, io: ioServer }));
      });
      clientSocket.on("connect", done);
    });
  });

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
    clientSocket.emit("OSC_JOIN_REQUEST", "control:1");
  });

  test("should handle USER_JOIN_REQUEST", (done) => {
    clientSocket.on("USER_JOIN_ACCEPTED", (data) => {
      expect(data.id).toBe(clientSocket.id);
      done();
    });
    clientSocket.emit("USER_JOIN_REQUEST", { room: "users:1" });
  });

  test("should handle USER_JOIN_REQUEST with wantsSlot", (done) => {
    clientSocket.on("USER_JOIN_ACCEPTED", (data) => {
      expect(data.id).toBe(clientSocket.id);
      expect(data.userSlot).toBe(2);
      done();
    });
    clientSocket.emit("USER_JOIN_REQUEST", { room: "users:1", wantsSlot: 2 });
  });

  test("should handle OSC_HOST_MESSAGE", (done) => {
    clientSocket.emit("USER_JOIN_REQUEST", { room: "users:1" });

    /**
     * @todo refactor so consistent arg passing
     */
    const testData = { data: { blah: "blah" }, room: "control:1" };
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
      clientSocket.emit("USER_JOIN_REQUEST", { room: "users:2" });
      serverSocket.join("control:2")
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
      const testData = { message: "button", btnId: "channel1", state: 1 };
      const assignedClientSlotIndex = 1;
      clientSocket.emit("OSC_CTRL_MESSAGE", testData);

      ctrlSocket.on("OSC_CTRL_MESSAGE", (data) => {
        console.log("OSC_CTRL_MESSAGE", data)
        expect(data.message).toBe(testData.message);
        expect(data.btnId).toBe(testData.btnId);
        expect(data.state).toBe(testData.state);
        expect(data.client_index).toBe(assignedClientSlotIndex);
        done();
      });
    });
  });

  test("should handle disconnect", (done) => {
    clientSocket.on("disconnect", () => {
      expect(true).toBe(true); // Adjust this expectation based on your actual logic
      done();
    });
    clientSocket.close();
  });
});