import { AiFillPlayCircle } from "react-icons/ai";
import { SiEthereum } from 'react-icons/si';
import { BsInfoCircle } from 'react-icons/bs';
import React, { useEffect, useRef, useState } from "react";
import { Loader } from ".";
import { Lobby } from ".";
import { Link, useNavigate } from 'react-router-dom';
import { ethers } from "ethers";
import PokerGameArtifact from "./PokerGame.json";


const Poker = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [provider, setProvider] = useState(null);
    const [name, setName] = useState("");
    const [cryptoAmount, setCryptoAmount] = useState(0);
    const navigate = useNavigate();
    const [gameJoined, setGameJoined] = useState(false);
    const [playerData, setPlayerData] = useState(null);

    const contractABI = PokerGameArtifact.abi; // contract ABI
    const contractAddress = "0xb57FeaD7E1e9cE79037efE969e9480CDA9e61d5c"; // contract address

    const joinGame = async (name, cryptoAmount) => {
        if (!provider) {
            alert("Please install MetaMask to use this dApp!");
            return;
        }

        try {
            setIsLoading(true); // Start loading
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI, signer);

            // Convert the cryptoAmount to Wei
            const weiAmount = ethers.utils.parseEther(cryptoAmount.toString());

            // Call the buyIn function in the smart contract
            const transaction = await contract.buyIn(name, { value: weiAmount });

            // Wait for the transaction to be mined
            await transaction.wait();
            setIsLoading(false); // Stop loading
        } catch (error) {
            setIsLoading(false); // Stop loading
            console.error("Error joining the game:", error);
        }
        setPlayerData({ name, cryptoAmount });
        setGameJoined(true);

        navigate('/game', { state: { playerData: { name, cryptoAmount } } });
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
    };

    const handleCryptoAmountChange = (e) => {
        setCryptoAmount(e.target.value);
    };

    const handlePlayButtonClick = async () => {
        setShowModal(true);
    };

    const fetchPlayerData = async () => {
        try {
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI, signer);
            const playerAddress = await signer.getAddress();
            const data = await contract.players(playerAddress);

            // Convert the data to an object
            const playerData = {
                joined: data.joined,
                balance: ethers.utils.formatEther(data.balance),
                name: data.name
            };

            setPlayerData(playerData);
        } catch (error) {
            console.error("Error fetching player data:", error);
        }
    };


    useEffect(() => {
        const initializeProvider = async () => {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                setProvider(provider);
            } else {
                alert("Please install MetaMask to use this dApp!");
            }
        };

        initializeProvider();
    }, []);

    return (
        <>
            {gameJoined ? (
                <Lobby playerData={playerData} />
            ) : (
                <div className="gradient-bg-poker flex flex-col flex-1 items-center justify-start w-full md:mt-0">
                    <div className=" border-black p-3 justify-end items-start flex-col rounded-xl h-40 sm:w-72 w-full my-5 eth-card white-glassmorphism">
                        <div className="flex justify-between flex-col w-full h-full">
                            <div className="flex justify-between items-start">
                                <div className="w-10 h-10 rounded-full border-2 border-white flex justify-center items-center">
                                    <SiEthereum fontSize={21} color="#fff" />
                                </div>
                                <BsInfoCircle fontSize={17} color="#fff" />
                            </div>
                            <div>
                                <p className="text-white font-light text-sm">
                                    <b>Address:</b> 0xasjfndjvn...dofndn
                                </p>
                                <p className="text-white font-semibold text-lg mt-1">
                                    Ethereum
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex w-full justify-center items-center">

                        <button
                            type="button"
                            onClick={handlePlayButtonClick}
                            className="w-2/3 flex flex-row justify-center items-center my-5 bg-[#2952e3] p-8 rounded-full cursor-pointer hover:bg-[#2546bd]"
                        >
                            <p className="text-white text-3xl text-bold">Play Game</p>
                        </button>


                        {showModal && (
                            <div className="fixed z-10 inset-0 overflow-y-auto">
                                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                    <div
                                        className="fixed inset-0 transition-opacity"
                                        aria-hidden="true"
                                        onClick={() => setShowModal(false)}
                                    >
                                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                                    </div>
                                    <div
                                        className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
                                        role="dialog"
                                        aria-modal="true"
                                        aria-labelledby="modal-headline"
                                    >
                                        <div>
                                            <div>
                                                <h3
                                                    className="text-lg leading-6 font-medium text-gray-900"
                                                    id="modal-headline"
                                                >
                                                    Join Poker Game
                                                </h3>
                                            </div>
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    placeholder="Enter your name"
                                                    className="border border-gray-300 rounded p-2 w-full"
                                                    value={name}
                                                    onChange={handleNameChange}
                                                />
                                            </div>
                                            <div className="mt-2">
                                                <input
                                                    type="number"
                                                    placeholder="Enter crypto amount"
                                                    className="border border-gray-300 rounded p-2 w-full"
                                                    value={cryptoAmount}
                                                    onChange={handleCryptoAmountChange}
                                                />
                                            </div>
                                            <div className="mt-5 sm:mt-6">
                                                <button
                                                    type="button"
                                                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                                                    onClick={async () => {
                                                        setShowModal(false); // Close the modal
                                                        try {
                                                            await joinGame(name, cryptoAmount);
                                                            //console.log(playerData);
                                                            console.log(name, cryptoAmount);
                                                            navigate('/game', { state: { playerData: { name, cryptoAmount } } }); // Pass the entire playerData object
                                                        } catch (error) {
                                                            console.error("Transaction unsuccessful..");
                                                        }
                                                    }}
                                                    disabled={isLoading} // Disable the button while loading
                                                >
                                                    {isLoading ? <Loader /> : 'Join Game'}
                                                </button>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {isLoading && (
                        <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                            <Loader />
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default Poker;