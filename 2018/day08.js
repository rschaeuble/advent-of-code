const fs = require('fs');
const input = fs.readFileSync('day08.input.txt', 'utf8').trim();

const numbers = input.trim().split(' ').map(x => parseInt(x));

function parseNodes(pos) {
    const numChildren = numbers[pos++];
    const numMetadata = numbers[pos++];
    console.log(`Header: ${numChildren}, ${numMetadata}`);

    const children = [];
    for (let i = 0; i < numChildren; ++i) {
        const [child, newPos] = parseNodes(pos);
        //console.log(child, newPos);
        children.push(child);
        pos = newPos;
    }

    const metadata = numbers.slice(pos, pos + numMetadata);
    pos += numMetadata;

    const node = { children, metadata };
    return [node, pos];
}

function sumMetadata(node) {
    let sum = node.metadata.reduce((a, b) => a + b, 0);
    for (child of node.children) {
        sum += sumMetadata(child);
    }
    return sum;
}

function nodeValue(node, level) {
    if (node.children.length === 0) {
        return node.metadata.reduce((a, b) => a + b, 0);
    }

    let value = 0;
    for (const entry of node.metadata) {
        const index = entry - 1; // the indexes in the metadata array are 1-based => convert to 0-based
        if (index >= node.children.length) {
            // Child does not exist.
            continue;
        }
        value += nodeValue(node.children[index], level + 1);
    }

    return value;
}

// Part 1
const [rootNode] = parseNodes(0);
console.log(`Sum of metadata is ${sumMetadata(rootNode)}`);

// Part 2
console.log(`Value of root node: ${nodeValue(rootNode, 0)}`);
