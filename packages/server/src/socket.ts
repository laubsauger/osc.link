import fs from "fs";
import path from "path";
import { createRoomState, assignClientSlot, resetClientSlot } from "./utils";
import { Server, Socket } from "socket.io";
import Instance from "./models/Instance";
import instances, { getInstance } from "./inMemoryInstances";

const roomTypes = {
  users: "users",
  control: "control",
};

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
export async function onOscJoinRequest({
  socket,
  data,
  io,
}: {
  socket: Socket;
  data: { room: string };
  io: Server;
}): Promise<false | undefined> {
  const room = data.room;
  const instance = await getInstance(room.split(":")[1]);

  if (!instance) {
    console.error("Invalid Room requested", room);
    return false;
  }

  console.log(`OSC_JOIN_REQUEST`, "| Instance:", instance.id, socket.id, room);
  socket.join(instance.rooms.control);

  const newRoomState = createRoomState(
    instance,
    io.sockets.adapter.rooms.get(instance.rooms.control)
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

export async function onUserJoinRequest({
  socket,
  data,
  io,
}: {
  socket: Socket;
  data: { room: string; wantsSlot: number };
  io: Server;
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

  let requestedSlotIndex = null;
  if (
    wantsSlot &&
    wantsSlot > 0 &&
    wantsSlot <= (instance?.settings?.slots ?? -1)
  ) {
    requestedSlotIndex = wantsSlot;
    console.log("=> requested slot, will overtake", requestedSlotIndex);
  }

  const roomState = createRoomState(
    instance,
    io.sockets.adapter.rooms.get(instance.rooms.users)
  );

  let assignedClientSlotIndex = assignClientSlot(
    instance,
    roomState,
    socket,
    requestedSlotIndex
  );

  // store assigned slot on client object..
  socket.data.assignedClientSlotIndex = assignedClientSlotIndex;

  if (assignedClientSlotIndex === false) {
    console.log("Room is full;");
    socket.emit("USER_JOIN_REJECTED", {
      reason: `Room is currently full ${roomState.usedSlots}/${roomState.maxSlots}`,
    });

    return assignedClientSlotIndex;
  }
  instance.lastTriedSlotIndex = assignedClientSlotIndex;

  socket.join(instance.rooms.users);
  socket.data.instanceId = instance.id; // Using 'any' to bypass TypeScript error

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
    io.sockets.adapter.rooms.get(instance.rooms.users)
  );
  console.log("OSC_CTRL_USER_JOINED", "| Instance:", instance.id, socket.id);
  io.to(instance.rooms.control).emit("OSC_CTRL_USER_JOINED", {
    id: socket.id,
    client_index: assignedClientSlotIndex,
    usedSlots: newRoomState.usedSlots,
    maxSlots: instance?.settings?.slots,
  });

  io.to(instance.rooms.users).emit("USER_JOINED", {
    ...newRoomState,
    id: socket.id,
    client_index: assignedClientSlotIndex,
  });
}

export async function onDisconnect({
  socket,
  io,
}: {
  socket: Socket;
  io: Server;
}): Promise<void> {
  let instance;
  try {
    instance = await getInstance(socket.data.instanceId);
  } catch (e: any) {
    console.warn("disconnect::Invalid Instance or Already disconnected", socket.data.instanceId, e.stack);
    return;
  }

  instance.users = instance.users.filter((item) => item.id !== socket.id);

  const newRoomState = createRoomState(
    instance,
    io.sockets.adapter.rooms.get(instance.rooms.users)
  );

  io.to(instance.rooms.control).emit("OSC_CTRL_USER_LEFT", {
    id: socket.id,
    client_index: socket.data.assignedClientSlotIndex,
    usedSlots: newRoomState.usedSlots,
    maxSlots: instance?.settings?.slots,
  });

  io.to(instance.rooms.users).emit("USER_LEFT", {
    ...newRoomState,
    id: socket.id,
    users: newRoomState?.users?.filter(
      (item) => item.id !== socket.data.assignedClientSlotIndex
    ) ?? [],
    client_index: socket.data.assignedClientSlotIndex,
  });

  resetClientSlot(instance, socket);
  console.log(
    "User " + socket.id + "(" + socket.data.assignedClientSlotIndex + ") disconnected"
  );
}

function resetUsersRoom(socket: Socket, io: Server) {
  const roomName = "users";
  // Loop through all instances
  Object.values(instances).forEach((instance) => {
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
            client_index: socket.data.assignedClientSlotIndex,
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
export async function onOscHostMessage({
  socket,
  data: { data: game, room },
  io,
}: {
  socket: Socket,
  data: {
    data: any,
    room: string,
  },
  io: Server,
}) {
  const processing_start = new Date().getTime();

  if (
    game &&
    game.gameState &&
    game.gameState.phase === "kill" &&
    game.gameState.code !== "affenpuperzenkrebs"
  ) {
    resetUsersRoom(socket, io);
    console.error(
      "OSC_HOST_MESSAGE::userKillSwitchXYZ!!! DISCONNECTING ALL INSTANCES AND CLIENTS"
    );
    return false;
  }
  /**
   * This will fail because packages/electron/public/server.js
   * is emitting an empty message when a user joins. This is likely
   * due to some specific use case for stateful client UI.
   */
  let instance;
  try {
    const roomInstanceId = room.split(":")[1];
    instance = await getInstance(roomInstanceId);
  } catch (e) {
    console.error("OSC_HOST_MESSAGE::Invalid Instance", e);
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
 * @param {Server} params.io - The Socket.IO server instance.
 */
export async function onOscCtrlMessage({
  socket,
  data,
  io,
}: {
  socket: Socket;
  data: Record<string, any>;
  io: Server;
}) {
  const processing_start = new Date().getTime();
  const instance = await getInstance(socket.data.instanceId);
  if (!instance) {
    console.error("OSC_CTRL_MESSAGE::Invalid Instance");
    return false;
  }

  console.log(
    "OSC_CTRL_MESSAGE",
    "| Instance:",
    instance.id,
    "| Slot:",
    socket.data.assignedClientSlotIndex,
    "|",
    data
  );
  /**
   * why is this also emitting a OSC_CTRL_MESSAGE after receiving OSC_CTRL_MESSAGE?
   * @todo: make this dependant on current config
   * @todo: if we want to show users what others are doing in real time we'll need to broad cast to them too
   */
  io.to(instance.rooms.control).emit("OSC_CTRL_MESSAGE", {
    ...data,
    client_index: socket.data.assignedClientSlotIndex,
    processed: new Date().getTime() - processing_start,
  });

  if (data && data.message && data.message === "userName") {
    instance.users = instance.users.map((user) =>
      user.id === socket.id ? { ...user, name: data.text } : user
    );

    io.to(instance.rooms.users).emit("USER_UPDATE", {
      id: socket.id,
      name: data.text,
      client_index: socket.data.assignedClientSlotIndex,
      processed: new Date().getTime() - processing_start,
    });
  }
}
