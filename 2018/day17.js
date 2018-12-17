
const fs = require('fs');

const [springX, springY] = [500, 0];

function parseRange(r) {
    const match = new RegExp('(x|y)=(\\d+)(\.\.(\\d+))?').exec(r);
    if (match) {
        const result = {
            min: parseInt(match[2]),
            max: parseInt(match[2])
        };
        if (typeof(match[4]) !== 'undefined') {
            result.max = parseInt(match[4]);
        }
        return result
    } else {
        throw new Error('unparseable');
    }
}

function setCell(map, x, y, value) {
    map.grid[y - map.minY][x - map.minX] = value;
}

function getCell(map, x, y) {
    return map.grid[y - map.minY][x - map.minX];
}

function parseInput() {
    const clayAreas = [];

    const input = fs.readFileSync('day17.input.txt', 'utf8').trim().split('\n');
    for (const line of input) {
        const parts = line.split(', ');
        parts.sort(); // makes the 'x' specification appear before the 'y' specifications
        const x = parseRange(parts[0]);
        const y = parseRange(parts[1]);

        const area = {
            minX: x.min,
            maxX: x.max,
            minY: y.min,
            maxY: y.max
        };
        clayAreas.push(area);

        let str;
        if (area.minX === area.maxX) {
            str = `x=${area.minX}, y=${area.minY}..${area.maxY}`;
        } else {
            str = `y=${area.minY}, x=${area.minX}..${area.maxX}`;
        }

        if (str !== line.trim()) {
            throw new Error(`mismatch: input=${line.trim()}, output=${str}`);
        }        
    }

    // Find bounding box of the grid.
    // As any X coordinate is valid, we have to extend the grid by one to the left and the right.
    // Otherwise, the grid's border would function as a wall, preventing water from spilling over.
    const minX = Math.min(...clayAreas.map(a => a.minX), springX) - 1;
    const maxX = Math.max(...clayAreas.map(a => a.maxX), springX) + 1;
    const minY = Math.min(...clayAreas.map(a => a.minY), springY);
    const maxY = Math.max(...clayAreas.map(a => a.maxY), springY);

    // Create grid
    const grid = new Array(maxY - minY + 1).fill().map(_ => new Array(maxX - minX + 1).fill('.'));
    const map = {
        grid,
        minX,
        maxX,
        minY,
        maxY,
        springX,
        springY
    }

    for (const area of clayAreas) {
        for (let y = area.minY; y <= area.maxY; ++y) {
            for (let x = area.minX; x <= area.maxX; ++x) {
                setCell(map, x, y, '#');
            }
        }
    }
    setCell(map, springX, springY, '+');
    
    return map;
}

function printMap(map) {
    console.log(map.grid.map(row => row.join('')).join('\n'), '\n');
}

// Returns whether a square of water can drop straight down.
// Returns false when the bottom of the grid has been reached.
function canDrop(map, x, y) {
    if (y === map.maxY) {
        return false; // bottom of grid
    }

    return getCell(map, x, y + 1) === '.';
}


// Returns whether a square has reached the bottom of the grid.
function hasReachedBottom(map, x, y) {
    return y === map.maxY;
}

function walk(map, x, y, dx, indexes) {
    for (let ix = x; ix >= map.minX && ix <= map.maxX; ix += dx) {
        if (getCell(map, ix, y) === '.') {
            indexes.push(ix);
            const below = getCell(map, ix, y + 1);
            if (below === '.' || below === '|') {
                return;
            }
        } else {
            return;
        }
    }
}

// Returns the range of X coordinates in the same row that are reachable (including the starting position).

function horizontalMovements(map, x, y) {
    // Check to the left.
    const positions = [x];
    walk(map, x - 1, y, -1, positions);
    walk(map, x + 1, y, 1, positions);

    return positions;
}

// Creates one square of water and let it drop as far as possible.
function createSquare(map) {
    let x = map.springX;
    let y = map.springY + 1;

    if (getCell(map, x, y) !== '.') {
        // The grid is full.
        return false;
    }

    // Drop straight down as far as possible.
    while (true) {
        if (hasReachedBottom(map, x, y)) {
            setCell(map, x, y, '|');
            break;
        }

        if (getCell(map, x, y + 1) === '|') {
            // Dropping into the endless abyss.
            setCell(map, x, y, '|');
            return true;
        }

        if (canDrop(map, x, y)) {
            ++y;
        } else {
            // Check the current line for a position where the square can drop.
            const positions = horizontalMovements(map, x, y); 
       
            let foundDropPosition = false;
            for (const ix of positions) {
                if (canDrop(map, ix, y)) {
                    x = ix;
                    foundDropPosition = true;
                    break;
                }
            }
            if (!foundDropPosition) {
                if (positions.some(ix => getCell(map, ix, y + 1) === '|')) {
                    positions.forEach(ix => setCell(map, ix, y, '|'));
                } else {
                    positions.forEach(ix => setCell(map, ix, y, '~'));
                }
                            
                return true;
            }
        }
    }

    return true;
}

// Returns those lines of the grid that are eligible for counting.
function countedLines(map) {
    const firstCountedLine = map.grid.findIndex(row => row.join('').indexOf('#') !== -1);
    const rows = map.grid.slice(firstCountedLine);
    return rows
}

function numReachableByWater(map) {
    return countedLines(map).reduce(
        (sum, row) => {
            return sum + row.filter(cell => cell === '~' || cell === '|').length;
        },
        0
    );
}

function numRetained(map) {
    return countedLines(map).reduce(
        (sum, row) => {
            return sum + row.filter(cell => cell === '~').length;
        },
        0
    ); 
}

map = parseInput();
//printMap(map);
for (let i = 0; ; ++i) {
    const cont = createSquare(map);
    if (!cont) {
        printMap(map);
        console.log(`Aborting after ${i} iterations.`);
        console.log(`${numReachableByWater(map)} squares are reachable by water.`);
        console.log(`${numRetained(map)} squares are retained when the spring dries out.`);
        break;
    }
}

// Correct result:
// 27206 squares are reachable by water.
// 21787 squares are retained when the spring dries out.
