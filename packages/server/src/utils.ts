import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { InstanceInMemoryData, ConnectedClient, InstanceSlot } from "./inMemoryInstances";

function random(mn: number, mx: number) {
  return Math.random() * (mx - mn) + mn;
}

export const getRandomArrayElement = (arr: any[]) => {
  return arr[Math.floor(random(1, arr.length)) - 1];
};

export type RoomState = { usedSlots: number; maxSlots?: number; users?: ConnectedClient[] };

export function assignClientSlot(
  instance: InstanceInMemoryData,
  roomState: RoomState,
  newClient: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  requestedSlotIndex: number | null
): number | false {
  console.log("requested slot index");
  // override requested slot and assign new client id to it
  if (requestedSlotIndex) {
    instance.instanceSlots = instance.instanceSlots.map((slot) => {
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

  if (roomState.usedSlots + 1 > (roomState?.maxSlots ?? 0)) {
    console.log("no available slot for new client", newClient.id);
    return false;
  }

  // get free slots
  const freeSlots = instance.instanceSlots.filter((slot) => !slot.client);
  const freeSlotsExcludingLastTried =
    freeSlots.length > 1
      ? freeSlots.filter(
          (slot) => slot.slot_index !== instance.lastTriedSlotIndex
        )
      : freeSlots;

  // console.log({freeSlotsExcludingLastTried})

  // pick random free slot
  const nextFreeSlotIndex: number = instance?.settings?.randomPick
    ? getRandomArrayElement(freeSlotsExcludingLastTried).slot_index
    : freeSlotsExcludingLastTried?.[0]?.slot_index ?? 0;

  // assign client id to it
  instance.instanceSlots = instance.instanceSlots.map((slot) => {
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

export function resetClientSlot(instance: InstanceInMemoryData, client: Socket) {
  instance.instanceSlots = instance.instanceSlots.map((slot) => {
    if (slot.client && slot.client.id !== client.id) {
      return slot;
    }

    return {
      ...slot,
      client: null,
    };
  });
}

export function createRoomState(instance: InstanceInMemoryData, clientsInRoom?: Set<string>): RoomState {
  const numClients = clientsInRoom ? clientsInRoom.size : 0;

  return {
    usedSlots: numClients,
    maxSlots: instance?.settings?.slots,
    users: instance.connectedClients,
  };
}
