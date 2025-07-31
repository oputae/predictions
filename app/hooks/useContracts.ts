import { 
  useContract, 
  useContractRead, 
  useContractWrite, 
  usePrepareContractWrite,
  useWaitForTransaction,
  useAccount 
} from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import PredictionMarketArtifact from '@/app/lib/abis/PredictionMarket.json';
import USDCABI from '@/app/lib/abis/USDC.json';
import { CONTRACT_ADDRESSES } from '@/app/lib/constants';
import { useToast } from '@/app/hooks/useToast';
import { Market, Position } from '@/app/lib/types';

const PredictionMarketABI = PredictionMarketArtifact.abi;

// Get contract addresses based on network
const getContractAddresses = () => {
  return {
    predictionMarket: CONTRACT_ADDRESSES.predictionMarket as `0x${string}`,
    usdc: CONTRACT_ADDRESSES.usdc as `0x${string}`
  };
};

// Hook for getting market count
export function useMarketCount() {
  const { predictionMarket } = getContractAddresses();
  
  // Get total number of markets
  const { data: marketCount, refetch: refetchCount } = useContractRead({
    address: predictionMarket,
    abi: PredictionMarketABI,
    functionName: 'marketIdCounter',
    watch: true,
  });

  return { marketCount: Number(marketCount || 0), refetchCount };
}

// Hook for USDC operations
export function useUSDC() {
  const { address } = useAccount();
  const { usdc } = getContractAddresses();
  const { toast } = useToast();
  
  // Get USDC balance
  const { data: balance, refetch: refetchBalance } = useContractRead({
    address: usdc,
    abi: USDCABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: !!address,
    watch: true,
  });

  // Get allowance for prediction market
  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    address: usdc,
    abi: USDCABI,
    functionName: 'allowance',
    args: address ? [address, getContractAddresses().predictionMarket] : undefined,
    enabled: !!address,
    watch: true,
  });

  // Approve USDC spending using ethers.js directly
  const approve = async () => {
    if (!address) {
      throw new Error('Please connect your wallet first');
    }

    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();
      const usdcContract = new ethers.Contract(
        usdc,
        USDCABI,
        signer
      );

      const tx = await usdcContract.approve(
        getContractAddresses().predictionMarket,
        ethers.utils.parseUnits('1000000', 6)
      );

      await tx.wait();

      toast({
        title: 'USDC Approved!',
        description: 'You can now place bets',
        status: 'success',
      });

      refetchAllowance();
    } catch (error: any) {
      toast({
        title: 'Approval Failed',
        description: error.message || 'Failed to approve USDC',
        status: 'error',
      });
      throw error;
    }
  };

  return {
    balance: balance ? formatUnits(balance as bigint, 6) : '0',
    allowance: allowance ? formatUnits(allowance as bigint, 6) : '0',
    approve,
    isApproving: false,
    refetchBalance,
    refetchAllowance,
  };
}

// Hook for fetching markets
export function useMarkets() {
  const { predictionMarket } = getContractAddresses();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { marketCount, refetchCount } = useMarketCount();

  // Fetch markets
  useEffect(() => {
    const fetchMarkets = async () => {
      if (!marketCount) {
        setLoading(false);
        return;
      }

      try {
        const contract = new ethers.Contract(
          predictionMarket,
          PredictionMarketABI,
          new ethers.providers.Web3Provider((window.ethereum as any) || {}).getSigner()
        );

        const count = marketCount;
        const marketPromises: Market[] = [];

        for (let i = 0; i < count; i++) {
          try {
            const marketInfo = await contract.getMarketInfo(i);
            const market: Market = {
              id: i,
              question: marketInfo[0],
              asset: marketInfo[1],
              targetPrice: Number(ethers.utils.formatUnits(marketInfo[2], 8)),
              deadline: new Date(Number(marketInfo[3]) * 1000),
              yesPool: ethers.utils.formatUnits(marketInfo[4], 6),
              noPool: ethers.utils.formatUnits(marketInfo[5], 6),
              resolved: marketInfo[6],
              outcome: marketInfo[7],
              creator: marketInfo[8],
              minBet: "1",
            };
            
            // Only include active markets (not resolved and not expired)
            if (!market.resolved && market.deadline > new Date()) {
              marketPromises.push(market);
            }
          } catch (error) {
            console.error(`Error fetching market ${i}:`, error);
          }
        }

        setMarkets(marketPromises);
      } catch (error) {
        console.error('Error fetching markets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, [marketCount, predictionMarket, refreshTrigger]);

  const refetch = () => {
    setRefreshTrigger(Date.now());
    refetchCount();
  };

  return { markets, loading, refetch };
}

// Hook for fetching resolved markets
export function useResolvedMarkets() {
  const { predictionMarket } = getContractAddresses();
  const [resolvedMarkets, setResolvedMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { marketCount, refetchCount } = useMarketCount();

  // Create individual useContractRead hooks for each market
  const market0 = useContractRead({
    address: predictionMarket,
    abi: PredictionMarketABI,
    functionName: 'getMarketInfo',
    args: [0],
    enabled: !!predictionMarket && marketCount > 0,
  });

  const market1 = useContractRead({
    address: predictionMarket,
    abi: PredictionMarketABI,
    functionName: 'getMarketInfo',
    args: [1],
    enabled: !!predictionMarket && marketCount > 1,
  });

  const market2 = useContractRead({
    address: predictionMarket,
    abi: PredictionMarketABI,
    functionName: 'getMarketInfo',
    args: [2],
    enabled: !!predictionMarket && marketCount > 2,
  });

  const market3 = useContractRead({
    address: predictionMarket,
    abi: PredictionMarketABI,
    functionName: 'getMarketInfo',
    args: [3],
    enabled: !!predictionMarket && marketCount > 3,
  });

  const market4 = useContractRead({
    address: predictionMarket,
    abi: PredictionMarketABI,
    functionName: 'getMarketInfo',
    args: [4],
    enabled: !!predictionMarket && marketCount > 4,
  });

  const market5 = useContractRead({
    address: predictionMarket,
    abi: PredictionMarketABI,
    functionName: 'getMarketInfo',
    args: [5],
    enabled: !!predictionMarket && marketCount > 5,
  });

  const market6 = useContractRead({
    address: predictionMarket,
    abi: PredictionMarketABI,
    functionName: 'getMarketInfo',
    args: [6],
    enabled: !!predictionMarket && marketCount > 6,
  });

  // Process all market data
  useEffect(() => {
    if (!marketCount) {
      setLoading(false);
      return;
    }

    const allMarkets = [market0, market1, market2, market3, market4, market5, market6];
    const resolvedPromises: Market[] = [];

    allMarkets.forEach((marketQuery, index) => {
      if (index < marketCount && marketQuery.data) {
        const marketInfo = marketQuery.data as any;
        const market: Market = {
          id: index,
          question: marketInfo[0],
          asset: marketInfo[1],
          targetPrice: Number(ethers.utils.formatUnits(marketInfo[2], 8)),
          deadline: new Date(Number(marketInfo[3]) * 1000),
          yesPool: ethers.utils.formatUnits(marketInfo[4], 6),
          noPool: ethers.utils.formatUnits(marketInfo[5], 6),
          resolved: marketInfo[6],
          outcome: marketInfo[7],
          creator: marketInfo[8],
          minBet: "1",
        };
        
        // Include resolved markets OR expired markets (that can be resolved)
        if (market.resolved || market.deadline < new Date()) {
          resolvedPromises.push(market);
        }
      }
    });

    setResolvedMarkets(resolvedPromises);
    setLoading(false);
  }, [marketCount, market0.data, market1.data, market2.data, market3.data, market4.data, market5.data, market6.data, refreshTrigger]);

  const refetch = () => {
    setRefreshTrigger(Date.now());
    refetchCount();
    // Refetch all market queries
    market0.refetch?.();
    market1.refetch?.();
    market2.refetch?.();
    market3.refetch?.();
    market4.refetch?.();
    market5.refetch?.();
    market6.refetch?.();
  };

  return { resolvedMarkets, loading, refetch };
}

// Hook for creating markets
export function useCreateMarket() {
  const { predictionMarket } = getContractAddresses();
  const { toast } = useToast();
  const { address } = useAccount();

  const createMarket = async (
    asset: string,
    targetPrice: number,
    duration: number,
    minBet: number = 1,
    isAbove: boolean = true
  ) => {
    if (!address) {
      throw new Error('Please connect your wallet first');
    }

    try {
      // Use ethers.js directly for contract interaction
      const { ethers } = await import('ethers');
      
      // Get provider and signer
      const provider = new ethers.providers.Web3Provider((window.ethereum as any) || {});
      const signer = provider.getSigner();
      
      // Create contract instance
      const contract = new ethers.Contract(
        predictionMarket,
        PredictionMarketABI,
        signer
      );

      // Call the contract
      const deadline = Math.floor(Date.now() / 1000) + duration;
      const minBetInUSDC = ethers.utils.parseUnits(minBet.toString(), 6);
      
      const tx = await contract.createMarket(
        asset,
        ethers.utils.parseUnits(targetPrice.toString(), 8), // 8 decimals for price
        duration,
        minBetInUSDC,
        isAbove
      );

      toast({
        title: 'Market Created!',
        description: `Market for ${asset} ${isAbove ? 'above' : 'below'} $${targetPrice.toLocaleString()} created successfully`,
        status: 'success',
      });

      return tx.hash;
    } catch (error: any) {
      toast({
        title: 'Error creating market',
        description: error.message || 'Unknown error occurred',
        status: 'error',
      });
      throw error;
    }
  };

  return { createMarket, isLoading: false };
}

// Hook for placing bets
export function usePlaceBet() {
  const { predictionMarket } = getContractAddresses();
  const { toast } = useToast();
  const { allowance } = useUSDC();
  const { address } = useAccount();

  const placeBet = async (
    marketId: number,
    isYes: boolean,
    amount: string
  ) => {
    if (!address) {
      throw new Error('Please connect your wallet first');
    }

    try {
      // Check allowance
      if (parseFloat(allowance) < parseFloat(amount)) {
        throw new Error('Please approve USDC spending first');
      }

      // Use ethers.js directly for contract interaction
      const { ethers } = await import('ethers');
      
      // Get provider and signer
      const provider = new ethers.providers.Web3Provider((window.ethereum as any) || {});
      const signer = provider.getSigner();
      
      // Create contract instance
      const contract = new ethers.Contract(
        predictionMarket,
        PredictionMarketABI,
        signer
      );

      // Call the contract
      const amountInUSDC = ethers.utils.parseUnits(amount, 6);
      
      const tx = await contract.placeBet(
        marketId,
        isYes,
        amountInUSDC
      );

      await tx.wait();
      
      toast({
        title: 'Bet Placed!',
        description: `Successfully bet ${amount} USDC on ${isYes ? 'YES' : 'NO'}`,
        status: 'success',
      });
      
      return tx.hash;
    } catch (error: any) {
      toast({
        title: 'Error placing bet',
        description: error.message || 'Unknown error occurred',
        status: 'error',
      });
      throw error;
    }
  };

  return { placeBet, isLoading: false };
}

// Hook for claiming winnings
export function useClaimWinnings() {
  const { predictionMarket } = getContractAddresses();
  const { address } = useAccount();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const checkWinnings = async (marketId: number): Promise<{ winnings: string; claimed: boolean }> => {
    if (!address) return { winnings: '0', claimed: false };

    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.providers.Web3Provider((window.ethereum as any) || {});
      const contract = new ethers.Contract(
        predictionMarket,
        PredictionMarketABI,
        provider
      );

      const position = await contract.getUserPosition(marketId, address);
      const winnings = ethers.utils.formatUnits(position.potentialWinnings, 6);
      const claimed = position.claimed;
      
      return { winnings, claimed };
    } catch (error) {
      console.error('Error checking winnings:', error);
      return { winnings: '0', claimed: false };
    }
  };

  const claimWinnings = async (marketId: number) => {
    if (!address) {
      throw new Error('Please connect your wallet first');
    }

    setIsLoading(true);
    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.providers.Web3Provider((window.ethereum as any) || {});
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        predictionMarket,
        PredictionMarketABI,
        signer
      );

      toast({
        title: 'Claiming Winnings...',
        description: 'Please confirm the transaction in MetaMask',
        status: 'info',
      });

      const tx = await contract.claimWinnings(marketId);
      
      toast({
        title: 'Transaction Submitted',
        description: `Transaction hash: ${tx.hash}`,
        status: 'info',
      });

      await tx.wait();

      toast({
        title: 'Winnings Claimed!',
        description: 'Check your wallet for USDC',
        status: 'success',
      });

      return tx.hash;
    } catch (error: any) {
      toast({
        title: 'Error claiming winnings',
        description: error.message || 'Unknown error occurred',
        status: 'error',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { checkWinnings, claimWinnings, isLoading };
}

// Hook for market details with user position
export function useMarketDetails(marketId: number) {
  const { predictionMarket } = getContractAddresses();
  const { address } = useAccount();

  // Get market info
  const { data: marketInfo, refetch: refetchMarket } = useContractRead({
    address: predictionMarket,
    abi: PredictionMarketABI,
    functionName: 'getMarketInfo',
    args: [BigInt(marketId).toString()],
    watch: true,
  });

  // Get user position
  const { data: userPosition, refetch: refetchPosition } = useContractRead({
    address: predictionMarket,
    abi: PredictionMarketABI,
    functionName: 'getUserPosition',
    args: address ? [BigInt(marketId).toString(), address] : undefined,
    enabled: !!address,
    watch: true,
  });

  // Get odds
  const { data: odds, refetch: refetchOdds } = useContractRead({
    address: predictionMarket,
    abi: PredictionMarketABI,
    functionName: 'getOdds',
    args: [BigInt(marketId).toString()],
    watch: true,
  });

  const refetchAll = () => {
    refetchMarket();
    refetchPosition();
    refetchOdds();
  };

  return {
    market: marketInfo ? {
      question: (marketInfo as any)[0], // Use the question from the contract
      asset: (marketInfo as any)[1],
      targetPrice: Number(formatUnits((marketInfo as any)[2] as bigint, 8)), // Fix: format with 8 decimals
      deadline: new Date(Number((marketInfo as any)[3]) * 1000),
      yesPool: formatUnits((marketInfo as any)[4] as bigint, 6),
      noPool: formatUnits((marketInfo as any)[5] as bigint, 6),
      resolved: (marketInfo as any)[6],
      outcome: (marketInfo as any)[7],
      creator: (marketInfo as any)[8],
      // Note: isAbove field is available at (marketInfo as any)[9] but not used in Market interface
    } as Market : null,
    position: userPosition ? {
      yesAmount: formatUnits((userPosition as any)[0] as bigint, 6),
      noAmount: formatUnits((userPosition as any)[1] as bigint, 6),
      claimed: (userPosition as any)[2],
      potentialWinnings: formatUnits((userPosition as any)[3] as bigint, 6),
    } as Position : null,
    odds: odds ? {
      yes: Number((odds as any)[0]),
      no: Number((odds as any)[1]),
    } : null,
    refetch: refetchAll,
  };
}

// Hook for resolving markets
export function useResolveMarket() {
  const { predictionMarket } = getContractAddresses();
  const { toast } = useToast();

  const resolveMarket = async (marketId: number) => {
    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.providers.Web3Provider((window.ethereum as any) || {});
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        predictionMarket,
        PredictionMarketABI,
        signer
      );

      toast({
        title: 'Resolving Market...',
        description: 'Please confirm the transaction in MetaMask',
        status: 'info',
      });

      const tx = await contract.resolveMarket(marketId);
      
      toast({
        title: 'Transaction Submitted',
        description: `Transaction hash: ${tx.hash}`,
        status: 'info',
      });

      await tx.wait();

      toast({
        title: 'Market Resolved!',
        description: 'The market has been successfully resolved',
        status: 'success',
      });

      // Add a small delay to ensure blockchain state is updated
      await new Promise(resolve => setTimeout(resolve, 2000));

      return tx.hash;
    } catch (error: any) {
      toast({
        title: 'Resolution Failed',
        description: error.message || 'Failed to resolve market',
        status: 'error',
      });
      throw error;
    }
  };

  return { resolveMarket };
}

// Hook for withdrawing fees (admin only)
export function useWithdrawFees() {
  const { predictionMarket } = getContractAddresses();
  const { address } = useAccount();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const withdrawFees = async () => {
    setIsLoading(true);
    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.providers.Web3Provider((window.ethereum as any) || {});
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        predictionMarket,
        PredictionMarketABI,
        signer
      );

      toast({
        title: 'Withdrawing Fees...',
        description: 'Please confirm the transaction in MetaMask',
        status: 'info',
      });

      const tx = await contract.withdrawFees();
      
      toast({
        title: 'Transaction Submitted',
        description: `Transaction hash: ${tx.hash}`,
        status: 'info',
      });

      await tx.wait();

      toast({
        title: 'Fees Withdrawn!',
        description: 'All accumulated fees have been transferred to your wallet',
        status: 'success',
      });

      return tx.hash;
    } catch (error: any) {
      toast({
        title: 'Fee Withdrawal Failed',
        description: error.message || 'Failed to withdraw fees',
        status: 'error',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { withdrawFees, isLoading };
}

// Hook for withdrawing forfeited amounts (admin only)
export function useWithdrawForfeited() {
  const { predictionMarket } = getContractAddresses();
  const { address } = useAccount();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const withdrawForfeited = async () => {
    setIsLoading(true);
    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.providers.Web3Provider((window.ethereum as any) || {});
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        predictionMarket,
        PredictionMarketABI,
        signer
      );

      toast({
        title: 'Withdrawing Forfeited Amounts...',
        description: 'Please confirm the transaction in MetaMask',
        status: 'info',
      });

      const tx = await contract.withdrawForfeited();
      
      toast({
        title: 'Transaction Submitted',
        description: `Transaction hash: ${tx.hash}`,
        status: 'info',
      });

      await tx.wait();

      toast({
        title: 'Forfeited Amounts Withdrawn!',
        description: 'All forfeited amounts have been transferred to your wallet',
        status: 'success',
      });

      return tx.hash;
    } catch (error: any) {
      toast({
        title: 'Forfeited Withdrawal Failed',
        description: error.message || 'Failed to withdraw forfeited amounts',
        status: 'error',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { withdrawForfeited, isLoading };
}