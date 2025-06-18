const { ethers } = require("ethers");
const Game = require('./game');
const Lobby = require('./lobby');
const { hex2str, str2hex, report, notice } = require('./utils');


// Helper function to be added in src/index.js
// (Assuming 'report' is already imported from './utils')

async function withValidGame(sender, actionCallback, ...actionArgs) {
  const game = playerState[sender];
  if (!game) {
    report("create or join a game state");
    return "reject";
  }
  if (game.gameEnded) {
    report("This game has ended, create or join a game state");
    return "reject";
  }
  return actionCallback(game, ...actionArgs);
}


const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollup_server);


const lobby = new Lobby();

let playerState = {};

//important function
// payload should hold methods and the the request
async function handle_advance(data) {
  console.log("Received advance request data " + JSON.stringify(data));
  const metadata = data["metadata"];
  const sender = metadata["msg_sender"];
  const hexPayload = data["payload"];

  let payload = JSON.parse(JSON.parse(hex2str(hexPayload)));

  const method = payload["method"];
  const request = payload["request"];
  const handler = advanceState[method];
  if (!handler) {
    report("invalid method");
    return "reject";
  }
  handler(sender, request);

  return "accept";
}


async function handle_inspect(data) {
  console.log("Received inspect request data " + JSON.stringify(data));

  const hexPayload = data["payload"];

  let payload = hex2str(hexPayload);


  const handler = inspectState[payload];
  if (!handler) {
    report("invalid method");
    return "reject";
  }
  handler();
  return "accept";

}


async function mainMenu() {
  const menu = {
    1: "Create Game Room",
    2: "Join Existing Game Room",
    3: "Exit",
  }
  report(JSON.stringify(menu));
  return "accept";
}


// request here should be {option: int, roomId: String}
async function menu(sender, requestJson) {
  let request = requestJson;
  let choice = request["option"];
  let roomId = request["roomID"];

  switch (choice) {
    case 1: {
      let game = lobby.createRoom(sender);
      playerState[sender] = game;


      // let testPlayers = [
      //   "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      //   "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      //   "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      //   "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"]
      // testPlayers.forEach((p) => {
      //   game.addPlayer(p);
      //   playerState[p] = game
      // })

    }
      break;
    case 2:

      let game = lobby.joinRoom(roomId, sender);
      if (game) {

        playerState[sender] = game;
      } else {
        report("Room not found.");
      }


      break;
    case 3:
      try {
        delete playerState[sender];
      } catch {

        playerState[sender] = null;

      }
      notice("Exited");
      break;
    default:
      report("Invalid choice. Try again.");
      mainMenu();
  }




}


async function startLobby(sender, request) {
  return withValidGame(sender, (game) => game.startLobby(sender));
}


async function getGameState(sender, request) {
  const game = playerState[sender];
  if (game) {
    game.getGameState();
  } else {
    report("create or join a game state");
  }
}

async function getRoomId(sender, request) {
  const game = playerState[sender];
  if (game) {
    game.getRoomId();
  } else {
    report("create or join a game state");
  }
}

async function peopleInRoom(sender, request) {
  return withValidGame(sender, (game) => game.seePlayersInRoom(sender));
}

async function killPlayer(sender, tergetId) {
  return withValidGame(sender, (game, tid) => game.killPlayer(sender, tid), tergetId);
}

async function avialableRooms() {
  let rooms = {
    1: 'Engine Room',
    2: 'Hall',
    3: 'Cafeteria',
    4: 'Electrical',
    5: 'Medbay',
    6: 'Navigation',
    7: 'Reactor',
    8: 'Security',
  }
  report(JSON.stringify(rooms));
}


async function moveToRoom(sender, roomChoice) {
  const game = playerState[sender];
  if (!game) {
    report("create or join a game state");
    return "reject";
  }
  if (game.gameEnded) {
    report("This game has ended, create or join a game state");
    return "reject";
  }

  // Original logic for mapping room choice
  let rooms = {
    1: 'Engine Room', 2: 'Hall', 3: 'Cafeteria', 4: 'Electrical',
    5: 'Medbay', 6: 'Navigation', 7: 'Reactor', 8: 'Security',
  };
  if (rooms[roomChoice]) {
    game.moveToRoom(sender, rooms[roomChoice]);
  } else {
    report("bad request");
    // return "reject"; // if appropriate
  }
}

async function myNews(sender, request) {
  return withValidGame(sender, (game) => game.getPlayerNews(sender));
}

async function roomNews(sender, request) {
  return withValidGame(sender, (game) => game.getRoomnews(sender));
}


async function sabotageRoom(sender, request) {
  return withValidGame(sender, (game) => game.sabotageRoom(sender));
}


async function doTask(sender, request) {
  return withValidGame(sender, (game) => game.doTask(sender));
}


async function startEmergencyMeeting(sender, request) {
  return withValidGame(sender, (game) => game.startEmergencyMeeting(sender));
}

async function addChart(sender, message) {
  return withValidGame(sender, (game, msg) => game.addChat(sender, msg), message);
}


async function displayChat(sender, request) {
  const game = playerState[sender];
  if (game) {
    game.displayChat();
  } else {
    report("create or join a game state");
  }
}

async function vote(sender, candidate) {
  return withValidGame(sender, (game, cand) => game.vote(sender, cand), candidate);
}

async function getRole(sender, request) {
  const game = playerState[sender];
  if (game) {
    game.getRole(sender);
  } else {
    report("create or join a game state");
  }
}

async function showTask(sender, request) {
  const game = playerState[sender];
  if (game) {
    game.showTasks(sender);
  } else {
    report("create or join a game state");
  }
}

async function gameEnded(sender, request) {
  const game = playerState[sender];
  if (game) {
    notice(JSON.stringify(game.gameEnded));
  } else {
    report("create or join a game state");
  }
}

async function getRoomTaskState(sender, request) {
  const game = playerState[sender];
  if (game) {
    notice(game.getRoomTaskState());
  } else {
    report("create or join a game state");
  }
}

async function endVotesAndDiscussion(sender, request) {
  return withValidGame(sender, (game) => game.endVotesAndDiscussion(sender));
}

var handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

var inspectState = {
  "mainMenu": mainMenu,
  "seeRoomsAvialable": avialableRooms,

};


var advanceState = {
  "menuOption": menu,
  "startLobby": startLobby,
  "killPlayer": killPlayer,
  "moveToRoom": moveToRoom,
  "sabotageRoom": sabotageRoom,
  "doTask": doTask,
  "alert": startEmergencyMeeting,
  "addChat": addChart,
  "vote": vote,
  "getMynews": myNews,
  "getRoomNews": roomNews,
  "displayChat": displayChat,
  "showTask": showTask,
  "gameEnded": gameEnded,
  "getGameState": getGameState,
  "getRoomId": getRoomId,
  "seePeopleInRoom": peopleInRoom,
  "getRoomTaskState": getRoomTaskState,
  "getRole": getRole,
  "endVotesAndDiscussion": endVotesAndDiscussion
}

var finish = { status: "accept" };




(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "accept" }),
    });

    console.log("Received finish status " + finish_req.status);

    if (finish_req.status == 202) {
      console.log("No pending rollup request, trying again");
    } else {
      const rollup_req = await finish_req.json();
      var handler = handlers[rollup_req["request_type"]];
      finish["status"] = await handler(rollup_req["data"]);
    }
  }
})();
