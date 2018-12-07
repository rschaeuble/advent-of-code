// const input = `
// Step C must be finished before step A can begin.
// Step C must be finished before step F can begin.
// Step A must be finished before step B can begin.
// Step A must be finished before step D can begin.
// Step B must be finished before step E can begin.
// Step D must be finished before step E can begin.
// Step F must be finished before step E can begin.
// `;

const input = `
Step S must be finished before step G can begin.
Step E must be finished before step T can begin.
Step G must be finished before step A can begin.
Step P must be finished before step Z can begin.
Step L must be finished before step Z can begin.
Step F must be finished before step H can begin.
Step D must be finished before step Y can begin.
Step J must be finished before step Y can begin.
Step N must be finished before step O can begin.
Step R must be finished before step Y can begin.
Step Y must be finished before step W can begin.
Step U must be finished before step T can begin.
Step H must be finished before step W can begin.
Step T must be finished before step Z can begin.
Step Q must be finished before step B can begin.
Step O must be finished before step Z can begin.
Step K must be finished before step W can begin.
Step M must be finished before step C can begin.
Step A must be finished before step Z can begin.
Step C must be finished before step X can begin.
Step I must be finished before step V can begin.
Step V must be finished before step W can begin.
Step W must be finished before step X can begin.
Step Z must be finished before step B can begin.
Step X must be finished before step B can begin.
Step D must be finished before step M can begin.
Step S must be finished before step Z can begin.
Step A must be finished before step B can begin.
Step V must be finished before step Z can begin.
Step Q must be finished before step Z can begin.
Step O must be finished before step W can begin.
Step S must be finished before step E can begin.
Step L must be finished before step B can begin.
Step P must be finished before step Y can begin.
Step K must be finished before step M can begin.
Step W must be finished before step Z can begin.
Step Y must be finished before step Q can begin.
Step J must be finished before step M can begin.
Step U must be finished before step H can begin.
Step Y must be finished before step U can begin.
Step D must be finished before step A can begin.
Step C must be finished before step V can begin.
Step G must be finished before step J can begin.
Step O must be finished before step C can begin.
Step P must be finished before step H can begin.
Step M must be finished before step B can begin.
Step T must be finished before step C can begin.
Step A must be finished before step W can begin.
Step C must be finished before step B can begin.
Step Q must be finished before step I can begin.
Step O must be finished before step A can begin.
Step N must be finished before step H can begin.
Step Q must be finished before step C can begin.
Step G must be finished before step W can begin.
Step V must be finished before step X can begin.
Step A must be finished before step V can begin.
Step S must be finished before step C can begin.
Step O must be finished before step M can begin.
Step E must be finished before step L can begin.
Step D must be finished before step V can begin.
Step P must be finished before step N can begin.
Step O must be finished before step I can begin.
Step P must be finished before step K can begin.
Step N must be finished before step A can begin.
Step A must be finished before step X can begin.
Step L must be finished before step A can begin.
Step L must be finished before step T can begin.
Step I must be finished before step X can begin.
Step N must be finished before step C can begin.
Step N must be finished before step W can begin.
Step Y must be finished before step M can begin.
Step R must be finished before step A can begin.
Step O must be finished before step X can begin.
Step G must be finished before step T can begin.
Step S must be finished before step P can begin.
Step E must be finished before step M can begin.
Step E must be finished before step A can begin.
Step E must be finished before step W can begin.
Step F must be finished before step D can begin.
Step U must be finished before step C can begin.
Step R must be finished before step Z can begin.
Step A must be finished before step C can begin.
Step F must be finished before step K can begin.
Step L must be finished before step V can begin.
Step F must be finished before step T can begin.
Step W must be finished before step B can begin.
Step Y must be finished before step A can begin.
Step D must be finished before step T can begin.
Step S must be finished before step V can begin.
Step Y must be finished before step O can begin.
Step K must be finished before step B can begin.
Step N must be finished before step V can begin.
Step Y must be finished before step I can begin.
Step Z must be finished before step X can begin.
Step E must be finished before step B can begin.
Step P must be finished before step O can begin.
Step D must be finished before step R can begin.
Step Q must be finished before step X can begin.
Step E must be finished before step K can begin.
Step J must be finished before step R can begin.
Step L must be finished before step N can begin.
`;

const steps = [];
const re = new RegExp('Step (.) must be finished before step (.) can begin.')
for (const line of input.split('\n')) {
    if (line.length === 0) {
        continue;
    }
    const matches = re.exec(line);
    if (matches) {
        steps.push({first: matches[1], then: matches[2]});
    }
}

const graph = new Map();
for (const step of steps) {
    if (!graph.has(step.first)) {
        graph.set(step.first, [])
    }

    let dependencies = graph.get(step.then);
    if (dependencies) {
        dependencies.push(step.first);
    } else {
        graph.set(step.then, [step.first]);
    }
}

function findReady(graph) {
    const readySteps = [];

    for ([step, dependencies] of graph.entries()) {
        // If all dependencies are done, this step is ready.
        let allReady = true;
        for (dep of dependencies) {
            if (graph.has(dep)) {
                allReady = false;
                break;
            }
        }
        if (allReady) {
            readySteps.push(step);
        }
    }

    readySteps.sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0));
    
    // Take as many steps as requested (if available); ignore the rest.
    return readySteps;
}

function topoSortPart1() {
    const steps = [];
    const tmpGraph = new Map(graph.entries());

    while (true) {
        const newSteps = findReady(tmpGraph);
        if (newSteps.length > 0) {
            steps.push(newSteps[0]);
            tmpGraph.delete(newSteps[0]);       
        } else {
            break;
        }
    }

    return steps;
}

function part2() {
    const baseDuration = 60;
    const numWorkers = 5;
    const tmpGraph = new Map(graph.entries());

    let time = 0;
    const workers = new Array(numWorkers).fill().map(_ => ({step: '.', timeLeft: 0}));
    const started = new Set();
    const done = [];

    while (true) {
        // Reduce the time each worker still needs to complete the task.
        workers.forEach(w => {
            if (w.timeLeft > 0) {
                --w.timeLeft;
                if (w.timeLeft === 0) {
                    tmpGraph.delete(w.step);
                    done.push(w.step);
                    w.step = '.';
                }
            }
        });

        const nextSteps = findReady(tmpGraph).filter(step => !started.has(step));

        workers.forEach(w => {
            if (w.timeLeft === 0 && nextSteps.length > 0) {
                const step = nextSteps.shift();
                w.step = step;
                w.timeLeft = baseDuration + step.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
                started.add(step);
            }
        });

        // console.log(`Period ${time}, Workers:`, workers.map(w => `${w.step} (${w.timeLeft})`).join('  '), 'done:', done.join(''));

        if (workers.filter(w =>w.timeLeft > 0).length === 0) {
            // All work done.
            break;
        }

        ++time;
    }

    return time;
}

// Part 1
console.log(`Order: ${topoSortPart1().join('')}`);

// Part 2
console.log(`Time required: ${part2()}`);
