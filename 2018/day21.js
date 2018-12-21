// Based on day 19.

const fs = require('fs');

const ops = new Map();

function define(mnemonic, fn, formatter) {
  ops.set(mnemonic, {
    fn,
    formatter
  });
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
for (const line of fs.readFileSync('day21.input.txt', 'utf8').trim().split('\n')) {
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

    switch (ip) {
      case 17:
        console.log(`>>> r4 = ${regs[4]}`);
        break;
      case 27:
        console.log(`<<< r4 = ${regs[4]}`);
        break;
    }

    const formatter = ops.get(instruction[0]).formatter;
    //console.log(`${ip}: ${formatter(instruction[1], instruction[2], instruction[3])}`);

    const fn = ops.get(instruction[0]).fn;
    fn(instruction[1], instruction[2], instruction[3], regs);


    ip = regs[ipReg] + 1;
  }

  console.log(`Final register values: [${regs.join(', ')}].`);
}

//dump(instructions);
//execute(instructions, 1);

function part1() {
  let r5 = 0

  let r4 = r5 | 0x10000
  r5 = 0xCAB363

  do {
    let r3 = r4 & 0xFF
    r5 = r5 + r3
    r5 = r5 & 0xFFFFFF
    r5 = r5 * 0x1016B
    r5 = r5 & 0xFFFFFF

    r4 = Math.floor(r4 / 256);
  } while (r4 > 0);

  console.log(`Part 1: ${r5}`);
}

function part2() {
  const values = [];

  let r5 = 0
  do {
    let r4 = r5 | 0x10000
    r5 = 0xCAB363

    do {
      let r3 = r4 & 0xFF
      r5 = r5 + r3
      r5 = r5 & 0xFFFFFF
      r5 = r5 * 0x1016B
      r5 = r5 & 0xFFFFFF

      r4 = Math.floor(r4 / 256);
    } while (r4 > 0)

    if (values.indexOf(r5) !== -1) {
      // Cycle detected.
      // The last value already in the array is the one that
      // takes the most iterations to reach.
      console.log(`Part 2: ${values[values.length - 1]}`);
      return;
    }
    values.push(r5);
  } while (true)
}

part1(); // answer: 7224964
part2();
