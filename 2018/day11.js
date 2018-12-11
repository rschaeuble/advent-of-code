const gridSerial = 1133;

// Precalculate power levels for the whole grid, as multiplication, division and modulo are quite
// expensive when performed millions of times.
const levels = [];
for (let y = 1; y <= 300; ++y) {
    const row = [];
    for (let x = 1; x <= 300; ++x) {
        const rackId = x + 10;
        const powerLevel = Math.floor((rackId * y + gridSerial) * rackId / 100) % 10 - 5;
        row.push(powerLevel);
    }
    levels.push(row);
}

function powerLevel(x, y) {
    return levels[y - 1][x - 1];
}

function gridPowerLevel(x, y, size) {
    let sum = 0;
    for (let ix = x; ix < x + size; ++ix) {
        for (let iy = y; iy < y + size; ++iy) {
            sum += powerLevel(ix, iy);
        }
    }
    return sum;
}

function maxPowerLevelForSize(size) {
    let maxX = 0;
    let maxY = 0;
    let maxPw = 0;

    for (let x = 1; x <= 300 - size + 1; ++x) {
        for (let y = 1; y <= 300 - size + 1; ++y) {
            const pw = gridPowerLevel(x, y, size);
            if (pw > maxPw) {
                maxX = x;
                maxY = y;
                maxPw = pw;
            }
        }
    }

    return [[maxX, maxY], maxPw];
}

function maxPowerLevel() {
    let maxX = 0;
    let maxY = 0;
    let maxPw = 0;
    let maxSize = 0;

    for (let i = 1; i <= 300; ++i) {
        console.log(i);
        const [coords, pw] = maxPowerLevelForSize(i);
        if (pw > maxPw) {
            [maxX, maxY] = coords;
            maxPw = pw;
            maxSize = i;
        }
    }

    return [[maxX, maxY], maxSize];
}


function maxPowerLevelForCoords(x, y) {
    let maxSum = 0;
    let maxSize = 0;

    const largestSize = 300 - Math.max(x, y) + 1;
    let sum = 0;

    for (let size = 1; size <= largestSize; ++size) { 
        const leftX = x;
        const rightX = x + size - 1;
        const topY = y;
        const bottomY = y + size - 1; 

        // Walk down the right border of the grid.
        for (let iy = topY; iy <= bottomY; ++iy) {
            sum += powerLevel(rightX, iy);
        }        

        // Bottom border of grid; ignore bottom right corner,
        // as that is already included in the right border.
        iy = y + size - 1;
        for (let ix = leftX; ix < rightX; ++ix) {
            sum += powerLevel(ix, bottomY);
        } 

        if (sum > maxSum) {
            maxSize = size;
            maxSum = sum;
        }
    }

    return [maxSize, maxSum];
}

function maxPowerLevel2() {
    let maxX = 0;
    let maxY = 0;
    let maxSize = 0;
    let maxPw = 0;

    for (let x = 1; x <= 300; ++x) {
        for (let y = 1; y <= 300; ++y) {
            const [size, pw] = maxPowerLevelForCoords(x, y);
            if (pw > maxPw) {
                maxX = x;
                maxY = y;
                maxSize = size;
                maxPw = pw;
            }
        }
    }

    return [[maxX, maxY], maxSize, maxPw];    
}


// Part 1
console.log("Part 1:", maxPowerLevelForSize(3));

// Part 2
console.log("Part 2:", maxPowerLevel2());
