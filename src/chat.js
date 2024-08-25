
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

class Chat {
    constructor() {
        this.messages = [];
    }

    sendMessage(player, message) {
        if (player.isGhost()) {
            report(`${player.name} is a ghost and cannot send messages.`);
            console.log(`${player.name} is a ghost and cannot send messages.`);
            return;
        }

        const chatMessage = `${player.name}: ${message}`;
        this.messages.push(chatMessage);
        console.log(this.messages)

    }




    showChatHistory() {
        notice(JSON.stringify({ 'messages': this.messages }))
        console.log(`this is the message\n${this.messages}`)
    }

    clearChat() {
        this.messages = [];
        notice("Chat history has been cleared.");
        console.log("Chat history has been cleared.");
    }
}

module.exports = Chat;
