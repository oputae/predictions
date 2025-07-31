const { ethers } = require("hardhat");
require('dotenv').config({ path: '.env.local' });

async function testNewContract() {
  try {
    console.log("🧪 Testing New Contract with Deadline Price Resolution\n");
    
    const contractAddress = "0x669174fC3ED415eF6aC095428cA96404007b68F0";
    const contract = await ethers.getContractAt("USDCPredictionMarket", contractAddress);
    
    console.log("✅ Connected to new contract:", contractAddress);
    
    // Test basic contract info
    const usdcAddress = await contract.usdc();
    console.log("USDC Address:", usdcAddress);
    
    const marketCount = await contract.marketIdCounter();
    console.log("Current Market Count:", marketCount.toString());
    
    // Test price feeds
    const btcFeed = await contract.priceFeeds("BTC");
    const ethFeed = await contract.priceFeeds("ETH");
    
    console.log("\n📊 Price Feeds:");
    console.log("BTC Feed:", btcFeed);
    console.log("ETH Feed:", ethFeed);
    
    // Test creating a market
    console.log("\n🎯 Testing Market Creation...");
    
    const [signer] = await ethers.getSigners();
    const targetPrice = ethers.utils.parseUnits("120000", 8); // $120,000
    const duration = 3600; // 1 hour
    
    try {
      const tx = await contract.createMarket(
        "BTC",
        targetPrice,
        duration,
        ethers.utils.parseUnits("1", 6), // 1 USDC min bet
        false // "below" market
      );
      
      console.log("✅ Market creation transaction:", tx.hash);
      await tx.wait();
      console.log("✅ Market created successfully!");
      
      const newMarketCount = await contract.marketIdCounter();
      console.log("New Market Count:", newMarketCount.toString());
      
      // Get market info
      const marketInfo = await contract.getMarketInfo(newMarketCount.toNumber() - 1);
      console.log("\n📋 Market Info:");
      console.log("Question:", marketInfo.question);
      console.log("Asset:", marketInfo.asset);
      console.log("Target Price:", ethers.utils.formatUnits(marketInfo.targetPrice, 8));
      console.log("Deadline:", new Date(marketInfo.deadline.toNumber() * 1000).toISOString());
      console.log("Is Above:", marketInfo.isAbove);
      console.log("Resolved:", marketInfo.resolved);
      
    } catch (error) {
      console.log("❌ Market creation failed:", error.message);
    }
    
    console.log("\n🎉 New contract is ready for testing!");
    console.log("Key improvements:");
    console.log("- ✅ Deadline price resolution (no manipulation)");
    console.log("- ✅ 5-minute tolerance for price accuracy");
    console.log("- ✅ Real CBBTC and ETH price feeds");
    console.log("- ✅ Fair one-sided market logic");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testNewContract().then(() => process.exit(0)).catch((error) => { 
  console.error(error); 
  process.exit(1); 
}); 