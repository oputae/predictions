export interface Market {
  id: number;
  question: string;
  asset: string;
  targetPrice: number;
  currentPrice?: number;
  deadline: Date;
  yesPool: string;
  noPool: string;
  resolved: boolean;
  outcome?: boolean;
  creator: string;
  minBet: string;
  totalVolume?: string;
}

export interface Position {
  yesAmount: string;
  noAmount: string;
  claimed: boolean;
  potentialWinnings: string;
}

export interface Odds {
  yes: number;
  no: number;
}

export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  custody?: string;
  verifications?: string[];
}

export interface MarketFormData {
  asset: string;
  condition: 'above' | 'below';
  targetPrice: string;
  timeframe: string;
  customDeadline?: string;
  minBet?: string;
}

export interface BetFormData {
  marketId: number;
  side: 'yes' | 'no';
  amount: string;
}

export interface FrameButtonAction {
  fid: number;
  buttonIndex: number;
  castId: {
    fid: number;
    hash: string;
  };
  inputText?: string;
  url: string;
  messageHash: string;
}