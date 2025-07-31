const { ethers } = require("hardhat");

async function testNetwork() {
  try {
    console.log("Testing Base Sepolia network connection...");
    
    // Test 1: Get provider
    console.log("1. Getting provider...");
    const provider = ethers.provider;
    console.log("✅ Provider obtained");
    
    // Test 2: Get network
    console.log("2. Getting network...");
    const network = await provider.getNetwork();
    console.log("✅ Network obtained:", network);
    
    // Test 3: Get signers
    console.log("3. Getting signers...");
    const [deployer] = await ethers.getSigners();
    console.log("✅ Deployer address:", deployer.address);
    
    // Test 4: Get balance
    console.log("4. Getting balance...");
    const balance = await deployer.getBalance();
    console.log("✅ Balance:", ethers.utils.formatEther(balance), "ETH");
    
    console.log("\n🎉 All network tests passed!");
    
  } catch (error) {
    console.error("❌ Network test failed:", error.message);
    console.error("Full error:", error);
  }
}

testNetwork()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 