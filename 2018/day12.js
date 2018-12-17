const initialStateInput = '###..#...####.#..###.....####.######.....##.#####.##.##..###....#....##...##...##.#..###..#.#...#..#';
const rulesInput = `
.###. => .
..#.. => .
.#### => .
.##.. => #
#.#.# => .
..#.# => #
#.##. => #
#...# => #
..... => .
##..# => #
.#.#. => .
..##. => #
##.#. => .
###.. => .
.#... => #
..### => .
#..## => .
...#. => .
###.# => #
.##.# => .
.#.## => .
....# => .
##### => .
#.#.. => #
...## => #
#.... => .
#.### => #
##... => #
.#..# => .
####. => .
#..#. => #
##.## => #
`;

// Parse rules.
const rules = new Map();
for (const ruleStr of rulesInput.split('\n')) {
    if (ruleStr.length === 0) {
        continue;
    }

    const pattern = ruleStr.substring(0, 5);
    const newValue = ruleStr.substring(9);
    rules.set(pattern, newValue);
}

const border = 1000; // should be enough for plants to spread
const initialState = [...new Array(border).fill('.'), ...initialStateInput.split(''), ...new Array(border).fill('.')];


function iterate(state) {
    const newState = [...state];

    for (let i = 2; i < newState.length - 2; ++i) {
        const areaToCheck = state.slice(i - 2, i + 3).join('');
        newState[i] = rules.get(areaToCheck) || '.';
    }

    return newState;
}

function value(state) {
    let sum = 0;
    for (let i = 0; i < state.length; ++i) {
        if (state[i] === '#') {
            sum += i - border;
        }
    }
    return sum;
}

function print(generation, state) {
    console.log(`${generation}:`, state.join(''), `(${value(state)})`);
}

function part1() {
    let state = initialState;

    // print(0, state);
    for (let i = 1; i <= 20; ++i) {
        state = iterate(state);
        // print(i, state);
    }

    console.log(`Part 1: value=${value(state)}`);
}

function part2() {
    let state = initialState;
    const values = [0];
    const diffs = [0];    

    for (let i = 1; ; ++i) {
        state = iterate(state);

        // Calculate value of current state, and the difference to the previous state.
        const v = value(state);
        const diff = v - values[values.length - 1];

        // If the last 5 diffs are identical, it seems the pattern has stablizised.
        if (diffs.slice(diffs.length - 5).every(d => d === diff)) {       
            const remainingIterations = 50 * 1000 * 1000 * 1000 - i;
            const finalValue = v + remainingIterations * diff;
            console.log(`Part 2: pattern has stabilized after ${i} iterations (diff=${diff}); final value: ${finalValue}`);
            break;
        }

        values.push(v);
        diffs.push(diff);
    }
}

part1();
part2();
