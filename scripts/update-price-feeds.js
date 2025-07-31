const { ethers } = require("hardhat");
require('dotenv').config({ path: '.env.local' });

async function updatePriceFeeds() {
  try {
    console.log("🔧 Updating Price Feeds on Deployed Contract\n");
    
    const contractAddress = "0x669174fC3ED415eF6aC095428cA96404007b68F0";
    const contract = await ethers.getContractAt("USDCPredictionMarket", contractAddress);
    
    console.log("✅ Connected to contract:", contractAddress);
    
    // New price feed addresses (Base Mainnet)
    const newPriceFeeds = {
      "BTC": "0x07DA0E54543a844a80ABE69c8A12F22B3aA59f9D", // CBBTC/USD
      "ETH": "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70"  // ETH/USD
    };
    
    const [signer] = await ethers.getSigners();
    console.log("Updating with account:", signer.address);
    
    // Update each price feed
    for (const [asset, feedAddress] of Object.entries(newPriceFeeds)) {
      console.log(`\n📊 Updating ${asset} price feed to ${feedAddress}...`);
      
      try {
        const tx = await contract.addPriceFeed(asset, feedAddress);
        console.log(`   Transaction hash: ${tx.hash}`);
        await tx.wait();
        console.log(`   ✅ ${asset} price feed updated successfully!`);
      } catch (error) {
        console.log(`   ❌ Failed to update ${asset} price feed:`, error.message);
      }
    }
    
    // Verify the updates
    console.log("\n🔍 Verifying price feed updates...");
    
    for (const [asset, expectedAddress] of Object.entries(newPriceFeeds)) {
      try {
        const currentFeed = await contract.priceFeeds(asset);
        console.log(`${asset} feed: ${currentFeed}`);
        
        if (currentFeed.toLowerCase() === expectedAddress.toLowerCase()) {
          console.log(`   ✅ ${asset} feed is correct`);
        } else {
          console.log(`   ❌ ${asset} feed mismatch`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking ${asset} feed:`, error.message);
      }
    }
    
    console.log("\n🎉 Price feed update complete!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

updatePriceFeeds().then(() => process.exit(0)).catch((error) => { 
  console.error(error); 
  process.exit(1); 
}); 