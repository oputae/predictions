'use client';

import { useState, useEffect } from 'react';
import { Market } from '@/app/lib/types';
import { usePlaceBet, useUSDC } from '@/app/hooks/useContracts';
import { formatUSDC, validateBetAmount } from '@/app/lib/utils';
import { X, ExternalLink } from 'lucide-react';

interface BetModalProps {
  market: Market;
  side: 'yes' | 'no';
  onClose: () => void;
  onSuccess: () => void;
}

export function BetModal({ market, side, onClose, onSuccess }: BetModalProps) {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'approve' | 'bet'>('approve');
  const [isApproved, setIsApproved] = useState(false);
  const [betTxHash, setBetTxHash] = useState<string | null>(null);
  const { balance, allowance, approve, isApproving, refetchAllowance } = useUSDC();
  const { placeBet, isLoading: isBetting } = usePlaceBet();

  // Check initial allowance status when modal opens
  useEffect(() => {
    const checkInitialAllowance = async () => {
      await refetchAllowance();
      // If user already has allowance, automatically move to bet step
      if (parseFloat(allowance) > 0) {
        setStep('bet');
        setIsApproved(true);
      }
    };
    checkInitialAllowance();
  }, [refetchAllowance, allowance]);

  // Check allowance on mount and when amount changes
  useEffect(() => {
    const checkAllowanceStatus = async () => {
      await refetchAllowance();
      const hasEnoughAllowance = parseFloat(allowance) >= parseFloat(amount || '0');
      setIsApproved(hasEnoughAllowance);
      
      // If user has enough allowance, automatically move to bet step
      if (hasEnoughAllowance && step === 'approve') {
        setStep('bet');
      }
    };
    checkAllowanceStatus();
  }, [refetchAllowance, allowance, amount, step]);

  const handleApprove = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      await approve();
      await refetchAllowance();
      setIsApproved(true);
      setStep('bet');
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const handleBet = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      const txHash = await placeBet(market.id, side === 'yes', amount);
      setBetTxHash(txHash);
      onSuccess();
    } catch (error) {
      console.error('Bet failed:', error);
    }
  };

  const formatQuestion = (question: string) => {
    return question.replace(/\$(\d+)/g, (match, number) => {
      const formattedNumber = parseInt(number).toLocaleString();
      return '$' + formattedNumber;
    });
  };

  const getBaseScanUrl = (txHash: string) => {
    return `https://sepolia.basescan.org/tx/${txHash}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            Bet on {formatQuestion(market.question)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Market Info */}
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Target</p>
              <p className="text-white font-mono">${market.targetPrice.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400">Current</p>
              <p className="text-white font-mono">{market.currentPrice?.toLocaleString() || 'Loading...'}</p>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-gray-400 text-sm">Your Bet</p>
            <p className={`text-lg font-semibold ${side === 'yes' ? 'text-green-400' : 'text-red-400'}`}>
              {side.toUpperCase()}
            </p>
          </div>
        </div>

        {/* User Balance & Allowance Info */}
        <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-400">Balance</p>
              <p className="text-white font-mono">{balance} USDC</p>
            </div>
            <div>
              <p className="text-gray-400">Approved</p>
              <p className={`font-mono ${parseFloat(allowance) >= parseFloat(amount || '0') ? 'text-green-400' : 'text-yellow-400'}`}>
                {allowance} USDC
              </p>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center mb-6">
          <div className={`flex-1 h-1 ${step === 'approve' ? 'bg-purple-600' : 'bg-green-600'}`}></div>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
            step === 'approve' ? 'bg-purple-600 text-white' : 'bg-green-600 text-white'
          }`}>
            {step === 'approve' ? '1' : '✓'}
          </div>
          <div className={`flex-1 h-1 ${step === 'bet' ? 'bg-green-600' : 'bg-gray-600'}`}></div>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
            step === 'bet' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-400'
          }`}>
            2
          </div>
          <div className="flex-1 h-1 bg-gray-600"></div>
        </div>

        {/* Transaction Links */}
        {betTxHash && (
          <div className="mb-4">
            <a
              href={getBaseScanUrl(betTxHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View Bet Transaction
            </a>
          </div>
        )}

        {/* Step 1: Approve */}
        {step === 'approve' && (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (Test USDC)
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            
            <button
              onClick={handleApprove}
              disabled={isApproving || !amount || parseFloat(amount) <= 0}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 py-2 rounded font-medium transition-colors flex items-center justify-center"
            >
              {isApproving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Approving...
                </>
              ) : (
                'Approve USDC'
              )}
            </button>
          </div>
        )}

        {/* Step 2: Place Bet */}
        {step === 'bet' && (
          <div>
            <div className="mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
              <p className="text-sm text-green-400">
                ✓ USDC Approved - Ready to place bet
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (Test USDC)
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              />
            </div>
            
            <button
              onClick={handleBet}
              disabled={isBetting || !amount || parseFloat(amount) <= 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 py-2 rounded font-medium transition-colors flex items-center justify-center"
            >
              {isBetting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Placing Bet...
                </>
              ) : (
                `Bet ${amount || '0'} USDC on ${side.toUpperCase()}`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}