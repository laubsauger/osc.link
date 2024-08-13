const http = require('http');
const io = require('socket.io-client');
const setupSocketServer = require('./socket'); // Adjust the path as necessary
const express = require('express');
const path = require('path');
const fs = require('fs');

describe('WebSocket message passing', () => {
  let ioServer;
  let httpServer;
  let httpServerAddr;
  let clientSocket;

  beforeAll((done) => {
    const app = express();
    const port = 8080;

    const instancesConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'dummy/instances.json'), 'utf-8'));
    const instances = instancesConfig.map(instanceConfig => {
      let userSlots = [];
      for (let i = 0; i < instanceConfig.settings.slots; i++) {
        userSlots.push({ slot_index: i + 1, client: null });
      }
      return {
        ...instanceConfig,
        rooms: {
          users: `users:${instanceConfig.id}`,
          control: `control:${instanceConfig.id}`,
        },
        userSlots: userSlots,
        users: [],
        lastTriedSlotIndex: 0,
      };
    });

    app.use(express.static(path.join(__dirname, 'dummy')));

    httpServer = http.createServer(app);
    ioServer = setupSocketServer(httpServer, instances);
    httpServer.listen(() => {
      httpServerAddr = httpServer.address();
      done();
    });
  });

  afterAll((done) => {
    ioServer.close();
    httpServer.close();
    done();
  });

  beforeEach((done) => {
    clientSocket = io(`http://localhost:${httpServerAddr.port}`);
    clientSocket.on('connect', done);
  });

  afterEach((done) => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
    done();
  });

  test('should join a room and receive a message', (done) => {
    const room = 'control:1'; // Example room name
    clientSocket.emit('OSC_JOIN_REQUEST', room);

    clientSocket.on('OSC_JOIN_ACCEPTED', (data) => {
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('usedSlots');
      expect(data).toHaveProperty('maxSlots');
      done();
    });

    ioServer.on('connection', (socket) => {
      socket.on('OSC_JOIN_REQUEST', (room) => {
        socket.join(room);
        ioServer.to(socket.id).emit('OSC_JOIN_ACCEPTED', {
          id: socket.id,
          usedSlots: 1,
          maxSlots: 10,
        });
      });
    });
  });

  test('should handle user join request and broadcast messages', (done) => {
    const room = 'users:1'; // Example room name
    const wantsSlot = 1;

    clientSocket.emit('USER_JOIN_REQUEST', { room, wantsSlot });

    clientSocket.on('USER_JOIN_ACCEPTED', (data) => {
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('userSlot');
      done();
    });

    ioServer.on('connection', (socket) => {
      socket.on('USER_JOIN_REQUEST', ({ room, wantsSlot }) => {
        socket.join(room);
        ioServer.to(socket.id).emit('USER_JOIN_ACCEPTED', {
          id: socket.id,
          userSlot: wantsSlot,
        });
      });
    });
  });

  test('should handle OSC_HOST_MESSAGE and broadcast to users', (done) => {
    const room = 'control:1'; // Example room name
    const data = { gameState: { phase: 'play' } };

    clientSocket.emit('OSC_HOST_MESSAGE', { data, room });

    clientSocket.on('OSC_HOST_MESSAGE', (receivedData) => {
      expect(receivedData).toHaveProperty('gameState');
      expect(receivedData.gameState).toHaveProperty('phase', 'play');
      done();
    });

    ioServer.on('connection', (socket) => {
      socket.on('OSC_HOST_MESSAGE', ({ data, room }) => {
        ioServer.to(room).emit('OSC_HOST_MESSAGE', data);
      });
    });
  });
});