const { Server } = require('socket.io');
const { assignClientSlot, resetClientSlot, createRoomState } = require('./utils');

function setupSocketServer(server, instances) {
  const io = new Server(server, { cors: { origin: '*' } });

  io.on('connection', (client) => {
    let assignedClientSlotIndex = false;

    client.on('OSC_JOIN_REQUEST', (room) => {
      const instance = instances.find(item => item.rooms.control === room);
      if (!instance) return client.emit('error', 'Invalid Room requested');

      client.join(instance.rooms.control);
      const newRoomState = createRoomState(instance, io.sockets.adapter.rooms.get(instance.rooms.control));
      io.to(client.id).emit('OSC_JOIN_ACCEPTED', { id: client.id, ...newRoomState });
      io.to(room).emit('OSC_JOINED', newRoomState);
    });

    client.on('USER_JOIN_REQUEST', ({ room, wantsSlot }) => {
      const instance = instances.find(item => item.rooms.users === room);
      if (!instance) return client.emit('error', 'Invalid Room');

      const roomState = createRoomState(instance, io.sockets.adapter.rooms.get(instance.rooms.users));
      assignedClientSlotIndex = assignClientSlot(instance, roomState, client, wantsSlot);
      if (assignedClientSlotIndex === false) {
        return io.to(client.id).emit('USER_JOIN_REJECTED', { reason: `Room is full ${roomState.usedSlots}/${roomState.maxSlots}` });
      }

      client.join(instance.rooms.users);
      client.instanceId = instance.id;
      io.to(client.id).emit('USER_JOIN_ACCEPTED', { id: client.id, userSlot: assignedClientSlotIndex });
      instance.users.push({ id: client.id, client_index: assignedClientSlotIndex, name: '' });

      const newRoomState = createRoomState(instance, io.sockets.adapter.rooms.get(instance.rooms.users));
      io.to(instance.rooms.control).emit('OSC_CTRL_USER_JOINED', { id: client.id, client_index: assignedClientSlotIndex, ...newRoomState });
      io.to(instance.rooms.users).emit('USER_JOINED', { ...newRoomState, id: client.id, client_index: assignedClientSlotIndex });
    });

    client.on('disconnect', () => {
      const instance = instances.find(item => item.id === client.instanceId);
      if (!instance) return;

      instance.users = instance.users.filter(user => user.id !== client.id);
      const newRoomState = createRoomState(instance, io.sockets.adapter.rooms.get(instance.rooms.users));
      io.to(instance.rooms.control).emit('OSC_CTRL_USER_LEFT', { id: client.id, client_index: assignedClientSlotIndex, ...newRoomState });
      io.to(instance.rooms.users).emit('USER_LEFT', { ...newRoomState, id: client.id, client_index: assignedClientSlotIndex });
      resetClientSlot(instance, client);
    });
  });

  return io;
}

module.exports = setupSocketServer;