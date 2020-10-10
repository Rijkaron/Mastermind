'use strict';

// Settings
const COLORS = ['RED', 'BLUE', 'YELLOW', 'GREEN', 'PURPLE', 'BLACK'];
const CODE_LENGTH = 4;
const MAX_TRIES = 10;
const ALLOW_REPETITION = true;

if (!ALLOW_REPETITION && CODE_LENGTH > COLORS.length)
    console.exception(`CODE_LENGTH (${CODE_LENGTH}) is too short for the amount of COLORS (${COLORS.length}) without allowing repetition.`);

// Generate a random code
const generateCode = () => {
    const code = [];
    while (code.length < CODE_LENGTH) {
        const tempColors = [...COLORS].filter(color => !code.includes(color) || ALLOW_REPETITION);
        code.push(tempColors[Math.floor(Math.random() * tempColors.length)]);
    }
    return code;
}

let code = generateCode();

// Compares 2 codes and return the feedback in [correctPositions, wrongPositions]
const testCode = (input, comparison = code) => {
    if (input.length !== comparison.length) return false;
    let correctPositions = 0, wrongPositions = 0, done = [];

    for (let i=0; i < input.length; i++) {
        // Count colors in the correct position
        if (input[i] === comparison[i] && done[i] !== true) {
            correctPositions++;
            done[i] = true;
            continue;
        }
        // Count colors in the wrong position
        const index = comparison.indexOf(input[i]);
        if (index !== -1 && done[index] !== true) {
            wrongPositions++;
            done[index] = true;
            continue;
        }
    }

    return [correctPositions, wrongPositions];
}

// Get all possible solutions with the settings provided
const getAllPosibilities = () => {
    const permutate = offset => {
        const permutations = [];
        for (let i = 0; i < CODE_LENGTH; i++) {
            const index = Math.floor((offset / COLORS.length ** i) % COLORS.length);
            permutations[i] = COLORS[index];
        }
        return permutations;
    }

    const posibilities = [];
    for (let i = 0; i < COLORS.length ** CODE_LENGTH; i++) {
        posibilities[i] = permutate(i);
    }

    // Return only the codes without repetitions if repetition isn't allowed
    return posibilities.filter(code => new Set(code).size === code.length || ALLOW_REPETITION);
}

const shuffle = array => {
    // Duplicate array so it doesn't change the original array
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
        const r = Math.floor(Math.random() * (i + 1));
        [a[i], a[r]] = [a[r], a[i]];
    }
    return a;
}

// Get the begin moves
const getBeginMoves = () => {
    const shuffledColors = shuffle(COLORS);

    const lengthOfColors = Math.floor(CODE_LENGTH / 2);
    const codes = [...Array(Math.floor(COLORS.length / 2))].map((a, i) => {
        return shuffle([...Array(CODE_LENGTH)].map((b, j) => {
            if (j < lengthOfColors) return shuffledColors[i * 2];
            else return shuffledColors[i * 2 + 1];
        }))
    })

    return codes;
}

const solve = () => {
    const posibilities = getAllPosibilities();
    const beginMoves = getBeginMoves();

    let solved = false;
    let doneMoves = [];
    let tries = 0;

    let foundColors = 0;

    // Try the begin moves
    for (let i = 0; i < beginMoves.length; i++) {
        const move = beginMoves[i];

        tries++;
        const feedback = testCode(move);
        doneMoves.push({move: move, feedback: feedback});

        if (feedback == CODE_LENGTH + ",0") {
            solved = true;
            break;
        }
 
        foundColors += feedback.reduce((goed, fout) => goed + fout);
        if (foundColors === CODE_LENGTH) break;
    }

    while (!solved && tries < MAX_TRIES && posibilities.length > 0) {
        for (let i = posibilities.length - 1; i >= 0; i--) {
            const move = posibilities[i];
            let fits = true;
            for (let j = 0; j < doneMoves.length; j++) {
                if (testCode(doneMoves[j].move, move) != doneMoves[j].feedback.toString()) {
                    fits = false;
                    break;
                }
            }

            if (!fits) {
                posibilities.splice(i, 1);
                continue;
            }

            tries++;
            const feedback = testCode(move);
            doneMoves.push({move: move, feedback: feedback});

            if (feedback == CODE_LENGTH + ",0") {
                solved = true;
                break;
            }
        }
    }

    const guess = doneMoves[tries - 1].move;

    // Return solving data
    return {
        solved: guess.toString() == code,
        guess: guess,
        tries: tries,
        steps: doneMoves
    }
}

// Calculate the average stats of this algorithm
const avarageStats = () => {
    const posibilities = getAllPosibilities();

    let min = TRIES + 1;
    let max = 0;
    let failed = 0;
    let x = 0;

    for (let i = 0; i < posibilities.length; i++) {
        code = posibilities[i];
        const result = solve();

        if (!result.solved) failed++;
        if (result.tries < min) min = result.tries;
        if (result.tries > max) max = result.tries;
        x += result.tries;
    }

    return `Min: ${min}\nMax: ${max}\nFailed: ${failed}\nAverage: ${x / posibilities.length}`;
}
