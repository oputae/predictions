const { run } = require("hardhat");

async function main() {
  const network = await ethers.provider.getNetwork();
  console.log(`\n🔍 Verifying contracts on ${network.name}...\n`);

  // Load deployment info
  const deployment = require(`../deployments/${network.name}.json`);
  
  if (!deployment.contracts.implementation) {
    console.error("❌ No implementation address found in deployment file");
    return;
  }

  const implementationAddress = deployment.contracts.implementation || deployment.contracts.predictionMarket;

  console.log("Verifying implementation at:", implementationAddress);

  try {
    await run("verify:verify", {
      address: implementationAddress,
      constructorArguments: [],
    });
    
    console.log("✅ Contract verified successfully!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️  Contract is already verified");
    } else {
      console.error("❌ Verification failed:", error.message);
      console.log("\nTry manual verification at:");
      console.log(`${deployment.explorerUrl}/address/${implementationAddress}#code`);
    }
  }

  // Also verify proxy if different
  if (deployment.contracts.predictionMarket && deployment.contracts.predictionMarket !== implementationAddress) {
    console.log("\nNote: The proxy contract at", deployment.contracts.predictionMarket);
    console.log("should be automatically recognized as a proxy by the explorer.");
    console.log("If not, use the 'Is this a proxy?' feature on the explorer.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });