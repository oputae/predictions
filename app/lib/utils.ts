import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatUSDC(amount: string | number): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function calculateOdds(yesPool: string, noPool: string): { yes: number; no: number } {
  const yes = parseFloat(yesPool);
  const no = parseFloat(noPool);
  const total = yes + no;
  
  if (total === 0) return { yes: 50, no: 50 };
  
  return {
    yes: Math.round((no / total) * 100),
    no: Math.round((yes / total) * 100),
  };
}

export function getTimeRemaining(deadline: Date): string {
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  
  if (diff <= 0) return 'Expired';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export function validateMarketForm(data: any): string | null {
  if (!data.asset) return 'Please select an asset';
  if (!data.targetPrice || parseFloat(data.targetPrice) <= 0) {
    return 'Please enter a valid target price';
  }
  if (!data.timeframe && !data.customDeadline) {
    return 'Please select a timeframe';
  }
  return null;
}

export function validateBetAmount(amount: string, balance: string, minBet: string): string | null {
  const betAmount = parseFloat(amount);
  const userBalance = parseFloat(balance);
  const minimum = parseFloat(minBet);
  
  if (isNaN(betAmount) || betAmount <= 0) {
    return 'Please enter a valid amount';
  }
  if (betAmount < minimum) {
    return `Minimum bet is ${formatUSDC(minimum)}`;
  }
  if (betAmount > userBalance) {
    return 'Insufficient USDC balance';
  }
  return null;
}