//www.codewars.be/game

// x+ -> right
// x- -> left
// y+ -> down
// y- -> up
const env = require('env2')('.env');

let controls = {
    direction: {
        up: false,
        down: false,
        left: false,
        right: false
    },
    shooting: true,
    running: false
};

let _lastUpdate = Date.now();
const _changeDuration = 1000;

const getDistance = (myCoords, otherCoords) => {
    let xdiff = Math.abs(myCoords.x - otherCoords.x);
    let ydiff = Math.abs(myCoords.y - otherCoords.y);
    return {
        x: xdiff,
        y: ydiff
    };
}

const resetDirections = () => {
    controls.direction.up = false;
    controls.direction.down = false;
    controls.direction.left = false;
    controls.direction.right = false;
}

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
};


let lastCoords = {
    x: 0,
    y: 0
};
let stuckCoords = [];

const update = (state) => {
    if (_lastUpdate + _changeDuration <= Date.now()) {
        let myCoords;
        //Find my bot
        state.bots.forEach(element => {
            if (element.id === process.env.BOT_ID) {
                myCoords = element.coordinates;
            }
        });
        let nearestPowerup = undefined;
        let nearestDiff = undefined;
        // Go to nearest powerup
        // TODO fix bot going left-right/up-down when near a powerup
        state.powerups.forEach(element => {
            if (!element.taken) {
                if (nearestPowerup === undefined) {
                    nearestPowerup = element;
                    nearestDiff = getDistance(myCoords, element.coordinates);
                } else {
                    let coordinates = element.coordinates;
                    let coordsDiff = getDistance(myCoords, coordinates);
                    if ((nearestDiff.x + nearestDiff.y) > (coordsDiff.x + coordsDiff.y)) {
                        nearestDiff = coordsDiff;
                        nearestPowerup = element;
                    }
                }
            }
        });
        resetDirections();
        let nearestCoords = nearestPowerup.coordinates;
        //console.log(myCoords);
        if (lastCoords.x === myCoords.x && lastCoords.y === myCoords.y) {
            // TODO fix duplicate coordinates
            if (!stuckCoords.includes(myCoords))
                stuckCoords.push(myCoords);
            console.log(stuckCoords);
            switch (getRandomInt(0, 4)) {
                case 0:
                    controls.direction.up = true;
                    break;
                case 1:
                    controls.direction.right = true;
                    break;
                case 2:
                    controls.direction.down = true;
                    break;
                case 3:
                    controls.direction.left = true;
                    break;
                default:
                    break;
            }
        } else {
            if (nearestDiff.x <= 7) {
                if (nearestCoords.y < myCoords.y) {
                    controls.direction.up = true;
                } else controls.direction.down = true;
            } else {
                if (nearestCoords.x < myCoords.x) {
                    controls.direction.left = true;
                } else controls.direction.right = true;
            }
        }

        console.log(myCoords);

        lastCoords = myCoords;
        controls.running = true;
        _lastUpdate = Date.now()
    }
    return controls;
};

require('cw-node-wrapper')({
    environment: 'codewars.be',
    botId: process.env.BOT_ID,
    botSecret: process.env.BOT_SECRET,
    update,
    events: {
        state: () => false,
        map: () => false,
        bots: () => false,
        activity: () => false
    }
});