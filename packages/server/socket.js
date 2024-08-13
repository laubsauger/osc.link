const socketIo = require('socket.io');
const { createRoomState, assignClientSlot, resetClientSlot } = require('./utils'); // Adjust the path as necessary

const roomTypes = {
  users: 'users',
  control: 'control',
}

function setupSocketServer(io, instances) {

  io.on('connection', (client) => {
    let assignedClientSlotIndex = false;

    // socket osc join request
    client.on('OSC_JOIN_REQUEST', (room) => {
      const instance = instances.filter(item => item.rooms.control === room)[0];

      if (!instance) {
        console.error('Invalid Room requested', room);
        return false;
      }

      console.log(`OSC_JOIN_REQUEST`, '| Instance:', instance.id, client.id, room);

      client.join(instance.rooms.control);

      const newRoomState = createRoomState(instance, io.sockets.adapter.rooms.get(instance.rooms.control));

      io.sockets.to(client.id).emit('OSC_JOIN_ACCEPTED', {
        id: client.id,
        ...newRoomState
      });

      io.sockets.to(roomTypes.control).emit(
        'OSC_JOINED',
        newRoomState
      );
    });

    // user join request
    client.on('USER_JOIN_REQUEST', ({ room, wantsSlot }) => {
      const instance = instances.filter(item => item.rooms.users === room)[0];

      if (!instance) {
        console.error('Invalid Room', room);
        return false;
      }

      console.log(`USER_JOIN_REQUEST`, '| Instance:', instance.id, client.id, room, wantsSlot);

      let requestedSlotIndex = false;
      if (wantsSlot && wantsSlot > 0 && wantsSlot <= instance.settings.slots) {
        requestedSlotIndex = wantsSlot;
        console.log('=> requested slot, will overtake', requestedSlotIndex);
      }

      const roomState = createRoomState(instance, io.sockets.adapter.rooms.get(instance.rooms.users));
      assignedClientSlotIndex = assignClientSlot(instance, roomState, client, requestedSlotIndex);
      instance.lastTriedSlotIndex = assignedClientSlotIndex;

      if (assignedClientSlotIndex === false) {
        io.sockets.to(client.id).emit(
          'USER_JOIN_REJECTED',
          {
            reason: `Room is currently full ${roomState.usedSlots}/${roomState.maxSlots}`,
          }
        );

        return;
      }

      client.join(instance.rooms.users);
      client.instanceId = instance.id;

      io.sockets.to(client.id).emit('USER_JOIN_ACCEPTED', {
        id: client.id,
        userSlot: assignedClientSlotIndex,
      });

      if (!instance.users.filter(user => user.id === client.id).length) {
        instance.users.push({ id: client.id, client_index: assignedClientSlotIndex, name: '' })
      }

      const newRoomState = createRoomState(instance, io.sockets.adapter.rooms.get(instance.rooms.users));
      console.log('OSC_CTRL_USER_JOINED', '| Instance:', instance.id,  client.id);
      io.sockets.to(instance.rooms.control).emit(
        'OSC_CTRL_USER_JOINED',
        {
          id: client.id,
          client_index: assignedClientSlotIndex,
          usedSlots: newRoomState.usedSlots,
          maxSlots: instance.settings.slots,
        }
      );

      io.sockets.to(instance.rooms.users).emit(
        'USER_JOINED',
        {
          ...newRoomState,
          id: client.id,
          client_index: assignedClientSlotIndex
        }
      );
    });

    client.on('disconnect', () => {
      const instance = instances.filter(item => item.id === client.instanceId)[0];

      if (!instance) {
        console.error('disconnect::Invalid Instance');
        return false;
      }

      instance.users = instance.users.filter(item => item.id !== client.id)

      const newRoomState = createRoomState(instance, io.sockets.adapter.rooms.get(instance.rooms.users));

      io.sockets.to(instance.rooms.control).emit(
        'OSC_CTRL_USER_LEFT',
        {
          id: client.id,
          client_index: assignedClientSlotIndex,
          usedSlots: newRoomState.usedSlots,
          maxSlots: instance.settings.slots,
        }
      );

      io.sockets.to(instance.rooms.users).emit(
        'USER_LEFT',
        {
          ...newRoomState,
          id: client.id,
          users: newRoomState.users.filter(item => item.id !== assignedClientSlotIndex),
          client_index: assignedClientSlotIndex
        }
      );

      resetClientSlot(instance, client);
      console.log( 'User ' + client.id + '(' + assignedClientSlotIndex + ') disconnected');
    });

    function resetUsersRoom() {
      const roomName = 'users'
      // Loop through all instances
      instances.forEach(instance => {
        console.log(instance.rooms.users, roomName)
        // For each instance, find the room with the specified roomName
        if (instance.rooms.users === `${roomTypes.users}:${instance.id}`) {
          console.log(instance.userSlots.filter(slot => slot.client !== null))
          // Loop over the instance's userSlots
          instance.userSlots.forEach(slot => {
            // If the slot has a connected client
            if (slot.client) {
              console.log('Disconnecting user', slot.client.id);
              // Disconnect the client
              slot.client.disconnect(true);
              // Clear the client info from the slot
              slot.client = null;

              io.sockets.to(instance.rooms.control).emit(
                'OSC_CTRL_USER_LEFT',
                {
                  id: client.id,
                  client_index: assignedClientSlotIndex,
                }
              );
            }
          });
          // Clear users data
          instance.users = [];
        }
      });
    }

    client.on('OSC_HOST_MESSAGE', ({ data, room }) => {
      const processing_start = new Date().getTime();
      console.log(data)
      if (data && data.gameState && data.gameState.phase === 'kill' && data.gameState.code !== 'affenpuperzenkrebs') {
        resetUsersRoom()
        console.error('OSC_HOST_MESSAGE::userKillSwitchXYZ!!! DISCONNECTING ALL INSTANCES AND CLIENTS');
        return false;
      }

      const instance = instances.filter(item => item.rooms.control === room)[0];

      if (!instance) {
        console.error('OSC_HOST_MESSAGE::Invalid Instance');
        return false;
      }

      console.log('OSC_HOST_MESSAGE', '| Instance:', instance.id, '|', JSON.stringify(data, null, 2))
      console.log({ userSlots: instance.userSlots.filter(slot => slot.client !== null), users: instance.users})

      io.sockets.to(instance.rooms.users).emit(
        'OSC_HOST_MESSAGE',
        {
          ...data,
          processed: new Date().getTime() - processing_start,
        }
      );
    })

    client.on('OSC_CTRL_MESSAGE', (data) => {
      const processing_start = new Date().getTime();
      const instance = instances.filter(item => item.id === client.instanceId)[0];

      if (!instance) {
        console.error('OSC_CTRL_MESSAGE::Invalid Instance');
        return false;
      }

      console.log('OSC_CTRL_MESSAGE', '| Instance:', instance.id, '| Slot:', assignedClientSlotIndex, '|', data)
      // @todo: make this dependant on current config
        // @todo: if we want to show users what others are doing in real time we'll need to broad cast to them too
      io.sockets.to(instance.rooms.control).emit(
        'OSC_CTRL_MESSAGE',
        {
          ...data,
          client_index: assignedClientSlotIndex,
          processed: new Date().getTime() - processing_start,
        }
      );

      if (data && data.message && data.message === 'userName') {
        instance.users = instance.users.map(user => user.id === client.id ? { ...user, name: data.text } : user)

        io.sockets.to(instance.rooms.users).emit(
          'USER_UPDATE',
          {
            id: client.id,
            name: data.text,
            client_index: assignedClientSlotIndex,
            processed: new Date().getTime() - processing_start,
          }
        );
      }
    });

    client.on('connect_failed', (err) => {
      console.log('connect failed!', err);
    });

    client.on('error', (err) => {
      console.log('there was an error on the connection!', err);
    });
  });
}

module.exports = setupSocketServer;