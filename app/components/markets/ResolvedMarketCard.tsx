'use client';

import { Market } from '@/app/lib/types';
import { formatUSDC } from '@/app/lib/utils';
import { CheckCircle, XCircle, DollarSign, Clock, Gift, ExternalLink } from 'lucide-react';
import { useResolveMarket, useClaimWinnings } from '@/app/hooks/useContracts';
import { useState, useEffect } from 'react';
import { CONTRACT_ADDRESSES } from '@/app/lib/constants';

interface ResolvedMarketCardProps {
  market: Market;
  onResolve?: () => void;
}

export function ResolvedMarketCard({ market, onResolve }: ResolvedMarketCardProps) {
  const [isResolving, setIsResolving] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [userWinnings, setUserWinnings] = useState('0');
  const [hasClaimed, setHasClaimed] = useState(false);
  const [resolveTxHash, setResolveTxHash] = useState<string | null>(null);
  const [claimTxHash, setClaimTxHash] = useState<string | null>(null);
  const [localMarket, setLocalMarket] = useState<Market>(market);
  const { resolveMarket } = useResolveMarket();
  const { checkWinnings, claimWinnings, isLoading } = useClaimWinnings();
  
  const isExpired = localMarket.deadline < new Date();
  const isActuallyResolved = localMarket.resolved;
  const outcome = localMarket.outcome;
  
  const winningPool = outcome ? localMarket.yesPool : localMarket.noPool;
  const losingPool = outcome ? localMarket.noPool : localMarket.yesPool;
  const totalVolume = parseFloat(winningPool) + parseFloat(losingPool);

  // Check user's winnings when component mounts or market resolves
  useEffect(() => {
    const checkUserWinnings = async () => {
      if (isActuallyResolved) {
        const result = await checkWinnings(localMarket.id);
        setUserWinnings(result.winnings);
        setHasClaimed(result.claimed);
      }
    };
    
    checkUserWinnings();
  }, [localMarket.id, isActuallyResolved, checkWinnings]);

  // Update local market state when prop changes
  useEffect(() => {
    setLocalMarket(market);
  }, [market]);

  // Format the question to add commas to the target price
  const formatQuestion = (question: string) => {
    return question.replace(/\$(\d+)/g, (match, number) => {
      const formattedNumber = parseInt(number).toLocaleString();
      return '$' + formattedNumber;
    });
  };

  const handleResolve = async () => {
    if (!isExpired || isActuallyResolved || isResolving) return;
    
    setIsResolving(true);
    try {
      const txHash = await resolveMarket(localMarket.id, localMarket.deadline, localMarket.asset);
      setResolveTxHash(txHash);
      
      // Store that we're on the resolved tab before reloading (client-side only)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('activeTab', 'resolved');
      }
      
      // Simple solution: reload the page to get fresh data
      window.location.reload();
    } catch (error) {
      console.error('Failed to resolve market:', error);
    } finally {
      setIsResolving(false);
    }
  };

  const handleClaim = async () => {
    if (isClaiming || parseFloat(userWinnings) === 0) return;
    
    setIsClaiming(true);
    try {
      const txHash = await claimWinnings(localMarket.id);
      setClaimTxHash(txHash);
      setHasClaimed(true);
      setUserWinnings('0');
      onResolve?.(); // Refresh markets to update pools
    } catch (error) {
      console.error('Failed to claim winnings:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  const getBaseScanUrl = (txHash: string) => {
    return `https://sepolia.basescan.org/tx/${txHash}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-white">
          {formatQuestion(localMarket.question)}
        </h3>
        <div className="flex items-center">
          {isActuallyResolved ? (
            // Show outcome for resolved markets
            <>
              {outcome ? (
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 mr-2" />
              )}
              <span className={`text-sm font-medium ${outcome ? 'text-green-400' : 'text-red-400'}`}>
                {outcome ? 'YES' : 'NO'} WON
              </span>
            </>
          ) : (
            // Show expired status for unresolved markets
            <>
              <Clock className="w-5 h-5 text-orange-500 mr-2" />
              <span className="text-sm font-medium text-orange-400">
                EXPIRED
              </span>
            </>
          )}
        </div>
      </div>

      {/* Market Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-400">Asset</p>
          <p className="text-lg font-mono text-white">{localMarket.asset}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Target Price</p>
          <p className="text-lg font-mono text-white">${localMarket.targetPrice.toLocaleString()}</p>
        </div>
      </div>

      {/* Pool Information */}
      <div className="bg-gray-700 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">
            {isActuallyResolved ? 'Final Results' : 'Current Pools'}
          </span>
          <span className="text-sm text-gray-400">
            {formatUSDC(totalVolume)} Total Volume
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-400">YES Pool</div>
            <div className={`font-semibold ${isActuallyResolved && outcome ? 'text-green-400' : 'text-gray-500'}`}>
              {formatUSDC(localMarket.yesPool)}
            </div>
            <div className="text-xs text-gray-500">
              {((parseFloat(localMarket.yesPool) / totalVolume) * 100).toFixed(1)}% of volume
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">NO Pool</div>
            <div className={`font-semibold ${isActuallyResolved && !outcome ? 'text-red-400' : 'text-gray-500'}`}>
              {formatUSDC(localMarket.noPool)}
            </div>
            <div className="text-xs text-gray-500">
              {((parseFloat(localMarket.noPool) / totalVolume) * 100).toFixed(1)}% of volume
            </div>
          </div>
        </div>
      </div>

      {/* User Winnings Display */}
      {isActuallyResolved && parseFloat(userWinnings) > 0 && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Gift className="w-4 h-4 text-green-400 mr-2" />
              <span className="text-sm text-green-400">Your Winnings:</span>
            </div>
            <span className="text-lg font-semibold text-green-400">
              {formatUSDC(userWinnings)}
            </span>
          </div>
        </div>
      )}

      {/* Transaction Links */}
      {(resolveTxHash || claimTxHash) && (
        <div className="mb-4 space-y-2">
          {resolveTxHash && (
            <a
              href={getBaseScanUrl(resolveTxHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View Resolution Transaction
            </a>
          )}
          {claimTxHash && (
            <a
              href={getBaseScanUrl(claimTxHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View Claim Transaction
            </a>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {isExpired && !isActuallyResolved ? (
        // State 1: Market Expired, Not Yet Resolved
        <button
          onClick={handleResolve}
          disabled={isResolving}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 py-2 rounded font-medium transition-colors flex items-center justify-center"
        >
          {isResolving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Resolving...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Resolve Market
            </>
          )}
        </button>
      ) : isActuallyResolved && parseFloat(userWinnings) > 0 && !hasClaimed ? (
        // State 2: Market Resolved, User has unclaimed winnings
        <button
          onClick={handleClaim}
          disabled={isClaiming}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 py-2 rounded font-medium transition-colors flex items-center justify-center"
        >
          {isClaiming ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Claiming...
            </>
          ) : (
            <>
              <Gift className="w-4 h-4 mr-2" />
              Claim Winnings
            </>
          )}
        </button>
      ) : isActuallyResolved && hasClaimed ? (
        // State 2: Market Resolved, User already claimed winnings
        <div className="text-center py-2 text-sm text-gray-400">
          ✓ Winnings claimed
        </div>
      ) : (
        // State 2: Market Resolved, User has no winnings
        <div className="flex justify-between items-center text-sm text-gray-400">
          <span>Resolved on {localMarket.deadline.toLocaleDateString()}</span>
          <span>Creator: {localMarket.creator.slice(0, 6)}...{localMarket.creator.slice(-4)}</span>
        </div>
      )}
    </div>
  );
} 