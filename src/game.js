const Player = require('./player');
const EngineRoom = require('./rooms/engineRoom');
const Hall = require('./rooms/hall');
const Cafeteria = require('./rooms/cafeteria')
const Electrical = require('./rooms/electrical');
const Medbay = require('./rooms/medBay');
const Navigation = require('./rooms/navigation');
const Reactor = require('./rooms/reactor');
const Security = require('./rooms/security');
const Chat = require('./chat');
const { ethers } = require("ethers");

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;

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

class Game {
    constructor(roomId, hostName) {
        this.roomId = roomId;
        this.hostName = hostName;
        this.players = [];
        this.imposter = [];
        this.rooms = {
            'Engine Room': new EngineRoom(),
            'Hall': new Hall(),
            'Cafeteria': new Cafeteria(),
            'Electrical': new Electrical(),
            'Medbay': new Medbay(),
            'Navigation': new Navigation(),
            'Reactor': new Reactor(),
            'Security': new Security(),

        };
        this.isRunning = false;
        this.chat = new Chat();
        this.isMeetingInProgress = false;
        this.totalTasks = 8;
        this.completedTasks1 = 0;
        this.hostNews = null;
        this.gameState = null;
        this.gameEnded = false;
    }

    getRoomId() {

        notice(this.roomId);
    }

    addPlayer(name) {
        const newPlayer = new Player(name);
        this.players.push(newPlayer);
        this.gameState = `Player ${name} has joined the game.`;

        notice(this.gameState);
    }

    getPlayerNews(playerName) {
        const player = this.players.find(p => p.name === playerName);
        if (player) {

            notice(player.news)
        } else {
            report("invalid userId")
        }
    }

    getRoomTaskState() {
        let state = {};
        for (let room in this.rooms) {
            state[room] = {
                "completed": this.rooms[room].taskDone, "isSabotaged": this.rooms[room].isSabotaged
            }
        }
        return state;
    }

    getRoomnews(playerName) {
        const player = this.players.find(p => p.name === playerName);
        if (player) {
            notice(JSON.stringify(player.currentRoom.news))
        } else {
            report("invalid userId")
        }
    }

    startLobby(sender) {
        if (sender == this.hostName) {
            if (this.isRunning) {
                report("game has already started");
                return;
            }
            if (this.players.length >= 3) {
                this.startGame();

            } else {
                report("Not enough players to start the game.");
            }
        } else {
            report('you do not have access to this function');
        }

        report(`Waiting for players...`);
        this.gameState = `Waiting for players...`;
    }

    getGameState() {
        notice(this.gameState)
    }

    startGame() {

        this.assignRoles();
        this.isRunning = true;
        this.gameState = "The game has started!";
        notice(this.gameState);

        this.players.forEach(player => {
            player.moveTo(this.rooms["Hall"]);
            this.rooms["Hall"].enterRoom(player);

        })

    }



    assignRoles() {
        const numPlayers = this.players.length;
        let numimposters = 1;

        if (numPlayers >= 10 && numPlayers <= 16) {
            numimposters = 3;
        } else if (numPlayers >= 16) {
            numimposters = 5;
        }

        let impostersAssigned = 0;

        while (impostersAssigned < numimposters) {
            const randomIndex = Math.floor(Math.random() * numPlayers);
            if (this.players[randomIndex].role !== 'imposter') {
                this.players[randomIndex].role = 'imposter';
                this.players[randomIndex].news = "you are an Imposter";
                this.imposter.push(this.players[randomIndex].name);
                impostersAssigned++;
            }
        }




        this.players.forEach(player => {
            if (player.role !== 'imposter') {
                player.role = 'crewmate';
            } else {
                player.news = (`${this.imposter} is also an imposter`)
            }
            // console.log(`${player.name} is a ${player.role}.`); //might include this later
        });
    }

    showTasks(sender) {
        const player = this.players.find(p => p.name === sender);
        if (player) {
            notice(player.currentRoom.showTasks(player));

        } else {
            report("invalid player id")
        }

    }

    seePlayersInRoom(playerName) {
        const player = this.players.find(p => p.name === playerName);
        if (player) {
            player.currentRoom.showPlayersAndDeadBodies();
        } else {
            report("invalid player id")
        }

    }


    killPlayer(imposterName, targetName) {
        if (this.isMeetingInProgress) {
            report("Cannot kill during an emergency meeting.");
            return;
        }
        if (!this.isRunning) {

            report("game has not started");
            return;
        }
        const imposter = this.players.find(p => p.name === imposterName);
        const target = this.players.find(p => p.name === targetName);


        if (imposter && target) {

            if (imposter.currentRoom == target.currentRoom && imposter.role == "imposter") {
                if (target.role == "imposter") {
                    report("you can not kill an imposter")
                    return;
                }
                if (imposter.isGhost()) {
                    report("you are a ghost, can not perform action")
                    return;
                }

                imposter.kill(target);

                target.currentRoom.exitRoom(target);
                target.currentRoom.deadBodies.push(target);


                this.checkWinConditions();


            } else {
                report("Invalid kill action.");
            }

        } else {
            report("Invalid player names for kill action.");
        }
    }


    moveToRoom(playerName, roomName) {
        if (this.isMeetingInProgress) {
            report("Cannot move to another room during an emergency meeting.");
            return;
        }
        if (!this.isRunning) {
            report("game has not started");
            return;
        }

        const player = this.players.find(p => p.name === playerName);
        const room = this.rooms[roomName];

        if (player && room && player.canLeaveRoom) {
            if (player.currentRoom) {
                player.currentRoom.exitRoom(player);
                notice("you have left the previous room")
            }
            if (player.isAlive) {
                room.enterRoom(player);
                notice("you have enterded the room")

            }

            player.moveTo(room);
        } else {

            report("Invalid player name or room name for movement.  or player can not leave the room");

        }
    }

    sabotageRoom(imposterName) {
        if (this.isMeetingInProgress) {
            report("Cannot sabotage during an emergency meeting.");
            return;
        }
        if (!this.isRunning) {
            report("game has not started");
            return;
        }

        const imposter = this.players.find(p => p.name === imposterName);


        if (imposter) {
            if (imposter.role == "imposter") {
                if (imposter.isGhost()) {
                    report("you are a ghost, can not perform action")
                    return;
                }

                let room = imposter.currentRoom;

                this.completedTasks1 -= imposter.sabotage(room);

                notice(`room has been sabotaged`)

            } else {
                report("you can not perform this action");
            }

        } else {

            report("Invalid imposter name or room name for sabotage action.");

        }

    }


    doTask(sender) {
        if (this.isMeetingInProgress) {
            report("Cannot do task during an emergency meeting.");
            return;
        }

        const player = this.players.find(p => p.name === sender);
        if (player) {
            if (player.role === 'crewmate') {
                if (player.isGhost()) {
                    report("You are a ghost and cannot perform tasks.");
                    return;
                }

                let d = player.currentRoom.doTask();

                // Ensure d is a valid number
                if (typeof d !== 'number' || isNaN(d)) {
                    console.error(`Error: doTask() returned an invalid value: ${d}`);
                    d = 0; // Set d to 0 if it's not a valid number
                }

                this.completedTasks1 += d;

                report("Task completed successfully.");
                this.checkWinConditions();
            } else {
                report("Only crewmates can perform tasks.");
            }
        } else {
            report("Player not found.");
        }
    }

    startEmergencyMeeting(caller) {
        if (this.isMeetingInProgress) {
            report("A meeting is already in progress.");
            return;
        }
        const player = this.players.find(p => p.name === caller);
        if (player.isGhost()) {
            report("you are a ghost, can not perform action")
            return;
        }
        this.chat.clearChat();
        this.isMeetingInProgress = true;
        this.gameState = `${caller} has called an emergency meeting!`;
        console.log(this.gameState);
        notice(this.gameState);
        this.discussAndVote();
    }

    discussAndVote() {
        notice("Discussion phase has started. Players are discussing...");

        this.gameState = "Discussion phase has started. Players are discussing and voting...";
        console.log(this.gameState)

    }


    endVotesAndDiscussion(sender) {
        if (sender == this.hostName) {
            if (this.isMeetingInProgress) {
                this.startVoting();
            }
        } else {
            report("you do not have access to this function")
            console.log("you do not have access to this function")
            return;
        }
    }






    addChat(playerName, message) {
        if (this.isMeetingInProgress) {

            const player = this.players.find(p => p.name === playerName);

            if (player) {
                this.chat.sendMessage(player, message);
            } else {
                report("invalid userId");
            }

            return;
        } else {
            report("no meeting is in progress.");
        }
    }

    displayChat() {
        this.chat.showChatHistory();
    }

    startVoting() {
        notice("Voting phase has ended.");
        const votes = {};


        this.players.forEach(player => {
            if (player.isAlive) {
                const vote = this.getPlayerVote(player);
                votes[vote] = (votes[vote] || 0) + 1;
            }
        });

        this.players.forEach(player => {
            player.currentVote = null;
        });
        console.log(`this is the current vote \n\n${JSON.stringify(votes)}`)

        this.resolveVoting(votes);
    }

    vote(playerName, vote) {

        if (this.isMeetingInProgress) {

            const player = this.players.find(p => p.name === playerName);
            if (player.currentVote == null) {

                if (player.isAlive) {

                    const candidate = this.players.find(p => p.name === vote);

                    if (candidate && candidate.isAlive) {

                        player.currentVote = vote;


                    } else {
                        report("vote invalid")
                    }
                } else {
                    report("you cannot vote")
                }
            } else {
                report("you have voted")
            }
        } else {
            report("no meeting is in progress.");
        }

    }

    getPlayerVote(player) {
        const vote = player.currentVote;
        this.addChat(player.name, `${player.name} votes to eject ${vote}`)
        console.log(this.displayChat())
        notice(`${player.name} votes to eject ${vote}`);
        return vote;
    }

    resolveVoting(votes) {
        const maxVotes = Math.max(...Object.values(votes));
        const candidates = Object.keys(votes).filter(player => votes[player] === maxVotes);

        if (candidates.length === 1) {
            const ejectedPlayerName = candidates[0];
            const ejectedPlayer = this.players.find(p => p.name === ejectedPlayerName);
            if (ejectedPlayer) {
                this.ejectPlayer(ejectedPlayer);

            }
        } else {
            report("No consensus reached. No one was ejected.");
        }

        this.endEmergencyMeeting();
    }

    ejectPlayer(player) {
        player.isAlive = false;
        player.currentRoom.exitRoom(player);

        this.gameState = (`${player.name} was ejected from the game!`);
        console.log(this.gameState)
        notice(this.gameState)


        this.addChat("System", `${player.name} was a ${player.role}`)
        console.log(this.displayChat())


        this.checkWinConditions();
    }

    endEmergencyMeeting() {
        this.isMeetingInProgress = false;
        this.gameState = ("The emergency meeting has ended.");

    }

    checkWinConditions() {



        let aliveCrewmates = 0;
        let aliveImposters = 0;



        this.players.forEach(player => {
            if (player.role === 'crewmate' && player.isAlive) {
                aliveCrewmates += 1;
            }
        });


        this.players.forEach(player => {
            if (player.role === 'imposter' && player.isAlive) {
                aliveImposters += 1;
            }
        });




        const allTasksDone = Object.values(this.rooms).every(room => room.areTasksDone());
        if (allTasksDone) {
            console.log("All tasks are completed. Crewmates win!");
            this.gameState = ("Crewmates have completed all tasks. Crewmates win!");
            console.log(this.gameState)
            notice(this.gameState)

            this.endGame('crewmates');

        }

        // Imposters win if they equal or outnumber crewmates
        else if (aliveImposters >= aliveCrewmates) {
            this.gameState = ("Imposters outnumber crewmates. Imposters win!");
            console.log(this.gameState)
            notice(this.gameState)

            this.endGame('imposters');


        } else if (aliveImposters <= 0) {
            this.gameState = ("Crewmates have voted out all imposters. Crewmates win!");
            console.log(this.gameState)
            notice(this.gameState)

            this.endGame('crewmates');
        }
    }

    endGame(winner) {
        this.isRunning = false;
        this.gameEnded = true;

        this.gameState = `Game over! ${winner.charAt(0).toUpperCase() + winner.slice(1)} win!`;
        notice(this.gameState)
        console.log(this.gameState)




    }

}






module.exports = Game;
