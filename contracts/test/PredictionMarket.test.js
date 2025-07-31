const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("USDCPredictionMarket", function () {
  let market, usdc, btcFeed, ethFeed;
  let owner, user1, user2;
  const INITIAL_PRICE = 12450000000000; // $124,500 with 8 decimals

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock USDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDC.deploy();

    // Deploy mock price feeds
    const MockAggregator = await ethers.getContractFactory("MockAggregator");
    btcFeed = await MockAggregator.deploy(8, "BTC/USD", INITIAL_PRICE);
    ethFeed = await MockAggregator.deploy(8, "ETH/USD", 425000000000);

    // Deploy prediction market
    const PredictionMarket = await ethers.getContractFactory("USDCPredictionMarket");
    market = await upgrades.deployProxy(PredictionMarket, [usdc.address], {
      initializer: 'initialize'
    });

    // Add price feeds
    await market.addPriceFeed("BTC", btcFeed.address);
    await market.addPriceFeed("ETH", ethFeed.address);

    // Mint USDC to users
    await usdc.mint(user1.address, ethers.utils.parseUnits("10000", 6));
    await usdc.mint(user2.address, ethers.utils.parseUnits("10000", 6));

    // Approve market to spend USDC
    await usdc.connect(user1).approve(market.address, ethers.constants.MaxUint256);
    await usdc.connect(user2).approve(market.address, ethers.constants.MaxUint256);
  });

  describe("Market Creation", function () {
    it("Should create a market successfully", async function () {
      const tx = await market.createMarket(
        "BTC",
        130000,
        3600, // 1 hour
        ethers.utils.parseUnits("10", 6)
      );

      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "MarketCreated");
      
      expect(event.args.marketId).to.equal(0);
      expect(event.args.asset).to.equal("BTC");
      expect(event.args.targetPrice).to.equal(130000);
    });

    it("Should reject unsupported assets", async function () {
      await expect(
        market.createMarket("DOGE", 1, 3600, ethers.utils.parseUnits("10", 6))
      ).to.be.revertedWith("Asset not supported");
    });
  });

  describe("Betting", function () {
    beforeEach(async function () {
      await market.createMarket("BTC", 130000, 3600, ethers.utils.parseUnits("10", 6));
    });

    it("Should place a YES bet", async function () {
      const betAmount = ethers.utils.parseUnits("100", 6);
      await market.connect(user1).placeBet(0, true, betAmount);

      const marketInfo = await market.getMarketInfo(0);
      expect(marketInfo.yesPool).to.equal(betAmount);
      expect(marketInfo.