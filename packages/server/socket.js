const fs = require("fs");
const path = require("path");
const {
  createRoomState,
  assignClientSlot,
  resetClientSlot,
} = require("./utils"); // Adjust the path as necessary

const roomTypes = {
  users: "users",
  control: "control",
};

const instancesConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, "dummy/instances.json"), "utf-8")
);
const instances = instancesConfig.map((instanceConfig) => {
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

function onOscJoinRequest(socket, room) {
  const instance = instances.filter((item) => {
    return item.rooms.control === room;
  })[0];

  if (!instance) {
    console.log("instance", instance);
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

  socket.to(roomTypes.control).emit("OSC_JOINED", newRoomState);
}

function onUserJoinRequest(socket, data, assignedClientSlotIndex) {
  const { room, wantsSlot } = data;
  const instance = instances.filter((item) => item.rooms.users === room)[0];

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
  console.log(roomState)
  assignedClientSlotIndex = assignClientSlot(
    instance,
    roomState,
    socket,
    requestedSlotIndex
  );
  console.log('assignedClientSlotIndex', assignedClientSlotIndex)
  instance.lastTriedSlotIndex = assignedClientSlotIndex;

  if (assignedClientSlotIndex === false) {
    console.log('Room is full;')
    socket.emit("USER_JOIN_REJECTED", {
      reason: `Room is currently full ${roomState.usedSlots}/${roomState.maxSlots}`,
    });

    return;
  }

  socket.join(instance.rooms.users);
  socket.instanceId = instance.id;

  console.log('user join accepted')
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
  socket.to(instance.rooms.control).emit("OSC_CTRL_USER_JOINED", {
    id: socket.id,
    client_index: assignedClientSlotIndex,
    usedSlots: newRoomState.usedSlots,
    maxSlots: instance.settings.slots,
  });

  socket.to(instance.rooms.users).emit("USER_JOINED", {
    ...newRoomState,
    id: socket.id,
    client_index: assignedClientSlotIndex,
  });
}

function onDisconnect(socket, assignedClientSlotIndex) {
  const instance = instances.filter((item) => item.id === socket.instanceId)[0];
  console.log(socket.instanceId)

  if (!instance) {
    // console.error("disconnect::Invalid Instance");
    return false;
  }

  instance.users = instance.users.filter((item) => item.id !== socket.id);

  const newRoomState = createRoomState(
    instance,
    socket.adapter.rooms.get(instance.rooms.users)
  );

  socket.to(instance.rooms.control).emit("OSC_CTRL_USER_LEFT", {
    id: socket.id,
    client_index: assignedClientSlotIndex,
    usedSlots: newRoomState.usedSlots,
    maxSlots: instance.settings.slots,
  });

  socket.to(instance.rooms.users).emit("USER_LEFT", {
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
      console.log(instance.userSlots.filter((slot) => slot.client !== null));
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

function onOscHostMessage(socket, dataArg) {
  const { data, room } = dataArg;

  const processing_start = new Date().getTime();
  console.log(data);
  if (
    data &&
    data.gameState &&
    data.gameState.phase === "kill" &&
    data.gameState.code !== "affenpuperzenkrebs"
  ) {
    resetUsersRoom();
    console.error(
      "OSC_HOST_MESSAGE::userKillSwitchXYZ!!! DISCONNECTING ALL INSTANCES AND CLIENTS"
    );
    return false;
  }

  const instance = instances.filter((item) => item.rooms.control === room)[0];

  if (!instance) {
    console.error("OSC_HOST_MESSAGE::Invalid Instance");
    return false;
  }

  console.log(
    "OSC_HOST_MESSAGE",
    "| Instance:",
    instance.id,
    "|",
    JSON.stringify(data, null, 2)
  );
  console.log({
    userSlots: instance.userSlots.filter((slot) => slot.client !== null),
    users: instance.users,
  });

  io.sockets.to(instance.rooms.users).emit("OSC_HOST_MESSAGE", {
    ...data,
    processed: new Date().getTime() - processing_start,
  });
}

function onOscCtrlMessage(socket, data) {
  const processing_start = new Date().getTime();
  const instance = instances.filter((item) => item.id === socket.instanceId)[0];

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
  // @todo: make this dependant on current config
  // @todo: if we want to show users what others are doing in real time we'll need to broad cast to them too
  io.sockets.to(instance.rooms.control).emit("OSC_CTRL_MESSAGE", {
    ...data,
    client_index: assignedClientSlotIndex,
    processed: new Date().getTime() - processing_start,
  });

  if (data && data.message && data.message === "userName") {
    instance.users = instance.users.map((user) =>
      user.id === socket.id ? { ...user, name: data.text } : user
    );

    io.sockets.to(instance.rooms.users).emit("USER_UPDATE", {
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
