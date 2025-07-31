const { ethers } = require("hardhat");

async function main() {
  const network = await ethers.provider.getNetwork();
  console.log(`\n🔍 Interacting with contracts on ${network.name}...\n`);

  // Load deployment info
  const deployment = require(`../deployments/${network.name}.json`);
  const contractAddress = deployment.contracts.predictionMarket;
  const usdcAddress = deployment.contracts.usdc;

  // Get contracts
  const PredictionMarket = await ethers.getContractFactory("USDCPredictionMarket");
  const market = PredictionMarket.attach(contractAddress);

  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = MockUSDC.attach(usdcAddress);

  console.log("Contract addresses:");
  console.log("- Prediction Market:", contractAddress);
  console.log("- USDC:", usdcAddress);

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("\nUsing account:", signer.address);

  // Check USDC balance
  const balance = await usdc.balanceOf(signer.address);
  console.log("USDC Balance:", ethers.utils.formatUnits(balance, 6));

  // Create a test market
  console.log("\n📊 Creating test market...");
  const tx = await market.createMarket(
    "BTC",
    135000, // $135,000 target
    6 * 60 * 60, // 6 hours
    ethers.utils.parseUnits("10", 6) // 10 USDC min bet
  );
  
  const receipt = await tx.wait();
  const event = receipt.events.find(e => e.event === "MarketCreated");
  const marketId = event.args.marketId;
  
  console.log("✅ Market created with ID:", marketId.toString());

  // Get market info
  const marketInfo = await market.getMarketInfo(marketId);
  console.log("\nMarket Info:");
  console.log("- Question:", marketInfo.question);
  console.log("- Target Price: $", marketInfo.targetPrice.toString());
  console.log("- Deadline:", new Date(marketInfo.deadline.toNumber() * 1000).toLocaleString());

  // Approve USDC
  console.log("\n💰 Approving USDC...");
  const approveTx = await usdc.approve(contractAddress, ethers.constants.MaxUint256);
  await approveTx.wait();
  console.log("✅ USDC approved");

  // Place a test bet
  console.log("\n🎲 Placing test bet...");
  const betAmount = ethers.utils.parseUnits("50", 6); // 50 USDC
  const betTx = await market.placeBet(marketId, true, betAmount); // Bet YES
  await betTx.wait();
  console.log("✅ Bet placed: 50 USDC on YES");

  // Check odds
  const odds = await market.getOdds(marketId);
  console.log("\n📈 Current odds:");
  console.log("- YES:", odds.yesOdds.toString() + "%");
  console.log("- NO:", odds.noOdds.toString() + "%");

  // Get user position
  const position = await market.getUserPosition(marketId, signer.address);
  console.log("\n👤 Your position:");
  console.log("- YES amount:", ethers.utils.formatUnits(position.yesAmount, 6), "USDC");
  console.log("- NO amount:", ethers.utils.formatUnits(position.noAmount, 6), "USDC");

  console.log("\n✨ Interaction complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });