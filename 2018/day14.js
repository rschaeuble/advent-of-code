const START_RECIPIES = [3, 7]
let START_ELF1 = 0;
let START_ELF2 = 1;

function newRecipe(a, b) {
    let sum = a + b;
    const digits = [];
    do {
        const lastDigit = sum % 10;
        digits.unshift(lastDigit);
        sum = Math.floor(sum / 10);
    } while (sum > 0);

    return digits;
}

function nextIndex(idx, recipes) {
    return (idx + 1 + recipes[idx]) % recipes.length;
}

function printBoard(recipes, elf1, elf2) {
    const board = recipes.map(x => '' + x);
    board[elf1] = `(${board[elf1]})`;
    board[elf2] = `[${board[elf2]}]`;
    console.log(board.join(' '));
}

function iterate(recipes, elf1, elf2) {
    // Add the new recipes to the scoreboard.
    recipes.push(...newRecipe(recipes[elf1], recipes[elf2]));

    // Move elves to new recipes.
    elf1 = nextIndex(elf1, recipes);
    elf2 = nextIndex(elf2, recipes);

    return [elf1, elf2];
}

function containsSequence(sequence, recipes, index) {
    for (let i = 0; i < sequence.length; ++i) {
        if (sequence[i] !== recipes[index + i]) {
            return false;
        }
    }
    return true;
}

function part1(input) {
    const recipes = [...START_RECIPIES];
    let elf1 = START_ELF1;
    let elf2 = START_ELF2;

    // The offset at which the recipes begin that we're interested in
    const offset = input;
    // The number of recipes we're interested in
    const numRecipes = 10;

    //printBoard(recipes, elf1, elf2);
    for (let i = 0; i < offset + numRecipes; ++i) {
        [elf1, elf2] = iterate(recipes, elf1, elf2);
        //printBoard(recipes, elf1, elf2);      
    }

    console.log(`Part 1: requested recipes are ${recipes.slice(offset, offset + numRecipes).join('')}`);
}

function part2(input) {
    const recipes = [...START_RECIPIES];
    let elf1 = START_ELF1;
    let elf2 = START_ELF2;

    // The sequence we're searching for.
    const sequence = input.split('').map(x => parseInt(x));
    console.log('searching for', sequence);

    //printBoard(recipes, elf1, elf2);
    for (let i = 0; ; ++i) {
        [elf1, elf2] = iterate(recipes, elf1, elf2);
        //printBoard(recipes, elf1, elf2);



        if (recipes.length >= sequence.length) {
            const idx1 = recipes.length - sequence.length - 1;
            const idx2 = recipes.length - sequence.length;
            let idx = -1;
            
            if (containsSequence(sequence, recipes, idx1)) {
                idx = idx1;
            } else if (containsSequence(sequence, recipes, idx2)) {
                idx = idx2;
            }

            if (idx !== -1) {
                console.log(`Part 2: recipes found after ${idx} recipes`);
                return;
            }
        }
    }
}

part1(990941);
part2('990941');