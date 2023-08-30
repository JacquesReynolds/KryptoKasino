const { userInfo } = require('os');
const socketIO = require('socket.io');
const gameLogic = require('../game-logic.js')
const { v4: uuidv4 } = require('uuid');
const { JsonRpcProvider } = require('ethers');
const { ethers } = require("ethers");
const { BigNumber } = ethers;
require('dotenv').config();
const api_key = process.env.API_KEY;
const private_key = process.env.PRIVATE_KEY;
const pokerGame = require("../../smart_contract/artifacts/contracts/PokerGame.sol/PokerGame.json");
const axios = require('axios');

const contractABI = pokerGame.abi;
const contractAddress = '0xb57FeaD7E1e9cE79037efE969e9480CDA9e61d5c';

exports.sio = server => {
    return socketIO(server, {
        transport: ['polling'],
        cors: {
            origin: "*"
        }
    })
};

const getETHConversionRate = async (currency) => {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,eur');
        return response.data.ethereum[currency.toLowerCase()];
    } catch (error) {
        console.error('Error fetching conversion rate:', error);
        return null;
    }
};

exports.updateAllClients = function (game, io, socket_event) {

    for (const player of game.players) {
        const socket = io.sockets.sockets.get(player.socketId);

        if (socket) {
            if (game.eliminations.includes(player.id) || (player.chips === 0 && game.isOver)) {
                // Player is in the elimination list and has no chips
                console.log("player eliminated...");
                update = gameLogic.removePlayer(game, player);
                socket.emit("player_eliminated", update, player);
            } else {
                console.log("sending ", socket_event, " to: ", player.socketId);
                socket.emit(socket_event, game);
            }
        } else {
            console.log("entered outside else.");
            io.emit(socket_event, game);
        }
    }

    // Remove eliminated players from the game object
    game.players = game.players.filter(player => !game.eliminations.includes(player));
}


const chipsToWei = chips => {
    const weiPerEth = ethers.utils.parseUnits('1', 'ether');
    const chipsPerEth = 1000; // assume 1 ETH = 1000 chips
    const eth = chips / chipsPerEth;
    const wei = eth * weiPerEth;
    return wei.toFixed(0); // round to 0 decimal places and convert to string
};



async function exitGame(playerAddress, winningsInWei) {
    // Call the exitGame() function with the winnings

    // Initialize the provider
    const provider = new ethers.providers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${api_key}`);

    console.log("provider: ", provider);

    // Load the server's private key
    const serverPrivateKey = private_key;

    // Create a wallet instance using the server's private key
    const wallet = new ethers.Wallet(serverPrivateKey, provider);

    // Check if the playerAddress is a valid Ethereum address
    if (!ethers.utils.isAddress(playerAddress)) {
        throw new Error(`Invalid Ethereum address: ${playerAddress}`);
    }

    // Initialize the contract instance with the ABI and contract address
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);


    try {
        // Call the exitGame() function with the winnings
        const transactionResponse = await contract.exitGame(winningsInWei);

        // Wait for the transaction to be mined and get the transaction receipt
        const transactionReceipt = await transactionResponse.wait();

        return transactionReceipt;
    } catch (error) {
        console.log(winningsInWei);
        console.error("Error leaving the game: ", error);
    }

}

async function removePlayer(playerAddress) {
    // Initialize the provider
    const provider = new ethers.providers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${api_key}`);

    // Load the server's private key
    const serverPrivateKey = private_key;

    // Create a wallet instance using the server's private key
    const wallet = new ethers.Wallet(serverPrivateKey, provider);

    // Check if the playerAddress is a valid Ethereum address
    if (!ethers.utils.isAddress(playerAddress)) {
        throw new Error(`Invalid Ethereum address: ${playerAddress}`);
    }

    // Initialize the contract instance with the ABI and contract address
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    try {
        // Call the removePlayer() function in the smart contract
        const transactionResponse = await contract.removePlayer(playerAddress);

        // Wait for the transaction to be mined and get the transaction receipt
        const transactionReceipt = await transactionResponse.wait();

        return transactionReceipt;
    } catch (error) {
        console.error("Error removing the player: ", error);
    }
}


exports.connection = io => {
    let Game;
    io.on("connection", socket => {
        //console.log("A user is connected");
        console.log(`User connect with id: + ${socket.id}`);

        socket.on('join_room', (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.id} joined room ${roomId}`);
        });

        //listen for new_game event
        socket.on("new_game", () => {
            console.log("new_game event received");
            if (!Game) {
                Game = gameLogic.newGame();
            }
            io.emit("game_data", Game);
        });

        // Listen for play_game event
        socket.on("join_game", (playerName, Chips, seatNum) => {
            console.log("join_game event received");
            if (Game) {
                // Generate a new UUID for each player
                const playerId = uuidv4();
                update = gameLogic.addPlayer(playerId, socket.id, Game, playerName, Chips, seatNum);
                exports.updateAllClients(update, io, "new_player");
            };
        });

        socket.on("deal_cards", (game) => {
            console.log("deal_cards event received");
            update = gameLogic.dealHoleCards(game, socket.id, io);
            exports.updateAllClients(update, io, "game_updated");
        });


        socket.on("deal_flop", (game) => {
            console.log("deal_flop event received");
            update = gameLogic.dealFlop(game, io);
            exports.updateAllClients(update, io, "game_updated");
        });

        socket.on("deal_turn", (game) => {
            console.log("deal_turn event received");
            update = gameLogic.dealTurn(game, socket.id, io);
            exports.updateAllClients(update, io, "game_updated");
        });

        socket.on("deal_river", (game) => {
            console.log("deal_river event received");
            update = gameLogic.dealTurn(game, socket.id, io);
            exports.updateAllClients(update, io, "game_updated");
        });

        socket.on("get_winning_hand", (game) => {
            console.log("get_winning_hand event received");
            winner = gameLogic.checkForWinner(game);
            io.emit("winning_hand", winner, game);
        });

        socket.on("reset_game", (game) => {
            console.log("reset_game event received");
            update = gameLogic.endOfHand(game);
            exports.updateAllClients(update, io, "hand_reset");
        });


        socket.on("fold", (game, player) => {
            console.log("fold event received");
            update = gameLogic.fold(game, player);
            exports.updateAllClients(update, io, "game_updated");
        });

        socket.on("place_bets", (game, playerId, amount) => {
            console.log("place_bets event received");
            if (!game || !game.players) {
                console.error("Game object or players not available.");
                return;
            }
            update = gameLogic.placeBets(game, playerId, amount);
            exports.updateAllClients(update, io, "game_updated");
        });

        socket.on("call", (game, playerId) => {
            console.log("call event received");
            if (!game || !game.players) {
                console.error("Game object or players not available.");
                return;
            }
            update = gameLogic.call(game, playerId);
            exports.updateAllClients(update, io, "game_updated");
        });

        socket.on("check", (game, player) => {
            console.log("check event received");
            if (!game || !game.players) {
                console.error("Game object or players not available.");
                return;
            }
            update = gameLogic.check(game, player);

            exports.updateAllClients(update, io, "game_updated");
        });

        socket.on("all_in", (game, player) => {
            console.log("all in event received");
            if (!game || !game.players) {
                console.error("Game object or players not available.");
                return;
            }
            update = gameLogic.allIn(game, player);
            exports.updateAllClients(update, io, "game_updated");
        });

        socket.on("call_all_in", (game, player) => {
            console.log("call_all in event received");
            if (!game || !game.players) {
                console.error("Game object or players not available.");
                return;
            }
            update = gameLogic.allIn(game, player);
            io.emit("all_in_called", update);
        });

        socket.on("deal_remaining_cards", (game) => {
            console.log("deal_remaining_cards event received");
            if (!game || !game.players) {
                console.error("Game object or players not available.");
                return;
            }
            update = gameLogic.dealRemainingCards(game);
            io.emit("remaining_cards_dealt", update);
        });

        socket.on("reset_actions", (game) => {
            console.log("reset actions event received");
            if (!game || !game.players) {
                console.error("Game object or players not available.");
                return;
            }
            update = gameLogic.resetActions(game);
            io.emit("actions_reset", update);
        });

        socket.on("update_current_player", (game, playerIndex) => {
            const newIndex = (playerIndex + 1) % game.players.length;
            game.currentPlayerIndex = newIndex;
            console.log("update_current_player event received");
            if (!game || !game.players) {
                console.error("Game object or players not available.");
                return;
            }
            exports.updateAllClients(game, io, 'game_updated');
        })

        socket.on("leave_game", async (game, playerAddress, socketId) => {
            // Find the player object by socket ID
            const player = game.players.findIndex(p => p.socketId === socketId);
            const eurRate = await getETHConversionRate('eur');


            const chips = Number(game.players[player].chips);
            const win = chips - Number(game.players[player].buyIn);
            const winnings = win / eurRate;
            const roundedWinnings = winnings.toFixed(18);
            const winningsInWei = ethers.utils.parseEther(roundedWinnings);

            console.log(winningsInWei);

            try {
                const receipt = await exitGame(playerAddress, winningsInWei);
                console.log("Transaction receipt: ", receipt);

                // Remove the player from the game object
                update = gameLogic.removePlayer(game, game.players[player]);

                // Emit the "leave_game_processed" event back to the client
                const socket = io.sockets.sockets.get(socketId);
                socket.emit("leave_game_processed", update);

            } catch (error) {
                console.error("Error leaving the game: ", error);
            }
        });

        socket.on("disconnect", () => {
            console.log(`socket ${socket.id} disconnected`)
            // Find the player in the game object
            const playerIndex = Game.players.findIndex(player => player.socketId === socket.id);

            // Remove the player from the game object
            update = gameLogic.removePlayer(Game, Game.players[playerIndex]);

            // Update the game state
            exports.updateAllClients(update, io, "game_updated");
        });
    });
}