import React, { useEffect, useInsertionEffect, useLayoutEffect, UseState } from 'react';
import { ethers } from 'ethers';

import { contractABI, contractAddress } from '../utils/constants';
import { useState } from 'react';

export const TransactionContext = React.createContext();

const { ethereum } = window;

// Function to fetch smart contract
const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    console.log({ provider, signer, transactionContract });
}

// Function to call getEthereumContract
export const TransactionProvider = ({ children }) => {

    const [connectedAccount, setConnectedAccount] = useState("");

    const checkIfWalletIsConnected = async () => {
        try {
            if (!ethereum) return alert("Please install Metamask!");

            const accounts = await ethereum.request({ method: "eth_accounts" });

            // Check if there is an account
            if (accounts.length) {
                setConnectedAccount(accounts[0]);
            }
            else {
                console.log("No accounts found..");
            }
        } catch (error) {
            console.log(error);
            throw new Error("Error with checkIfWalletIsConnected function");
        }
    }

    const connectWallet = async () => {
        try {
            if (!ethereum) return alert("Please install Metamask!");
            const accounts = await ethereum.request({ method: "eth_requestAccounts" });

            setConnectedAccount(accounts[0]);
        } catch (error) {
            console.log(error);
            throw new Error("Error with connectWallet function");
        }
    }

    const handleTransaction = async () => {
        try {
            if (!ethereum) return alert("Please install Metamask!");

            // Get data from poker game

        } catch (error) {
            console.log(error);
            throw new Error("Error with handleTransaction function");
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    return (
        <TransactionContext.Provider value={{ connectWallet, connectedAccount }}>
            {children}
        </TransactionContext.Provider>
    )
}
