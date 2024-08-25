const Room = require('./room');

class EngineRoom extends Room {
    constructor() {
        super('Engine Room');
        this.tasks = ['Align Engine Output'];
    }

    showTasks(player) {
        if (!this.isSabotaged) {
            return (`Tasks for ${player.name}: ${this.tasks.join(', ')}`);
        } else {
            return (`${this.name} is sabotaged. `);
        }
    }
}

module.exports = EngineRoom;


