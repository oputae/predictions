// const { ethers, upgrades } = require("hardhat"); // Disabled - not using proxy pattern
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const network = await ethers.provider.getNetwork();
  console.log(`\n⬆️  Upgrading contracts on ${network.name}...\n`);

  // Load deployment info
  const deploymentPath = path.join(__dirname, `../deployments/${network.name}.json`);
  const deployment = require(deploymentPath);
  
  const PROXY_ADDRESS = deployment.contracts.predictionMarket;
  
  if (!PROXY_ADDRESS) {
    console.error("❌ No proxy address found in deployment file");
    return;
  }

  console.log("Current proxy address:", PROXY_ADDRESS);
  console.log("Current implementation:", deployment.contracts.implementation);

  // Get the new contract version
  // You would create a new contract file like USDCPredictionMarketV2.sol
  // For this example, we'll use the same contract name
  const PredictionMarketV2 = await ethers.getContractFactory("USDCPredictionMarket");
  
  console.log("\n📦 Preparing upgrade...");
  
  try {
    // Upgrade the proxy to the new implementation
    const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, PredictionMarketV2, {
      kind: 'uups'
    });
    
    await upgraded.deployed();
    
    // Get new implementation address
    const newImplementationAddress = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
    
    console.log("✅ Upgrade successful!");
    console.log("New implementation:", newImplementationAddress);
    
    // Update deployment file
    deployment.contracts.implementation = newImplementationAddress;
    deployment.lastUpgrade = new Date().toISOString();
    
    fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
    console.log("\n📄 Deployment file updated");
    
    // Verify the new implementation
    console.log("\n🔍 Verifying new implementation...");
    if (network.name !== "localhost" && network.name !== "hardhat") {
      try {
        await run("verify:verify", {
          address: newImplementationAddress,
          constructorArguments: [],
        });
        console.log("✅ New implementation verified");
      } catch (error) {
        console.log("⚠️  Verification failed:", error.message);
      }
    }
    
  } catch (error) {
    console.error("❌ Upgrade failed:", error.message);
    console.log("\nMake sure:");
    console.log("1. You're using the correct network");
    console.log("2. You have upgrade permissions (owner)");
    console.log("3. The new contract is upgrade-compatible");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });