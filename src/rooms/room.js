
const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;


const { ethers } = require("ethers");
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



class Room {
    constructor(name) {
        this.name = name;
        this.playersInRoom = [];
        this.deadBodies = [];
        this.taskDone = [false, false];
        this.isSabotaged = false;
        this.sabotageState = 0;
        this.news = [];

    }


    enterRoom(player) {
        this.playersInRoom.push(player);
        this.announcePlayerEntry(player);
        this.showPlayersAndDeadBodies();

    }

    exitRoom(player) {

        this.playersInRoom = this.playersInRoom.filter(p => p !== player);

        notice(`${player.name} has left ${this.name}.`);
    }

    announcePlayerEntry(player) {

        this.playersInRoom.forEach(p => {
            if (p !== player) {

                notice(`${player.name} has entered the ${this.name}.`);


            }
        });
    }

    showPlayersAndDeadBodies() {
        const alivePlayers = this.playersInRoom.filter(p => p.isAlive).map(p => p.name);
        const deadPlayers = this.playersInRoom.filter(p => !p.isAlive).map(p => p.name);

        notice(JSON.stringify([(`\nIn ${this.name}:`)
            , (`Alive players: ${alivePlayers.length > 0 ? alivePlayers.join(', ') : 'None'}`),
        (`Dead bodies: ${deadPlayers.length > 0 ? deadPlayers.join(', ') : 'None'}`)]));


    }

    sabotage() {
        if (this.taskDone[0] == true && this.taskDone[1] == true) {
            this.isSabotaged = true;
            notice(`${this.name} has been sabotaged! `);

            console.log(`${this.name} has been sabotaged! `)

            this.taskDone = [false, false];
            console.log(`this the control sabotage state ${this.sabotageState}`)
            return 1

        } else {
            report(`${this.name} can not be sabotaged! \n task not done!`)
            console.log(`${this.name} can not be sabotaged! \n tak not done!`);
            return 0
        }
    }
    doTask() {
        if (this.taskDone[0] == this.taskDone[1] && this.taskDone[0] == false) {
            this.isSabotaged = false;
            notice(`${this.name} tasks are in progress.`);
            console.log(`${this.name} tasks are in progress.`);


            notice(`${this.name} first task has been done, secound task is in progress.`);
            console.log(`${this.name} first task has been done, secound task is in progress.`)
            this.taskDone = [true, true]

            notice(`${this.name} tasks has been completed`);
            console.log(`${this.name} tasks has been completed`)
            return 1;


        } else {
            report(`${this.name} tasks has been done`);
            console.log(`${this.name} tasks has been done`)
            return 0;

        }

    }
    areTasksDone() {
        return this.taskDone.every(task => task === true);
    }
}

module.exports = Room;
