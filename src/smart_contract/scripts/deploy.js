async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contract with the account:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance));

  const PokerGame = await ethers.getContractFactory("PokerGame");
  const pokerGame = await PokerGame.deploy();

  await pokerGame.deployed();

  console.log("PokerGame deployed to:", pokerGame.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
