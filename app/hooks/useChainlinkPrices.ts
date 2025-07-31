import { useState, useEffect } from 'react';

// Chainlink price feed addresses for Base Mainnet
const PRICE_FEEDS = {
  BTC: '0x07DA0E54543a844a80ABE69c8A12F22B3aA59f9D', // Base Mainnet CBBTC/USD
  ETH: '0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70'  // Base Mainnet ETH/USD
};

// ABI for Chainlink price feeds
const PRICE_FEED_ABI = [
  'function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
  'function decimals() external view returns (uint8)',
  'function description() external view returns (string memory)'
];

export function useChainlinkPrices() {
  const [prices, setPrices] = useState<Record<string, number>>({
    BTC: 0,
    ETH: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        setError(null);

        // Import ethers dynamically to avoid SSR issues
        const { ethers } = await import('ethers');
        
        // 100% Alchemy - no fallbacks
        const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID;
        if (!alchemyId) {
          throw new Error('Alchemy API key required');
        }
        
        // Use Base Mainnet for more realistic prices
        const provider = new ethers.providers.JsonRpcProvider(
          `https://base-mainnet.g.alchemy.com/v2/${alchemyId}`
        );
        
        console.log('✅ Connected to Alchemy Base Mainnet');
        
        const newPrices: Record<string, number> = {};

        // Fetch prices for each asset
        for (const [asset, address] of Object.entries(PRICE_FEEDS)) {
          try {
            console.log(`🔍 Fetching ${asset} price from Base Mainnet...`);
            const feed = new ethers.Contract(address, PRICE_FEED_ABI, provider);
            const roundData = await feed.latestRoundData();
            
            // Convert from 8 decimals to human readable price
            const price = parseFloat(ethers.utils.formatUnits(roundData.answer, 8));
            newPrices[asset] = price;
            
            console.log(`✅ Fetched ${asset} price: $${price.toLocaleString()}`);
          } catch (error: any) {
            console.error(`❌ Error fetching ${asset} price:`, error.message);
            throw new Error(`Failed to fetch ${asset} price: ${error.message}`);
          }
        }

        setPrices(newPrices);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching Chainlink prices:', error);
        setError(error.message || 'Failed to fetch prices');
        setPrices({ BTC: 0, ETH: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();

    // Refresh prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);

    return () => clearInterval(interval);
  }, []);

  return { prices, loading, error };
} 