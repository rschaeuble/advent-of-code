const fs = require('fs');

const ops = new Map();

function define(mnemonic, fn, formatter) {
    ops.set(mnemonic, {fn, formatter});
}

define(
    'addr',
    (a, b, c, regs) => regs[c] = regs[a] + regs[b],
    (a, b, c) => `r${c} = r${a} + r${b}`
);
define(
    'addi',
    (a, b, c, regs) => regs[c] = regs[a] + b,
    (a, b, c) => `r${c} = r${a} + ${b}`
);
define(
    'mulr',
    (a, b, c, regs) => regs[c] = regs[a] * regs[b],
    (a, b, c) => `r${c} = r${a} * r${b}`
);
define(
    'muli',
    (a, b, c, regs) => regs[c] = regs[a] * b,
    (a, b, c) => `r${c} = r${a} * ${b}`
);

define(
    'banr',
    (a, b, c, regs) => regs[c] = regs[a] & regs[b],
    (a, b, c) => `r${c} = r${a} & r${b}`
);
define(
    'bani',
    (a, b, c, regs) => regs[c] = regs[a] & b,
    (a, b, c) => `r${c} = r${a} & ${b}`
);

define(
    'borr',
    (a, b, c, regs) => regs[c] = regs[a] | regs[b],
    (a, b, c) => `r${c} = r${a} | r${b}`
);
define(
    'bori',
    (a, b, c, regs) => regs[c] = regs[a] | b,
    (a, b, c) => `r${c} = r${a} | ${b}`
);

define(
    'setr',
    (a, b, c, regs) => regs[c] = regs[a],
    (a, b, c) => `r${c} = r${a}`
);
define(
    'seti',
    (a, b, c, regs) => regs[c] = a,
    (a, b, c) => `r${c} = ${a}`
);

define(
    'gtir',
    (a, b, c, regs) => regs[c] = (a > regs[b]) ? 1 : 0,
    (a, b, c) => `r${c} = (${a} > r${b}) ? 1 : 0`
);
define(
    'gtri',
    (a, b, c, regs) => regs[c] = (regs[a] > b) ? 1 : 0,
    (a, b, c) => `r${c} = (r${a} > ${b}) ? 1 : 0`
);
define(
    'gtrr',
    (a, b, c, regs) => regs[c] = (regs[a] > regs[b]) ? 1 : 0,
    (a, b, c) => `r${c} = (r${a} > r${b}) ? 1 : 0`
);

define(
    'eqir',
    (a, b, c, regs) => regs[c] = (a === regs[b]) ? 1 : 0,
    (a, b, c) => `r${c} = (${a} === r${b}) ? 1 : 0`
);
define(
    'eqri',
    (a, b, c, regs) => regs[c] = (regs[a] === b) ? 1 : 0,
    (a, b, c) => `r${c} = (r${a} === ${b}) ? 1 : 0`
);
define(
    'eqrr',
    (a, b, c, regs) => regs[c] = (regs[a] === regs[b]) ? 1 : 0,
    (a, b, c) => `r${c} = (r${a} === r${b}) ? 1 : 0`
);


const instructions = [];
let ipReg = 0;
for (const line of fs.readFileSync('day19.input.txt', 'utf8').trim().split('\n')) {
    if (line.startsWith('#ip ')) {
        ipReg = parseInt(line.substring(4));
        continue;
    }

    const parts = line.split(' ');
    instructions.push([parts[0], parseInt(parts[1]), parseInt(parts[2]), parseInt(parts[3])]);
}

function dump(instructions) {
    let ip = 0;

    for (instruction of instructions) {
        const formatter = ops.get(instruction[0]).formatter;
        console.log(`${ip}: ${formatter(instruction[1], instruction[2], instruction[3])}`);
        ++ip;
    }
}

function execute(instructions, r0) {
    let ip = 0;
    const regs = [r0, 0, 0, 0, 0, 0];

    while (ip < instructions.length) {
        regs[ipReg] = ip;
        const instruction = instructions[ip];
        
        const formatter = ops.get(instruction[0]).formatter;
        console.log(`${ip}: ${formatter(instruction[1], instruction[2], instruction[3])}`);

        const fn = ops.get(instruction[0]).fn;
        fn(instruction[1], instruction[2], instruction[3], regs);
        console.log(regs);
        //console.log();

        ip = regs[ipReg] + 1;
        if (ip > 34) return;
    }

    console.log(`Final register values: [${regs.join(', ')}].`);
}

//dump(instructions);
execute(instructions, 1);

// Part 1: 1256
// Part 2: 16137576


function algorithm(input) {
    let r0 = 0;
    for (r3 = 1; r3 <= input; ++r3) {
        const r2 = input / r3;
        if (r2 === Math.floor(r2)) {
            r0 = r0 + r3;
        }
    }
    return r0;
}
//console.log(algorithm(10551339));
