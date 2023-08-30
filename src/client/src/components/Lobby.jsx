import React, { useEffect, useRef, useState, useCallback } from "react";
import '../app.css';
import { io } from 'socket.io-client';
import { Link } from 'react-router-dom';
import CommunityCard from './CommunityCard';
import Chair from './Chair';
import { ethers } from "ethers";
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader } from ".";
import logo2 from '../../images/Logo2.png'

const Lobby = () => {

    const location = useLocation();
    const playerData = location.state?.playerData;
    const myRef = useRef(null);
    const socket = useRef();
    const [game, setGame] = useState(null);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [timer, setTimer] = useState(null);
    const [betAmount, setBetAmount] = useState(0);
    const [startIndex, setStartIndex] = useState(0);
    const [raises, setRaises] = useState(0);
    const [actionsTaken, setActionsTaken] = useState(1);
    const [gameStarted, setGameStarted] = useState();
    const [handStarted, setHandStarted] = useState();
    const [communityCards, setCommunityCards] = useState(Array(5).fill(null));
    const [currentActionIndex, setCurrentActionIndex] = useState(0)
    const [pot, setPot] = useState(0);
    const [betMade, setBetmade] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cardsDealt, setCardsDealt] = useState(false);
    const [handReset, setHandReset] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        socket.current = io('http://localhost:3000');
        socket.current.emit("new_game");
        socket.current.on("game_data", (game) => {
            setGame(game);
            console.log(game);
        });

        socket.current.on("new_player", (game) => {
            setGame(game);
            if (game.players.length >= 2 && !gameStarted) {
                alert("Game able to start now");
                // Wait for 5 seconds before starting the game
                setTimeout(() => {
                    if (!cardsDealt) {
                        setCardsDealt(true);
                        socket.current.emit("deal_cards", game);
                        setGameStarted(true);
                        setHandStarted(true);
                    }
                }, 1000); // 1000 milliseconds = 1 seconds
            }
        });

        socket.current.on("winning_hand", (Player, Game) => {
            setGame(Game);
            const parsedPlayer = JSON.parse(JSON.stringify(Player));
            const winner = parsedPlayer[0].name;
            alert("Winning player is: " + winner);
            if (Game.players.length < 2) {
                setGameStarted(false);
                Game.gameOver = false;
            }
            resetHand(Game);
        });

        socket.current.on("hand_reset", async (updatedGame) => {
            console.log("hand reset: ", updatedGame);
            //setGame(updatedGame);
            setPot(updatedGame.pot);
            setBetAmount(updatedGame.betAmount);
            setBetmade(updatedGame.betMade);
            setCommunityCards(updatedGame.communityCards);
            setCurrentPlayerIndex(updatedGame.currentPlayerIndex);
            //setActionsTaken(actionsTaken + 1);
            setStartIndex(updatedGame.startIndex);
            //setGameStarted(false);

            if (updatedGame.players.length < 2) {
                console.log("game over");
                setGame(updatedGame);
                setGameStarted(false);
                setHandStarted(false);
                updatedGame.gameOver = false;

            } else if (!updatedGame.gameOver) {
                await dealCards(updatedGame);
            };
        })

        const dealCards = async (gameData) => {
            if (!cardsDealt) {
                setHandStarted(true);
                setCardsDealt(true);
                socket.current.emit("deal_cards", gameData);
            }
        };


        // socket.current.on("folded", (Game, Player) => {
        //     setGame(Game);
        //     nextPlayer();
        // });

        socket.current.on("bets_placed", (Game) => {
            setGame(Game);
            setPot(Game.pot);
        });

        socket.current.on("cards_dealt", (Game) => {
            setGame(Game);
        });

        socket.current.on("winner", (Game, Winner) => {
            setGame(Game);
            consooe.log("winning player: ", Winner);
        });

        // socket.current.on("called", (Game) => {
        //     setGame(Game);
        //     setPot(Game.pot);
        // });

        // socket.current.on("checked", (Game) => {
        //     setGame(Game);
        // });

        socket.current.on("all_in_event", (Game) => {
            setGame(Game);
            setPot(Game.pot);
        });

        socket.current.on("all_in_called", (Game) => {
            setGame(Game);
        });

        socket.current.on("actions_reset", (Game) => {
            setGame(Game);
            updateGame(Game);
        });

        socket.current.on("remaining_cards_dealt", (game) => {
            setGame(game);
            setCommunityCards(game.communityCards);
        });

        socket.current.on("game_updated", async (updatedGame) => {
            setGame(updatedGame);
            setPot(updatedGame.pot);
            setBetAmount(updatedGame.betAmount);
            setBetmade(updatedGame.betMade);
            setCommunityCards(updatedGame.communityCards);
            setCurrentPlayerIndex(updatedGame.currentPlayerIndex);
            setActionsTaken(actionsTaken + 1);
        });

        socket.current.on("leave_game_processed", (Game) => {
            setGame(Game);
            setLoading(false);
            navigate("/");
        });

        socket.current.on("player_eliminated", async (updatedGame, player) => {
            console.log(player, " eliminated...");
            setLoading(true);
            setGame(updatedGame);
            setBetAmount(updatedGame.betAmount);
            setBetmade(updatedGame.betMade);
            setCommunityCards(updatedGame.communityCards);
            setCurrentPlayerIndex(updatedGame.currentPlayerIndex);
            setLoading(false);

            if (!eliminationHandled) {
                setEliminationHandled(true);
                await handleLeaveGameWithLoader(updatedGame);
                navigate("/");
            }
        });

        // Cleanup function
        return () => {
            socket.current.disconnect();
        };

    }, []);

    async function getPlayerAddress() {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const address = await signer.getAddress();
            return address;
        } catch (error) {
            console.error('Error getting account address:', error);
            return null;
        }
    }

    const countActivePlayers = (game) => {
        if (!game || !game.players) return 0;
        return game.players.filter((player) => !player["hasFolded"]).length;
    };

    const countAllIn = (activePlayers) => {
        if (!activePlayers) return 0;
        return activePlayers.filter((player) => player.isAllIn).length;
    };


    const activePlayers = (game) => {
        return game.players.filter((player) => !player["hasFolded"]);
    };


    const handleRaise = () => {
        const raiseAmount = prompt("Enter your raise amount:");
        alert("Bet amount: " + raiseAmount);
        setBetAmount(raiseAmount);
        const currentPlayerId = game.players[currentPlayerIndex].id;
        setBetmade(true);

        if (parseFloat(raiseAmount) > game.players[currentPlayerIndex].chips) {
            alert("You don't have enough chips to make that bet!");
            return;
        } else if (parseFloat(raiseAmount) <= game.currentBet) {
            alert("Raise amount too small");
            return;
        }

        //emit socket event to update the game state to the server
        socket.current.emit("place_bets", game, currentPlayerId, parseFloat(raiseAmount));
        console.log(game.players[currentPlayerIndex].name + " raised");

        setActionsTaken(actionsTaken + 1);
        setRaises(raises + 1);
        nextPlayer();

    };

    const handleCall = () => {
        const currentPlayer = game.players[currentPlayerIndex];
        const callAmount = game.currentBet - currentPlayer.currentBet;

        if (callAmount <= 0) {
            alert("Cannot call. No need to match any bet.");
            return;
        }

        if (game.currentBetbetAmount >= currentPlayer.chips) {
            currentPlayer.isAllIn = true;
            currentPlayer.hasActed = true;
            socket.current.emit("call", game, game.players[currentPlayerIndex], currentPlayer.chips);
            setActionsTaken(actionsTaken + 1);
            console.log(game.players[currentPlayerIndex].name + " called");
            updateGame(game);
            game.pot += currentPlayer.chips;
            game.players[currentPlayerIndex].chips = 0;
            game.actionsTaken += 1;
            nextPlayer();
        }
        else {
            currentPlayer.hasActed = true;
            socket.current.emit("call", game, game.players[currentPlayerIndex]);
            setActionsTaken(actionsTaken + 1);
            console.log(game.players[currentPlayerIndex].name + " called");
            updateGame(game);
            game.pot += game.currentBet;
            game.players[currentPlayerIndex].chips -= game.currentBet;
            game.actionsTaken += 1;
            nextPlayer();
        }
    };


    const handleFold = () => {
        socket.current.emit("fold", game, game.players[currentPlayerIndex].id);
        setActionsTaken(actionsTaken + 1);
        const updatedGame = { ...game };
        updatedGame.players[currentPlayerIndex].hasFolded = true;  // Set current player's hasFolded to true
        updatedGame.players[currentPlayerIndex].hasActed = true;
        updatedGame.actionsTaken += 1;
        setGame(updatedGame);
        console.log(game.players[currentPlayerIndex].name + " folded");
        nextPlayer();
    };

    const handleCheck = () => {
        setActionsTaken(actionsTaken + 1);
        const currentPlayer = game.players[currentPlayerIndex];
        //currentPlayer.hasActed = true;
        socket.current.emit("check", game, game.players[currentPlayerIndex]);
        game.actionsTaken += 1;
        console.log(game.players[currentPlayerIndex].name + " checked");
        nextPlayer();
    };

    const handleAllIn = () => {
        setBetmade(true);
        setActionsTaken(actionsTaken + 1);
        const currentPlayer = game.players[currentPlayerIndex];
        currentPlayer.hasActed = true;
        currentPlayer.isAllIn = true;
        socket.current.emit("all_in", game, game.players[currentPlayerIndex].id);
        setBetAmount(game.players[currentActionIndex].chips);
        game.pot += game.players[currentActionIndex].chips;
        console.log(game.players[currentPlayerIndex].name + " is all in!");
        nextPlayer();
    }

    async function handleLeaveGame(game) {
        return new Promise(async (resolve) => {
            const onProcessed = () => {
                socket.current.off("leave_game_processed", onProcessed);
                resolve();
            };
            socket.current.on("leave_game_processed", onProcessed);

            const playerAddress = await getPlayerAddress();
            if (!playerAddress) {
                return;
            }
            socket.current.emit("leave_game", game, playerAddress, socket.current.id);
        });
    }

    async function dealRemainingCards(Game) {
        socket.current.emit("deal_remaining_cards", Game);
    }

    async function handleLeaveGameWithLoader(game) {
        console.log("game: ", game);
        setLoading(true);
        await handleLeaveGame(game);
        setLoading(false);
    }


    function allPlayersActed(players) {
        return players.every(player => player.hasActed === true);
    }

    const areAllPlayersAllIn = (players) => {
        return players.every(player => player.isAllIn === true);
    };

    const allInCount = (players) => {
        return players.filter((player) => !player["isAllIn"]).length;
    };


    const resetActions = (game) => {
        if (!game || !game.players) return;

        // Update the hasActed property for all players in the game
        const updatedPlayers = game.players.map(player => ({ ...player, hasActed: false }));
        const updatedGame = { ...game, players: updatedPlayers };
        setBetmade(false);

        // Emit an event to update the game state on the server
        socket.current.emit("reset_actions", updatedGame);
        return updatedGame;
    };


    const nextPlayer = () => {
        const activePlayers = countActivePlayers(game);
        //console.log("next player: ", game);

        // If there's only one active player left, handle the end of the round
        if (activePlayers === 1 && !game.isOver) {
            // Handle the end of the round or game here
            const winnerIndex = game.players.findIndex((player) => !player.hasFolded);
            alert("Only one player left. The winner is: " + game.players[winnerIndex].name);
            resetHand(game);
            setGame(game);
        } else {
            let actionIndex = (currentPlayerIndex + 1) % game.players.length;

            while (game.players[actionIndex].hasFolded) {
                actionIndex = (actionIndex + 1) % game.players.length;
            }
            setCurrentPlayerIndex(actionIndex);
            game.currentPlayerIndex = actionIndex;
            // socket.current.emit("update_current_player", game, currentPlayerIndex);
        }
    };


    const updateBettingRound = useCallback(async (game) => {
        const activo = activePlayers(game);
        if (allInCount(activo) <= 1 && allPlayersActed(activo)) {
            // Go straight to showdown
            game.actionsTaken = 0;
            console.log("Showdown!");
            await dealRemainingCards(game);
            if (!game.isOver) {
                socket.current.emit("get_winning_hand", game);
            }
        }
        else if (game.bettingRound === 0 && allPlayersActed(activo) && countAllIn(activo) === 0) {
            //game.actionsTaken = 0;
            let u = resetActions(game);
            setBetmade(false);
            //setGame(u);
            //setCurrentPlayerIndex(startIndex);
            socket.current.emit("deal_flop", u);
        } else if (game.bettingRound === 1 && allPlayersActed(activo) && countAllIn(activo) === 0) {
            game.actionsTaken = 0;
            let u = resetActions(game);
            setBetmade(false);
            setGame(u);
            let allin = areAllPlayersAllIn(activo);

            socket.current.emit("deal_turn", u);
        } else if (game.bettingRound === 2 && allPlayersActed(activo) && countAllIn(activo) === 0) {
            game.actionsTaken = 0;
            let u = resetActions(game);
            setBetmade(false);
            setGame(u);
            //setCurrentPlayerIndex(startIndex);
            socket.current.emit("deal_river", u);
        } else if (game.bettingRound === 3 && allPlayersActed(activo)) {
            game.actionsTaken = 0;
            let u = resetActions(game);
            socket.current.emit("get_winning_hand", u);
        }

    }, []);


    const resetHand = (latestGame) => {
        setPot(0);
        setHandStarted(false);
        setCommunityCards(Array(5).fill(null));
        setActionsTaken(1);
        setBetmade(false);
        setCardsDealt(false);

        latestGame.bettingRound = 0;
        latestGame.actionsTaken = 0;
        latestGame.isOver = false;
        latestGame.pot = 0;

        for (const player of latestGame.players) {
            player['cards'] = [];
            player['wholeCards'] = [];
            player['hasFolded'] = false;
            player['hand'] = '';
            player['hasActed'] = false;
            player['isAllIn'] = false;
        }
        socket.current.emit("reset_game", latestGame);
    };

    const updateGame = (updatedGame) => {
        setGame(updatedGame);
    };

    useEffect(() => {

        if (game && game.players) {
            updateBettingRound(game);
        }
    }, [actionsTaken, pot]);

    return (
        <div>
            <div className="gradient-bg-poker absolute inset-0">
                <button
                    className="absolute left-2 top-2 text-white bg-[#2952e3] py-2 px-7 rounded cursor-pointer hover:bg-[#2546bd]" onClick={() => handleLeaveGameWithLoader(game)}>
                    Leave Game
                </button>
                {game && game.players.length >= 2 && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-white text-2xl font-semibold mt-5">
                        {game.players[currentPlayerIndex].name}'s turn
                    </div>
                )}
                <Chair game={game} socket={socket} handStarted={handStarted} playerData={{ ...playerData }} />
                <div className="flex bg-green-600 ring-4 ring-yellow-800 absolute border-8 border-yellow-800 top-1/2 left-1/2 w-3/4 h-3/5 -translate-x-1/2 -translate-y-1/2 rounded-full">
                <div className="place-content-evenly flex flex-col justify-start items-center h-full w-full mt-10">
                    <img src={logo2} alt="logo2" className='w-64 cursor-pointer top-0' />
                    {game && <h1 className="text-xl font-semibold text-white items-bottom">POT: <div>{pot.toFixed(2)}</div></h1>}
                </div>
            </div>
            </div>
            <div className="community-cards">
                {handStarted &&
                    <>
                        <CommunityCard id={1} card={communityCards[0]} />
                        <CommunityCard id={2} card={communityCards[1]} />
                        <CommunityCard id={3} card={communityCards[2]} />
                        <CommunityCard id={4} card={communityCards[3]} />
                        <CommunityCard id={5} card={communityCards[4]} />
                    </>
                }
            </div>
            {
                game
                    ? game.players.map((player, index) => (
                        <div key={player.id}>
                            {/* Render other player information here */}

                            {index === currentPlayerIndex && socket.current.id === player.socketId && gameStarted && (
                                <div className="buttons absolute bottom-0 right-0 flex justify-end mb-16 mr-8 z-10">
                                    {betMade === false ? (
                                        <button className="bg-red-600 hover:bg-red-600 text-white py-4 px-8 rounded mr-2" onClick={() => handleCheck()}>
                                            Check
                                        </button>
                                    ) : null}
                                    <button className="bg-red-600 hover:bg-red-600 text-white py-4 px-8 rounded mr-2" onClick={() => handleRaise()}>
                                        Raise
                                    </button>
                                    {betMade === true ? (
                                        <button className="bg-red-600 hover:bg-red-600 text-white py-4 px-8 rounded mr-2" onClick={() => handleCall()}>
                                            Call
                                        </button>
                                    ) : null}
                                    <button className="bg-red-600 hover:bg-red-600 text-white py-4 px-8 rounded mr-2" onClick={() => handleFold()}>
                                        Fold
                                    </button>
                                    <button className="bg-red-600 hover:bg-red-600 text-white py-4 px-8 rounded mr-2" onClick={() => handleAllIn()}>
                                        All in
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                    : null
            }
            {loading && (
                <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                    <Loader />
                </div>
            )}
        </div>
    );
}

export default Lobby;