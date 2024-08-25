const { ethers } = require("ethers");
const Game = require('./game');
const Lobby = require('./lobby');


const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollup_server);


const lobby = new Lobby();

let playerState = {};

//important function
function hex2str(hex) {
  return ethers.toUtf8String(hex);
}

function str2hex(payload) {
  return ethers.hexlify(ethers.toUtf8Bytes(payload));
}


async function report(payload) {
  let data = payload;
  if (payload === null || payload === undefined) {
    data = "null"
  }
  const report_req = await fetch(rollup_server + "/report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: str2hex(data) }),
  });
  return;
}


async function notice(payload) {
  let data = payload;
  if (payload === null || payload === undefined) {
    data = "null"
  }
  const notice_req = await fetch(rollup_server + "/notice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: str2hex(data) }),
  });

  return;
}



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
  let game = playerState[sender];
  if (game) {
    if (game.gameEnded) {
      report("This game has ended, create or join a game state")
      console.log("This game has ended, create or join a game state")
      return "reject";
    }
    game.startLobby(sender);

  } else {
    report("create or join a game state");
  }
}


async function getGameState(sender, request) {
  let game = playerState[sender];
  if (game) {
    game.getGameState();
  } else {
    report("create or join a game state");
  }
}

async function getRoomId(sender, request) {
  let game = playerState[sender];
  if (game) {
    game.getRoomId();
  } else {
    report("create or join a game state");
  }
}

async function peopleInRoom(sender, request) {
  let game = playerState[sender];
  if (game) {
    game.seePlayersInRoom(sender);

  } else {
    report("create or join a game state");
  }
}

async function killPlayer(sender, tergetId) {
  let game = playerState[sender];
  if (game) {
    if (game.gameEnded) {
      report("This game has ended, create or join a game state")
      return "reject";
    }
    game.killPlayer(sender, tergetId);

  } else {
    report("create or join a game state");
  }

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


async function moveToRoom(sender, request) {
  let game = playerState[sender];
  if (game) {
    if (game.gameEnded) {
      report("This game has ended, create or join a game state")
      return "reject";
    }
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

    if (rooms[request]) {

      game.moveToRoom(sender, rooms[request])

    } else {
      report("bad request");
    }

  } else {
    report("create or join a game state");
  }

}

async function myNews(sender, request) {
  let game = playerState[sender];
  if (game) {
    game.getPlayerNews(sender);
  } else {
    report("create or join a game state");
  }
}

async function roomNews(sender, request) {
  let game = playerState[sender];
  if (game) {
    game.getRoomnews(sender);
  } else {
    report("create or join a game state");
  }

}


async function sabotageRoom(sender, request) {
  let game = playerState[sender];
  if (game) {
    if (game.gameEnded) {
      report("This game has ended, create or join a game state")
      return "reject";
    }
    game.sabotageRoom(sender);
  } else {
    report("create or join a game state");
  }

}


async function doTask(sender, request) {
  let game = playerState[sender];
  if (game) {
    if (game.gameEnded) {
      report("This game has ended, create or join a game state")
      return "reject";
    }
    game.doTask(sender);
  } else {
    report("create or join a game state");
  }

}


async function startEmergencyMeeting(sender, request) {
  let game = playerState[sender];
  if (game) {
    if (game.gameEnded) {
      report("This game has ended, create or join a game state")
      return "reject";
    }
    game.startEmergencyMeeting(sender);
  } else {
    report("create or join a game state");
  }

}

async function addChart(sender, message) {

  let game = playerState[sender];

  if (game) {
    if (game.gameEnded) {
      report("This game has ended, create or join a game state")
      return "reject";
    }
    game.addChat(sender, message);
  } else {
    report("create or join a game state");
  }
}


async function displayChat(sender, request) {
  let game = playerState[sender];
  if (game) {
    game.displayChat();
  } else {
    report("create or join a game state");
  }
}

async function vote(sender, candidate) {
  let game = playerState[sender];
  if (game) {
    if (game.gameEnded) {
      report("This game has ended, create or join a game state")
      return "reject";
    }
    game.vote(sender, candidate);

  } else {
    report("create or join a game state");
  }
}

async function showTask(sender, request) {
  let game = playerState[sender];
  if (game) {
    game.showTasks(sender);
  } else {
    report("create or join a game state");
  }
}

async function gameEnded(sender, request) {
  let game = playerState[sender];
  if (game) {
    notice(JSON.stringify(game.gameEnded));
  } else {
    report("create or join a game state");
  }
}

async function getRoomTaskState(sender, request) {
  let game = playerState[sender];
  if (game) {
    notice(game.getRoomTaskState());

  } else {
    report("create or join a game state");
  }
}

async function endVotesAndDiscussion(sender, request) {
  let game = playerState[sender];
  if (game) {
    game.endVotesAndDiscussion(sender);

  } else {
    report("create or join a game state");
  }

}

async function bugTest(sender, request) {
  const player1 = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
  const player2 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const player3 = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
  const imposter = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";
  const player4 = "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65";

  // First test
  try {
    menu(player1, { "option": 1, "roomID": "9rvtfx0" });
    menu(player2, { "option": 2, "roomID": "9rvtfx0" });
    menu(player3, { "option": 2, "roomID": "9rvtfx0" });
    menu(imposter, { "option": 2, "roomID": "9rvtfx0" });
    menu(player4, { "option": 2, "roomID": "9rvtfx0" });
  } catch (e) {
    console.error(`The error occurred in menu option 1:\n${e}`);
  }

  // Test start room
  try {
    startLobby(player1, 1);
    console.log("\n\n\n\nThis is successful\n\n\n\n");
  } catch (e) {
    console.error("Error in start room:\n", e);
  }

  // Test move to room
  try {
    moveToRoom(player1, 1);

    moveToRoom(player2, 3);
    console.log("\n\n\n")
    moveToRoom(player3, 4);
    console.log("\n\n\n")
    moveToRoom(imposter, 1);
    console.log("\n\n\n")
    moveToRoom(player4, 5);
  } catch (e) {
    console.error("\n\n\n\n\n\nError in move to room:\n", e);
  }

  // Test do task
  try {
    doTask(player1, 1);
    console.log("\n\n\n")
    doTask(player2, 1);
    console.log("\n\n\n")
    doTask(player3, 1);
    console.log("\n\n\n")
    doTask(player4, 1);
    try {
      doTask(imposter, 1);
      console.log("\n\n\n")
    } catch (e) {
      console.error("\n\n\n Error in imposter do task:\n", e);
    }
  } catch (e) {
    console.error("\n\n Error in do task:\n", e);
  }

  // Kill player
  try {
    killPlayer(player1, player2);
    console.log("\n\n\n")
    killPlayer(player2, imposter);
    console.log("\n\n\n")
    killPlayer(imposter, player1);
    console.log("\n\n\n")
  } catch (e) {
    console.error(`Error occurred in kill player:\n${e}`);
  }

  // Sabotage room
  try {
    sabotageRoom(player1, 1);
    console.log("\n\n\n")
    sabotageRoom(player2, 1);
    console.log("\n\n\n")
    sabotageRoom(player3, 1);
    console.log("\n\n\n")
    sabotageRoom(imposter, 1);
    console.log("\n\n\n")
    sabotageRoom(player4, 1);
  } catch (e) {
    console.error(`\n\n Error in sabotage room:\n${e}`);
  }

  // Test move to room again
  try {
    moveToRoom(player1, 2);
    console.log("\n\n\n")
    moveToRoom(player2, 1);
    console.log("\n\n\n")
    moveToRoom(player3, 5);
    console.log("\n\n\n")
    moveToRoom(imposter, 2);
    console.log("\n\n\n")
    moveToRoom(player4, 6);
  } catch (e) {
    console.error("\n\n\n\n\n\nError in move to room:\n", e);
  }

  // Start emergency meeting
  try {
    startEmergencyMeeting(player1, 1);
    console.log("\n\n\n")
    startEmergencyMeeting(player2, 1);
    console.log("\n\n\n")
    startEmergencyMeeting(player3, 1);
  } catch (e) {
    console.error("\n\n\n\n\n\n Error in start emergency meeting:\n", e);
  }

  // Add chart
  try {
    addChart(player1, "player1");
    console.log("\n\n\n")
    addChart(player2, "player2");
    console.log("\n\n\n")
    addChart(player3, "player3");
    console.log("\n\n\n")
    addChart(imposter, "imposter");
    console.log("\n\n\n")
    addChart(player4, "player4");
  } catch (e) {
    console.error("\n\n\n\n\n\n Error in add chart:\n", e);
  }

  // Vote
  try {
    vote(player1, player2);
    console.log("\n\n\n")
    vote(player2, player4);
    console.log("\n\n\n")
    vote(player3, player1);
    console.log("\n\n\n")
    vote(imposter, player4);
    console.log("\n\n\n")
    vote(player4, player2);
  } catch (e) {
    console.error("\n\n\n\n\n\n Error in vote:\n", e);
  }

  // Display chat
  try {
    displayChat(player1, 1);
    console.log("\n\n\n")
    displayChat(player2, 1);
    console.log("\n\n\n")
    displayChat(player4, 1);
  } catch (e) {
    console.error("\n\n\n\n\n\n Error in display chat:\n", e);
  }

  // End votes and discussion
  try {
    endVotesAndDiscussion(player1, 1);
    console.log("\n\n\n")
    endVotesAndDiscussion(player2, 1);
  } catch (e) {
    console.error("\n\n\n\n\n\n Error in end votes and discussion:\n", e);
    console.log("\n\n\n")
  }

  // Display chat again
  try {
    displayChat(player1, 1);
    console.log("\n\n\n")
    displayChat(player2, 1);
    console.log("\n\n\n")
    displayChat(player4, 1);

  } catch (e) {
    console.error("\n\n\n\n\n\n Error in display chat:\n", e);
  }

  // try win by kill 
  try {
    moveToRoom(player1, 6);
    console.log("\n\n\n")
    moveToRoom(player2, 6);
    console.log("\n\n\n")
    moveToRoom(player3, 6);
    console.log("\n\n\n")
    moveToRoom(imposter, 6);
    console.log("\n\n\n")
    moveToRoom(player4, 6);
    console.log("\n\n\n")
    killPlayer(imposter, player2);
    console.log("\n\n\n")
    killPlayer(imposter, player3);
    console.log("\n\n\n")

  } catch (e) {
    console.error("\n\n\n\n\n\n Error in display win:\n", e);
  }

  // // try win by task
  // try {
  //   moveToRoom(player2, 1);
  //   doTask(player2, 1);
  //   for (let i = 1; i < 9; i++) {
  //     moveToRoom(player2, i);
  //     doTask(player2, i);

  //   }
  // } catch (e) {
  //   console.error("\n\n\n\n\n\n Error in display win:\n", e);

  // }



  // // try win by vote

  // try {
  //   startEmergencyMeeting(player3, 1);
  //   vote(player2, imposter);
  //   console.log("\n\n\n")
  //   vote(player3, imposter);
  //   console.log("\n\n\n")
  //   vote(imposter, player3);
  //   endVotesAndDiscussion(player1, 1);

  // } catch (e) {
  //   console.error("\n\n\n\n\n\n Error in display win:\n", e);
  // }



  // const func = [
  //   "getMynews",
  //   "getRoomNews",
  //   "displayChat",
  //   "showTask",
  //   "gameEnded",
  //   "getGameState",
  //   "getRoomId",
  //   "seePeopleInRoom",
  //   "getRoomTaskState"
  // ];

  // for (let i in func) {
  //   const funcName = func[i];
  //   const dataFunc = advanceState[funcName];

  //   if (typeof dataFunc === 'function') {
  //     try {
  //       dataFunc(player1, 1);
  //       dataFunc(player2, 1);
  //       dataFunc(player3, 1);
  //       dataFunc(imposter, 1);
  //       dataFunc(player4, 1);
  //     } catch (error) {
  //       console.error(`Error executing function ${funcName}:`, error);
  //     }
  //   } else {
  //     console.error(`${funcName} is not a function in advanceState`);
  //   }
  // }


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
  "endVotesAndDiscussion": endVotesAndDiscussion,
  "test": bugTest

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
