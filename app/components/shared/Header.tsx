'use client';

import { useWeb3Auth } from '@/app/hooks/useWeb3Auth';
import { useUSDC, useWithdrawFees, useWithdrawForfeited } from '@/app/hooks/useContracts';
import { AuthButton } from '@/app/components/auth/AuthButton';
import { ActivityFeed } from './ActivityFeed';
import { DollarSign, Coins } from 'lucide-react';

export function Header() {
  const { isFullyAuthenticated } = useWeb3Auth();
  const { balance } = useUSDC();
  const { withdrawFees, isLoading: isWithdrawing } = useWithdrawFees();
  const { withdrawForfeited, isLoading: isWithdrawingForfeited } = useWithdrawForfeited();

  const handleWithdrawFees = async () => {
    try {
      await withdrawFees();
    } catch (error) {
      console.error('Failed to withdraw fees:', error);
    }
  };

  const handleWithdrawForfeited = async () => {
    try {
      await withdrawForfeited();
    } catch (error) {
      console.error('Failed to withdraw forfeited amounts:', error);
    }
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-white">Prediction Markets</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {isFullyAuthenticated && (
              <>
                <div className="text-white">
                  <span className="text-sm text-gray-400">Balance:</span>
                  <span className="ml-1 font-mono">
                    ${parseFloat(balance || '0').toLocaleString()}
                    <span className="text-xs text-gray-400 ml-1">(Test USDC)</span>
                  </span>
                </div>
                <ActivityFeed />
                <button
                  onClick={handleWithdrawFees}
                  disabled={isWithdrawing}
                  className="flex items-center text-sm text-yellow-400 hover:text-yellow-300 transition-colors disabled:opacity-50"
                  title="Withdraw accumulated fees (Admin only)"
                >
                  <DollarSign className="w-4 h-4 mr-1" />
                  {isWithdrawing ? 'Withdrawing...' : 'Withdraw Fees'}
                </button>
                <button
                  onClick={handleWithdrawForfeited}
                  disabled={isWithdrawingForfeited}
                  className="flex items-center text-sm text-orange-400 hover:text-orange-300 transition-colors disabled:opacity-50"
                  title="Withdraw forfeited amounts (Admin only)"
                >
                  <Coins className="w-4 h-4 mr-1" />
                  {isWithdrawingForfeited ? 'Withdrawing...' : 'Withdraw Forfeited'}
                </button>
              </>
            )}
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
}