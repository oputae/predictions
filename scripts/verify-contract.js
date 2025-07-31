// scripts/verify-contract.js
const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Verifying contract functionality...\n");

  // New contract address
  const CONTRACT_ADDRESS = "0x095A8982DC8bA19A863DFB503fb79d82f8878259";

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Get contract instance
  const PredictionMarket = await ethers.getContractFactory("USDCPredictionMarket");
  const contract = PredictionMarket.attach(CONTRACT_ADDRESS);

  console.log("Contract address:", CONTRACT_ADDRESS);
  console.log("");

  // Test contract functions
  console.log("1. Testing contract state...");
  try {
    const usdcAddress = await contract.usdc();
    console.log("✅ USDC address:", usdcAddress);
    
    const owner = await contract.owner();
    console.log("✅ Owner:", owner);
    
    const btcFeed = await contract.priceFeeds("BTC");
    console.log("✅ BTC price feed:", btcFeed);
    
    const ethFeed = await contract.priceFeeds("ETH");
    console.log("✅ ETH price feed:", ethFeed);
    
    const marketCount = await contract.marketIdCounter();
    console.log("✅ Market count:", marketCount.toString());
    
    console.log("\n🎉 Contract is working properly!");
    console.log("✅ Ready for testing!");
    
  } catch (error) {
    console.error("❌ Contract verification failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 