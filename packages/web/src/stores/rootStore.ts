import { UserStore } from './userStore';
import { SocketStore } from './socketStore';
import { GameStore } from './gameStore';

export class RootStore {
  // authStore: AuthStore;
  userStore: UserStore;
  socketStore: SocketStore;
  gameStore: GameStore;

  constructor() {
    // this.authStore = new AuthStore();
    this.userStore = new UserStore(this);
    this.socketStore = new SocketStore(this);
    this.gameStore = new GameStore(this);
  }
}