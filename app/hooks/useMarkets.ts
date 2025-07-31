import { useState, useEffect } from 'react';
import { Market } from '@/app/lib/types';

// Mock data for local testing
const MOCK_MARKETS: Market[] = [
  {
    id: 0,
    question: "Will BTC be above $130,000?",
    asset: "BTC",
    targetPrice: 130000,
    currentPrice: 124500,
    deadline: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
    yesPool: "100",
    noPool: "150",
    resolved: false,
    creator: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    minBet: "5",
    totalVolume: "250"
  },
  {
    id: 1,
    question: "Will ETH be above $5,000?",
    asset: "ETH",
    targetPrice: 5000,
    currentPrice: 4250,
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    yesPool: "0",
    noPool: "0",
    resolved: false,
    creator: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    minBet: "1",
    totalVolume: "0"
  }
];

// Global state to track created markets
let createdMarkets: Market[] = [];
let nextMarketId = 2;

export function useMarkets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => {
      setMarkets([...MOCK_MARKETS, ...createdMarkets]);
      setLoading(false);
    }, 500);
  }, []);

  const refetch = () => {
    setLoading(true);
    setTimeout(() => {
      setMarkets([...MOCK_MARKETS, ...createdMarkets]);
      setLoading(false);
    }, 500);
  };

  const addMarket = (market: Omit<Market, 'id'>) => {
    const newMarket: Market = {
      ...market,
      id: nextMarketId++
    };
    createdMarkets.push(newMarket);
    setMarkets([...MOCK_MARKETS, ...createdMarkets]);
  };

  return { markets, loading, refetch, addMarket };
}