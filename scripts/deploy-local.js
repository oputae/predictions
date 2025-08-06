const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying to local network...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy Mock USDC for local testing
  console.log("\n1. Deploying Mock USDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.deployed();
  console.log("✅ Mock USDC deployed to:", usdc.address);

  // Deploy Prediction Market
  console.log("\n2. Deploying Prediction Market...");
  const PredictionMarket = await ethers.getContractFactory("USDCPredictionMarket");
  const predictionMarket = await PredictionMarket.deploy(usdc.address);
  await predictionMarket.deployed();
  
  const implementationAddress = predictionMarket.address;
  
  console.log("✅ Prediction Market deployed!");
  console.log("   Proxy:", predictionMarket.address);
  console.log("   Implementation:", implementationAddress);

  // Save deployment info
  const deploymentInfo = {
    network: "localhost",
    chainId: 31337,
    deploymentDate: new Date().toISOString(),
    contracts: {
      predictionMarket: predictionMarket.address,
      usdc: usdc.address,
      implementation: implementationAddress
    }
  };

  const deploymentPath = path.join(__dirname, "../deployments/localhost.json");
  fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n✅ Deployment complete!");
  console.log("\nContract addresses:");
  console.log("- Prediction Market:", predictionMarket.address);
  console.log("- USDC:", usdc.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });