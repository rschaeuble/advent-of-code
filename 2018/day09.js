function calcHighestScore(numPlayers, lastMarble) {   
    // The current marble.
    let curMarble = { value: 0 };
    curMarble.next = curMarble;
    curMarble.prev = curMarble;
    const firstMarble = curMarble;
    
    const scores = new Map();
    for (let i = 1; i <= numPlayers; ++i) {
        scores.set(i, 0);
    }
    
    function printCircle(player) {
        let output = [];
        let marble = firstMarble;
        do {
            if (marble === curMarble) {
                output.push(`(${marble.value})`);
            } else {
                output.push(marble.value);
            }

            marble = marble.next;
        } while (marble !== firstMarble);
    
        console.log(`[${player}]`, output.join(' '));
    }
    
    function placeMarble(marble) {
        // Go one marble clockwise.
        curMarble = curMarble.next;

        // Insert after this marble.
        const newMarble = {
            value: marble,
            next: curMarble.next,
            prev: curMarble
        }
        curMarble.next.prev = newMarble;
        curMarble.next = newMarble;
        
        // Make the new marble the current one.
        curMarble = newMarble;
    }
    
    function removeMarble() {
        // Go seven marbles counterclockwise.
        for (let i = 0; i < 7; ++i) {
            curMarble = curMarble.prev;
        }

        const removedMarble = curMarble.value;
        
        // Remove the marble.
        curMarble.prev.next = curMarble.next;
        curMarble.next.prev = curMarble.prev;

        curMarble = curMarble.next;

        return removedMarble;
    }
    
    let player = 0;
    for (let marble = 1; marble <= lastMarble; ++marble) {
        player += 1;
        if (player > numPlayers) {
            player = 1;
        }
    
        if (marble % 23 === 0) {
            const addToScore = marble + removeMarble();
            scores.set(player, scores.get(player) + addToScore);
        } else {
            placeMarble(marble);
        }
    
        //printCircle(player);
    }

    return Math.max(...scores.values());
}


console.log('Part 1:', calcHighestScore(426, 72058));
console.log('Part 2:', calcHighestScore(426, 72058 * 100));