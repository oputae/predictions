import { useState } from 'react';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { parseUnits } from 'viem';
import { CONTRACT_ADDRESSES } from '@/app/lib/constants';
import PredictionMarketABI from '@/app/lib/abis/PredictionMarket.json';
import { useToast } from './useToast';
import { useUSDC } from './useUSDC';

export function usePlaceBet() {
  const { toast } = useToast();
  const { allowance } = useUSDC();
  const [isLoading, setIsLoading] = useState(false);

  const placeBet = async (
    marketId: number,
    isYes: boolean,
    amount: string
  ) => {
    setIsLoading(true);
    try {
      const amountInUSDC = parseUnits(amount, 6);
      
      // Check allowance
      if (parseFloat(allowance) < parseFloat(amount)) {
        throw new Error('Please approve USDC spending first');
      }

      // For now, just simulate the bet
      toast({
        title: 'Bet Placed!',
        description: `Bet ${amount} USDC on ${isYes ? 'YES' : 'NO'}`,
        status: 'success',
      });

      return '0x123...'; // Mock transaction hash
    } catch (error: any) {
      toast({
        title: 'Error placing bet',
        description: error.message || 'Unknown error occurred',
        status: 'error',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { placeBet, isLoading };
}