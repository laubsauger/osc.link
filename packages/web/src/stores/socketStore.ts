import { action, observable, makeAutoObservable } from 'mobx';
import { RootStore } from './rootStore';
import { PlayerColor } from '../components/Controller';

export type ConnectionState = {
  clientId?: string;
  connecting?: boolean;
  connected?: boolean;
  failed?: boolean;
  failReason?: string;
  joining?: boolean;
  joined?: boolean;
  rejected?: boolean;
  rejectReason?: string;
}

export type RoomState = {
  users?: Player[];
  numMaxUsers?: number;
  currentSlot?: number;
}

export type Control = {
  id: string
  type: 'text'|'button'|'eden'|'xy'|'toggle'
  options: {
    variant?: 'black'|'red'|'green'|'blue'|'yellow'
    icon?: string,
    label?: string,
    submit?: boolean
    admin?: boolean
    mode?: 'paint'|'crosshair'
    singleUse?: boolean
    multiline?: boolean
    maxLength?: number
  }
}

export type Instance = {
  id: number,
  name: string,
  description: string,
  settings: {
    slots: number,
    slotPick?: boolean,
    randomPick?: boolean,
    sequentialPick?: boolean,
    layout: {
      wrapButtons?: boolean
    }
    controls: {
      eden?: [
        Control
      ],
      buttons?: Control[],
      faders?: Control[]
      texts?: Control[],
      xy?: Control[],
      sensors?: Control[],
    }
  }
}

export interface ISocketStore {
  connectionState: ConnectionState,
  roomState: RoomState,
  availableInstances: Instance[],
  currentInstance: Instance|undefined,
}

export type Player = {
  id: string,
  client_index: number,
  name?: string,
  color: PlayerColor,
  points?: number
}

const connectionStateStub = {
  clientId: '',
  connecting: false,
  connected: false,
  failed: false,
  failReason: '',
  joining: false,
  joined: false,
  rejected: false,
  rejectReason: '',
};

const roomStateStub = {
  numCurrentUsers: 0,
  numMaxUsers: 0,
  currentSlot: 0,
};

export class SocketStore implements ISocketStore {
  private rootStore: RootStore;

  @observable connectionState = Object.assign({}, connectionStateStub);
  @observable roomState: RoomState = Object.assign({}, roomStateStub);
  @observable availableInstances:Instance[] = [];
  @observable currentInstance:Instance|undefined = undefined;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  @action updateConnectionState(state:ConnectionState) {
    this.connectionState = {
      ...this.connectionState,
      ...state,
    }
  }

  @action resetConnectionState() {
    this.connectionState = Object.assign({}, connectionStateStub);
  }

  @action updateRoomState(state:RoomState) {
    this.roomState = {
      ...this.roomState,
      ...state,
    };
  }

  @action resetRoomState() {
    this.roomState = Object.assign({}, roomStateStub);
  }

  @action setAvailableInstances(instances:Instance[]) {
    this.availableInstances = instances;
  }

  @action setCurrentInstance(instance:Instance|undefined) {
    this.currentInstance = instance;
  }
}