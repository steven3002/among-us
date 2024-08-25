
const Room = require('./room');

class Reactor extends Room {
    constructor() {
        super('Reactor');
        this.tasks = ['Start Reactor', 'Unlock Manifolds'];
    }

    showTasks(player) {
        if (!this.isSabotaged) {
            return (`Tasks for ${player.name}: ${this.tasks.join(', ')}`);
        } else {
            return (`${this.name} is sabotaged.`);
        }
    }
}

module.exports = Reactor;




