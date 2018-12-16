const fs = require('fs');

function parseTests() {
    const input = fs.readFileSync('day16-1.input.txt', 'utf8').trim();
    const tests = [];
    let before, instruction, after;

    for (let line of input.split('\n')) {
        line = line.trim();
        if (line.length === 0) {
            continue;
        }
    
        if (line.startsWith('Before')) {
            before = line.substring(9, line.length - 1).split(' ').map(c => parseInt(c));
        } else if (line.startsWith('After')) {
            after = line.substring(9, line.length - 1).split(' ').map(c => parseInt(c));
            tests.push({ before, instruction, after});
        } else {
            instruction = line.split(' ').map(c => parseInt(c));
        }
    }  
    
    return tests;
}

function parseInstructions() {
    const input = fs.readFileSync('day16-2.input.txt', 'utf8').trim();

    const instructions = [];
    for (const line of input.split('\n')) {
        if (line.length === 0) { 
            continue;
        }
        instructions.push(line.split(' ').map(x => parseInt(x)));
    }

    return instructions;
}


function addr(a, b, c, regs) {
    regs[c] = regs[a] + regs[b];
}

function addi(a, b, c, regs) {
    regs[c] = regs[a] + b;
}

function mulr(a, b, c, regs) {
    regs[c] = regs[a] * regs[b];
}

function muli(a, b, c, regs) {
    regs[c] = regs[a] * b;
}

function banr(a, b, c, regs) {
    regs[c] = regs[a] & regs[b];
}

function bani(a, b, c, regs) {
    regs[c] = regs[a] & b;
}

function borr(a, b, c, regs) {
    regs[c] = regs[a] | regs[b];
}

function bori(a, b, c, regs) {
    regs[c] = regs[a] | b;
}

function setr(a, b, c, regs) {
    regs[c] = regs[a];
}

function seti(a, b, c, regs) {
    regs[c] = a;
}

function gtir(a, b, c, regs) {
    regs[c] = (a > regs[b]) ? 1 : 0;
}

function gtri(a, b, c, regs) {
    regs[c] = (regs[a] > b) ? 1 : 0;
}

function gtrr(a, b, c, regs) {
    regs[c] = (regs[a] > regs[b]) ? 1 : 0;
}

function eqir(a, b, c, regs) {
    regs[c] = (a === regs[b]) ? 1 : 0;
}

function eqri(a, b, c, regs) {
    regs[c] = (regs[a] === b) ? 1 : 0;
}

function eqrr(a, b, c, regs) {
    regs[c] = (regs[a] === regs[b]) ? 1 : 0;
}

const ops = [
    addr,
    addi,
    mulr,
    muli,
    banr,
    bani,
    borr,
    bori,
    setr,
    seti,
    gtir,
    gtri,
    gtrr,
    eqir,
    eqri,
    eqrr
];

function arraysEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}

function matchingOps(before, instruction, after, ops) {
    return ops.filter(op => {
        const regs = [...before];
        op(instruction[1], instruction[2], instruction[3], regs);
        return arraysEqual(regs, after);
    });
}

function part1() {
    let counter = 0;
    const tests = parseTests();
    for (const test of tests) {
        const matching = matchingOps(test.before, test.instruction, test.after, ops);
        if (matching.length >= 3) {
            ++counter;
        }
    }

    console.log(`Part 1: ${counter} samples (of ${tests.length}) behave like three or more opcodes.`);
}

function findOpCodeMapping() {
    // For each op code, stores a map <fn> -> <number of matches>.
    const opFnsByCode = new Map();

    const tests = parseTests();
    for (const test of tests) {
        const opcode = test.instruction[0];
        const matching = matchingOps(test.before, test.instruction, test.after, ops);
        for (const match of matching) {
            let fnsForCode = opFnsByCode.get(opcode);
            if (!fnsForCode) {
                fnsForCode = new Map();
                opFnsByCode.set(opcode, fnsForCode);
            }
            fnsForCode.set(match, (fnsForCode.get(match) || 0) + 1);
        }
    }

    // Find the mapping of opcode to function.
    const opcodeToFn = new Map();
    while (opFnsByCode.size > 0) {
        let foundMapping = false;

        for (const [opcode, fns] of opFnsByCode) {
            let fn = null;

            if (fns.size === 1) {
                // Exact match.
                fn = [...fns.keys()][0];
            }

            if (fn) {
                opcodeToFn.set(opcode, fn);
                opFnsByCode.delete(opcode);
                opFnsByCode.forEach(value => value.delete(fn));
                foundMapping = true;
            }            
        }

        if (!foundMapping) {
            throw new Error('No further mappig found during iteration -> problem not solvable.');
        }
    }

    return opcodeToFn;
}

function part2() {
    const ops = findOpCodeMapping();
    const instructions = parseInstructions();
    const regs = [0, 0, 0, 0];

    for (const instruction of instructions) {
        const opFn = ops.get(instruction[0]);
        opFn(instruction[1], instruction[2], instruction[3], regs);
    }


    console.log(`Part 2: register 0 contains value ${regs[0]}.`);
}

// Answer: 605
part1();

// Answer: 653
part2();

//681