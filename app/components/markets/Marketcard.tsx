'use client';

import { Market } from '@/app/lib/types';
import { formatUSDC, getTimeRemaining, calculateOdds } from '@/app/lib/utils';
import { Clock, TrendingUp, TrendingDown, CheckCircle, ExternalLink } from 'lucide-react';
import { BetModal } from './BetModal';
import { useChainlinkPrices } from '@/app/hooks/useChainlinkPrices';
import { useResolveMarket } from '@/app/hooks/useContracts';
import { useState, useEffect } from 'react';

interface MarketCardProps {
  market: Market;
  onBet: () => void;
}

export function MarketCard({ market, onBet }: MarketCardProps) {
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedSide, setSelectedSide] = useState<'yes' | 'no'>('yes');
  const [isResolving, setIsResolving] = useState(false);
  const [resolveTxHash, setResolveTxHash] = useState<string | null>(null);
  const { prices, loading: pricesLoading, error: pricesError } = useChainlinkPrices();
  const { resolveMarket } = useResolveMarket();

  const currentPrice = prices[market.asset] || market.currentPrice || 0;
  const priceDirection = currentPrice > market.targetPrice;
  const odds = calculateOdds(market.yesPool, market.noPool);

  // Check if market is expired but not resolved
  const isExpired = market.deadline < new Date();
  const canResolve = isExpired && !market.resolved;

  // Format the question to add commas to the target price
  const formatQuestion = (question: string) => {
    return question.replace(/\$(\d+)/g, (match, number) => {
      const formattedNumber = parseInt(number).toLocaleString();
      return '$' + formattedNumber;
    });
  };

  const handleBet = (side: 'yes' | 'no') => {
    setSelectedSide(side);
    setShowBetModal(true);
  };

  const handleResolve = async () => {
    if (!canResolve || isResolving) return;

    setIsResolving(true);
    try {
      const txHash = await resolveMarket(market.id, market.deadline, market.asset);
      setResolveTxHash(txHash);
      
      // Store that we should go to the resolved tab after reloading (client-side only)
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

  const getBaseScanUrl = (txHash: string) => {
    return `https://sepolia.basescan.org/tx/${txHash}`;
  };

  return (
    <>
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-white">
            {formatQuestion(market.question)}
          </h3>
          <div className="flex items-center text-sm text-gray-400">
            <Clock className="w-4 h-4 mr-1" />
            {getTimeRemaining(market.deadline)}
            {isExpired && (
              <span className="ml-2 text-orange-400 font-medium">(EXPIRED)</span>
            )}
          </div>
        </div>

        {/* Price Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-400">Current</p>
            <p className="text-lg font-mono flex items-center">
              {pricesLoading ? (
                <span className="text-yellow-400">Loading...</span>
              ) : pricesError ? (
                <span className="text-red-400" title={pricesError}>Error</span>
              ) : (
                <>
                  {formatUSDC(currentPrice)}
                  {priceDirection ?
                    <TrendingUp className="w-4 h-4 ml-1 text-green-500" /> :
                    <TrendingDown className="w-4 h-4 ml-1 text-red-500" />
                  }
                </>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Target</p>
            <p className="text-lg font-mono">${market.targetPrice.toLocaleString()}</p>
          </div>
        </div>

        {/* Pool Visualization */}
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400">Total Volume</span>
            <span className="text-sm text-gray-400">
              {formatUSDC(parseFloat(market.yesPool) + parseFloat(market.noPool))}
            </span>
          </div>

          {/* Betting Breakdown */}
          <div className="grid grid-cols-2 gap-4 mb-3 p-3 bg-gray-700 rounded">
            <div className="text-center">
              <div className="text-sm text-gray-400">YES Pool</div>
              <div className="text-green-400 font-semibold">{formatUSDC(market.yesPool)}</div>
              <div className="text-xs text-gray-500">{odds.yes}% of volume</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">NO Pool</div>
              <div className="text-red-400 font-semibold">{formatUSDC(market.noPool)}</div>
              <div className="text-xs text-gray-500">{odds.no}% of volume</div>
            </div>
          </div>

          <div className="h-6 bg-gray-700 rounded-full overflow-hidden flex">
            <div
              className="bg-green-500 h-full transition-all duration-300"
              style={{ width: `${odds.yes}%` }}
            />
            <div
              className="bg-red-500 h-full transition-all duration-300"
              style={{ width: `${odds.no}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-green-400">YES: {odds.yes}%</span>
            <span className="text-red-400">NO: {odds.no}%</span>
          </div>
        </div>

        {/* Transaction Links */}
        {resolveTxHash && (
          <div className="mb-4">
            <a
              href={getBaseScanUrl(resolveTxHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View Resolution Transaction
            </a>
          </div>
        )}

        {/* Action Buttons */}
        {canResolve ? (
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
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleBet('yes')}
              className="bg-green-600 hover:bg-green-700 py-2 rounded font-medium transition-colors"
            >
              Bet YES
            </button>
            <button
              onClick={() => handleBet('no')}
              className="bg-red-600 hover:bg-red-700 py-2 rounded font-medium transition-colors"
            >
              Bet NO
            </button>
          </div>
        )}
      </div>

      {showBetModal && (
        <BetModal
          market={market}
          side={selectedSide}
          onClose={() => setShowBetModal(false)}
          onSuccess={() => {
            setShowBetModal(false);
            onBet();
          }}
        />
      )}
    </>
  );
}