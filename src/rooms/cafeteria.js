
const Room = require('./room');

class Cafeteria extends Room {
    constructor() {
        super('Cafeteria');
        this.tasks = ['Empty Garbage', 'Fix Wiring'];
    }

    showTasks(player) {
        if (!this.isSabotaged) {
            return (`Tasks for ${player.name}: ${this.tasks.join(', ')}`);
        } else {
            return (`${this.name} is sabotaged.`);
        }
    }
}

module.exports = Cafeteria;



