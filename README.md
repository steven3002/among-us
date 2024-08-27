
<h1>🛸 Among Us Game - Built with Cartesi</h1>

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

```javascript
{
    1: 'Engine Room',
    2: 'Hall',
    3: 'Cafeteria',
    4: 'Electrical',
    5: 'Medbay',
    6: 'Navigation',
    7: 'Reactor',
    8: 'Security',
  }
```

### 🗳️ Ejecting Players

-  Players can be ejected by voting them out of the game during a meeting.
-  or players can be killed by the imposter


### 🏆 Winning the Game

- **Imposters Wins** if their number(of imposter) is equal to or greater than the number of crewmates.
- **Crewmates Wins** if:
  - The number of imposters reaches 0. i.e through voting out players
  - All tasks are completed.

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
### 
Note: The code is based on a frontend CLI, so the inputs are in the format { "method": <methodName>, "request<T>": <T> }. Since the system processes input from the terminal as a string, I have included a double JSON.parse to make it easier for you to copy and paste from your JSON-to-String converter.

Also, Note: The game uses (report) for error handling and notifications of failed computations, while (notice) is used for successful computations. Therefore, when you send an input, watch out for both.
## 
### **Inspect State**
##
Note: inspect outputs are all (report)
##
```bash
.../inspect/<method>
```

- `mainMenu`: Access the main menu.

- `seeRoomsAvialable`: View available rooms.

### **Advance State**
-***standard payload structure, the standard request type will be given for each method***
 ```javascript
  { "method": <methodName>, "request"<T>: <T> }
  ```
the following are the methods:...
---
- `menuOption`: Select options from the menu.
```javascript
{"request": { "option": <Number>, "roomID": <String>}}
```

- `startLobby`: Start the game lobby.
```javascript
{"request": null}

```

- `killPlayer`: Eliminate a player.
```javascript
{"request": String}

```


- `moveToRoom`: Move to a different room.
```javascript
{"request": <Number>}

```


- `sabotageRoom`: Sabotage a room.
```javascript
{"request": null}

```

- `doTask`: Perform a task.
```javascript
{"request": null}

```

- `alert`: Start an emergency meeting.
```javascript
{"request": null}

```

- `addChat`: Add a message to the chat.
```javascript
{"request": <String>}

```

- `vote`: Vote to eject a player.
```javascript
{"request": <String>}

```

- `getMynews`: Get personal updates.
```javascript
{"request": null}

```

- `getRoomNews`: Get room-specific updates.
```javascript
{"request": null}

```

- `displayChat`: View the chat.
```javascript
{"request": null}

```

- `showTask`: Display the task status.
```javascript
{"request": null}

```

- `gameEnded`: Check if the game has ended.
```javascript
{"request": null}

```

- `getGameState`: Get the current state of the game.
```javascript
{"request": null}

```

- `getRoomId`: Retrieve the room ID.
```javascript
{"request": null}

```

- `seePeopleInRoom`: View players in a room.
```javascript
{"request": null}

```

- `getRoomTaskState`: Get the status of tasks in a room.
```javascript
{"request": null}

```

- `endVotesAndDiscussion`: End the voting and discussion phase.
```javascript
{"request": null}

```

- `test`: Run a bug test.
```javascript
{"request": null}

```
