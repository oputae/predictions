// scripts/deploy-base-sepolia.js
const { ethers, upgrades, run } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Base Sepolia Configuration
const BASE_SEPOLIA_CONFIG = {
  // Real USDC on Base Sepolia
  USDC_ADDRESS: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  
  // Chainlink Price Feeds on Base Mainnet (for better price accuracy)
  PRICE_FEEDS: {
    "BTC/USD": "0x07DA0E54543a844a80ABE69c8A12F22B3aA59f9D", // CBBTC/USD
    "ETH/USD": "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70"  // ETH/USD
  },
  
  // Base Sepolia Chain ID
  CHAIN_ID: 84532,
  
  // Explorer
  EXPLORER_URL: "https://sepolia.basescan.org"
};

async function main() {
  console.log("🚀 Deploying to Base Sepolia...\n");

  // Skip network detection for now due to ethers v5.8.0 issue
  // const chainId = await ethers.provider.getNetwork().then(n => n.chainId);
  // if (chainId !== BASE_SEPOLIA_CONFIG.CHAIN_ID) {
  //   throw new Error(`Wrong network! Expected Base Sepolia (${BASE_SEPOLIA_CONFIG.CHAIN_ID}), got ${chainId}`);
  // }

  // Get deployer
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();
  
  console.log("Network: Base Sepolia");
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");
  console.log("USDC Address:", BASE_SEPOLIA_CONFIG.USDC_ADDRESS);
  console.log("");

  // Deploy Prediction Market
  console.log("1. Deploying USDCPredictionMarket...");
  const PredictionMarket = await ethers.getContractFactory("USDCPredictionMarket");
  
  // Deploy with USDC address parameter
  const predictionMarket = await PredictionMarket.deploy(BASE_SEPOLIA_CONFIG.USDC_ADDRESS);
  await predictionMarket.deployed();
  
  console.log("✅ Contract deployed to:", predictionMarket.address);
  
  // Verify USDC address
  const usdcAddress = await predictionMarket.usdc();
  console.log("✅ Contract initialized with USDC:", usdcAddress);

  console.log("✅ Prediction Market deployed!");
  console.log("   Address:", predictionMarket.address);
  console.log("");

  // Configure price feeds
  console.log("2. Configuring price feeds...");
  
  for (const [asset, feedAddress] of Object.entries(BASE_SEPOLIA_CONFIG.PRICE_FEEDS)) {
    const assetSymbol = asset.split("/")[0]; // Get BTC from BTC/USD
    console.log(`   Adding ${asset} feed...`);
    const tx = await predictionMarket.addPriceFeed(assetSymbol, feedAddress);
    await tx.wait();
  }
  
  console.log("✅ Price feeds configured!");
  console.log("");

  // Save deployment info
  console.log("3. Saving deployment info...");
  const deploymentInfo = {
    network: "base-sepolia",
    chainId: BASE_SEPOLIA_CONFIG.CHAIN_ID,
    deploymentDate: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      predictionMarket: {
        proxy: predictionMarket.address,
        implementation: predictionMarket.address // No implementation address for direct deployment
      },
      usdc: BASE_SEPOLIA_CONFIG.USDC_ADDRESS
    },
    priceFeeds: BASE_SEPOLIA_CONFIG.PRICE_FEEDS,
    explorerUrl: BASE_SEPOLIA_CONFIG.EXPLORER_URL,
    feePercentage: "1%"
  };

  const deploymentPath = path.join(__dirname, "../deployments/base-sepolia.json");
  fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("✅ Deployment info saved!");
  console.log("");

  // Generate frontend env
  console.log("4. Generating frontend environment variables...");
  const envContent = `# Base Sepolia Configuration
NEXT_PUBLIC_NETWORK=base-sepolia
NEXT_PUBLIC_CHAIN_ID=84532

# Contract Addresses
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=${predictionMarket.address}
NEXT_PUBLIC_USDC_ADDRESS=${BASE_SEPOLIA_CONFIG.USDC_ADDRESS}

# Add your API keys
NEXT_PUBLIC_ALCHEMY_ID=your_alchemy_key_here
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id_here

# Farcaster Configuration
FARCASTER_CLIENT_ID=your_farcaster_app_id
FARCASTER_CLIENT_SECRET=your_farcaster_secret

# Your deployed app URL
NEXT_PUBLIC_URL=https://your-app.vercel.app
`;

  fs.writeFileSync(path.join(__dirname, "../.env.local.example"), envContent);
  console.log("✅ Environment template saved to .env.local.example");
  console.log("");

  // Verify on BaseScan
  console.log("5. Verifying contracts on BaseScan...");
  console.log("   Waiting for 6 block confirmations...");
  await predictionMarket.deployTransaction.wait(6);

  try {
    await run("verify:verify", {
      address: predictionMarket.address,
      constructorArguments: [],
    });
    console.log("✅ Contract verified on BaseScan!");
  } catch (error) {
    console.log("❌ Verification failed:", error.message);
    console.log("   You can verify manually at:", `${BASE_SEPOLIA_CONFIG.EXPLORER_URL}/address/${predictionMarket.address}#code`);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log(`Network: Base Sepolia (Chain ID: ${BASE_SEPOLIA_CONFIG.CHAIN_ID})`);
  console.log(`Prediction Market: ${predictionMarket.address}`);
  console.log(`USDC Token: ${BASE_SEPOLIA_CONFIG.USDC_ADDRESS}`);
  console.log(`Fee Structure: 1% on profit (not on stake)`);
  console.log(`Explorer: ${BASE_SEPOLIA_CONFIG.EXPLORER_URL}/address/${predictionMarket.address}`);
  console.log("\n🎉 Deployment complete!");

  // Next steps
  console.log("\n📝 NEXT STEPS:");
  console.log("1. Get Base Sepolia ETH from: https://www.alchemy.com/faucets/base-sepolia");
  console.log("2. Get test USDC from: https://faucet.circle.com/ (mint on Base Sepolia)");
  console.log("3. Update your .env.local with the contract addresses above");
  console.log("4. Run 'npm run dev' to start the frontend");
  console.log("5. Test creating markets and placing bets!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// hardhat.config.js updates for Base Sepolia
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    baseSepolia: {
      url: `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 84532,
    },
    base: {
      url: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 8453,
    }
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY,
      base: process.env.BASESCAN_API_KEY,
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
        }
      }
    ]
  }
};