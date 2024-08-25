const Room = require('./room');

class Security extends Room {
    constructor() {
        super('Security');
        this.tasks = ['Fix Wiring', 'Monitor Cams'];
    }

    showTasks(player) {
        if (!this.isSabotaged) {
            return (`Tasks for ${player.name}: ${this.tasks.join(', ')}`);
        } else {
            return (`${this.name} is sabotaged.`);
        }
    }
}

module.exports = Security;




