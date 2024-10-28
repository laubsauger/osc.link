import { Socket } from "socket.io";
import Instance from "./models/Instance";


export type InstanceSlot = { slot_index: number; client: Socket | null | undefined };
export type ConnectedClient = { id: string; client_index: number; name: string };

interface InstanceInMemoryAttributes {
  rooms: {
    users: string;
    control: string;
  };
  instanceSlots: InstanceSlot[];
  connectedClients: ConnectedClient[];
  lastTriedSlotIndex: number; // used to keep track of user slots - sequentially ordered.
}

export type InstanceInMemoryData = Instance & InstanceInMemoryAttributes;

/**
 * In memory instances -> used to keep track of connected socket clients and state.
 * instance.id is the key.
 */
let instances: Record<string, InstanceInMemoryData> = {};
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

    let instanceSlots: InstanceSlot[] = [];
    const slots = instance?.settings?.slots || 0;
    for (let i = 0; i < slots; i++) {
      instanceSlots.push({ slot_index: i + 1, client: undefined });
    }

    instances[instanceId] = Object.assign(instance, {
      rooms: {
        users: `users:${instance.id}`,
        control: `control:${instance.id}`,
      },
      instanceSlots: instanceSlots,
      connectedClients: [] as ConnectedClient[],
      lastTriedSlotIndex: 0,
    }) as InstanceInMemoryData;
  }
  return instances[instanceId];
}