
const { ethers } = require("ethers");


function str2hex(payload) {
    return ethers.hexlify(ethers.toUtf8Bytes(payload));
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


const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;


const Game = require('./game');

class Lobby {
    constructor() {
        this.rooms = {};
        this.currentId = 0
    }


    createRoom(hostName) {
        const roomId = `${Math.random().toString(36).substring(2, 7)}` + "x" + `${this.currentId}`;
        const game = new Game(roomId, hostName);
        this.rooms[roomId] = game;
        game.addPlayer(hostName);
        notice(`Game room created. Room ID: ${roomId}`);
        console.log(`Game room created. Room ID: ${roomId}`)
        this.currentId += 1;
        return game;
    }

    joinRoom(roomId, playerName) {
        const game = this.rooms[roomId];
        if (game) {
            game.addPlayer(playerName);
            console.log(`joined game Room ID: ${roomId}`)

            return game;
        } else {
            return null;
        }
    }
}

module.exports = Lobby;
