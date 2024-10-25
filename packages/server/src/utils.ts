// @ts-nocheck
// TODO: Update to TypeScript. 
const getRandomArrayElement = (arr: []) => {
  return arr[Math.floor(random(1, arr.length))-1];
}

function assignClientSlot(instance, roomState, newClient, requestedSlotIndex) {
    console.log('requested slot index')
  // override requested slot and assign new client id to it
  if (requestedSlotIndex) {
    instance.userSlots = instance.userSlots.map((slot) => {
      if (slot.slot_index !== requestedSlotIndex) {
        return slot;
      }

      if (slot.client && slot.client.id) {
        console.log(
          "slot is occupied, disconnecting current tenant",
          slot.client.id
        );
        slot.client.disconnect();
      }

      return {
        ...slot,
        client: newClient,
      };
    });

    return requestedSlotIndex;
  }

  if (roomState.usedSlots + 1 > roomState.maxSlots) {
    console.log("no available slot for new client", newClient.id);
    return false;
  }

  // get free slots
  const freeSlots = instance.userSlots.filter((slot) => !slot.client);
  const freeSlotsExcludingLastTried =
    freeSlots.length > 1
      ? freeSlots.filter(
          (slot) => slot.slot_index !== instance.lastTriedSlotIndex
        )
      : freeSlots;

  // console.log({freeSlotsExcludingLastTried})

  // pick random free slot
  const nextFreeSlotIndex = instance.settings.randomPick
    ? getRandomArrayElement(freeSlotsExcludingLastTried).slot_index
    : freeSlotsExcludingLastTried?.[0]?.slot_index ?? 0;

  // assign client id to it
  instance.userSlots = instance.userSlots.map((slot) => {
    if (slot.slot_index !== nextFreeSlotIndex) {
      return slot;
    }

    return {
      ...slot,
      client: newClient,
    };
  });

  return nextFreeSlotIndex;
}

function resetClientSlot(instance, client) {
  instance.userSlots = instance.userSlots.map((slot) => {
    if (slot.client && slot.client.id !== client.id) {
      return slot;
    }

    return {
      ...slot,
      client: null,
    };
  });
}

function createRoomState(instance, clientsInRoom) {
  const numClients = clientsInRoom ? clientsInRoom.size : 0;

  return {
    usedSlots: numClients,
    maxSlots: instance.settings.slots,
    users: instance.users,
  };
}

module.exports = { assignClientSlot, resetClientSlot, createRoomState };
