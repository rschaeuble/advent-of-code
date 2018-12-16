const fs = require('fs');
const input = fs.readFileSync('day13.input.txt', 'utf8');

const inputGrid = [];

for (const line of input.split('\n')) {
    if (line.length === 0) {
        continue;
    }

    inputGrid.push(line.split(''));
}

function parseInputGrid(ig) {
    const sy = ig.length;
    const sx = Math.max(...ig.map(row => row.length));
    const grid = new Array(sy).fill().map(_ => new Array(sx).fill(' '));

    const carts = [];

    let y = 0;
    for (const row of ig) {
        let x = 0;
        for (const cell of row) {
            // Extract carts.

            let gridEntry;
            switch (cell) {
                case '^':
                    gridEntry = '|';
                    carts.push({x, y, dir: cell, nextTurn: 90});
                    break;
                case 'v':
                    gridEntry = '|';
                    carts.push({x, y, dir: cell, nextTurn: 90});
                    break;
                case '<':
                    gridEntry = '-'; 
                    carts.push({x, y, dir: cell, nextTurn: 90});
                    break;
                case '>':
                    gridEntry = '-';
                    carts.push({x, y, dir: cell, nextTurn: 90});
                    break;
                default:
                    gridEntry = cell;
                    break;
            }

            grid[y][x] = gridEntry;

            ++x;
        }

        ++y;
    }

    return {
        grid,
        carts
    };
}

function dirToDegrees(dir) {
    switch (dir) {
        case '>': return 0;
        case '^': return 90;
        case '<': return 180;
        case 'v': return 270;
        default: throw new Error(`invalid input: ${dir}`)
    }
}

function degreesToDir(deg) {
    while (deg < 0) {
        deg += 360;
    }
    switch (deg % 360) {
        case 0: return '>';
        case 90: return '^';
        case 180: return '<';
        case 270: return 'v';
        default: throw new Error(`invalid input: ${deg}`);
    }
}

// Calculates the next coordinate a cart will move to.
function nextCoord(cart) {
    let dx, dy;

    switch (cart.dir) {
        case '^': [dx, dy] = [0, -1]; break;
        case 'v': [dx, dy] = [0, 1]; break;
        case '<': [dx, dy] = [-1, 0]; break;
        case '>': [dx, dy] = [1, 0]; break;
        default: throw new Error(`unknown direction: ${cart.dir}`);
    }

    return [cart.x + dx, cart.y + dy];
}

// Calculates the next direction a cart will take at an intersection, based on the current decision it would take.
function rotateDirection(dir) {
    switch (dir) {
        // left
        case 90: return 0;
        
        // straight
        case 0: return -90;

        // right
        case -90: return 90;
    }
}

function moveCart(cart, grid) {
    const [nextX, nextY] = nextCoord(cart);
    const nextCell = grid[nextY][nextX];

    // Update cart's direction.
    switch (nextCell) {
        case '|':
        case '-':
            // just continue;
            break;

        case '/': 
            switch (cart.dir) {
                case '^': cart.dir = '>'; break;
                case 'v': cart.dir = '<'; break;
                case '<': cart.dir = 'v'; break;
                case '>': cart.dir = '^'; break;
            }
            break;
        

        case '\\':
            switch (cart.dir) {
                case '^': cart.dir = '<'; break;
                case 'v': cart.dir = '>'; break;
                case '<': cart.dir = '^'; break;
                case '>': cart.dir = 'v'; break;
            }
            break;
            
        case '+':
            cart.dir = degreesToDir(dirToDegrees(cart.dir) + cart.nextTurn);
            cart.nextTurn = rotateDirection(cart.nextTurn);
            break;            

        default:
            throw new Error(`unknown cell content: ${nextCell}`);
    }

    // Update cart's position.
    cart.x = nextX;
    cart.y = nextY;
}

function crashingCarts(carts) {
    if (carts.length < 2) {
        return [];
    }

    const cartsByCoord = new Map();

    for (const cart of carts) {
        const coordsString = `${cart.x}-${cart.y}`;
        if (cartsByCoord.has(coordsString)) {
            cartsByCoord.get(coordsString).push(cart);
        } else {
            cartsByCoord.set(coordsString, [cart]);
        }
    }

    return [...cartsByCoord.values()]
        .filter(e => e.length > 1)
        .reduce((a, b) => a.concat(b), []);
}

function tick(state, continueOnCrash = false) {
    // Sort carts
    const carts = state.carts.sort((a, b) => a.x - b.x).sort((a, b) => a.y - b.y);

    for (const cart of carts) {
        moveCart(cart, state.grid);

        const crashing = crashingCarts(carts);
        if (crashing.length > 0) {
            if (!continueOnCrash) {
                console.log(`Crash at ${crashing[0].x},${crashing[0].y}.`);
                return false;
            } else {
                // Remove crashing carts.
                state.carts = state.carts.filter(cart => crashing.indexOf(cart) === -1);
            }
        }
    }

    if (state.carts.length === 1) {
        console.log(`Last remaining cart is at position ${state.carts[0].x},${state.carts[0].y}.`);
        return false;
    }

    return true;
}

function printState(state) {
    const grid = state.grid.map((row, y) =>
        row.map((cell, x) => {
            const cart = state.carts.find(cart => cart.x === x && cart.y === y);
            return cart ? cart.dir : cell;
        })
    );
    console.log(grid.map(row => row.join('')).join('\n'));
}

function run(continueOnCrash = false) {
    state = parseInputGrid(inputGrid);
    //printState(state);

    for (let iteration = 1; ;++iteration) {
        //console.log(`Iteration ${iteration}:`);
        if (!tick(state, continueOnCrash)) {
            console.log(`Stopping after iteration ${iteration}.`);
            break;
        }
        //printState(state);
        //if (iteration ==5) break;
    }
}

console.log('Part 1:');
run(false); // expected answer: crash at 2,0

console.log('\nPart2:');
run(true); // expected answer: last remaining cart is at position 50,100.