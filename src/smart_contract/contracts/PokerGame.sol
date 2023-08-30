// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract PokerGame {
    struct Player {
        bool joined;
        uint256 balance;
        string name;
    }

    mapping(address => Player) public players;
    address[] public playerList;

    function buyIn(string memory _name) public payable {
        require(
            msg.value > 0,
            "Must send a positive amount of Ether to buy in."
        );
       // require(!players[msg.sender].joined, "Player already joined the game.");

        players[msg.sender] = Player({
            balance: msg.value,
            joined: true,
            name: _name
        });
        playerList.push(msg.sender);
    }

    function exitGame(int256 winnings) public {
     //   require(players[msg.sender].joined, "Player not in the game.");

        if (winnings > 0) {
            uint256 winningsInWei = uint256(winnings);
            require(
                address(this).balance >= winningsInWei,
                "Not enough contract balance to pay winnings."
            );

            // Send winnings directly to the player
            payable(msg.sender).transfer(winningsInWei);
        } else if (winnings < 0) {
            uint256 lossesInWei = uint256(-winnings);
            require(
                players[msg.sender].balance >= lossesInWei,
                "Player doesn't have enough balance to cover losses."
            );

            // Deduct losses from the player's balance and send it back
            players[msg.sender].balance -= lossesInWei;
            payable(msg.sender).transfer(players[msg.sender].balance);
        } else if (winnings == 0) {
            // If there are no winnings or losses, just return the player's balance
            payable(msg.sender).transfer(players[msg.sender].balance);
        }

        removePlayer(msg.sender);
    }

    function removePlayer(address playerToRemove) private {
        for (uint256 i = 0; i < playerList.length; i++) {
            if (playerList[i] == playerToRemove) {
                playerList[i] = playerList[playerList.length - 1];
                playerList.pop();
                players[playerToRemove].joined = false;
                break;
            }
        }
    }
}
