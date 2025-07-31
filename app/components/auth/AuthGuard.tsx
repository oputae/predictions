'use client';

import { useWeb3Auth } from '@/app/hooks/useWeb3Auth';
import { User, Wallet, Shield, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export function AuthGuard() {
  const {
    isFarcasterAuthenticated,
    isWalletConnected,
    signInWithFarcaster,
    connectWallet,
    authLoading,
    isWrongNetwork,
    switchToBase,
  } = useWeb3Auth();

  const [isConnecting, setIsConnecting] = useState(false);

  const handleFarcasterSignIn = async () => {
    setIsConnecting(true);
    try {
      await signInWithFarcaster();
    } finally {
      setIsConnecting(false);
    }
  };

  const handleWalletConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
    } finally {
      setIsConnecting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show step-by-step auth flow
  const currentStep = !isFarcasterAuthenticated ? 1 : !isWalletConnected ? 2 : isWrongNetwork ? 3 : 4;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Shield className="w-16 h-16 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome to Prediction Markets
            </h1>
            <p className="text-gray-400">
              Connect your wallet and Farcaster to start betting
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-purple-600' : 'text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep >= 1 ? 'border-purple-600 bg-purple-600' : 'border-gray-600'
              }`}>
                {currentStep > 1 ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold text-white">1</span>
                )}
              </div>
            </div>
            
            <div className={`flex-1 h-0.5 mx-2 ${currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-600'}`} />
            
            <div className={`flex items-center ${currentStep >= 2 ? 'text-purple-600' : 'text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep >= 2 ? 'border-purple-600' : 'border-gray-600'
              } ${currentStep > 2 ? 'bg-purple-600' : ''}`}>
                {currentStep > 2 ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className={`text-xs font-bold ${currentStep >= 2 ? 'text-white' : ''}`}>2</span>
                )}
              </div>
            </div>
            
            <div className={`flex-1 h-0.5 mx-2 ${currentStep >= 3 ? 'bg-purple-600' : 'bg-gray-600'}`} />
            
            <div className={`flex items-center ${currentStep >= 3 ? 'text-purple-600' : 'text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep >= 3 ? 'border-purple-600' : 'border-gray-600'
              } ${currentStep > 3 ? 'bg-purple-600' : ''}`}>
                {currentStep > 3 ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className={`text-xs font-bold ${currentStep >= 3 ? 'text-white' : ''}`}>3</span>
                )}
              </div>
            </div>
          </div>

          {/* Step Labels */}
          <div className="flex justify-between text-xs mb-8">
            <span className={currentStep >= 1 ? 'text-purple-400' : 'text-gray-500'}>Farcaster</span>
            <span className={currentStep >= 2 ? 'text-purple-400' : 'text-gray-500'}>Wallet</span>
            <span className={currentStep >= 3 ? 'text-purple-400' : 'text-gray-500'}>Network</span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {!isFarcasterAuthenticated ? (
              <button
                onClick={handleFarcasterSignIn}
                disabled={isConnecting}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {isConnecting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <User className="w-5 h-5 mr-2" />
                    Sign in with Farcaster
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            ) : !isWalletConnected ? (
              <button
                onClick={handleWalletConnect}
                disabled={isConnecting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {isConnecting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect Wallet
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            ) : isWrongNetwork ? (
              <button
                onClick={switchToBase}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                Switch to Base Network
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            ) : null}

            {/* Status Messages */}
            {isFarcasterAuthenticated && (
              <div className="text-center text-sm text-green-400">
                ✓ Farcaster connected
              </div>
            )}
            {isWalletConnected && !isWrongNetwork && (
              <div className="text-center text-sm text-green-400">
                ✓ Wallet connected
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Need help? Check our <a href="#" className="text-purple-400 hover:text-purple-300 underline">setup guide</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}