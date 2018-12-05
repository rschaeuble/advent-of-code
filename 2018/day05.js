const fs = require('fs');
const input = fs.readFileSync('day05.input.txt', 'utf8').trim();

function process(polymer) {
    // This buffer holds the processed polymer. It's maximum length is the length of the input.
    const result = new Array(polymer.length);

    // The position in the result buffer where the last unit was stored; -1 when buffer is empty
    let pos = -1;

    // Go through the input, and process reactions.
    for (let i = 0; i < polymer.length; ++i) {
        const newUnit = polymer.charAt(i);

        if (pos === -1) {
            result[++pos] = newUnit;
        } else {
            const curUnit = result[pos];
            if (newUnit !== curUnit && newUnit.toUpperCase() === curUnit.toUpperCase()) {
                // These units react. Drop the last unit in the result buffer.
                --pos;
            }  else {
                // No reaction.
                result[++pos] = newUnit;
            }
        }
    }

    return pos + 1;
}


// Part 1
const length = process(input);
console.log(`Result buffer contains ${length} units`);


// Part 2

// Which letters do we need to check?
const letters = new Set();
for (const letter of input.toUpperCase()) {
    letters.add(letter);
}
const lengthByLetter = {};
for (const letter of letters) {
    const modifiedInput = input.replace(new RegExp(`${letter}|${letter.toLowerCase()}`, "g"), "");
    const length = process(modifiedInput);
    lengthByLetter[letter] = length;
}
const [bestLetter, shortestLength] = Object.entries(lengthByLetter).sort((a, b) => a[1] - b[1])[0];
console.log(`The letter ${bestLetter} produces the shortest polymer with a length of ${shortestLength}`);
