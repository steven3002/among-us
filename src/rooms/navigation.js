
const Room = require('./room');

class Navigation extends Room {
    constructor() {
        super('Navigation');
        this.tasks = ['Chart Course', 'Stabilize Steering'];
    }

    showTasks(player) {
        if (!this.isSabotaged) {
            return (`Tasks for ${player.name}: ${this.tasks.join(', ')}`);
        } else {
            return (`${this.name} is sabotaged.`);
        }
    }
}

module.exports = Navigation;




