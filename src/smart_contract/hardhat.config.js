require("@nomiclabs/hardhat-ethers");
require('dotenv').config();
const api_key = process.env.API_KEY;
const private_key = process.env.PRIVATE_KEY;


module.exports = {
  solidity: "0.8.0",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${api_key}`,
      accounts: [`0x${private_key}`]
    }
  }
};
