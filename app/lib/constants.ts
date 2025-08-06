export const SUPPORTED_CHAINS = [84532, 8453, 31337]; // Base Sepolia, Base, Localhost

export const CHAIN_CONFIG = {
  84532: {
    name: 'Base Sepolia',
    usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    explorer: 'https://sepolia.basescan.org',
    faucet: 'https://www.alchemy.com/faucets/base-sepolia',
  },
  8453: {
    name: 'Base',
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    explorer: 'https://basescan.org',
    faucet: null,
  },
  31337: {
    name: 'Localhost',
    usdc: process.env.NEXT_PUBLIC_USDC_ADDRESS || '',
    explorer: '',
    faucet: null,
  },
};

export const CONTRACT_ADDRESSES = {
  predictionMarket: process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS || '0x3bfD4012d81E040D25B06caA89b2Eabf14507F71',
  usdc: process.env.NEXT_PUBLIC_USDC_ADDRESS || '',
};

export const ASSETS = [
  { id: 'BTC', name: 'Bitcoin', icon: '₿' },
  { id: 'ETH', name: 'Ethereum', icon: 'Ξ' },
];

export const TIMEFRAMES = [
  { value: 3600, label: '1 hour' },
  { value: 21600, label: '6 hours' },
  { value: 86400, label: '24 hours' },
  { value: 604800, label: '1 week' },
  { value: 2592000, label: '30 days' },
];

export const MIN_BET = 1; // 1 USDC
export const MAX_BET = 10000; // 10,000 USDC
export const FEE_PERCENTAGE = 1; // 1% on winnings