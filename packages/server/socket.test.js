const { Server } = require("socket.io");
const Client = require("socket.io-client");
const {
  onOscJoinRequest,
  onOscHostMessage,
  onOscCtrlMessage,
  onDisconnect,
  onUserJoinRequest,
} = require("./socket");

describe("Socket Server", () => {
  let io, serverSocket, clientSocket;

  beforeAll((done) => {
    const httpServer = require("http").createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = new Client(`http://localhost:${port}`);
      io.on("connection", (socket) => {
        serverSocket = socket;
        socket.on("OSC_JOIN_REQUEST", (room) => onOscJoinRequest(socket, room));
        socket.on("USER_JOIN_REQUEST", (data) => onUserJoinRequest(socket, data));
        socket.on("OSC_HOST_MESSAGE", (data) => onOscHostMessage(socket, data, io));
        socket.on("OSC_CTRL_MESSAGE", (data) => onOscCtrlMessage(socket, data));
        socket.on("disconnect", () => {
          console.log('disconnecting', socket.instanceId)
          onDisconnect(socket);
        });
      });
      clientSocket.on("connect", done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  test("should work", (done) => {
    clientSocket.on("hello", (arg) => {
      expect(arg).toBe("world");
      done();
    });
    serverSocket.emit("hello", "world");
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

  test.only("should handle OSC_HOST_MESSAGE", (done) => {
    // setup test
    clientSocket.emit("USER_JOIN_REQUEST", { room: "users:1" });

    const testData = { data: "test host message", room: 'control:1'};
    clientSocket.emit("OSC_HOST_MESSAGE", testData);
    console.log(clientSocket)
    clientSocket.on("OSC_HOST_MESSAGE", (data) => {
      console.log(data)
      expect(data.message).toBe(testData.message);
      done();
    });
  });

  test("should handle OSC_CTRL_MESSAGE", (done) => {
    const testData = { message: "test control message" };
    const assignedClientSlotIndex = 1; // Example slot index
    clientSocket.on("OSC_CTRL_MESSAGE_RECEIVED", (data) => {
      expect(data.message).toBe(testData.message);
      expect(data.slotIndex).toBe(assignedClientSlotIndex);
      done();
    });
    clientSocket.emit("OSC_CTRL_MESSAGE", testData, assignedClientSlotIndex);
  });

  test("should handle disconnect", (done) => {
    clientSocket.on("disconnect", () => {
      expect(true).toBe(true); // Adjust this expectation based on your actual logic
      done();
    });
    clientSocket.close();
  });
});