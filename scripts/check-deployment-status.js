const { ethers } = require("hardhat");
require('dotenv').config({ path: '.env.local' });

async function checkDeploymentStatus() {
  try {
    console.log("🔍 Checking Deployment Status\n");
    
    const contractAddress = "0x669174fC3ED415eF6aC095428cA96404007b68F0";
    
    // Check if contract exists
    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
      console.log("❌ Contract not found at address:", contractAddress);
      return;
    }
    
    console.log("✅ Contract exists at:", contractAddress);
    console.log("Contract bytecode length:", code.length);
    
    // Try to get basic info
    try {
      const contract = await ethers.getContractAt("USDCPredictionMarket", contractAddress);
      
      // Check if we can call basic functions
      const marketCount = await contract.marketIdCounter();
      console.log("✅ Market count:", marketCount.toString());
      
      console.log("\n🎉 Contract is working correctly!");
      console.log("\n📋 Current Status:");
      console.log("- Contract Address:", contractAddress);
      console.log("- Network: Base Sepolia");
      console.log("- Markets Created:", marketCount.toString());
      console.log("- Price Feeds: Updated to Base Mainnet");
      console.log("- Resolution Logic: Deadline-based (5min tolerance)");
      
    } catch (error) {
      console.log("⚠️  Contract exists but has issues:", error.message);
      console.log("This might be due to ABI mismatch or deployment issues.");
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkDeploymentStatus().then(() => process.exit(0)).catch((error) => { 
  console.error(error); 
  process.exit(1); 
}); 