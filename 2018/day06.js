const input = `
61, 90
199, 205
170, 60
235, 312
121, 290
62, 191
289, 130
131, 188
259, 82
177, 97
205, 47
302, 247
94, 355
340, 75
315, 128
337, 351
73, 244
273, 103
306, 239
261, 198
355, 94
322, 69
308, 333
123, 63
218, 44
278, 288
172, 202
286, 172
141, 193
72, 316
84, 121
106, 46
349, 77
358, 66
309, 234
289, 268
173, 154
338, 57
316, 95
300, 279
95, 285
68, 201
77, 117
313, 297
259, 97
270, 318
338, 149
273, 120
229, 262
270, 136
`;

function distance(x, y, coord) {
    return Math.abs(x - coord.x) + Math.abs(y - coord.y);
}

function distances(x, y, coordinates) {
    return coordinates.map(c => ({ id: c.id, distance: distance(x, y, c)}));
}

const coordinates = [];
let id = 0;
for (line of input.split('\n')) {
    if (line.length === 0) {
        continue;
    }
    const [x, y] = line.split(', ');
    coordinates.push({ id: ++id, x: parseInt(x), y: parseInt(y)});
}

// Find bounding box of coordinates.
const xCoords = coordinates.map(c => c.x);
const yCoords = coordinates.map(c => c.y);
const xMin = Math.min(...xCoords);
const yMin = Math.min(...yCoords);
const xMax = Math.max(...xCoords);
const yMax = Math.max(...yCoords);
const width = xMax - xMin + 1;
const height = yMax - yMin + 1;
console.log(`Bounding box: (${xMin}, ${yMin}) to (${xMax}, ${yMax})`);

function part1() {
    // Build grid with closest coordinates.
    const grid = new Array(width).fill().map(_ => new Array(height).fill('.'));

    // For each square in the grid, mark the closest coordinate.
    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            const nearest = distances(x + xMin, y + yMin, coordinates).sort((a, b) => a.distance - b.distance);
            if (nearest[0].distance != nearest[1].distance) {
                grid[x][y] = nearest[0].id
            }
        }
    }

    // Count how often each letter appears in the grid
    const appearances = {};
    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            const nearest = grid[x][y];
            if (nearest !== '.') {
                appearances[nearest] = (appearances[nearest] || 0) + 1;
            }
        }
    }

    // Remove infinite areas.
    // Each area that touches the border of the grid is infinite.
    for (let x = 0; x < width; ++x) {
        delete appearances[grid[x][0]];
        delete appearances[grid[x][height - 1]];
    }
    for (let y = 0; y < height; ++y) {
        delete appearances[grid[0][y]];
        delete appearances[grid[width - 1][y]];
    }

    const largestAreaSize = Object.values(appearances).sort((a, b) => b - a)[0];
    console.log(`The largest area has a size of ${largestAreaSize} fields.`);
}

function part2() {
    function distanceSum(x, y, coordinates) {
        return coordinates.reduce((prev, cur) => prev + distance(x, y, cur), 0);
    }

    function inArea(x, y, coordinates) {
        return distanceSum(x, y, coordinates) < 10000;
    }

    // From the middle of the bounding box, go out in circles (well, squares, actually).
    // As long as at least one field per iteration is within the maximum distance, continue.
    const centerX = Math.floor((xMax - xMin) / 2);
    const centerY = Math.floor((yMax - yMin) / 2);
    let dist = 0;
    let counter = 0;
    do {
        let newFields = 0;

        // Check top and bottom edge of the square.
        for (let x = centerX - dist; x <= centerX + dist; ++x) {
            if (inArea(x, centerY - dist, coordinates)) {
                ++newFields;
            }
            if (dist > 0) {
                if (inArea(x, centerY + dist, coordinates)) {
                    ++newFields;
                }
            }
        }

        // Check left and right edge of the square.
        for (let y = centerY - dist + 1; y <= centerY + dist - 1; ++y) {
            if (inArea(centerX - dist, y, coordinates)) {
                ++newFields;
            }            
            if (dist > 0) {
                if (inArea(centerX + dist, y, coordinates)) {
                    ++newFields;
                } 
            }            
        }

        if (newFields === 0) {
            break;
        }
        
        counter += newFields
        ++dist;
    } while (true);
    console.log(`Area is ${counter} fields large.`);
}

part1();
part2();
