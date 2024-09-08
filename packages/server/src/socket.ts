// @ts-nocheck
const fs = require("fs");
const path = require("path");
const {
  createRoomState,
  assignClientSlot,
  resetClientSlot,
} = require("./utils");
const { Server } = require("socket.io");
import Instance from "./models/Instance";

const roomTypes = {
  users: "users",
  control: "control",
};

/**
 * Goal: Use DB instances rather than this static config.
 */

/**
 * instances is the following object.
 * {
 *  id, - assigned by DB
 *  name, - assigned on creation
 *  description, - assigned on creation
 *  settings, - defined in UI
 *  rooms { - defined dynamically based on id
 *    users,
 *    control
 *  }
 *  userSlots [ - TODO - this is assigned dynamically, based on settings.slots. Should be stored in DB?
 *    { slot_index, client } - client is socket id
 *  ],
 *  users: [] - socket id, assigne by socket.io
 *  lastTriedSlotIndex, - used to keep track of user slots - sequentially ordered.
 * }
 */

/**
 * instance Slots
 * - There are X amount of slots
 * - why are they prepopulated?
 * - I guess Slot index matters. What if there was a different identifier than pure index?
 * - people can request to pick a slot
 * - rewrite this later
 * - do we store in DB, or in memory?
 *  - if in DB, we can query
 *  - if in memory, can still query, but perhaps will be less debuggable?
 *
 * I think, keep in memory for now. We don't need to do this mapping, only check upon join.
 * We could have occasional clean up to avoid memory leaks and growing over time.
 *
 * "randomPick": true,
 * "slotPick": true,
 * "sequentialPick": false,
 */
let instances = {};

/**
 * Helper to get an instance. We are storing them in memory with additional info
 * related to socket rooms and connected users. This is due to legacy in-memory
 * behaviour pre-DB, but also the ephemerality of this information.
 */
async function getInstance(instanceId: String): Instance {
  if (!instances[instanceId]) {
    console.log("no in memory instance, finding by ", instanceId);
    const instanceConfig = await Instance.findByPk(instanceId);
    if (!instanceConfig) {
      throw new Error(`Instance with ID ${instanceId} not found`);
    }

    let userSlots = [];
    for (let i = 0; i < instanceConfig.settings.slots; i++) {
      userSlots.push({ slot_index: i + 1, client: null });
    }

    instances[instanceId] = {
      ...instanceConfig.dataValues,
      rooms: {
        users: `users:${instanceConfig.id}`,
        control: `control:${instanceConfig.id}`,
      },
      userSlots: userSlots,
      users: [],
      lastTriedSlotIndex: 0,
    };
  }
  return instances[instanceId];
}

async function onOscJoinRequest({ socket, data: room, io }) {
  const instance = await getInstance(room.split(":")[1]);

  if (!instance) {
    console.error("Invalid Room requested", room);
    return false;
  }

  console.log(`OSC_JOIN_REQUEST`, "| Instance:", instance.id, socket.id, room);
  socket.join(instance.rooms.control);

  const newRoomState = createRoomState(
    instance,
    socket.adapter.rooms.get(instance.rooms.control)
  );

  console.log("OSC_JOIN_ACCEPTED", {
    id: socket.id,
    ...newRoomState,
  });

  socket.emit("OSC_JOIN_ACCEPTED", {
    id: socket.id,
    ...newRoomState,
  });

  io.to(roomTypes.control).emit("OSC_JOINED", newRoomState);
}

async function onUserJoinRequest({
  socket,
  data,
  assignedClientSlotIndex,
  io,
}) {
  const { room, wantsSlot } = data;
  const instance = await getInstance(room.split(":")[1]);

  if (!instance) {
    console.error("Invalid Room", room);
    return false;
  }

  console.log(
    `USER_JOIN_REQUEST`,
    "| Instance:",
    instance.id,
    socket.id,
    room,
    wantsSlot
  );

  let requestedSlotIndex = false;
  if (wantsSlot && wantsSlot > 0 && wantsSlot <= instance.settings.slots) {
    requestedSlotIndex = wantsSlot;
    console.log("=> requested slot, will overtake", requestedSlotIndex);
  }

  const roomState = createRoomState(
    instance,
    socket.adapter.rooms.get(instance.rooms.users)
  );

  assignedClientSlotIndex = assignClientSlot(
    instance,
    roomState,
    socket,
    requestedSlotIndex
  );
  instance.lastTriedSlotIndex = assignedClientSlotIndex;

  if (assignedClientSlotIndex === false) {
    console.log("Room is full;");
    socket.emit("USER_JOIN_REJECTED", {
      reason: `Room is currently full ${roomState.usedSlots}/${roomState.maxSlots}`,
    });

    return assignedClientSlotIndex;
  }

  socket.join(instance.rooms.users);
  socket.instanceId = instance.id;

  console.log("user join accepted");
  socket.emit("USER_JOIN_ACCEPTED", {
    id: socket.id,
    userSlot: assignedClientSlotIndex,
  });

  if (!instance.users.filter((user) => user.id === socket.id).length) {
    instance.users.push({
      id: socket.id,
      client_index: assignedClientSlotIndex,
      name: "",
    });
  }

  const newRoomState = createRoomState(
    instance,
    socket.adapter.rooms.get(instance.rooms.users)
  );
  console.log("OSC_CTRL_USER_JOINED", "| Instance:", instance.id, socket.id);
  io.to(instance.rooms.control).emit("OSC_CTRL_USER_JOINED", {
    id: socket.id,
    client_index: assignedClientSlotIndex,
    usedSlots: newRoomState.usedSlots,
    maxSlots: instance.settings.slots,
  });

  io.to(instance.rooms.users).emit("USER_JOINED", {
    ...newRoomState,
    id: socket.id,
    client_index: assignedClientSlotIndex,
  });
}

async function onDisconnect({ socket, assignedClientSlotIndex, io }) {
  let instance;
  try {
    instance = await getInstance(socket.instanceId);
  } catch (e) {
    console.error("disconnect::Invalid Instance", socket.instanceId);
    return false;
  }

  instance.users = instance.users.filter((item) => item.id !== socket.id);

  const newRoomState = createRoomState(
    instance,
    socket.adapter.rooms.get(instance.rooms.users)
  );

  io.to(instance.rooms.control).emit("OSC_CTRL_USER_LEFT", {
    id: socket.id,
    client_index: assignedClientSlotIndex,
    usedSlots: newRoomState.usedSlots,
    maxSlots: instance.settings.slots,
  });

  io.to(instance.rooms.users).emit("USER_LEFT", {
    ...newRoomState,
    id: socket.id,
    users: newRoomState.users.filter(
      (item) => item.id !== assignedClientSlotIndex
    ),
    client_index: assignedClientSlotIndex,
  });

  resetClientSlot(instance, socket);
  console.log(
    "User " + socket.id + "(" + assignedClientSlotIndex + ") disconnected"
  );
}

function resetUsersRoom() {
  const roomName = "users";
  // Loop through all instances
  instances.forEach((instance) => {
    console.log(instance.rooms.users, roomName);
    // For each instance, find the room with the specified roomName
    if (instance.rooms.users === `${roomTypes.users}:${instance.id}`) {
      // Loop over the instance's userSlots
      instance.userSlots.forEach((slot) => {
        // If the slot has a connected client
        if (slot.client) {
          console.log("Disconnecting user", slot.client.id);
          // Disconnect the client
          slot.client.disconnect(true);
          // Clear the client info from the slot
          slot.client = null;

          io.sockets.to(instance.rooms.control).emit("OSC_CTRL_USER_LEFT", {
            id: socket.id,
            client_index: assignedClientSlotIndex,
          });
        }
      });
      // Clear users data
      instance.users = [];
    }
  });
}

/**
 * OSC_HOST_MESSAGE is sent by the electron "host".
 * Notes:
 * - Is the Electron app the host?
 * - @todo rework this data argument. Previous implementation had { data, room },
 *         name would be better if it was { game, room }
 */
async function onOscHostMessage({ socket, data: { data: game, room }, io }) {
  const processing_start = new Date().getTime();

  if (
    game &&
    game.gameState &&
    game.gameState.phase === "kill" &&
    game.gameState.code !== "affenpuperzenkrebs"
  ) {
    resetUsersRoom();
    console.error(
      "OSC_HOST_MESSAGE::userKillSwitchXYZ!!! DISCONNECTING ALL INSTANCES AND CLIENTS"
    );
    return false;
  }
  console.log(data);
  /**
   * This will fail because packages/electron/public/server.js
   * is emitting an empty message when a user joins. This is likely
   * due to some specific use case for stateful client UI.
   */
  // const instance = instances.filter((item) => item.rooms.control === room)[0];
  const instance = await getInstance(room.split(":")[1]);

  if (!instance) {
    console.error("OSC_HOST_MESSAGE::Invalid Instance");
    return false;
  }

  console.log(
    "OSC_HOST_MESSAGE",
    "| Instance:",
    instance.id,
    "|",
    JSON.stringify(game, null, 2)
  );
  /**
   * Uncertain that this ever works? When are users set?
   */
  io.to(instance.rooms.users).emit("OSC_HOST_MESSAGE", {
    ...game,
    processed: new Date().getTime() - processing_start,
  });
}

/**
 * Handles the OSC_CTRL_MESSAGE event.
 *
 * @param {Object} params - The parameters for the function.
 * @param {Object} params.socket - The socket instance.
 * @param {Object} params.data - The data received from the client.
 * @param {number} params.assignedClientSlotIndex - The index of the client slot assigned.
 * @param {Server} params.io - The Socket.IO server instance.
 */
async function onOscCtrlMessage({ socket, data, assignedClientSlotIndex, io }) {
  console.log("onOscCtrlMessage", io.instanceId);
  const processing_start = new Date().getTime();
  // const instance = instances.filter((item) => item.id === socket.instanceId)[0];
  const instance = await getInstance(socket.instanceId);
  if (!instance) {
    console.error("OSC_CTRL_MESSAGE::Invalid Instance");
    return false;
  }

  console.log(
    "OSC_CTRL_MESSAGE",
    "| Instance:",
    instance.id,
    "| Slot:",
    assignedClientSlotIndex,
    "|",
    data
  );
  /**
   * why is this also emitting a OSC_CTRL_MESSAGE after receiving OSC_CTRL_MESSAGE?
   *
   */
  // @todo: make this dependant on current config
  // @todo: if we want to show users what others are doing in real time we'll need to broad cast to them too
  io.to(instance.rooms.control).emit("OSC_CTRL_MESSAGE", {
    ...data,
    client_index: assignedClientSlotIndex,
    processed: new Date().getTime() - processing_start,
  });

  if (data && data.message && data.message === "userName") {
    instance.users = instance.users.map((user) =>
      user.id === socket.id ? { ...user, name: data.text } : user
    );

    io.to(instance.rooms.users).emit("USER_UPDATE", {
      id: socket.id,
      name: data.text,
      client_index: assignedClientSlotIndex,
      processed: new Date().getTime() - processing_start,
    });
  }
}

module.exports = {
  onOscJoinRequest,
  onOscHostMessage,
  onOscCtrlMessage,
  onDisconnect,
  onUserJoinRequest,
};
