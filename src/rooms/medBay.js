
const Room = require('./room');

class Medbay extends Room {
    constructor() {
        super('Medbay');
        this.tasks = ['Submit Scan', 'Inspect Sample'];
    }

    showTasks(player) {
        if (!this.isSabotaged) {
            return (`Tasks for ${player.name}: ${this.tasks.join(', ')}`);
        } else {
            return (`${this.name} is sabotaged.`);
        }
    }
}

module.exports = Medbay;




