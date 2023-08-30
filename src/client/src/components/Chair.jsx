import { useState, useEffect, useRef } from "react";
import React from 'react';
import { io } from 'socket.io-client';
import Card from './Card';
import axios from 'axios';

const Chair = ({ game, socket, handStarted, playerData }) => {

  const myRef = useRef(null);
  const [takenSeats, setTakenSeats] = useState([]);
  const [playerNames, setPlayerNames] = useState(Array(6).fill(null));
  const [playerChips, setPlayerChips] = useState(Array(6).fill(null));
  const [playerCards, setPlayerCards] = useState(Array(6).fill(null));
  const [ethToEurRate, setEthToEurRate] = useState(null);
  const [ethToUsdRate, setEthToUsdRate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getETHConversionRate = async (currency) => {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,eur');
      return response.data.ethereum[currency.toLowerCase()];
    } catch (error) {
      console.error('Error fetching conversion rate:', error);
      return null;
    }
  };

  useEffect(() => {
    if (game && game.players) {
      setTakenSeats(game.players.filter(player => player !== null).map(player => player.seatNum));
      setPlayerNames(game.players.map(player => player !== null ? player.name : null));
      setPlayerChips(game.players.map(player => player !== null ? player.chips : null));
      const cards = Array(6).fill(null);
      game.players.forEach(player => {
        if (player.seatNum !== undefined) {
          cards[player.seatNum - 1] = player.hasFolded ? 'folded' : player.cards || null;
        }
      });
      setPlayerCards(cards);
      setPlayerChips(game.players.map(player => player.chips));
    }
  }, [game]);

  const handleAddPlayer = (id) => {
    const chairId = id;

    if (takenSeats.length === 6) {
      alert("The game is already full, please try again later.");
    } else if (takenSeats.includes(chairId)) {
      alert("This seat is already taken, please select a different one.");
    } else {
      const playerName = playerData.name;
      const chips = parseFloat(playerData.cryptoAmount * ethToEurRate);

      if (playerName !== null && chips !== null && game) {
        setTakenSeats([...takenSeats, chairId]);
        socket.current.emit("join_game", playerName, chips, chairId);
        setPlayerNames(prevPlayerNames => {
          const newPlayerNames = [...prevPlayerNames];
          newPlayerNames[chairId - 1] = playerName;
          return newPlayerNames;
        });
        setPlayerChips(prevPlayerChips => {
          const newPlayerChips = [...prevPlayerChips];
          newPlayerChips[chairId - 1] = parseInt(chips);
          return newPlayerChips;
        });
      }
    }
  }

  const cardToString = (card) => {
    if (!card) return '';
    const { rank, suit } = card;
    return `${rank}${suit}`;
  };

  function renderChair(seatNum) {
    if (game && game.players) {
      const player = game.players.find((p) => p.seatNum === seatNum);
      const chairStyles = {
        1: "row-start-1 row-end-2 col-start-2 col-end-2",
        2: "row-start-1 row-end-2 col-start-5 col-end-5",
        3: "row-start-2 row-end-3 col-start-6 col-end-6",
        4: "row-start-5 row-end-5 col-start-6 col-end-6",
        5: "row-start-5 row-end-5 col-start-1 col-end-1",
        6: "row-start-2 row-end-3 col-start-1 col-end-1",
      };

      return (
        <button
          key={player ? player.id : seatNum}
          index={seatNum}
          onClick={() => handleAddPlayer(seatNum)}
          className={`${chairStyles[seatNum]} text-white bg-[#2952e3] rounded-full cursor-pointer hover:bg-[#2546bd] w-20 h-16 p-2`}
        >
          {player ? player.name : `Chair ${seatNum}`}
          {player && player.chips && (
            <div className="text-white mt-1">€{(player.chips).toFixed(2)}</div>
          )}
          {handStarted && player && player.cards && (
            <div className="mt-4 flex justify-center items-center">
              {socket.current.id === player.socketId ? (
                <>
                  <Card id={1} card={player.cards[0]} />
                  <Card id={2} card={player.cards[1]} />
                </>
              ) : (
                <>
                  <Card id={1} card={null} />
                  <Card id={2} card={null} />
                </>
              )}
            </div>
          )}
        </button>
      );
    }
  }

  useEffect(() => {
    const fetchConversionRates = async () => {
      const eurRate = await getETHConversionRate('eur');
      const usdRate = await getETHConversionRate('usd');

      setEthToEurRate(eurRate);
      setEthToUsdRate(usdRate);
    };

    fetchConversionRates();
  }, []);

  return (
    <div className="z-10 ml-[70px] mt-[17px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] h-[85%] rounded-full grid grid-cols-6 grid-rows-6">
      {renderChair(1)}
      {renderChair(2)}
      {renderChair(3)}
      {renderChair(4)}
      {renderChair(5)}
      {renderChair(6)}
    </div>
  )
};

export default Chair;