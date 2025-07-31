const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Setting up local testing environment...\n");

  // Get signers
  const [deployer, user1, user2] = await ethers.getSigners();
  
  console.log("Accounts:");
  console.log("Deployer:", deployer.address);
  console.log("User 1:", user1.address);
  console.log("User 2:", user2.address);
  console.log("");

  // 1. Deploy Mock USDC
  console.log("1. Deploying Mock USDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.deployed();
  console.log("✅ USDC deployed to:", usdc.address);

  // 2. Deploy Mock Price Feeds
  console.log("\n2. Deploying Mock Price Feeds...");
  const MockAggregator = await ethers.getContractFactory("MockAggregator");
  
  const btcFeed = await MockAggregator.deploy(8, "BTC/USD", 12450000000000); // $124,500
  await btcFeed.deployed();
  console.log("✅ BTC/USD feed:", btcFeed.address);

  const ethFeed = await MockAggregator.deploy(8, "ETH/USD", 425000000000); // $4,250
  await ethFeed.deployed();
  console.log("✅ ETH/USD feed:", ethFeed.address);

  // 3. Deploy Prediction Market
  console.log("\n3. Deploying Prediction Market...");
  const PredictionMarket = await ethers.getContractFactory("USDCPredictionMarket");
  const market = await PredictionMarket.deploy(usdc.address);
  await market.deployed();
  console.log("✅ Prediction Market:", market.address);

  // 4. Configure Price Feeds
  console.log("\n4. Configuring price feeds...");
  await market.addPriceFeed("BTC", btcFeed.address);
  await market.addPriceFeed("ETH", ethFeed.address);
  console.log("✅ Price feeds configured");

  // 5. Mint USDC to test users
  console.log("\n5. Minting USDC to test users...");
  const mintAmount = ethers.utils.parseUnits("10000", 6); // 10,000 USDC
  await usdc.mint(deployer.address, mintAmount);
  await usdc.mint(user1.address, mintAmount);
  await usdc.mint(user2.address, mintAmount);
  console.log("✅ Minted 10,000 USDC to each user");

  // 6. Create test markets
  console.log("\n6. Creating test markets...");
  
  // Approve USDC for market creation if needed
  await usdc.connect(deployer).approve(market.address, ethers.constants.MaxUint256);
  
  // Market 1: BTC above $130,000 in 6 hours
  const tx1 = await market.createMarket(
    "BTC",
    130000,
    6 * 60 * 60, // 6 hours
    ethers.utils.parseUnits("5", 6) // 5 USDC min bet
  );
  await tx1.wait();
  
  // Market 2: ETH above $5,000 in 24 hours
  const tx2 = await market.createMarket(
    "ETH",
    5000,
    24 * 60 * 60, // 24 hours
    ethers.utils.parseUnits("1", 6) // 1 USDC min bet
  );
  await tx2.wait();
  
  console.log("✅ Created 2 test markets");

  // 7. Place some test bets
  console.log("\n7. Placing test bets...");
  
  // User1 bets YES on market 0
  await usdc.connect(user1).approve(market.address, ethers.constants.MaxUint256);
  await market.connect(user1).placeBet(0, true, ethers.utils.parseUnits("100", 6));
  
  // User2 bets NO on market 0
  await usdc.connect(user2).approve(market.address, ethers.constants.MaxUint256);
  await market.connect(user2).placeBet(0, false, ethers.utils.parseUnits("150", 6));
  
  console.log("✅ Placed test bets");

  // 8. Save deployment info
  const contracts = {
    network: "localhost",
    chainId: 31337,
    contracts: {
      usdc: usdc.address,
      predictionMarket: market.address,
      btcFeed: btcFeed.address,
      ethFeed: ethFeed.address
    },
    testAccounts: {
      deployer: deployer.address,
      user1: user1.address,
      user2: user2.address
    }
  };

  const deploymentPath = path.join(__dirname, "../deployments/localhost.json");
  fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(contracts, null, 2));

  // 9. Generate ABIs
  console.log("\n8. Generating ABIs...");
  const abiPath = path.join(__dirname, "../app/lib/abis");
  fs.mkdirSync(abiPath, { recursive: true });

  // Save contract ABIs
  const marketArtifact = await artifacts.readArtifact("USDCPredictionMarket");
  fs.writeFileSync(
    path.join(abiPath, "PredictionMarket.json"),
    JSON.stringify(marketArtifact.abi, null, 2)
  );

  const usdcArtifact = await artifacts.readArtifact("MockUSDC");
  fs.writeFileSync(
    path.join(abiPath, "USDC.json"),
    JSON.stringify(usdcArtifact.abi, null, 2)
  );

  console.log("✅ ABIs saved to app/lib/abis");

  console.log("\n✨ Local environment setup complete!");
  console.log("\nNext steps:");
  console.log("1. Run 'npx hardhat node' in a separate terminal");
  console.log("2. Run 'npm run dev' to start the frontend");
  console.log("3. Import test accounts to MetaMask using private keys from hardhat");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});