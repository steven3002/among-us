# 🛸 Among Us Game - Built with Cartesi

This is a simple version of the **Among Us** game, developed using the **Cartesi Machine**, **Cartesi Rollup APIs**, and **JavaScript** as the programming language. The frontend is powered by **Cartesi CLI**.

## 🎮 How to Play

1. **Create a Room:** Start by creating a room and wait for at least 2 players to join.
2. **Host Responsibilities:** The host should start the game and will be the admin responsible for managing vote deadlines and the game state.
3. **Role Assignment:** Roles are assigned randomly:
   - The number of imposters is determined by the number of players:
     - 1 to 9 players: Maximum of 1 imposter.
     - 10 to 16 players: Maximum of 3 imposters.
     - 17+ players: Maximum of 5 imposters.
4. **Starting Room:** All players begin in the **Hall** room.
5. **Ship Layout:** The game takes place in a ship consisting of 8 rooms.

### 🏆 Winning the Game

- **Imposters Win** if their number is equal to or greater than the number of crewmates.
- **Crewmates Win** if:
  - The number of imposters reaches 0.
  - All tasks are completed.

### 🗳️ Ejecting Players

Players can be ejected by voting them out of the game.

So, hop in and invite your friends for an exciting game!

---


## 📋 Prerequisites

Before setting up the game, ensure you have the following installed on your system:

1. **Node.js** (v14 or higher)
   - [Download Node.js](https://nodejs.org/)
2. **Docker**
   - [Download Docker](https://www.docker.com/products/docker-desktop)
3. **Cartesi Machine & Rollup CLI**
   - Install using the official Cartesi documentation: 
4. **Git** (for cloning the repository)
   - [Download Git](https://git-scm.com/downloads)


## 🔧 Setup Instructions

Follow these steps to set up and run the game locally:

1. **Clone the Repository:**

2. **Build the Project: Use the Cartesi CLI to build the project**

```bash
cartesi build
```

3. **Run the Game: Start the Cartesi Rollup server to handle game logic:**


```bash
cartesi run
```


-------------------


## 🕹️ Game Functions

### **Inspect State**
```bash
.../inspect/"<method>
```

- `mainMenu`: Access the main menu.

- `seeRoomsAvialable`: View available rooms.

### **Advance State**
-***standard payload structure, the standard request type will be given for each method***
 ```json
  { "method": <methodName>, "request"<T>: <T> }
  ```

- `menuOption`: Select options from the menu.
```json
{"request": { "option": <Number>, "roomID": <String>}}
```

- `startLobby`: Start the game lobby.
```json
{"request": null}

```

- `killPlayer`: Eliminate a player.
```json
{"request": String}

```


- `moveToRoom`: Move to a different room.
```json
{"request": <Number>}

```


- `sabotageRoom`: Sabotage a room.
```json
{"request": null}

```

- `doTask`: Perform a task.
```json
{"request": null}

```

- `alert`: Start an emergency meeting.
```json
{"request": null}

```

- `addChat`: Add a message to the chat.
```json
{"request": <String>}

```

- `vote`: Vote to eject a player.
```json
{"request": <String>}

```

- `getMynews`: Get personal updates.
```json
{"request": null}

```

- `getRoomNews`: Get room-specific updates.
```json
{"request": null}

```

- `displayChat`: View the chat.
```json
{"request": null}

```

- `showTask`: Display the task status.
```json
{"request": null}

```

- `gameEnded`: Check if the game has ended.
```json
{"request": null}

```

- `getGameState`: Get the current state of the game.
```json
{"request": null}

```

- `getRoomId`: Retrieve the room ID.
```json
{"request": null}

```

- `seePeopleInRoom`: View players in a room.
```json
{"request": null}

```

- `getRoomTaskState`: Get the status of tasks in a room.
```json
{"request": null}

```

- `endVotesAndDiscussion`: End the voting and discussion phase.
```json
{"request": null}

```

- `test`: Run a bug test.
```json
{"request": null}

```
