const combinations = require('combinations');

exports.rankToValue = function (rank) {
    if (rank === 'A') return 14;
    if (rank === 'K') return 13;
    if (rank === 'Q') return 12;
    if (rank === 'J') return 11;
    return parseInt(rank, 10);
}

exports.isStraight = function (cards) {
    // Convert the cards to numerical values
    const values = cards.map(card => exports.rankToValue(card.rank));

    // Handle the special case of an Ace (treated as 1)
    if (values.includes(14)) {
        values.push(1);
    }

    // Remove duplicates and sort the values in descending order
    const sortedValues = Array.from(new Set(values)).sort((a, b) => b - a);

    // Check for a straight
    for (let i = 0; i < sortedValues.length - 4; i++) {
        let straight = true;
        for (let j = 0; j < 4; j++) {
            if (sortedValues[i + j] - 1 !== sortedValues[i + j + 1]) {
                straight = false;
                break;
            }
        }
        if (straight) return true;
    }
    return false;
};


// check for flush
exports.isFlush = function (cards) {
    // sort the cards in descending order by rank
    cards.sort((a, b) => exports.rankToValue(b.rank) - exports.rankToValue(a.rank));

    // generate all possible combinations of 5 cards from the array
    const combs = combinations(cards, 5);

    // loop through the combinations and check for a flush
    for (const comb of combs) {
        // check if there are 5 cards of the same suit in the combination
        const suits = {};
        for (const card of comb) {
            if (suits[card.suit]) {
                suits[card.suit] += 1;
            } else {
                suits[card.suit] = 1;
            }
        }
        if (Object.values(suits).includes(5)) return true;
    }
    return false;
}


// check for full house
exports.isFullHouse = function (cards) {
    // generate all possible combinations of 5 cards from the array
    const combs = combinations(cards, 5);

    // loop through the combinations and check for a full house
    for (const comb of combs) {
        const counts = {};
        for (const card of comb) {
            if (counts[card.rank]) {
                counts[card.rank] += 1;
            } else {
                counts[card.rank] = 1;
            }
        }
        if (Object.values(counts).includes(3) && Object.values(counts).includes(2)) {
            return true;
        }
    }
    return false;
}

exports.isStraightFlush = function (cards) {
    // Sort the cards in ascending order by rank
    cards.sort((a, b) => exports.rankToValue(a.rank) - exports.rankToValue(b.rank));
  
    // Remove duplicate cards
    cards = cards.filter((card, index) => cards.findIndex(c => c.rank === card.rank && c.suit === card.suit) === index);
  
    // Loop through the cards and check for a straight flush
    for (let i = 0; i <= cards.length - 5; i++) {
      let straightFlush = true;
      for (let j = i; j < i + 4; j++) {
        if (exports.rankToValue(cards[j].rank) + 1 !== exports.rankToValue(cards[j + 1].rank) || cards[j].suit !== cards[j + 1].suit) {
          straightFlush = false;
          break;
        }
      }
      if (straightFlush) return true;
    }
  
    return false;
  }
  

// Royal flush
exports.isRoyalFlush = function (cards) {

    // sort the cards in descending order by rank
    cards.sort((a, b) => {
        if (exports.rankToValue(b.rank) > exports.rankToValue(a.rank)) return 1;
        if (exports.rankToValue(b.rank) < exports.rankToValue(a.rank)) return -1;
        return 0;
    });


    // check for flush
    let flush = true;
    for (let i = 0; i < cards.length - 1; i++) {
        if (cards[i].suit !== cards[i + 1].suit) {
            flush = false;
            break;
        }
    }
    
    // check for straight
    let straight = true;
    for (let i = 0; i < cards.length - 1; i++) {
        if (exports.rankToValue(cards[i + 1].rank) !== exports.rankToValue(cards[i + 1].rank)) {
            straight = false;
            break;
        }
    }
    // check for royal flush
    if (straight && flush) {
        const ranks = ['A', 'K', 'Q', 'J', '10'];
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].rank !== ranks[i]) {
                return false;
            }
        }
        return true;
    }
    return false;
}


// check for four of a kind
exports.isFourOfAKind = function (cards) {
    // sort the cards in descending order by rank
    cards.sort((a, b) => b.rank - a.rank);

    // generate all possible combinations of 5 cards from the array
    const combs = combinations(cards, 5);

    // loop through the combinations and check for four of a kind
    for (const comb of combs) {
        const counts = {};
        for (const card of comb) {
            if (counts[card.rank]) {
                counts[card.rank] += 1;
            } else {
                counts[card.rank] = 1;
            }
        }
        if (Object.values(counts).includes(4)) return true;
    }
    return false;
}



// Three of a kind
exports.isThreeOfAKind = function (cards) {

    // sort the cards in descending order by rank
    cards.sort((a, b) => {
        if (b.rank > a.rank) return 1;
        if (b.rank < a.rank) return -1;
        return 0;
    });


    // check for three of a kind
    const counts = {};
    for (const card of cards) {
        if (counts[card.rank]) {
            counts[card.rank] += 1;
        } else {
            counts[card.rank] = 1;
        }
    }
    return Object.values(counts).includes(3);
}

// Two pair
exports.isTwoPair = function (cards) {

    // sort the cards in descending order by rank
    cards.sort((a, b) => {
        if (exports.rankToValue(b.rank) > exports.rankToValue(a.rank)) return 1;
        if (exports.rankToValue(b.rank) < exports.rankToValue(a.rank)) return -1;
        return 0;
    });


    // check for two pair
    let twoPair = false;
    const counts = {};
    for (const card of cards) {
        if (counts[card.rank]) {
            counts[card.rank] += 1;
        } else {
            counts[card.rank] = 1;
        }
    }
    let pairs = 0;
    for (const count of Object.values(counts)) {
        if (count === 2) {
            pairs += 1;
        }
    }
    if (pairs === 2) {
        twoPair = true;
    }
    return twoPair;
}

// One pair
exports.isOnePair = function (cards) {
    // sort the cards in descending order by rank

    cards.sort((a, b) => {
        if (exports.rankToValue(b.rank) > exports.rankToValue(a.rank)) return 1;
        if (exports.rankToValue(b.rank) < exports.rankToValue(a.rank)) return -1;
        return 0;
    });


    // check for one pair
    const counts = {};
    for (const card of cards) {
        if (counts[card.rank]) {
            counts[card.rank] += 1;
        } else {
            counts[card.rank] = 1;
        }
    return Object.values(counts).includes(2);
}


// high card
exports.isHighCard = function (cards) {

    // sort the cards in descending order by rank
    cards.sort((a, b) => {
        if (b.rank > a.rank) return 1;
        if (b.rank < a.rank) return -1;
        return 0;
    });


    // check for high card
    const counts = {};
    for (const card of cards) {
        if (counts[card.rank]) {
            counts[card.rank] += 1;
        } else {
            counts[card.rank] = 1;
        }
    }
    return !Object.values(counts).includes(2) && !Object.values(counts).includes(3) && !Object.values(counts).includes(4);
}}
