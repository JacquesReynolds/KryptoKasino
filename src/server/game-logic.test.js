const { assert } = require('console');
const { describe } = require('node:test');
const gameLogic = require('./game-logic');


// 1. GAME INITIALIZATION
describe('1. Game Initialization', () => {
  test('new game should create a deck of 52 shuffled cards', () => {
    // Arrange
    const game = gameLogic.newGame();
    const expectedDeckLength = 52;
    const possibleRanks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const possibleSuits = ['♠', '♣', '♦', '♥'];
    const expectedCards = [];
    for (const rank of possibleRanks) {
      for (const suit of possibleSuits) {
        expectedCards.push({ rank, suit });
      }
    }
  });
  
  test('adds a player to the game', () => {
    // Create a simple game object with a players array for the test
    const game = {
      players: [],
    };
  
    gameLogic.addPlayer('alice123', 'socket123', game, 'Alice', 100, 1);
    expect(game.players.length).toBe(1);
    expect(game.players[0].name).toBe('Alice');
    expect(game.players[0].chips).toBe(100);
  });
  
  test('adds multiple players to the game', () => {
    const game = gameLogic.newGame();
    gameLogic.addPlayer('alice123', 'socket123', game, 'Alice', 100, 1);
    gameLogic.addPlayer('bob123', 'socket456', game, 'Bob', 100, 2);
  
    expect(game.players.length).toBe(2);
    expect(game.players[0].name).toBe('Alice');
    expect(game.players[1].name).toBe('Bob');
  });
  
  test('removes a player from the game', () => {
    const game = {
      players: [
        { name: 'Alice', chips: 100 },
        { name: 'Bob', chips: 100 }
      ]
    };
  
    gameLogic.removePlayer(game, { name: 'Alice' });
  
    expect(game.players.length).toBe(1);
    expect(game.players[0].name).toBe('Bob');
  });
  
});


// 2. HAND RANKINGS
describe('2. Hand Rankings', () => {
    test('check for royal flush', () => {
      const cards = [
        { rank: 'A', suit: '♠' },
        { rank: 'K', suit: '♠' },
        { rank: 'Q', suit: '♠' },
        { rank: 'J', suit: '♠' },
        { rank: '10', suit: '♠' },
      ];
      expect(gameLogic.getRank(cards)).toBe(9);
  });

  test('check for four of a kind', () => {
      const cards = [
        { rank: 'A', suit: '♠' },
        { rank: 'A', suit: '♣' },
        { rank: 'A', suit: '♦' },
        { rank: 'A', suit: '♥' },
        { rank: '10', suit: '♠' },
      ];
      expect(gameLogic.getRank(cards)).toBe(7);
    });
});


// 3. DETERMINING WINNING HANDS
describe('3. Determining Winning Hands', () => {
  test('Player B wins with a higher pair', () => {
    const playerA = { name: 'A', wholeCards: [ { rank: '5', suit: '♣' }, { rank: '6', suit: '♠' } ], cards: [{ rank: '5', suit: '♣' }, { rank: '6', suit: '♠' },{ rank: 'Q', suit: '♠' }, { rank: '9', suit: '♠' }, { rank: '10', suit: '♠' }, { rank: '5', suit: '♦' }, { rank: '4', suit: '♦' }] };
    const playerB = { name: 'B', wholeCards: [ { rank: 'J', suit: '♦' }, { rank: 'Q', suit: '♦' } ], cards: [{ rank: 'J', suit: '♦' }, { rank: 'Q', suit: '♦' },{ rank: 'Q', suit: '♠' }, { rank: '9', suit: '♠' }, { rank: '10', suit: '♠' }, { rank: '5', suit: '♦' }, { rank: '4', suit: '♦' }] };
    const communityCards = [ { rank: 'Q', suit: '♠' }, { rank: '9', suit: '♠' }, { rank: '10', suit: '♠' }, { rank: '5', suit: '♦' }, { rank: '4', suit: '♦' } ];
    
    const game = {
    players: [playerA, playerB],
    communityCards
    }
    
    const winningPlayers = gameLogic.determineWinningHand(game);
    expect(winningPlayers[0]).toBe(playerB);
  });

  test('Player B wins with a straight', () => {
    const playerA = { name: 'A', wholeCards: [ { rank: '5', suit: '♣' }, { rank: '6', suit: '♠' } ], cards: [{ rank: '5', suit: '♣' }, { rank: '6', suit: '♠' },{ rank: 'A', suit: '♠' }, { rank: 'K', suit: '♠' }, { rank: '10', suit: '♠' }, { rank: '5', suit: '♦' }, { rank: '4', suit: '♦' }] };
    const playerB = { name: 'B', wholeCards: [ { rank: 'J', suit: '♦' }, { rank: 'Q', suit: '♦' } ], cards: [{ rank: 'J', suit: '♦' }, { rank: 'Q', suit: '♦' },{ rank: 'A', suit: '♠' }, { rank: 'K', suit: '♠' }, { rank: '10', suit: '♠' }, { rank: '5', suit: '♦' }, { rank: '4', suit: '♦' }] };
    const communityCards = [ { rank: 'A', suit: '♠' }, { rank: 'K', suit: '♠' }, { rank: '10', suit: '♠' }, { rank: '5', suit: '♦' }, { rank: '4', suit: '♦' } ];
    
    const game = {
    players: [playerA, playerB],
    communityCards
    };
    
    const winningPlayers = gameLogic.determineWinningHand(game);
    expect(winningPlayers[0]).toBe(playerB);
  });

  test('Player A wins with one pair', () => {
    const playerA = { name: 'A', wholeCards: [ { rank: '5', suit: '♣' }, { rank: '6', suit: '♠' } ], cards: [{ rank: '5', suit: '♣' }, { rank: '6', suit: '♠' },{ rank: 'A', suit: '♠' }, { rank: 'K', suit: '♠' }, { rank: '10', suit: '♠' }, { rank: '5', suit: '♦' }, { rank: '4', suit: '♦' }], hasFolded: false };
    const playerB = { name: 'B', wholeCards: [ { rank: '3', suit: '♦' }, { rank: '2', suit: '♦' } ], cards: [{ rank: '7', suit: '♦' }, { rank: '2', suit: '♦' },{ rank: 'A', suit: '♠' }, { rank: 'K', suit: '♠' }, { rank: '10', suit: '♠' }, { rank: '5', suit: '♦' }, { rank: '4', suit: '♦' }], hasFolded: false };
    const playerC = {name: 'C', wholeCards: [{ rank: 'K', suit: '♣' }, { rank: '2', suit: '♠' }], cards: [{ rank: 'K', suit: '♣' }, { rank: '2', suit: '♠' },{ rank: 'A', suit: '♠' }, { rank: 'K', suit: '♠' }, { rank: '10', suit: '♠' }, { rank: '5', suit: '♦' }, { rank: '4', suit: '♦' } ], hasFolded: true};
    const communityCards = [ { rank: 'A', suit: '♠' }, { rank: 'K', suit: '♠' }, { rank: '10', suit: '♠' }, { rank: '5', suit: '♦' }, { rank: '4', suit: '♦' } ];
    
    const game = {
    players: [playerA, playerB, playerC],
    communityCards
    };
  
    const winningPlayers = gameLogic.determineWinningHand(game);
    expect(winningPlayers[0]).toBe(playerA);
  });

  test('Player A has the highest ranking hand with a King-high straight flush', () => {
    const game = {
      players: [
        {
          name: 'A',
          wholeCards: [
            { rank: 'K', suit: '♠' },
            { rank: 'Q', suit: '♠' }
          ],
          cards: [
            { rank: 'K', suit: '♠' },
            { rank: 'Q', suit: '♠' },
            { rank: 'J', suit: '♠' },
            { rank: '10', suit: '♠' },
            { rank: '9', suit: '♠' },
            { rank: '7', suit: '♥' },
            { rank: '6', suit: '♥' }
          ],
          hasFolded: false
        },
        {
          name: 'B',
          wholeCards: [
            { rank: 'J', suit: '♥' },
            { rank: '10', suit: '♥' }
          ],
          cards: [
            { rank: 'J', suit: '♥' },
            { rank: '10', suit: '♥' },
            { rank: '9', suit: '♥' },
            { rank: '8', suit: '♥' },
            { rank: '6', suit: '♥' },
            { rank: '4', suit: '♠' },
            { rank: '3', suit: '♠' }
          ],
          hasFolded: false
        },
      ]
    };
  
    const winners = gameLogic.determineWinningHand(game);
    expect(winners).toEqual([game.players[0]]);
    });
});


// 4. HAND COMPARISON
describe('4. Hand comparison', () => {
  test('two identical straight flushes', () => {
    const hand1 = [
        { rank: '10', suit: '♣' },
        { rank: 'J', suit: '♣' },
        { rank: 'Q', suit: '♣' },
        { rank: 'K', suit: '♣' },
        { rank: 'A', suit: '♣' }
    ];
    const hand2 = [
        { rank: '10', suit: '♥' },
        { rank: 'J', suit: '♥' },
        { rank: 'Q', suit: '♥' },
        { rank: 'K', suit: '♥' },
        { rank: 'A', suit: '♥' }
    ];
    const result = gameLogic.compareHands(hand1, hand2);
    expect(result).toEqual(0);
});
  
    test(' High card vs one pair', () => {
      const hand1 = [
        { rank: 'A', suit: '♠' },
        { rank: 'K', suit: '♦' },
        { rank: 'Q', suit: '♥' },
        { rank: '10', suit: '♣' },
        { rank: '5', suit: '♠' }
      ];
      const hand2 = [
        { rank: 'K', suit: '♠' },
        { rank: 'Q', suit: '♦' },
        { rank: 'J', suit: '♥' },
        { rank: '10', suit: '♠' },
        { rank: '9', suit: '♦' }
      ];
      const result = gameLogic.compareHands(hand1, hand2);
      expect(result).toEqual(-1);
    });

    test('Two pairs vs three of a kind', () => {
      const hand1 = [
        { rank: 'A', suit: '♠' },
        { rank: 'A', suit: '♦' },
        { rank: 'K', suit: '♥' },
        { rank: 'K', suit: '♣' },
        { rank: '5', suit: '♠' }
      ];
      const hand2 = [
        { rank: 'Q', suit: '♠' },
        { rank: 'Q', suit: '♦' },
        { rank: 'Q', suit: '♥' },
        { rank: '10', suit: '♠' },
        { rank: '9', suit: '♦' }
      ];
      const result = gameLogic.compareHands(hand1, hand2);
      expect(result).toEqual(-1);
    });

    test('Flush vs straight', () => {
      const hand1 = [
        { rank: '8', suit: '♠' },
        { rank: '9', suit: '♠' },
        { rank: '10', suit: '♠' },
        { rank: 'J', suit: '♠' },
        { rank: 'Q', suit: '♠' }
      ];
      const hand2 = [
        { rank: '9', suit: '♥' },
        { rank: '10', suit: '♦' },
        { rank: 'J', suit: '♣' },
        { rank: 'Q', suit: '♠' },
        { rank: 'K', suit: '♠' }
      ];
      const result = gameLogic.compareHands(hand1, hand2);
      expect(result).toEqual(1);
    });

    test('a pair of aces should beat a pair of kings', () => {
        const hand1 = [
            { rank: 'A', suit: '♠' },
            { rank: 'A', suit: '♣' },
            { rank: '3', suit: '♦' },
            { rank: '5', suit: '♥' },
            { rank: '7', suit: '♠' }
        ];
        const hand2 = [
            { rank: 'K', suit: '♠' },
            { rank: 'K', suit: '♦' },
            { rank: '3', suit: '♦' },
            { rank: '5', suit: '♥' },
            { rank: '7', suit: '♠' },
        ];
        expect(gameLogic.compareHands(hand1, hand2)).toBeGreaterThan(0);
    });

    test('a pair of aces should beat a pair of jacks', () => {
      const hand1 = [
          { rank: 'A', suit: '♠' },
          { rank: 'A', suit: '♣' },
          { rank: '3', suit: '♦' },
          { rank: '5', suit: '♥' },
          { rank: '7', suit: '♠' }
      ];
      const hand2 = [
          { rank: 'J', suit: '♠' },
          { rank: 'J', suit: '♦' },
          { rank: '3', suit: '♦' },
          { rank: '5', suit: '♥' },
          { rank: '7', suit: '♠' },
      ];
      expect(gameLogic.compareHands(hand1, hand2)).toBeGreaterThan(0);
  });


    test('a pair of queens should beat a pair of jacks', () => {
      const hand1 = [
          { rank: 'Q', suit: '♠' },
          { rank: 'Q', suit: '♣' },
          { rank: '3', suit: '♦' },
          { rank: '5', suit: '♥' },
          { rank: '7', suit: '♠' }
      ];
      const hand2 = [
          { rank: 'J', suit: '♠' },
          { rank: 'J', suit: '♦' },
          { rank: '3', suit: '♦' },
          { rank: '5', suit: '♥' },
          { rank: '7', suit: '♠' },
      ];
      expect(gameLogic.compareHands(hand1, hand2)).toBeGreaterThan(0);
  });

  test('a pair of Js should beat a pair of 10s', () => {
    const hand1 = [
        { rank: 'J', suit: '♠' },
        { rank: 'J', suit: '♣' },
        { rank: '3', suit: '♦' },
        { rank: '5', suit: '♥' },
        { rank: '7', suit: '♠' }
    ];
    const hand2 = [
        { rank: '10', suit: '♠' },
        { rank: '10', suit: '♦' },
        { rank: '2', suit: '♣' },
        { rank: '4', suit: '♥' },
        { rank: '6', suit: '♠' }
    ];
    expect(gameLogic.compareHands(hand1, hand2)).toBeGreaterThan(0);
  });

  test('Three of a Kind vs Two Pairs', () => {
      const hand1 = [
        { rank: 'A', suit: '♠' },
        { rank: 'A', suit: '♣' },
        { rank: 'A', suit: '♦' },
        { rank: 'K', suit: '♠' },
        { rank: 'Q', suit: '♠' }
      ];
      const hand2 = [
        { rank: 'K', suit: '♠' },
        { rank: 'K', suit: '♦' },
        { rank: 'Q', suit: '♠' },
        { rank: 'Q', suit: '♣' },
        { rank: 'J', suit: '♠' }
      ];
      expect(gameLogic.compareHands(hand1, hand2)).toBeGreaterThan(0);
    });

  test('Full House vs Flush', () => {
      const hand1 = [
        { rank: 'A', suit: '♠' },
        { rank: 'A', suit: '♣' },
        { rank: 'A', suit: '♦' },
        { rank: 'K', suit: '♠' },
        { rank: 'K', suit: '♣' }
      ];
      const hand2 = [
        { rank: '2', suit: '♠' },
        { rank: '4', suit: '♠' },
        { rank: '6', suit: '♠' },
        { rank: '8', suit: '♠' },
        { rank: '10', suit: '♠' }
      ];
      expect(gameLogic.compareHands(hand1, hand2)).toBeGreaterThan(0);
    });

  test('Four of a Kind vs Straight', () => {
      const hand1 = [
        { rank: 'A', suit: '♠' },
        { rank: 'A', suit: '♣' },
        { rank: 'A', suit: '♦' },
        { rank: 'A', suit: '♥' },
        { rank: 'K', suit: '♠' }
      ];
      const hand2 = [
        { rank: '10', suit: '♠' },
        { rank: 'J', suit: '♣' },
        { rank: 'Q', suit: '♠' },
        { rank: 'K', suit: '♦' },
        { rank: 'A', suit: '♠' }
      ];
      expect(gameLogic.compareHands(hand1, hand2)).toBeGreaterThan(0);
    });


  test('Royal Flush vs Straight Flush', () => {
      const hand1 = [
        { rank: 'A', suit: '♠' },
        { rank: 'K', suit: '♠' },
        { rank: 'Q', suit: '♠' },
        { rank: 'J', suit: '♠' },
        { rank: '10', suit: '♠' }
      ];
      const hand2 = [
        { rank: 'K', suit: '♦' },
        { rank: 'Q', suit: '♦' },
        { rank: 'J', suit: '♦' },
        { rank: '10', suit: '♦' },
        { rank: '9', suit: '♦' }
      ];
      expect(gameLogic.compareHands(hand1, hand2)).toBeGreaterThan(0);
    });


    test('Full House vs Four of a Kind', () => {
      const hand1 = [
        { rank: 'A', suit: '♠' },
        { rank: 'A', suit: '♣' },
        { rank: 'A', suit: '♦' },
        { rank: 'K', suit: '♠' },
        { rank: 'K', suit: '♣' }
      ];
      const hand2 = [
        { rank: 'K', suit: '♠' },
        { rank: 'K', suit: '♦' },
        { rank: 'K', suit: '♥' },
        { rank: 'K', suit: '♣' },
        { rank: 'Q', suit: '♠' }
      ];
      expect(gameLogic.compareHands(hand1, hand2)).toBeLessThan(0);
    });

    test('Straight vs Three of a Kind', () => {
      const hand1 = [
        { rank: 'A', suit: '♠' },
        { rank: '2', suit: '♣' },
        { rank: '3', suit: '♦' },
        { rank: '4', suit: '♠' },
        { rank: '5', suit: '♣' }
      ];
      const hand2 = [
        { rank: 'K', suit: '♠' },
        { rank: 'K', suit: '♦' },
        { rank: 'K', suit: '♥' },
        { rank: 'J', suit: '♣' },
        { rank: 'Q', suit: '♠' }
      ];
      expect(gameLogic.compareHands(hand1, hand2)).toBeGreaterThan(0);
    });

    test('Straight Flush vs Straight Flush (Different Suit)', () => {
      const hand1 = [
        { rank: '10', suit: '♠' },
        { rank: 'J', suit: '♠' },
        { rank: 'Q', suit: '♠' },
        { rank: 'K', suit: '♠' },
        { rank: 'A', suit: '♠' }
      ];
      const hand2 = [
        { rank: '10', suit: '♦' },
        { rank: 'J', suit: '♦' },
        { rank: 'Q', suit: '♦' },
        { rank: 'K', suit: '♦' },
        { rank: 'A', suit: '♦' }
      ];
      expect(gameLogic.compareHands(hand1, hand2)).toEqual(0);
    });

    test('Full House vs Four of a Kind', () => {
      const hand1 = [
        { rank: 'A', suit: '♠' },
        { rank: 'A', suit: '♣' },
        { rank: 'A', suit: '♦' },
        { rank: 'K', suit: '♠' },
        { rank: 'K', suit: '♣' }
      ];
      const hand2 = [
        { rank: 'K', suit: '♠' },
        { rank: 'K', suit: '♦' },
        { rank: 'K', suit: '♥' },
        { rank: 'K', suit: '♣' },
        { rank: 'Q', suit: '♠' }
      ];
      expect(gameLogic.compareHands(hand1, hand2)).toBeLessThan(0);
    });
    
    test('Straight vs Three of a Kind', () => {
      const hand1 = [
        { rank: 'A', suit: '♠' },
        { rank: '2', suit: '♣' },
        { rank: '3', suit: '♦' },
        { rank: '4', suit: '♠' },
        { rank: '5', suit: '♣' }
      ];
      const hand2 = [
        { rank: 'K', suit: '♠' },
        { rank: 'K', suit: '♦' },
        { rank: 'K', suit: '♥' },
        { rank: 'J', suit: '♣' },
        { rank: 'Q', suit: '♠' }
      ];
      expect(gameLogic.compareHands(hand1, hand2)).toBeGreaterThan(0);
    });   
    
    test('Full House vs Two Pairs', () => {
      const hand1 = [
          { rank: 'A', suit: '♠' },
          { rank: 'A', suit: '♣' },
          { rank: 'A', suit: '♦' },
          { rank: 'K', suit: '♠' },
          { rank: 'K', suit: '♣' }
      ];
      const hand2 = [
          { rank: 'Q', suit: '♠' },
          { rank: 'Q', suit: '♣' },
          { rank: 'J', suit: '♦' },
          { rank: 'J', suit: '♠' },
          { rank: '10', suit: '♣' }
      ];
      expect(gameLogic.compareHands(hand1, hand2)).toBeGreaterThan(0);
  });

    test('Straight vs Two Pairs', () => {
      const hand1 = [
          { rank: '9', suit: '♠' },
          { rank: '10', suit: '♦' },
          { rank: 'J', suit: '♣' },
          { rank: 'Q', suit: '♠' },
          { rank: 'K', suit: '♠' }
      ];
      const hand2 = [
          { rank: '2', suit: '♠' },
          { rank: '2', suit: '♦' },
          { rank: '7', suit: '♣' },
          { rank: '7', suit: '♠' },
          { rank: 'A', suit: '♠' }
      ];
      expect(gameLogic.compareHands(hand1, hand2)).toBeGreaterThan(0);
  });

  test('Test 33', () => {
    const hand1 = [
        { rank: 'Q', suit: '♠' },
        { rank: '4', suit: '♦' },
        { rank: 'K', suit: '♣' },
        { rank: '6', suit: '♠' },
        { rank: '8', suit: '♠' }
    ];
    const hand2 = [
        { rank: '7', suit: '♠' },
        { rank: 'Q', suit: '♦' },
        { rank: 'K', suit: '♣' },
        { rank: '6', suit: '♠' },
        { rank: '8', suit: '♠' }
    ];
    expect(gameLogic.compareHands(hand1, hand2)).toBeLessThan(0);
  });


    test('Test 34', () => {
      const hand1 = [
          { rank: 'K', suit: '♠' },
          { rank: '5', suit: '♦' },
          { rank: 'J', suit: '♣' },
          { rank: '4', suit: '♠' },
          { rank: '3', suit: '♠' }
      ];
      const hand2 = [
          { rank: '2', suit: '♠' },
          { rank: '8', suit: '♦' },
          { rank: 'J', suit: '♣' },
          { rank: '4', suit: '♠' },
          { rank: '3', suit: '♠' }
      ];
      expect(gameLogic.compareHands(hand1, hand2)).toBeGreaterThan(0);
    });

    test('Test 35', () => {
      const hand1 = [
          { rank: '4', suit: '♠' },
          { rank: '8', suit: '♦' },
          { rank: '9', suit: '♣' },
          { rank: '6', suit: '♠' },
          { rank: '2', suit: '♠' }
      ];
      const hand2 = [
          { rank: '9', suit: '♠' },
          { rank: '8', suit: '♦' },
          { rank: '4', suit: '♣' },
          { rank: '4', suit: '♠' },
          { rank: 'A', suit: '♠' }
      ];
      expect(gameLogic.compareHands(hand1, hand2)).toBeLessThan(0);
    });

    test('Test 36', () => {

      const hand1 = [
          { rank: '4', suit: '♠' },
          { rank: '8', suit: '♦' },
          { rank: '9', suit: '♣' },
          { rank: '6', suit: '♠' },
          { rank: '2', suit: '♠' }
      ];
      const hand2 = [
          { rank: '9', suit: '♠' },
          { rank: '8', suit: '♦' },
          { rank: '4', suit: '♣' },
          { rank: '4', suit: '♠' },
          { rank: 'A', suit: '♠' }
      ];
      expect(gameLogic.compareHands(hand1, hand2)).toBeLessThan(0);
    });


  test('Test 37', () => {
    const hand1 = [
        { rank: '6', suit: '♠' },
        { rank: '4', suit: '♦' },
        { rank: 'A', suit: '♣' },
        { rank: 'J', suit: '♠' },
        { rank: 'A', suit: '♠' }
    ];
    const hand2 = [
        { rank: 'Q', suit: '♠' },
        { rank: '6', suit: '♦' },
        { rank: 'A', suit: '♣' },
        { rank: 'J', suit: '♠' },
        { rank: 'A', suit: '♠' }
    ];
    expect(gameLogic.compareHands(hand1, hand2)).toBeLessThan(0);
  });
});

// // test('Player A wins with a higher three of a kind', () => {
// //     const playerA = { name: 'A', cards: [ { rank: '5', suit: '♣' }, { rank: '6', suit: '♠' } ] };
// //     const playerB = { name: 'B', cards: [ { rank: 'J', suit: '♦' }, { rank: 'Q', suit: '♦' } ] };
// //     const communityCards = [ { rank: 'Q', suit: '♠' }, { rank: '9', suit: '♠' }, { rank: '10', suit: '♠' }, { rank: '5', suit: '♦' }, { rank: '5', suit: '♠' } ];

// //     const game = {
// //       players: [playerA, playerB],
// //       communityCards
// //     };

// //     const winningPlayers = gameLogic.determineWinningHand(game);
// //     expect(winningPlayers.length).toBe(1);
// //     expect(winningPlayers[0]).toBe(playerA);
// // });

// //   test('two pairs with higher pairs should beat two pairs with lower pairs', () => {
// //     const hand1 = [ { rank: 'A', suit: '♠' }, { rank: 'A', suit: '♣' }, { rank: 'K', suit: '♠' }, { rank: 'K', suit: '♦' } ];
// //     const hand2 = [ { rank: 'Q', suit: '♠' }, { rank: 'Q', suit: '♣' }, { rank: 'J', suit: '♠' }, { rank: 'J', suit: '♦' } ];
// //     expect(gameLogic.compareHands(hand1, hand2)).toBeGreaterThan(0);
// //   });
  
// //   test('a straight flush should beat a full house', () => {
// //     const hand1 = [ { rank: '10', suit: '♠' }, { rank: '9', suit: '♠' }, { rank: '8', suit: '♠' }, { rank: '7', suit: '♠' }, { rank: '6', suit: '♠' } ];
// //     const hand2 = [ { rank: 'K', suit: '♠' }, { rank: 'K', suit: '♣' }, { rank: 'K', suit: '♦' }, { rank: '9', suit: '♥' }, { rank: '9', suit: '♣' } ];
// //     expect(gameLogic.compareHands(hand1, hand2)).toBeGreaterThan(0);
// //   });

// // });

// // // isFlush test cases
// // test('should detect a flush', () => {
// //   const cards1 = [
// //     { rank: 'K', suit: '♠' },
// //     { rank: 'Q', suit: '♠' },
// //     { rank: 'J', suit: '♠' },
// //     { rank: '10', suit: '♠' },
// //     { rank: '9', suit: '♠' },
// //   ];
// //   expect(isFlush(cards1)).toBe(true);
// // });

// // test('should not detect a flush', () => {
// //   const cards2 = [
// //     { rank: 'K', suit: '♠' },
// //     { rank: 'Q', suit: '♠' },
// //     { rank: 'J', suit: '♠' },
// //     { rank: '10', suit: '♠' },
// //     { rank: '9', suit: '♣' },
// //   ];
// //   expect(isFlush(cards2)).toBe(false);
// // });

// // // isStraightFlush test cases
// // test('should detect a straight flush', () => {
// //   const cards3 = [
// //     { rank: 'K', suit: '♠' },
// //     { rank: 'Q', suit: '♠' },
// //     { rank: 'J', suit: '♠' },
// //     { rank: '10', suit: '♠' },
// //     { rank: '9', suit: '♠' },
// //   ];
// //   expect(isStraightFlush(cards3)).toBe(true);
// // });

// test('should not detect a straight flush', () => {
//   const cards4 = [
//     { rank: 'K', suit: '♠' },
//     { rank: 'Q', suit: '♠' },
//     { rank: 'J', suit: '♠' },
//     { rank: '10', suit: '♠' },
//     { rank: '9', suit: '♣' },
//   ];
//   expect(isStraightFlush(cards4)).toBe(false);
// });