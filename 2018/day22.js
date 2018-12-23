'use strict';

const depth = 4845;
const target = [6, 770];

// const depth = 510;
// const target = [10, 10];

const CLIMBING_GEAR = 'climbing gear';
const TORCH = 'torch';
const NEITHER = 'neither';

// Initializes the map. The geological index of all cells is set to 0.
function createMap(width, height) {
    const rows = height;
    const cols = width
    return {
        rows,
        cols,
        grid:  new Array(rows).fill().map(_ => new Array(cols).fill())
    };
}

function erosionLevel(geoIndex, depth) {
    return (geoIndex + depth) % 20183;
}

function regionType(erosionLevel) {
    switch (erosionLevel % 3) {
        case 0: return '.';
        case 1: return '=';
        case 2: return '|';
    }
}

function calcErosionLevelMap(map, depth, target) {
    // The mouth of the cave.
    map.grid[0][0] = erosionLevel(0, depth);

    // Fill top border.
    for (let x = 1; x < map.cols; ++x) {
        map.grid[0][x] = erosionLevel(x * 16807, depth);
    }

    // Fill left border;
    for (let y = 1; y < map.rows; ++y) {
        map.grid[y][0] = erosionLevel(y * 48271, depth);
    }

    // Now that the borders have been set, the grid can be filled either row by row
    // or column by column. Here the row-by-row approach is taken.
    for (let y = 1; y < map.rows; ++y) {
        for (let x = 1; x < map.cols; ++x) {
            let erosion;
            if (x === target[0] && y === target[1]) {
                erosion = 0;
            } else {
                erosion = erosionLevel(map.grid[y][x - 1] * map.grid[y - 1][x], depth);
            }
            map.grid[y][x] = erosion;
        }
    }
}

function createRegionTypeMap(erosionLevelMap) {
    const grid = erosionLevelMap.grid.map(row => row.map(cell => regionType(cell)));

    return {
        rows: erosionLevelMap.rows,
        cols: erosionLevelMap.cols,
        grid
    };
}

function riskLevel(regionType) {
    switch (regionType) {
        case '.': return 0;
        case '=': return 1;
        case '|': return 2;
        default: throw new Error(`unknown region type: '${regionType}'`);
    }
}

function riskLevelOfMap(regionTypeMap) {
    let risk = 0;
    regionTypeMap.grid.forEach(row => {
        row.forEach(cell => risk += riskLevel(cell));
    });
    return risk;
}

function print(map) {
    console.log(map.grid.map(row => row.join('')).join('\n'));
}

function toolsForRegion(regionType) {
    switch (regionType) {
        case '.': return [CLIMBING_GEAR, TORCH];
        case '=': return [CLIMBING_GEAR, NEITHER];
        case '|': return [TORCH, NEITHER];
        default: throw new Error(`unknown region type: '${regionType}'`);
    }
}

function adjacentCells(map, x, y) {
    const cells = [];

    if (x > 0) {
        cells.push([x - 1, y]);
    }
    if (y > 0) {
        cells.push([x, y - 1]);
    }

    if (x < map.cols - 1) {
        cells.push([x + 1, y]);
    }
    if (y < map.rows - 1) {
        cells.push([x, y + 1]);
    }

    return cells;
}

function coordString(x, y) {
    return `${x}-${y}`;
}

function manhattanDistance(x1, y1, x2, y2) {
    return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}

function distance(x1, y1, x2, y2) {
    if (x1 < x2 && y1 < y2) {
        return 0;
    } else {
        return Math.abs(x2 - x1) + Math.abs(y2 - y1);;
    }
}

function allowedTools(allowedThisNode, allowedNextNode) {
    return allowedNextNode.filter(a => allowedThisNode.indexOf(a) !== -1);
}

// Finds the route to the target, starting at (0, 0).
function findRoute(map, target) {
    const startNode = {
        x: 0,
        y: 0,
        times: new Map([[TORCH, 0]])
    };
    const allNodes = new Map();
    allNodes.set(coordString(0, 0), startNode);

    let curGen = [startNode];
    const nextGen = new Set();

    let timeToTarget = -1;

    while (curGen.length > 0) {
        for (const node of curGen) {
            if (node.x === target[0] && node.y === target[1]) {

                // Get the best time to the target node, taking into consideration that if we arrive without a torch,
                // we first have to change to it.
                const nodeTimes = [...node.times.entries()].map(([tool, time]) => (tool === TORCH ? time : time + 7));
                const nodeMinTime = Math.min(...nodeTimes);

                //console.log('Arriving at target; min time: ', nodeMinTime);

                if (timeToTarget === -1 || timeToTarget > nodeMinTime) {
                    timeToTarget = nodeMinTime;
                }

                continue;
            }
            const toolsForThisRegion = toolsForRegion(map.grid[node.y][node.x]);

            const adjacent = adjacentCells(map, node.x, node.y);
            for (const nextCoords of adjacent) {
                let nextNode = allNodes.get(coordString(nextCoords[0], nextCoords[1]));
                if (!nextNode) {
                    nextNode = {x: nextCoords[0], y: nextCoords[1], times: new Map() };
                    allNodes.set(coordString(nextCoords[0], nextCoords[1]), nextNode);
                }

                const tools = allowedTools(toolsForThisRegion, toolsForRegion(map.grid[nextNode.y][nextNode.x]));
                for (const nextTool of tools) {
                    for (const currentTool of node.times.keys()) {
                        const timeCost = 1 + ((currentTool === nextTool) ? 0 : 7);
                        const timeToNextNode = node.times.get(currentTool) + timeCost;

                        if (timeToTarget !== -1 && timeToNextNode > timeToTarget) {
                            continue;
                        }

                        if (!nextNode.times.has(nextTool) || nextNode.times.get(nextTool) > timeToNextNode) {
                            nextNode.times.set(nextTool, timeToNextNode);
                            nextGen.add(nextNode);
                        }
                    }
                }
            }
        }

        curGen = [...nextGen.values()];
        nextGen.clear();
    }

    console.log(`Part 2: time to target: ${timeToTarget} minutes.`);
}

function part1() {
    const geoMap = createMap(target[0] + 1, target[1] + 1);
    calcErosionLevelMap(geoMap, depth, target);

    const regionTypeMap = createRegionTypeMap(geoMap, depth);
    console.log(`Part 1: risk level is ${riskLevelOfMap(regionTypeMap)}`);
}

function part2() {
    const geoMap = createMap(depth, 5 * target[1]); // should be large enough
    calcErosionLevelMap(geoMap, depth, target);
    const regionTypeMap = createRegionTypeMap(geoMap, depth);
  
    findRoute(regionTypeMap, target);
}

part1(); // solution: 5400
part2(); // solution: 1048
