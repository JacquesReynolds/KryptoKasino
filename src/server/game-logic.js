// game-logic
const { sum } = require("itertools");
const Hands = require('./hands.js');

exports.newGame = function () {
    // create a new game with the appropriate data model - game.players[0][cards]
    const game = {
        deck: [], // An array of cards representing the deck
        players: [], // An array of player objects with a cards property
        minBet: 10, // The minimum bet for the current hand
        pot: 0, // The total amount of chips in the pot
        communityCards: [], // An array of cards representing the community cards
        actionsTaken: 0, // Number of betting rounds
        isOver: false,
        gameOver: false,
        currentPlayerIndex: 0,
        startIndex: 0,
        originalIndex: 0,
        currentBet: 0,
        betMade: false,
        bettingRound: 0, // The current betting round (0: preflop, 1: flop, 2: turn, 3: river)
        eliminations: [], // An array of player actions taken during the current betting round
    }

    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const suits = ['♠', '♣', '♦', '♥'];

    for (const rank of ranks) {
        for (const suit of suits) {
            game.deck.push({ rank, suit });
        }
    }

    exports.shuffle(game.deck); // shuffle the deck

    return game;
}

exports.addPlayer = function (playerId, socketId, game, playerName, chips, seatNum) {
    game.players.push({ 'buyIn': chips, 'id': playerId, 'socketId': socketId, 'name': playerName, 'cards': [], 'hand': '', 'chips': chips, 'wholeCards': [], 'seatNum': seatNum, 'hasFolded': false, 'hasActed': false, 'isAllIn': false, 'currentBet': 0 });
    return game;
}


exports.removePlayer = function (game, playerToRemove) {
    game.players = game.players.filter(player => player.name !== playerToRemove.name);
    return game;
}

exports.shuffle = function (deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}


exports.dealHoleCards = function (game, socketId, io) {
    game.isOver = false;
    // Get the index of the current player
    const currentPlayerIndex = game.players.findIndex((player) => player.id === socketId);

    // Deal two cards to each player
    for (const [index, player] of game.players.entries()) {
        // Clear the player's cards and wholeCards arrays
        player.cards = [];
        player.wholeCards = [];

        for (let i = 0; i < 2; i++) {
            const card = game.deck.pop();
            player.wholeCards.push({ rank: card.rank, suit: card.suit });
            player.cards.push({ rank: card.rank, suit: card.suit });
        }
    }

    return game;
};



exports.addCommunityCards = function (game, numCards) {
    exports.shuffle(game.deck);
    const newCards = game.deck.slice(0, numCards);
    for (const card of newCards) {
        game.communityCards.push({ rank: card.rank, suit: card.suit });
    }
    game.deck.splice(0, numCards);

    return game;
}

exports.dealFlop = function (game, io) {
    exports.addCommunityCards(game, 3);

    // Update each player's cards with the new community cards
    for (const player of game.players) {
        if (!player.hasFolded) {
            player.cards = player.cards.concat(game.communityCards.slice(-3));
            player.currentBet = 0;
        }
    }
    game.bettingRound += 1;
    game.actionsTaken = 0;
    game.betMade = false;
    game.currentBet = 0;

    if (game.players[game.startIndex].hasFolded === true) {
        game.startIndex = exports.findNotFolded(game);
        game.currentPlayerIndex = game.startIndex;
    }

    // io.emit("flop_dealt", game);

    return game;
}


exports.dealTurn = function (game, socketId, io) {
    exports.addCommunityCards(game, 1);

    // Update each player's cards with the new community cards
    for (const player of game.players) {
        if (!player.hasFolded) {
            player.cards = player.cards.concat(game.communityCards.slice(-3));
            player.currentBet = 0;
        }
    }

    game.bettingRound += 1;
    game.actionsTaken = 0;
    game.betMade = false;
    game.currentBet = 0;

    if (game.players[game.startIndex].hasFolded === true) {
        game.startIndex = exports.findNotFolded(game);
        game.currentPlayerIndex = game.startIndex;
    }

    return game;
}

exports.dealRiver = function (game, socketId, io) {
    exports.addCommunityCards(game, 1);

    // Update each player's cards with the new community cards
    for (const player of game.players) {
        if (!player.hasFolded) {
            player.cards = player.cards.concat(game.communityCards.slice(-3));
            player.currentBet = 0;
        }
    }

    game.bettingRound += 1;
    game.actionsTaken = 0;
    game.betMade = false;
    game.currentBet = 0;

    if (game.players[game.startIndex].hasFolded === true) {
        game.startIndex = exports.findNotFolded(game);
        game.currentPlayerIndex = game.startIndex;
    }

    return game;
}

//---------------------------//

exports.fold = function (game, playerId) {
    const playerIndex = game.players.findIndex(player => player.id === playerId);
    if (playerIndex === -1) {
        throw new Error('Player not found');
    }
    game.players[playerIndex]['hasFolded'] = true;
    game.players[playerIndex]['wholeCards'] = [];
    game.players[playerIndex]['cards'] = [];

    if (game.players[(game.currentPlayerIndex + 1) % game.players.length].hasActed === false) {
        // Update the currentPlayerIndex
        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    } else {
        game.currentPlayerIndex = game.startIndex;
    }
    return game;
};

exports.call = function (game, player) {
    // Find the index of the player in the game's players array
    const playerIndex = game.players.findIndex(p => p.id === player.id);

    // If the player is found, update the hasActed property
    if (playerIndex !== -1) {
        game.players[playerIndex].hasActed = true;
        game.players[playerIndex].chips -= (game.currentBet - player.currentBet);
        game.pot += (game.currentBet - player.currentBet);

        // Check if the player is all-in after making the call
        if (game.players[playerIndex].chips <= 0) {
            game.players[playerIndex].isAllIn = true;
        } else {
            game.players[playerIndex].isAllIn = false;
        }
    }


    if (game.players[(game.currentPlayerIndex + 1) % game.players.length].hasActed === false && game.players[(game.currentPlayerIndex + 1) % game.players.length].hasFolded === false) {
        // Update the currentPlayerIndex
        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    } else {
        game.currentPlayerIndex = game.startIndex;

    }

    return game;
}

// Function to find the next player with hasActed value of false
exports.findNotActed = function (game) {
    let nextPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    while (game.players[nextPlayerIndex].hasActed) {
        nextPlayerIndex = (nextPlayerIndex + 1) % game.players.length;
    }
    return nextPlayerIndex;
}

// Function to find the next player with hasFolded value of false
exports.findNotFolded = function (game) {
    let nextPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    while (game.players[nextPlayerIndex].hasFolded) {
        nextPlayerIndex = (nextPlayerIndex + 1) % game.players.length;
    }
    return nextPlayerIndex;
}


exports.check = function (game, player) {
    // Find the index of the player in the game's players array
    const playerIndex = game.players.findIndex(p => p.id === player.id);

    // If the player is found, update the hasActed property
    if (playerIndex !== -1) {
        game.players[playerIndex].hasActed = true;
    }

    game.currentPlayerIndex = exports.findNotFolded(game);

    return game;
}

exports.resetActions = function (game) {
    // Set every other player's hasActed value to false
    game.players.forEach(p => {
        p['hasActed'] = false;
    });

    return game;
}

exports.determineWinningHand = function (game) {
    // Determine the winning player(s)
    let winningPlayers = [];
    let winningHand = null;

    for (const player of game.players) {
        // Skip players who have folded
        if (player.hasFolded) {
            continue;
        }

        if (!winningHand || exports.compareHands(player.cards, winningHand) > 0) {
            // This player has a higher ranking hand
            winningPlayers = [player];
            winningHand = player.cards;
        } else if (exports.compareHands(player.cards, winningHand) === 0) {
            // This player has the same ranking hand
            winningPlayers.push(player);
        }
    }
    return winningPlayers;
}


exports.checkForWinner = function (game) {
    game.isOver = true;
    // Check for players who haven't folded
    const remainingPlayers = game.players.filter(player => !player.hasFolded);
    if (remainingPlayers.length < 2) {
        // Only one remaining player, they win the pot
        remainingPlayers[0].chips += game.pot;
        console.log(remainingPlayers[0].name, "wins the hand as only remaining player!");
        return remainingPlayers;
    } else {
        // Determine the winning hand
        const winningPlayers = exports.determineWinningHand(game);

        if (winningPlayers.length === 1) {
            // There is a single winner
            winningPlayers[0].chips += game.pot;
            console.log(winningPlayers[0].name, "wins the hand with best hand!");
        } else if (winningPlayers.length > 1) {
            // There is a draw
            console.log(`The pot is split among ${winningPlayers.length} players.`);
            const splitAmount = game.pot / winningPlayers.length;
            for (const player of winningPlayers) {
                player.chips += splitAmount;
            }
        } else {
            throw new Error('No winner could be determined');
        }
        return winningPlayers;
    }
}


exports.compareHands = function (hand1, hand2) {
    // Compare the ranks of the hands
    const rank1 = exports.getRank(hand1);
    const rank2 = exports.getRank(hand2);

    if (rank1 > rank2) {
        return 1;
    } else if (rank2 > rank1) {
        return -1;
    }

    // Sort the hands
    const sortedHand1 = exports.sortHand(hand1);
    const sortedHand2 = exports.sortHand(hand2);


    // Compare the kickers of the hands
    const kickers1 = exports.getKickers(sortedHand1, rank1);
    const kickers2 = exports.getKickers(sortedHand2, rank2);

    const kickersCompareResult = exports.compareKickers(kickers1, kickers2);

    if (kickersCompareResult !== 0) {
        return kickersCompareResult;
    }

    // Compare the highest card among the kickers
    return exports.compareHighestCards(hand1, hand2);
};



exports.sortHand = function (hand) {
    const rankValues = {
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': 6,
        '7': 7,
        '8': 8,
        '9': 9,
        '10': 10,
        'J': 11,
        'Q': 12,
        'K': 13,
        'A': 14,
    };

    return hand.sort((a, b) => rankValues[a.rank] - rankValues[b.rank]);
};


exports.compareRanks = function (hand1, hand2) {
    const rank1 = exports.getRank(hand1);
    const rank2 = exports.getRank(hand2);

    console.log(rank1);
    console.log(rank2);
    const rankOrder = ['high card', 'one pair', 'two pair', 'three of a kind', 'straight', 'flush', 'full house', 'four of a kind', 'straight flush', 'royal flush'];

    if (rankOrder.indexOf(rank1) > rankOrder.indexOf(rank2)) {
        // hand1 has a higher rank than hand2
        return 1;
    } else if (rankOrder.indexOf(rank1) < rankOrder.indexOf(rank2)) {
        // hand2 has a higher rank than hand1
        return -1;
    } else {
        // Ranks are equal, compare the highest card among the kickers
        const kickers1 = exports.getKickers(hand1);
        const kickers2 = exports.getKickers(hand2);
        return exports.compareKickers(kickers1, kickers2);
    }
}

function rankToValue(rank) {
    // console.log(rank);
    const rankValues = {
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': 6,
        '7': 7,
        '8': 8,
        '9': 9,
        '10': 10,
        'J': 11,
        'Q': 12,
        'K': 13,
        'A': 14,
    };
    return rankValues[rank];
}




exports.compareKickers = function (kickers1, kickers2) {
    // Sort the kickers in descending order
    kickers1.sort((a, b) => rankToValue(b.rank) - rankToValue(a.rank));
    kickers2.sort((a, b) => rankToValue(b.rank) - rankToValue(a.rank));

    // Compare the kickers one by one
    for (let i = 0; i < kickers1.length; i++) {
        if (i >= kickers2.length) {
            // Kicker1 has more kickers than kicker2, so kicker1 wins
            return 1;
        } else if (rankToValue(kickers1[i].rank) > rankToValue(kickers2[i].rank)) {
            return 1;
        } else if (rankToValue(kickers1[i].rank) < rankToValue(kickers2[i].rank)) {
            return -1;
        }
    }

    if (kickers2.length > kickers1.length) {
        // Kicker2 has more kickers than kicker1, so kicker2 wins
        return -1;
    }

    // All kickers are the same
    return 0;
};


exports.compareHighestCards = function (hand1, hand2) {
    const highestCard1 = Math.max(...hand1.map(card => rankToValue(card)));
    const highestCard2 = Math.max(...hand2.map(card => rankToValue(card)));

    const sumOfHand1 = exports.arraySum(hand1);
    const sumOfHand2 = exports.arraySum(hand2);

    if (highestCard1 > highestCard2) {
        return 1;
    } else if (highestCard1 < highestCard2) {
        return -1;
    } else if (sumOfHand1 > sumOfHand2) {
        return 1;
    } else if (sumOfHand1 < sumOfHand2) {
        return -1;
    } else {
        return 0;
    }
};

exports.arraySum = function (array) {
    let sum = 0;

    for (let i = 0; i < array.length; i++) {
        sum += rankToValue(array[i].rank);
    }

    return sum;
};

exports.getCardCounts = function (cards) {
    const counts = {};
    for (const card of cards) {
        if (card.rank in counts) {
            counts[card.rank] += 1;
        } else {
            counts[card.rank] = 1;
        }
    }
    return counts;
}


exports.getKickers = function (hand, count) {
    // check for royal flush or straight flush, no kickers
    if (Hands.isRoyalFlush(hand) || Hands.isStraightFlush(hand)) {
        return [];
    }
    // check for four of a kind, return the kicker
    if (Hands.isFourOfAKind(hand)) {
        const fourOfAKind = exports.getKicker(hand, 4);
        return fourOfAKind.slice(0, count);
    }
    // check for full house, no kickers
    if (Hands.isFullHouse(hand)) {
        return [];
    }
    // check for flush, return the highest 5 cards
    if (Hands.isFlush(hand)) {
        return exports.getHighCards(hand, 5);
    }
    // check for straight, no kickers
    if (Hands.isStraight(hand)) {
        return [];
    }
    // check for three of a kind, return the highest 2 kickers
    if (Hands.isThreeOfAKind(hand)) {
        const threeOfAKind = exports.getKicker(hand, 3);
        return threeOfAKind.slice(0, count);
    }
    // check for two pair, return the highest kicker
    if (Hands.isTwoPair(hand)) {
        return exports.getKicker(hand, 2);

    }
    // check for one pair, return the highest kicker (the highest card in the pair)
    if (Hands.isOnePair(hand)) {
        const onePair = exports.getKicker(hand, 2);
        return onePair.slice(0, count);
    }
    // no pair, return the highest 5 cards
    return exports.getHighCards(hand, 5);
}


exports.getMostFrequentRank = function (hand) {
    const rankCounts = hand.reduce((acc, card) => {
        acc[card.rank] = (acc[card.rank] || 0) + 1;
        return acc;
    }, {});

    let maxCount = 0;
    let mostFrequentRank = '';

    for (const rank in rankCounts) {
        if (rankCounts[rank] > maxCount) {
            maxCount = rankCounts[rank];
            mostFrequentRank = rank;
        }
    }

    return mostFrequentRank;
}

exports.getKicker = function (hand, count) {
    const mostFrequentRank = exports.getMostFrequentRank(hand);

    const groupedCards = hand.filter(card => card.rank === mostFrequentRank);
    const remainingCards = hand.filter(card => card.rank !== mostFrequentRank);

    const sortedRemainingCards = remainingCards
        .sort((a, b) => b.rank - a.rank)
        .slice(0, count - groupedCards.length);

    return groupedCards.concat(sortedRemainingCards);
};



exports.getHighCards = function (cards, n) {
    return cards
        .sort((a, b) => rankToValue(b.rank) - rankToValue(a.rank))
        .slice(0, n)
        .map(card => card.rank);
};



exports.getHand = function (cards) {
    // sort the cards by rank
    cards.sort((a, b) => a.rank - b.rank);

    if (Hands.isStraightFlush(cards)) return 'Straight Flush';
    if (Hands.isFourOfAKind(cards)) return 'Four of a Kind';
    if (Hands.isFlush(cards)) return 'Flush';
    if (Hands.isStraight(cards)) return 'Straight';
    if (Hands.isFullHouse(cards)) return 'full house';
    if (Hands.isRoyalFlush(cards)) return 'royal flush';
    if (Hands.isThreeOfAKind(cards)) return 'three of a kind';
    if (Hands.isTwoPair(cards)) return 'two pair';
    if (Hands.isOnePair(cards)) return 'one pair';
    if (Hands.isHighCard(cards)) return 'high card';

    // compare hands of the same rank
    return compareHands(cards);
}

exports.isGameOver = function (game) {
    game.isOver = true;
}

exports.placeBets = function (game, playerId, amount) {
    const player = game.players.find(p => p.id === playerId);
    if (!player) {
        console.error("Player not found.");
        return game;
    }
    exports.handleBet(game, player, amount);
    game.betMade = true;
    game.currentBet = amount;
    game.players[game.currentPlayerIndex].currentBet = amount;

    game.currentPlayerIndex = exports.findNotFolded(game);

    return game;
};

exports.allIn = function (game, playerId) {
    const player = game.players.find(p => p.id === playerId);
    if (!player) {
        console.error("Player not found.");
        return game;
    }
    const allInAmount = player.chips;
    player['hasActed'] = true;
    player['isAllIn'] = true;
    player.chips -= allInAmount;
    game.currentBet = allInAmount;
    game.pot += allInAmount;
    game.betMade = true;

    // Set every other player's hasActed value to false
    game.players.forEach(p => {
        if (p.id !== playerId) {
            p['hasActed'] = false;
        }
    });

    // Update the currentPlayerIndex
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;

    return game;
};

exports.dealRemainingCards = function (game) {
    // Deal the community cards for showdown
    exports.addCommunityCards(game, 5 - game.communityCards.length);

    // Update each player's cards with the new community cards
    for (const player of game.players) {
        player.cards = player.cards.concat(game.communityCards.slice(-5));
    }

    //game.bettingRound = 3;
    return game;
}



exports.handleBet = function (game, player, amount) {
    // Check if there are any other players with chips left
    const otherPlayersWithChips = game.players.filter(p => p.chips > 0 && p !== player);
    if (otherPlayersWithChips.length === 0) {
        // proceed to next round in the hand
        return;
    }

    // Check if the player has enough chips to make the bet
    if (player.chips < amount) {
        // If the player has no chips left, they are 'all in'
        if (player.chips === 0) {
            // Set the bet amount to the remaining chips
            amount = player.chips;
        } else {
            //throw new Error('Player does not have enough chips to make this bet');
            amount = player.chips;
        }
    }

    player['hasActed'] = true;
    player.chips -= amount;
    game.pot += amount;
    // Set every other player's hasActed value to false
    game.players.forEach(p => {
        if (p !== player) {
            p['hasActed'] = false;
        }
    });
}

exports.getRank = function (hand) {

    if (Hands.isRoyalFlush(hand)) {
        rank = 9;
    } else if (Hands.isStraightFlush(hand)) {
        rank = 8;
    } else if (Hands.isFourOfAKind(hand)) {
        rank = 7;
    } else if (Hands.isFullHouse(hand)) {
        rank = 6;
    } else if (Hands.isFlush(hand)) {
        rank = 5;
    } else if (Hands.isStraight(hand)) {
        rank = 4;
    } else if (Hands.isThreeOfAKind(hand)) {
        rank = 3;
    } else if (Hands.isTwoPair(hand)) {
        rank = 2;
    } else if (Hands.isOnePair(hand)) {
        rank = 1;
    } else {
        rank = 0;
    }

    return rank;
}


exports.endOfHand = function (game) {

    // Reset the game state for the next hand
    game.isOver = true;
    game.deck = [];
    game.communityCards = [];
    game.pot = 0;
    game.originalIndex = (game.originalIndex + 1) % game.players.length;
    game.startIndex = game.originalIndex;
    game.currentPlayerIndex = game.originalIndex;
    game.actionsTaken = 0;
    game.betMade = false;
    game.currentBet = 0;
    game.handsDealt = 0;

    // Rebuild the deck
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const suits = ['♠', '♣', '♦', '♥'];
    for (const rank of ranks) {
        for (const suit of suits) {
            game.deck.push({ rank, suit });
        }
    }

    // Shuffle the deck
    exports.shuffle(game.deck);

    for (let i = 0; i < game.players.length; i++) {
        const player = game.players[i];
        player['cards'] = [];
        player['wholeCards'] = [];
        player['hasFolded'] = false;
        player['hand'] = '';
        player['hasActed'] = false;
        player['isAllIn'] = false;
        player['currentBet'] = 0;

        if (player.chips === 0) {
            game.eliminations.push(player.id);
        }
    }

    // Deal new hole cards to the players
    return game;
}