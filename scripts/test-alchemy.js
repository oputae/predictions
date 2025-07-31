const { ethers } = require("hardhat");
require('dotenv').config({ path: '.env.local' });

async function testAlchemy() {
  try {
    console.log("🔍 Testing Alchemy API Key\n");
    
    const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID;
    if (!alchemyId) {
      console.log("❌ No Alchemy API key found in .env.local");
      console.log("   Please add: NEXT_PUBLIC_ALCHEMY_ID=your_key_here");
      return;
    }
    
    console.log("✅ Alchemy API key found:", alchemyId.substring(0, 10) + "...");
    
    const alchemyUrl = `https://base-sepolia.g.alchemy.com/v2/${alchemyId}`;
    console.log("🌐 Alchemy URL:", alchemyUrl);
    
    // Test connection
    const provider = new ethers.providers.JsonRpcProvider(alchemyUrl);
    
    try {
      const network = await provider.getNetwork();
      console.log("✅ Successfully connected to Alchemy!");
      console.log("   Network:", network.name);
      console.log("   Chain ID:", network.chainId);
      
      // Test getting latest block
      const latestBlock = await provider.getBlockNumber();
      console.log("   Latest Block:", latestBlock);
      
      // Test Chainlink price feeds
      console.log("\n📊 Testing Chainlink Price Feeds via Alchemy:");
      
      const priceFeeds = {
        "BTC/USD": "0xd94e4C1C3bB697AAE92744FAA4E43B5c2Ef11f16",
        "ETH/USD": "0xE2E1CECaF186D44A4B01f46D6A7EcaE2B89c8076"
      };
      
      for (const [pair, address] of Object.entries(priceFeeds)) {
        try {
          const feed = new ethers.Contract(
            address,
            ['function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)'],
            provider
          );
          
          const roundData = await feed.latestRoundData();
          const price = ethers.utils.formatUnits(roundData.answer, 8);
          
          console.log(`   ${pair}: $${parseFloat(price).toLocaleString()}`);
        } catch (error) {
          console.log(`   ❌ ${pair}: Error - ${error.message}`);
        }
      }
      
      console.log("\n🎉 Alchemy is working perfectly!");
      console.log("   Your frontend should now use Alchemy for price feeds.");
      
    } catch (error) {
      console.log("❌ Failed to connect to Alchemy:", error.message);
      console.log("   Please check your API key and network settings.");
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testAlchemy().then(() => process.exit(0)).catch((error) => { 
  console.error(error); 
  process.exit(1); 
}); 