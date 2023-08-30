const commonStyles = "min-h-[70px] sm:px-0 px-2 sm:min-w-[120px] flex justify-center items-center border-[0.5px] border-gray-400 text-sm font-light text-white";
import { TransactionContext } from "../context/TransactionContext";
import React, { useContext } from "react";

const Welcome = () => {

    const { connectWallet, connectedAccount } = useContext(TransactionContext);

    return (
        <div className="flex w-full justify-center items-center">
            <div className="flex md:flex-row flex-col items-start justify-between md:p-20 py-12 px-4">
                <div className="flex flex-1 justify-start flex-col md:mr-10">
                    <h1 className="text-white text-3xl sm:text-5xl text-gradient py-1">Play Poker <br />With Crypto!</h1>
                    <p className="text-left mt-6 text-white font-light md:w-8/12 w-11/12">Explore the cryptocurrency poker world. Easily connect your crypto wallet to enjoy online cryptocurrency Texas Holdem' games!</p>
                    {!connectedAccount && (
                        <button
                            type="button"
                            onClick={connectWallet}
                            className="flex flex-row justify-center items-center my-5 bg-[#2952e3] p-8 rounded-full cursor-pointer hover:bg-[#2546bd]"
                        >
                            <p className="text-white text-3xl font-semibold">Connect Wallet</p>
                        </button>
                    )}
                    <div className="grid sm:grid-cols-3 grid-cols-2 w-full mt-10">
                        <div className={`rounded-tl-2xl ${commonStyles}`}>Secure</div>
                        <div className={` ${commonStyles}`}>Reliable</div>
                        <div className={`rounded-tr-2xl ${commonStyles}`}>Easy</div>
                        <div className={`rounded-bl-2xl ${commonStyles}`}>Ethereum</div>
                        <div className={`${commonStyles}`}>Texas Holdem'</div>
                        <div className={`rounded-br-2xl ${commonStyles}`}>Blockchain</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Welcome;