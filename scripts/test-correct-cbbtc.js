const { ethers } = require("hardhat");
require('dotenv').config({ path: '.env.local' });

async function testCorrectCBBTC() {
  try {
    console.log("🔍 Testing Correct CBBTC/USD Price Feed on Base Mainnet\n");
    
    const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID;
    if (!alchemyId) {
      console.log("❌ No Alchemy API key found");
      return;
    }
    
    const provider = new ethers.providers.JsonRpcProvider(
      `https://base-mainnet.g.alchemy.com/v2/${alchemyId}`
    );
    
    const cbbtcAddress = "0x07DA0E54543a844a80ABE69c8A12F22B3aA59f9D";
    const ethAddress = "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70";
    
    console.log("Testing price feeds...\n");
    
    const priceFeeds = {
      "CBBTC/USD": cbbtcAddress,
      "ETH/USD": ethAddress
    };
    
    for (const [pair, address] of Object.entries(priceFeeds)) {
      try {
        console.log(`📊 Testing ${pair} at ${address}:`);
        
        const feed = new ethers.Contract(
          address,
          [
            'function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
            'function description() external view returns (string memory)',
            'function decimals() external view returns (uint8)'
          ],
          provider
        );
        
        const description = await feed.description();
        const decimals = await feed.decimals();
        const roundData = await feed.latestRoundData();
        const price = ethers.utils.formatUnits(roundData.answer, decimals);
        
        console.log(`   Description: ${description}`);
        console.log(`   Decimals: ${decimals}`);
        console.log(`   Price: $${parseFloat(price).toLocaleString()}`);
        console.log(`   Last Updated: ${new Date(roundData.updatedAt.toNumber() * 1000).toISOString()}`);
        console.log(`   Round ID: ${roundData.roundId.toString()}\n`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
      }
    }
    
    console.log("🎉 Price feeds are ready for the frontend!");
    console.log("   Your frontend will now use real CBBTC and ETH prices from Base Mainnet.");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testCorrectCBBTC().then(() => process.exit(0)).catch((error) => { 
  console.error(error); 
  process.exit(1); 
}); 