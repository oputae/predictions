import { useAccount, useContractRead } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { CONTRACT_ADDRESSES } from '@/app/lib/constants';
import USDCABI from '@/app/lib/abis/USDC.json';
import { useToast } from './useToast';

export function useUSDC() {
  const { address } = useAccount();
  const { toast } = useToast();
  
  // Get USDC balance
  const { data: balance, refetch: refetchBalance } = useContractRead({
    address: CONTRACT_ADDRESSES.usdc as `0x${string}`,
    abi: USDCABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: !!address,
    watch: true,
  });

  // Get allowance for prediction market
  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    address: CONTRACT_ADDRESSES.usdc as `0x${string}`,
    abi: USDCABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACT_ADDRESSES.predictionMarket] : undefined,
    enabled: !!address,
    watch: true,
  });

  const approve = async () => {
    if (!address) {
      throw new Error('Please connect your wallet first');
    }

    try {
      // Use ethers.js directly for contract interaction
      const { ethers } = await import('ethers');
      
      // Get provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();
      
      // Create USDC contract instance
      const usdcContract = new ethers.Contract(
        CONTRACT_ADDRESSES.usdc,
        USDCABI,
        signer
      );

      toast({
        title: 'Approving USDC...',
        description: 'Please confirm the transaction in MetaMask',
        status: 'info',
      });

      // Call the approve function
      const tx = await usdcContract.approve(
        CONTRACT_ADDRESSES.predictionMarket,
        ethers.utils.parseUnits('1000000', 6) // 1M USDC approval
      );

      toast({
        title: 'Transaction Submitted',
        description: `Transaction hash: ${tx.hash}`,
        status: 'info',
      });

      // Wait for confirmation
      const receipt = await tx.wait();
      
      toast({
        title: 'USDC Approved!',
        description: 'You can now place bets',
        status: 'success',
      });

      // Refresh allowance
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