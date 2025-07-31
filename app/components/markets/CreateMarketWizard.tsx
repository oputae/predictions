'use client';

import { useState } from 'react';
import { X, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { ASSETS, TIMEFRAMES } from '@/app/lib/constants';
import { useCreateMarket } from '@/app/hooks/useContracts';
import { useToast } from '@/app/hooks/useToast';
import { useAccount } from 'wagmi';

interface MarketFormData {
  asset: string;
  condition: 'above' | 'below';
  targetPrice: string;
  timeframe: string;
  customDeadline: string;
  minBet: string;
}

interface CreateMarketWizardProps {
  onClose: () => void;
  onCreate: () => void;
}

export function CreateMarketWizard({ onClose, onCreate }: CreateMarketWizardProps) {
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const { createMarket } = useCreateMarket();
  const { toast } = useToast();
  const { address } = useAccount();
  
  const [formData, setFormData] = useState<MarketFormData>({
    asset: '',
    condition: 'above',
    targetPrice: '',
    timeframe: '',
    customDeadline: '',
    minBet: '1',
  });

  const currentPrices: Record<string, number> = {
    BTC: 124500,
    ETH: 4250,
  };

  const isStepValid = () => {
    switch(step) {
      case 1: 
        return formData.asset !== '';
      case 2: 
        return formData.targetPrice !== '' && parseFloat(formData.targetPrice) > 0;
      case 3: 
        return formData.timeframe !== '' && 
               (formData.timeframe !== 'custom' || formData.customDeadline !== '');
      case 4:
        return true;
      default: 
        return false;
    }
  };

  const nextStep = () => {
    if (step < 4 && isStepValid()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const duration = formData.timeframe === 'custom'
        ? Math.floor((new Date(formData.customDeadline).getTime() - Date.now()) / 1000)
        : parseInt(formData.timeframe);

      await createMarket(
        formData.asset,
        parseFloat(formData.targetPrice),
        duration,
        parseFloat(formData.minBet),
        formData.condition === 'above'
      );

      // Add the new market to the list
      const newMarket = {
        question: `Will ${formData.asset} be above $${parseFloat(formData.targetPrice).toLocaleString()}?`,
        asset: formData.asset,
        targetPrice: parseFloat(formData.targetPrice),
        currentPrice: formData.asset === 'BTC' ? 124500 : 4250,
        deadline: new Date(Date.now() + duration * 1000),
        yesPool: "0",
        noPool: "0",
        resolved: false,
        creator: address || "0x...",
        minBet: formData.minBet,
        totalVolume: "0"
      };
      
      // The addMarket function was removed from imports, so this line is commented out
      // addMarket(newMarket); 

      toast({
        title: 'Market Created!',
        description: 'Your prediction market is now live',
        status: 'success',
      });

      onCreate();
    } catch (error: any) {
      toast({
        title: 'Creation Failed',
        description: error.message || 'Failed to create market',
        status: 'error',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create Market</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
                  s <= step ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
                }`}
              >
                {s < step ? <Check className="w-5 h-5" /> : s}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Select Asset */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h3 className="text-xl font-semibold mb-2">Select Asset</h3>
            <p className="text-gray-400 mb-4">Choose the cryptocurrency for your prediction</p>
            <div className="space-y-3">
              {ASSETS.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => setFormData({ ...formData, asset: asset.id })}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    formData.asset === asset.id
                      ? 'border-purple-600 bg-purple-600 bg-opacity-20'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{asset.icon}</span>
                      <div>
                        <p className="font-semibold">{asset.name}</p>
                        <p className="text-sm text-gray-400">{asset.id}</p>
                      </div>
                    </div>
                    <p className="text-lg font-mono">
                      ${currentPrices[asset.id]?.toLocaleString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Set Price Target */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h3 className="text-xl font-semibold mb-2">Set Price Target</h3>
            <p className="text-gray-400 mb-4">What price are you predicting?</p>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Prediction Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, condition: 'above' })}
                  className={`p-3 rounded-lg font-medium transition-colors ${
                    formData.condition === 'above' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Above
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, condition: 'below' })}
                  className={`p-3 rounded-lg font-medium transition-colors ${
                    formData.condition === 'below' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Below
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Target Price ($)</label>
              <input
                type="text"
                value={formData.targetPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                onChange={(e) => {
                  const value = e.target.value.replace(/,/g, '');
                  if (/^\d*\.?\d*$/.test(value)) {
                    setFormData({ ...formData, targetPrice: value });
                  }
                }}
                className="w-full bg-gray-700 rounded-lg px-4 py-3 text-lg font-mono"
                placeholder={formData.asset === 'BTC' ? '130,000' : '5,000'}
              />
              <p className="text-xs text-gray-500 mt-2">
                Current: ${currentPrices[formData.asset]?.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Select Timeframe */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h3 className="text-xl font-semibold mb-2">Select Timeframe</h3>
            <p className="text-gray-400 mb-4">When should this market resolve?</p>
            <div className="space-y-2">
              {TIMEFRAMES.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData({ ...formData, timeframe: option.value.toString() })}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    formData.timeframe === option.value.toString()
                      ? 'border-purple-600 bg-purple-600 bg-opacity-20'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
              <button
                onClick={() => setFormData({ ...formData, timeframe: 'custom' })}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  formData.timeframe === 'custom'
                    ? 'border-purple-600 bg-purple-600 bg-opacity-20'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                Custom Date & Time
              </button>
            </div>
            
            {formData.timeframe === 'custom' && (
              <div className="mt-4">
                <label className="block text-sm text-gray-400 mb-2">Select Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.customDeadline}
                  onChange={(e) => setFormData({ ...formData, customDeadline: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-3"
                  min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review & Confirm */}
        {step === 4 && (
          <div className="animate-fade-in">
            <h3 className="text-xl font-semibold mb-2">Review Market</h3>
            <p className="text-gray-400 mb-4">Confirm your prediction market details</p>
            
            <div className="bg-gray-700 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Asset:</span>
                <span className="font-semibold">{formData.asset}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Prediction:</span>
                <span className="font-semibold">
                  {formData.condition} ${parseFloat(formData.targetPrice).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Resolves in:</span>
                <span className="font-semibold">
                  {formData.timeframe === 'custom' 
                    ? new Date(formData.customDeadline).toLocaleString()
                    : TIMEFRAMES.find(t => t.value.toString() === formData.timeframe)?.label
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Min Bet:</span>
                <span className="font-semibold">${formData.minBet} USDC</span>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-yellow-900 bg-opacity-20 rounded-lg border border-yellow-700">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-400">
                  <p className="font-semibold mb-1">Important:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Markets cannot be cancelled once created</li>
                    <li>1% fee will be charged on winning profits</li>
                    <li>Market will auto-resolve at deadline using Chainlink price</li>
                    <li>One-sided losing markets: If you bet on the losing side with no opposing bets, your stake is forfeited</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-2 mt-6">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-medium"
            >
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={nextStep}
              disabled={!isStepValid()}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center ${
                isStepValid()
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg transition-colors font-medium flex items-center justify-center"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                'Create Market'
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}