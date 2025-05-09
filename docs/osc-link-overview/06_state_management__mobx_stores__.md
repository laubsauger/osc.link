# Chapter 6: State Management (MobX Stores)

In [Chapter 5: Server-Side Instance & Slot Management](05_server_side_instance___slot_management_.md), we saw how the `osc.link` server manages who's in an Instance and ensures everyone follows the rules. But once you've joined a session, how does your web browser (or the [Electron Host Application (OSC Bridge)](04_electron_host_application__osc_bridge__.md)) keep track of all the changing information, like who else is in the room, or what the current connection status is? If this information changes, how does the user interface (UI) update instantly? This is where **State Management** comes in!

## What's the Big Idea? The Application's Brain and Dashboard

Imagine an application like `osc.link` as a living thing. It needs a "brain" or a "memory" to keep track of what's currently happening. This "memory" is called the **application state**.

**State** is simply all the data that an application needs to remember at any given moment to function correctly and display the right information to the user. For example:
*   Is my device currently connected to the `osc.link` server?
*   Which [Instance (Session Configuration)](01_instance__session_configuration__.md) am I in?
*   Who are the other users in this Instance with me?
*   If it's a game, what's the current score or phase of the game?

`osc.link` uses a powerful JavaScript library called **MobX** to manage this state. MobX helps organize this information into "stores."

**Stores** are like specialized sections of the application's memory, or a car's dashboard.
*   One part of the dashboard (a store) shows your speed (connection status).
*   Another part (another store) shows how much fuel you have (current session details).
*   Another might show who your passengers are (list of users).

These stores hold crucial information. The magic of MobX is that when a piece of information in a store changes (e.g., a new user joins the session), any part of the UI that is displaying that information automatically updates itself! This keeps the interface consistent and super responsive.

## Key MobX Concepts (Simplified)

MobX makes state management more straightforward with a few core ideas:

1.  **Observables (`@observable` or through `makeAutoObservable`):**
    These are pieces of data in your store that MobX "watches." If an observable changes, MobX knows about it.
    *   *Analogy:* A sensor on your dashboard that constantly monitors the fuel level.

2.  **Actions (`@action` or through `makeAutoObservable`):**
    These are special functions that are allowed to change observable data. They are the *only* way you should modify your watched data.
    *   *Analogy:* The act of pumping gas into your car is an "action" that changes the "observable" fuel level.

3.  **Reactions (Automatic UI Updates):**
    This is the best part! If a UI component is displaying an observable piece of data, and that data changes (through an action), MobX automatically tells the UI component to re-render itself to show the new data. You don't have to write complex code to manually update the screen.
    *   *Analogy:* When the fuel level sensor (observable) detects a change, the fuel gauge on your dashboard (UI component) automatically moves.

## How `osc.link` Uses MobX Stores

Both the web frontend (what users see in their browsers) and the [Electron Host Application (OSC Bridge)](04_electron_host_application__osc_bridge__.md) use MobX stores to manage their state. Let's look at a typical scenario:

**Scenario: A New User Joins Your `osc.link` Session**

1.  **Server Notification:** The `osc.link` server detects a new user has joined your Instance. It sends a "USER_JOINED" message via [Socket Communication (Real-time Interaction)](03_socket_communication__real_time_interaction__.md) to your browser.
2.  **Socket Listener:** Your browser's code, which is listening for socket messages, receives this "USER_JOINED" message. This message contains the updated list of users.
3.  **Action Call:** The socket listener then calls an **action** in a specific MobX store, let's say `SocketStore`. This action might be named something like `updateUsersInRoom(newList)`.
4.  **Observable Update:** Inside the `updateUsersInRoom` action, the **observable** property holding the list of users (e.g., `this.users`) is updated with the `newList`.
5.  **Automatic UI Re-render:** MobX notices that the `users` observable has changed. If there's a UI component on your screen that displays the list of users (and it's set up to observe this data), MobX automatically tells that component to refresh. The new user's name magically appears on your screen!

This makes the application feel very live and reactive.

`osc.link` has several stores. Here are a couple of important ones:

*   **`SocketStore`:** (Found in `packages/web/src/stores/socketStore.ts` and `packages/electron/src/stores/socketStore.ts`)
    *   Manages connection state (connected to server? joining room? rejected?).
    *   Holds details about the current Instance (like its name, settings, and available [Controls (User Input Elements)](02_controls__user_input_elements__.md)).
    *   Keeps track of users in the current room (`roomState.users`).
    *   In the Electron app, it also stores OSC port configurations.

*   **`GameStore`:** (Primarily in `packages/web/src/stores/gameStore.ts`)
    *   Used for more complex interactive experiences like "CtrlEden."
    *   Manages game-specific state: current game phase (e.g., "lounge," "voting," "results"), player scores, prompts, and other data specific to the game logic. We'll touch on this more in the next chapter.

*   **`UserStore`:** (In `packages/web/src/stores/userStore.ts` and `packages/electron/src/stores/userStore.ts`)
    *   Holds information about the currently logged-in user, like their username or authentication status.

## A Peek at the Code (Simplified)

Let's see a very simplified example of what a MobX store might look like and how a UI component might use it.

**1. Defining a Simple Store (Conceptual)**

This is a stripped-down idea of how a `SocketStore` might be defined.

```typescript
// Simplified concept from packages/web/src/stores/socketStore.ts
import { observable, action, makeAutoObservable } from 'mobx';

export class SocketStore {
  // Data that MobX will watch for changes
  usersInRoom = []; // No need for @observable with makeAutoObservable
  isConnected = false;
  currentInstanceName = '';

  constructor() {
    // This one line tells MobX to automatically make properties
    // observable and methods actions or computed values.
    makeAutoObservable(this);
  }

  // An action to update the connection status
  setConnectedStatus(status: boolean) {
    this.isConnected = status;
  }

  // An action to update the list of users
  updateUsers(newUserList: string[]) { // Assuming user list is just names for simplicity
    this.usersInRoom = newUserList;
  }

  // An action to set the current instance name
  setCurrentInstanceName(name: string) {
    this.currentInstanceName = name;
  }
}
```
*   `makeAutoObservable(this);` is a MobX helper that automatically figures out what should be observable (data like `usersInRoom`) and what should be an action (functions like `setConnectedStatus`).
*   Methods like `setConnectedStatus` and `updateUsers` are **actions**. They are the proper way to change `isConnected` and `usersInRoom`.

**2. Using the Store in a React UI Component (Conceptual)**

React is a library used to build user interfaces. `osc.link` uses React for its web frontend and Electron UI.

```tsx
// Conceptual React component using MobX
import React from 'react';
import { observer } from 'mobx-react-lite'; // Makes the component "observe" MobX stores
import { useStores } from '../hooks/useStores'; // A custom hook to easily access stores

const SessionInfoDisplay = observer(() => { // 'observer' is key!
  const { socketStore } = useStores(); // Get our SocketStore

  return (
    <div>
      <h2>Instance: {socketStore.currentInstanceName}</h2>
      <p>Connected: {socketStore.isConnected ? 'Yes' : 'No'}</p>
      <h3>Users in Room:</h3>
      <ul>
        {socketStore.usersInRoom.map(user => (
          <li key={user}>{user}</li> // Display each user
        ))}
      </ul>
    </div>
  );
});

export default SessionInfoDisplay;
```
*   `observer(...)`: This function from `mobx-react-lite` wraps our UI component. It tells MobX, "Hey, this component uses data from your stores. If that data changes, please re-render this component."
*   `useStores()`: This is a helper function (often found in `packages/web/src/hooks/useStores.tsx` or `packages/electron/src/hooks/useStores.tsx`) that gives easy access to all the application's stores. Here, we're grabbing `socketStore`.
*   Whenever `socketStore.currentInstanceName`, `socketStore.isConnected`, or `socketStore.usersInRoom` changes (via an action), this `SessionInfoDisplay` component will automatically update on the screen!

## Under the Hood: Connecting the Dots

How does all this work together?

1.  **RootStore:** `osc.link` usually has a `RootStore` (e.g., in `packages/web/src/stores/rootStore.ts`). This `RootStore` creates and holds instances of all other stores (like `SocketStore`, `GameStore`, `UserStore`). Think of it as the main office for all your dashboards.
    ```typescript
    // Simplified from packages/web/src/stores/rootStore.ts
    import { SocketStore } from './socketStore';
    import { GameStore } from './gameStore';

    export class RootStore {
      socketStore: SocketStore;
      gameStore: GameStore;

      constructor() {
        this.socketStore = new SocketStore(this); // 'this' passes rootStore if needed
        this.gameStore = new GameStore(this);
      }
    }
    ```

2.  **Providing Stores to Components:** This `RootStore` is made available to all React components, often using React's "Context" feature. The `useStores()` hook taps into this context to grab the stores.

3.  **The Reactive Flow:**

    Let's visualize the "new user joins" scenario again:

    ```mermaid
    sequenceDiagram
        participant Server
        participant ClientSocketHandler as Browser's Socket Code
        participant SocketStoreAction as SocketStore Action (e.g., updateUsers)
        participant SocketStoreData as SocketStore @observable data (usersInRoom)
        participant UIDisplay as UI Component (observing usersInRoom)

        Server->>ClientSocketHandler: Sends "USER_JOINED" message with new user list
        ClientSocketHandler->>SocketStoreAction: Calls `socketStore.updateUsers(newUserList)`
        SocketStoreAction->>SocketStoreData: Modifies `usersInRoom` observable
        Note over SocketStoreData: MobX detects this change!
        SocketStoreData->>UIDisplay: (MobX Magic) Notifies UI Display to re-render
        UIDisplay->>UIDisplay: Updates to show the new user
    ```
    This "MobX Magic" ensures that your UI always reflects the current state of the application without you needing to manually write update logic for every piece of data.

## Stores in the Web vs. Electron

While the core idea of MobX stores is the same, the specific stores or their contents can differ slightly between the web client and the [Electron Host Application (OSC Bridge)](04_electron_host_application__osc_bridge__.md):

*   **Web Client (`packages/web/src/stores`):**
    *   `SocketStore`: Manages connection, current Instance (fetched from server), users in the room.
    *   `GameStore`: If you're using a complex interactive module like CtrlEden, this store will hold detailed game state (phases, scores, etc.).
    *   `UserStore`: Basic user info.

*   **Electron Host App (`packages/electron/src/stores`):**
    *   `SocketStore`: Similar to the web's, but it also manages state specific to the host, like the configured **OSC local and remote ports** (e.g., `socketStore.oscRemotePort` which you set in the UI). It also tracks which Instance it is currently "hosting."
    *   `UserStore`: Basic user info for logging into `osc.link`.
    *   It typically doesn't need a `GameStore` as complex game UI rendering usually happens on the participant's web clients.

The file `packages/electron/src/stores/socketStore.ts` clearly shows these OSC port properties:
```typescript
// Snippet from packages/electron/src/stores/socketStore.ts
// ...
export class SocketStore implements ISocketStore {
  // ...
  @observable oscLocalPort:number = config.oscOverUDP.localPort;
  @observable oscRemotePort:number = config.oscOverUDP.remotePort;
  // ...
  @action setOscLocalPort(localPort:number) {
    this.oscLocalPort = localPort;
  }

  @action setOscRemotePort(remotePort:number) {
    this.oscRemotePort = remotePort;
  }
  // ...
}
```
When you change the OSC port numbers in the Electron app's UI, you're actually calling these actions, which update these observable properties.

## Conclusion: Keeping Your App's Data Sane and Synced

**State Management with MobX Stores** is like having a well-organized and self-updating dashboard for your `osc.link` application. It ensures that:
*   Important information (like connection status, user lists, game details) is stored neatly.
*   When this information changes, the user interface automatically reflects these changes.
*   This makes the application feel responsive and dynamic, and simplifies the code needed to build complex UIs.

By using MobX, `osc.link` can provide a smooth experience, whether you're a participant joining a session on your phone or an admin managing things via the Electron Host App. The UI stays in sync with the underlying "truth" held in the stores.

Now that we understand how general application state is managed, what about the specific state of a more complex interactive game or experience within `osc.link`?

Next, we'll take a closer look at a specialized example of this: [Chapter 7: Game State Management (CtrlEden)](07_game_state_management__ctrleden__.md).

---

Generated by [AI Codebase Knowledge Builder](https://github.com/The-Pocket/Tutorial-Codebase-Knowledge)