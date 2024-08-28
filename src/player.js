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




class Player {
    constructor(name) {
        this.name = name;
        this.isAlive = true;
        this.role = null;  // 'crewmate' or 'imposter'
        this.currentRoom = null;
        this.isInCooldown = false;
        this.emergencyMeetingsLeft = 1;
        this.news = null;
        this.canLeaveRoom = true;
        this.chatSeenIndex = null;
        this.currentVote = null;
    }

    moveTo(room) {
        if (this.canLeaveRoom) {
            this.currentRoom = room;
            report(`${this.name} moved to ${room.name}`);
            console.log(`${this.name} moved to ${room.name}`)
            return;
        }
        report(`you currrently can not leave ${this.currentRoom}`)
        console.log(`you currrently can not leave ${this.currentRoom}`)

    }

    die() {
        this.isAlive = false;
        notice(`${this.name} has died and is now a ghost.`);
        console.log(`${this.name} has died and is now a ghost.`)
    }

    isGhost() {
        console.log(`${this.name} is ${!this.isAlive} Ghost`)
        return !this.isAlive;

    }

    kill(targetPlayer) {
        if (this.isInCooldown) {
            report(`${this.name} cannot kill right now (cooldown active).`);
            console.log(`${this.name} cannot kill right now (cooldown active).`)
            return;
        }

        if (this.role !== 'imposter') {
            console.log(`${this.name} is not an imposter and cannot kill.`);
            report(`${this.name} is not an imposter and cannot kill.`);
            return;
        }

        if (targetPlayer.isGhost()) {
            console.log(`${targetPlayer.name} is already dead.`)
            report(`${targetPlayer.name} is already dead.`);
            return;
        }

        targetPlayer.die();
        notice(`${this.name} has killed ${targetPlayer.name}.`);
        console.log(`${this.name} has killed ${targetPlayer.name}.`)
        notice(`you can not leave this room wait for the 2.9s cooldown`);


    }

    sabotage(room) {
        if (this.role !== 'imposter') {
            report(`${this.name} is not an imposter and cannot sabotage.`);
            console.log(`${this.name} is not an imposter and cannot sabotage.`);
            return;
        }

        if (room.isSabotaged) {
            report(`${room.name} is already sabotaged.`);
            console.log(`${room.name} is already sabotaged.`);
            return;
        }

        room.sabotage();
        console.log(`${this.name} has sabotaged ${room.name}.`)
        notice(`${this.name} has sabotaged ${room.name}.`);
    }
    callEmergencyMeeting(game) {
        console.log(`this is the length of the current emergencyMeetingsLeft: ${this.emergencyMeetingsLeft} `)
        if (this.emergencyMeetingsLeft > 0 && this.isAlive) {
            this.emergencyMeetingsLeft -= 1;
            notice(`this is the length of your current emergencyMeetingsLeft: ${this.emergencyMeetingsLeft} `)
            game.startEmergencyMeeting(this);
        } else {
            console.log(`${this.name} cannot call an emergency meeting.`)
            report(`${this.name} cannot call an emergency meeting.`);
        }
    }
}

module.exports = Player;
