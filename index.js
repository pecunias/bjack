const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const allTypeOfCards = {
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0,
    '6': 0,
    '7': 0,
    '8': 0,
    '9': 0,
    '10': 0,
    'j': 0,
    'q': 0,
    'k': 0,
    'a': 0,
};

const illustriousEightteen = [
    // The player should stand/double/split if the True Count equals or exceeds the Index Number, otherwise hit
    // The player should take insurance if the True Count is +3 or greater.
    { play: '       Insurance          ', index: 3 },
    { play: 'Player 16    Vs. Dealer 10', index: 0 },
    { play: 'Player 15    Vs. Dealer 10', index: 4 },
    { play: 'Player 10,10 Vs. Dealer 5 ', index: 5 },
    { play: 'Player 10,10 Vs. Dealer 6 ', index: 4 },
    { play: 'Player 10    Vs. Dealer 10', index: 4 },
    { play: 'Player 12    Vs. Dealer 3 ', index: 2 },
    { play: 'Player 12    Vs. Dealer 2 ', index: 3 },
    { play: 'Player 11    Vs. Dealer A ', index: 1 },
    { play: 'Player 9     Vs. Dealer 2 ', index: 1 },
    { play: 'Player 10    Vs. Dealer A ', index: 4 },
    { play: 'Player 9     Vs. Dealer 7 ', index: 3 },
    { play: 'Player 16    Vs. Dealer 9 ', index: 5 },
    { play: 'Player 13    Vs. Dealer 2 ', index: -1 },
    { play: 'Player 12    Vs. Dealer 4 ', index: 0 },
    { play: 'Player 12    Vs. Dealer 5 ', index: -2 },
    { play: 'Player 12    Vs. Dealer 6 ', index: -1 },
    { play: 'Player 13    Vs. Dealer 3 ', index: -2 },
];

const fabFour = [
    // The player should surrender if the True Count equals or exceeds the Index Number.
    { play: 'Player 14 Vs. Dealer 10   ', index: 3 },
    { play: 'Player 15 Vs. Dealer 10   ', index: 0 },
    { play: 'Player 15 Vs. Dealer 9    ', index: 2 },
    { play: 'Player 15 Vs. Dealer A    ', index: 1 },
];

const colors = {
    get green() { return '\x1b[32m' + this.reset },
    get yellow() { return '\x1b[33m' + this.reset },
    get red() { return '\x1b[31m' + this.reset },
    get reset() { return '%s\x1b[0m' },
};

let runningCount = 0;
let cardsDealt = 0;
let cardsDealtHistory = {...allTypeOfCards};

calculateRemainingDecks = (cardsDealt) => {
    const amountCardsInDeck = 52;
    const amountOfDecksInShoe = 6;
    const averageCardsInShoe = amountOfDecksInShoe * amountCardsInDeck;
    const cardsLeft = averageCardsInShoe - cardsDealt;

    return Math.ceil((cardsLeft / amountCardsInDeck));
}

calculateTrueCount = (currentRunningCount, currentCardsDealt) => {
    return Math.round(currentRunningCount / calculateRemainingDecks(currentCardsDealt));
}

resetGame = () => {
    console.log('Shuffle: Resetting runningCount');
    console.log(`Cards dealt ${cardsDealt}`);
    console.log(`History: ${JSON.stringify(cardsDealtHistory)}`)
    cardsDealtHistory = resetCardsDealtHistory();
    runningCount = 0;
    cardsDealt = 0;
} 

shouldIncreaseRunningCount = (cardValue) => {
    return parseInt(cardValue, 10) <= 6 && parseInt(cardValue, 10) >= 2;
};

shouldDecreaseRunningCount = (cardValue) => {
    return parseInt(cardValue, 10) === 10 || cardValue === 'j' || cardValue === 'q' || cardValue === 'k' || cardValue === 'a';
};

modifyRunningCount = (cardValue, runningCount) => {
    if (shouldIncreaseRunningCount(cardValue)) {
        return runningCount + 1;
    } else if (shouldDecreaseRunningCount(cardValue)) {
        return runningCount - 1;
    } else {
        return runningCount;
    }   
};

resetCardsDealtHistory = () => {
    return {...allTypeOfCards};
}

handleCardsDealt = (currentCardsDealt) => {
    return currentCardsDealt + 1;
}

isValidCardValue = (cardValue) => {
    return allTypeOfCards.hasOwnProperty(cardValue);
}

isTrueCountExceeding = (value) => {
    const currentRunningCount = calculateTrueCount(runningCount, cardsDealt);
    if (currentRunningCount >= 0) {
        return value.index <= calculateTrueCount(runningCount, cardsDealt) && value.index >= 0;
    } else {
        return value.index >= calculateTrueCount(runningCount, cardsDealt) && value.index < 0;
    }
}

hasInsurrance = ({play}) => play.includes('Insurance');

decideColor = (trueCount) => {
    if (trueCount === 0) {
        return colors.yellow;
    } else if (trueCount > 0) {
        return colors.green;
    } else {
        return colors.red;
    }
}

logAvailableOptions = ({play}) => {
    console.log(` 
------------------------------
| ${play} |
------------------------------`);
}

logOptionsToPlayer = (logColor, explanation, options) => {
    const listOptions = options.filter(isTrueCountExceeding);
    if (listOptions.length) {
        if (listOptions.some(hasInsurrance)) {
            console.log(logColor, explanation + ' The player should take insurance');
        } else {
            console.log(logColor, explanation);
        }
        options.filter(isTrueCountExceeding).forEach(logAvailableOptions);
    }
}

processStatistics = (cardValue, currentRunningCount, currentCardsDealt) => {
    cardsDealtHistory[cardValue]++;
    runningCount = modifyRunningCount(cardValue, currentRunningCount);
    cardsDealt = handleCardsDealt(currentCardsDealt, currentRunningCount);
    
    logColor = decideColor(runningCount),

    logOptionsToPlayer(logColor, 'The player should stand/double/split, otherwise hit.', illustriousEightteen);
    logOptionsToPlayer(logColor, '\n The player should surrender.', fabFour);
}

askCard = () => {
    rl.question("Card? \n", function(input) {
        if (input === 'shuffle') {
            console.clear()
            resetGame();
        } else if (isValidCardValue(input)) {
            console.log('\n')
            processStatistics(input, runningCount, cardsDealt);
        } else {
            console.log('Not a valid input');
        }
        
        askCard();
    });
};
startTracking = () => {
    console.clear();
    askCard();    
};

startTracking();

/* ---

// History: {"2":17,"3":17,"4":16,"5":16,"6":15,"7":16,"8":15,"9":16,"10":20,"j":18,"q":15,"k":17,"a":17}
// History: {"2":17,"3":16,"4":12,"5":17,"6":15,"7":17,"8":16,"9":21,"10":13,"j":15,"q":16,"k":13,"a":12} (201)

// cards dealt 203
// History: {"2":17,"3":17,"4":12,"5":12,"6":15,"7":19,"8":13,"9":14,"10":16,"j":16,"q":16,"k":17,"a":19}

// cards dealt 207
// History: {"2":47,"3":49,"4":40,"5":44,"6":46,"7":45,"8":39,"9":51,"10":54,"j":52,"q":49,"k":50,"a":51}

// cards dealt 222
// History: {"2":67,"3":66,"4":57,"5":59,"6":63,"7":65,"8":56,"9":62,"10":71,"j":69,"q":63,"k":71,"a":70}
*/