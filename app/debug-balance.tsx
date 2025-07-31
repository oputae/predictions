'use client';

import { useAccount, useContractRead } from 'wagmi';
import { formatUnits } from 'viem';

export default function DebugBalance() {
  const { address, isConnected } = useAccount();
  
  // USDC contract address on Base Sepolia
  const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
  
  // USDC ABI (just balanceOf)
  const USDC_ABI = [
    {
      inputs: [{ name: 'account', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ] as const;

  const { data: balance, isLoading, error } = useContractRead({
    address: USDC_ADDRESS as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: !!address,
    watch: true,
  });

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Balance</h1>
      
      <div className="space-y-4">
        <div>
          <strong>Wallet Connected:</strong> {isConnected ? 'Yes' : 'No'}
        </div>
        
        <div>
          <strong>Wallet Address:</strong> {address || 'Not connected'}
        </div>
        
        <div>
          <strong>USDC Contract Address:</strong> {USDC_ADDRESS}
        </div>
        
        <div>
          <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
        </div>
        
        <div>
          <strong>Error:</strong> {error ? error.message : 'None'}
        </div>
        
        <div>
          <strong>Raw Balance:</strong> {balance?.toString() || 'No data'}
        </div>
        
        <div>
          <strong>Formatted Balance:</strong> {balance ? formatUnits(balance as unknown as bigint, 6) : 'No data'} USDC
        </div>
      </div>
    </div>
  );
} 