
const Room = require('./room');

class Hall extends Room {
    constructor() {
        super('Hall');
        this.tasks = ['Fix Wiring', 'Upload Data'];
    }

    showTasks(player) {
        if (!this.isSabotaged) {
            return (`Tasks for ${player.name}: ${this.tasks.join(', ')}`);
        } else {
            return (`${this.name} is sabotaged.`);
        }
    }
}

module.exports = Hall;



