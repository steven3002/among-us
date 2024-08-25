
class AliveOrDead {
    constructor() {
        this.playersStatus = {};
    }

    setPlayerStatus(playerName, isAlive) {
        this.playersStatus[playerName] = isAlive;
    }

    isPlayerAlive(playerName) {
        return this.playersStatus[playerName];
    }

    getAlivePlayers() {
        return Object.keys(this.playersStatus).filter(player => this.playersStatus[player]);
    }

    getDeadPlayers() {
        return Object.keys(this.playersStatus).filter(player => !this.playersStatus[player]);
    }
}

module.exports = AliveOrDead;
