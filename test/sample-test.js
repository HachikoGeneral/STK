const { expect, should } = require("chai");
const { ethers } = require("hardhat");
const {
  isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

describe.only("Staking Test", function () {
  var owner, addr1, addr2;
  var contractFactory, tokenContract, stakeContract;
  var totalSupply;

  //Deploy token si staking
  beforeEach(async () => {
    totalSupply = ethers.utils.parseUnits("1000", "ether");
    contractFactory = await ethers.getContractFactory("MyToken");
    tokenContract = await contractFactory.deploy(totalSupply);
    await tokenContract.deployed();

    contractFactory = await ethers.getContractFactory("Staking");
    stakeContract = await contractFactory.deploy(tokenContract.address);
    await stakeContract.deployed();

    [owner, addr1, addr2] = await ethers.getSigners();
  });

  describe("deploy tests", function () {
    it("should should console log the addresses", async () => {
      console.log(tokenContract.address, "\n", stakeContract.address);
    });
  });

  describe("transfering funds to owner", function () {
    it("should transfer total supply to owner address", async () => {
      var ownerBalance = await tokenContract.balanceOf(owner.address);
      await expect(ownerBalance).to.be.equal(totalSupply);
    });
  });

  describe("testing stake function from owner", function () {
    it("should transfer amount from owner address to contract address: stake-contract side", async () => {
      const amount = ethers.utils.parseUnits("10", "ether");
      await tokenContract.approve(stakeContract.address, amount);
      await stakeContract._stake(amount);
      const contractBalance = await tokenContract.balanceOf(
        stakeContract.address
      );
      const ownerBalance = await tokenContract.balanceOf(owner.address);
      await expect(contractBalance).to.be.equal(amount);
    });

    it("should transfer amount from owner address to contract address: owner side", async () => {
      const amount = ethers.utils.parseUnits("10", "ether");
      await tokenContract.approve(stakeContract.address, amount);
      await stakeContract._stake(amount);
      const contractBalance = await tokenContract.balanceOf(
        stakeContract.address
      );
      const ownerBalance = await tokenContract.balanceOf(owner.address);
      await expect(ownerBalance.toString()).to.be.equal(
        (totalSupply - amount).toString()
      );
    });
  });

  describe("staking from addr1 address", function () {
    it("should transfer 1 from owner to addr1 address", async () => {
      const amount = ethers.utils.parseUnits("10", "ether");
      await tokenContract.transferFrom(owner.address, addr1.address, amount);
      const addr1Balance = await tokenContract.balanceOf(addr1.address);
      await expect(addr1Balance).to.be.equal(amount);
    });
    it("should trasfer staking amount from addr1 to staking contract", async () => {
      const amount = ethers.utils.parseUnits("10", "ether");
      await tokenContract.transferFrom(owner.address, addr1.address, amount);

      await tokenContract.connect(addr1).approve(stakeContract.address, amount);
      await stakeContract.connect(addr1)._stake(amount);

      const contractBalance = await tokenContract.balanceOf(
        stakeContract.address
      );
      const addr1Balance = await tokenContract.balanceOf(addr1.address);

      await expect(contractBalance).to.be.equal(amount);
      await expect(addr1Balance).to.be.equal(0);
    });
  });

  describe("staking from owner and addr1 in the same time", function () {
    it("should transfer funds from owner and addr1 to contract address", async () => {
      const amount = ethers.utils.parseUnits("10", "ether");
      const amount3 = ethers.utils.parseUnits("20", "ether");
      await tokenContract.transferFrom(owner.address, addr1.address, amount);

      await tokenContract
        .connect(addr1)
        .approve(stakeContract.address, amount3);

      await tokenContract.approve(addr1.address, amount3);
      await tokenContract.approve(stakeContract.address, amount3);

      await stakeContract._stake(amount);
      await stakeContract.connect(addr1)._stake(amount);

      const ownerBalance = await tokenContract.balanceOf(owner.address);
      const addr1Balance = await tokenContract.balanceOf(addr1.address);
      const contractBalance = await tokenContract.balanceOf(
        stakeContract.address
      );

      await expect(ownerBalance.toString()).to.be.equal(
        (totalSupply - amount - amount).toString()
      );
      await expect(addr1Balance).to.be.equal(0);
      await expect(contractBalance.toString()).to.be.equal(
        (2 * amount).toString()
      );
    });
  });
  describe("testing requires", function () {
    it("Should fail if staking amount < 10", async () => {
      await tokenContract.approve(
        stakeContract.address,
        ethers.utils.parseUnits("10", "ether")
      );
      await expect(
        stakeContract._stake(ethers.utils.parseUnits("5", "ether"))
      ).to.be.revertedWith("Minimum amount to stake is 10 MTK");
    });
    it("Should fail if staking amount > 100", async () => {
      await tokenContract.approve(
        stakeContract.address,
        ethers.utils.parseUnits("200", "ether")
      );
      await expect(
        stakeContract._stake(ethers.utils.parseUnits("101", "ether"))
      ).to.be.revertedWith("Staking limit exceeded. Lower your stake!");
    });
    it("Should fail if addr1 tries to stake more than it owns", async () => {
      const amount = ethers.utils.parseUnits("10", "ether");
      const greateramount = ethers.utils.parseUnits("11", "ether");
      await tokenContract
        .connect(addr1)
        .approve(stakeContract.address, greateramount);

      await tokenContract.transferFrom(owner.address, addr1.address, amount);
      await expect(
        stakeContract.connect(addr1)._stake(greateramount)
      ).to.be.revertedWith("Can't stake more than you own!");
    });
  });

  describe("testing compute rewards, harvest and withdraw", function () {
    it("should compute correct the reward", async () => {
      const currentBlockNumber = await hre.ethers.provider.getBlockNumber();
      const currentBlock = await hre.ethers.provider.getBlock(
        currentBlockNumber
      );
      const currentTimestamp = currentBlock.timestamp;

      const amount = ethers.utils.parseUnits("10", "ether");
      await tokenContract.approve(stakeContract.address, amount);
      await stakeContract._stake(amount);

      const amount2 = ethers.utils.parseUnits("20", "ether");
      await tokenContract.transferFrom(owner.address, addr1.address, amount2);
      await tokenContract
        .connect(addr1)
        .approve(stakeContract.address, amount2);
      await stakeContract.connect(addr1)._stake(amount2);

      // da timpul blockchain ului in fata
      const oneHundredDays = 100 * 24 * 60 * 60;
      await hre.ethers.provider.send("evm_mine", [
        currentTimestamp + oneHundredDays,
      ]);

      //calculez reward urile si le afisez
      const ownerReward = await stakeContract.computeUserRewards();
      const addr1Reward = await stakeContract
        .connect(addr1)
        .computeUserRewards();
    });
    it("should harvest correctly for owner and addr1", async () => {
      const currentBlockNumber = await hre.ethers.provider.getBlockNumber();
      const currentBlock = await hre.ethers.provider.getBlock(
        currentBlockNumber
      );
      const currentTimestamp = currentBlock.timestamp;

      const amount = ethers.utils.parseUnits("10", "ether");
      await tokenContract.approve(stakeContract.address, amount);
      await stakeContract._stake(amount);

      const amount2 = ethers.utils.parseUnits("20", "ether");
      await tokenContract.transferFrom(owner.address, addr1.address, amount2);
      await tokenContract
        .connect(addr1)
        .approve(stakeContract.address, amount2);
      await stakeContract.connect(addr1)._stake(amount2);

      // da timpul blockchain ului in fata
      const oneHundredDays = 100 * 24 * 60 * 60;
      await hre.ethers.provider.send("evm_mine", [
        currentTimestamp + oneHundredDays,
      ]);

      //harvest rewards
      await stakeContract.harvestReward(0);
      await stakeContract.connect(addr1).harvestReward(0);

      const addr1Balance = await tokenContract.balanceOf(addr1.address);

      await expect(addr1Balance.toString()).to.be.equal("602149000000000000");
    });
    it("should withdraw the staked amount + reward", async () => {
      const currentBlockNumber = await hre.ethers.provider.getBlockNumber();
      const currentBlock = await hre.ethers.provider.getBlock(
        currentBlockNumber
      );
      const currentTimestamp = currentBlock.timestamp;

      const amount = ethers.utils.parseUnits("10", "ether");
      await tokenContract.approve(stakeContract.address, amount);
      await stakeContract._stake(amount);

      const amount2 = ethers.utils.parseUnits("20", "ether");
      await tokenContract.transferFrom(owner.address, addr1.address, amount2);
      await tokenContract
        .connect(addr1)
        .approve(stakeContract.address, amount2);
      await stakeContract.connect(addr1)._stake(amount2);

      // da timpul blockchain ului in fata
      const oneHundredDays = 100 * 24 * 60 * 60;
      await hre.ethers.provider.send("evm_mine", [
        currentTimestamp + oneHundredDays,
      ]);

      //withdraw

      await stakeContract.connect(addr1).withdrawStake(0);
      const addr1Balance = await tokenContract.balanceOf(addr1.address);

      await expect(addr1Balance.toString()).to.be.equal("20602149000000000000");
    });
  });
});
