const hre = require("hardhat");
async function main() {
  var contractFactory, tokenContract, stakeContract;
  var totalSupply;
  totalSupply = ethers.utils.parseUnits("100000", "ether");
  contractFactory = await ethers.getContractFactory("MyToken");
  tokenContract = await contractFactory.deploy(totalSupply);
  await tokenContract.deployed();

  contractFactory = await ethers.getContractFactory("Staking");
  stakeContract = await contractFactory.deploy(tokenContract.address);
  await stakeContract.deployed();
  console.log(
    "Token address: ",
    tokenContract.address,
    "\n Staking contract: ",
    stakeContract.address
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
