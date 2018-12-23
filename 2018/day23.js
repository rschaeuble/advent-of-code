'use strict';

const fs = require('fs');
const input = fs.readFileSync('day23.input.txt', 'utf8').trim().split('\n');

function parseInput() {
    const bots = [];
    const regexp = new RegExp('pos=<(-?\\d+),(-?\\d+),(-?\\d+)>, r=(\\d+)');
    for (const line of input) {
        const match = regexp.exec(line);
        if (match) {
            bots.push({
                x: parseInt(match[1]),
                y: parseInt(match[2]),
                z: parseInt(match[3]),
                r: parseInt(match[4])
            });
        } else {
            throw new Error(`Line does not match regular expression: ${line}`);
        }
    }

    return bots;
}

function manhattanDistance(x1, y1, z1, x2, y2, z2) {
    return Math.abs(x2 - x1) + Math.abs(y2 - y1) + Math.abs(z2 - z1);
}

function inRangeOfBot(pos, bot) {
    return manhattanDistance(pos.x, pos.y, pos.z, bot.x, bot.y, bot.z) <= bot.r;
}

function strongestBot(bots) {
    return [...bots].sort((a, b) => b.r - a.r)[0];
}

function botsInRangeOfStrongestBot(bots) {
    const strongest = strongestBot(bots);
    return bots.filter(b => inRangeOfBot(b, strongest));
}

function boundingBox(bots) {
    const xValues = bots.map(b => b.x);
    const yValues = bots.map(b => b.y);
    const zValues = bots.map(b => b.z);

    return {
        minX: Math.min(...xValues),
        maxX: Math.max(...xValues),
    
        minY: Math.min(...yValues),
        maxY: Math.max(...yValues),
    
        minZ: Math.min(...zValues),
        maxZ: Math.max(...zValues)
    };
}

function part1() {
    const bots = parseInput();
    console.log(`Part 1: there are ${botsInRangeOfStrongestBot(bots).length} bots in range of the strongest bot.`);
}


part1(); // solution: 906 bots
