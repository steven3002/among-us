

const Room = require('./room');

class Electrical extends Room {
    constructor() {
        super('Electrical');
        this.tasks = ['Fix Wiring', 'Calibrate Distributor'];
    }

    showTasks(player) {
        if (!this.isSabotaged) {
            return (`Tasks for ${player.name}: ${this.tasks.join(', ')}`);
        } else {
            return (`${this.name} is sabotaged.`);
        }
    }
}

module.exports = Electrical;



