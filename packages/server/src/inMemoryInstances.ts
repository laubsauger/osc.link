import { Socket } from "socket.io";
import Instance from "./models/Instance";

export type UserSlot = { slot_index: number; client: Socket | null | undefined };
export type InstanceUser = { id: string; client_index: number; name: string };

interface InstanceInMemoryAttributes {
  rooms: {
    users: string;
    control: string;
  };
  // todo: define difference between userSlots and users.. why???
  userSlots: UserSlot[];
  users: InstanceUser[];
  lastTriedSlotIndex: number; // used to keep track of user slots - sequentially ordered.
}

export type InstanceInMemoryData = Instance & InstanceInMemoryAttributes;

let instances: Record<string, InstanceInMemoryData> = {};
// export default function getInstances() { return instances };
export default instances;

/**
 * Helper to get an instance. We are storing them in memory with additional info
 * related to socket rooms and connected users. This is due to legacy in-memory
 * behaviour pre-DB, but also the ephemerality of this information.
 *
 * To-Do: store this data in DB
 */
export async function getInstance(
  instanceId: string
): Promise<InstanceInMemoryData> {
  if (!instances[instanceId]) {
    console.log("no in memory instance, finding by ", instanceId);
    const instance = await Instance.findByPk(instanceId);
    if (!instance) {
      throw new Error(`Instance with ID ${instanceId} not found`);
    }

    let userSlots: UserSlot[] = [];
    const slots = instance?.settings?.slots || 0;
    for (let i = 0; i < slots; i++) {
      userSlots.push({ slot_index: i + 1, client: undefined });
    }

    instances[instanceId] = Object.assign(instance, {
      rooms: {
        users: `users:${instance.id}`,
        control: `control:${instance.id}`,
      },
      userSlots: userSlots,
      users: [] as InstanceUser[],
      lastTriedSlotIndex: 0,
    }) as InstanceInMemoryData;
  }
  return instances[instanceId];
}