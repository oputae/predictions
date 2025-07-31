'use client';

import { useWeb3Auth } from '@/app/hooks/useWeb3Auth';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { User, Wallet, LogOut } from 'lucide-react';
import { formatAddress } from '@/app/lib/utils';

export function AuthButton() {
  const {
    isWalletConnected,
    isFarcasterAuthenticated,
    farcasterUser,
    signInWithFarcaster,
    signOutFarcaster,
    disconnectWallet,
    isWrongNetwork,
    switchToBase,
    address,
  } = useWeb3Auth();

  // Not authenticated with Farcaster
  if (!isFarcasterAuthenticated) {
    return (
      <button
        onClick={signInWithFarcaster}
        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors flex items-center font-medium"
      >
        <User className="w-4 h-4 mr-2" />
        Sign in with Farcaster
      </button>
    );
  }

  // Authenticated with Farcaster but no wallet
  if (!isWalletConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="bg-gray-800 rounded-lg px-3 py-2 flex items-center">
          {farcasterUser?.pfpUrl && (
            <img
              src={farcasterUser.pfpUrl}
              alt={farcasterUser.username}
              className="w-6 h-6 rounded-full mr-2"
            />
          )}
          <span className="text-sm font-medium">@{farcasterUser?.username}</span>
        </div>
        <ConnectButton />
      </div>
    );
  }

  // Wrong network
  if (isWrongNetwork) {
    return (
      <div className="flex items-center gap-3">
        <div className="bg-gray-800 rounded-lg px-3 py-2 flex items-center">
          <span className="text-sm">{formatAddress(address || '')}</span>
        </div>
        <button
          onClick={switchToBase}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors font-medium"
        >
          Switch to Base
        </button>
      </div>
    );
  }

  // Fully authenticated
  return (
    <div className="flex items-center gap-3">
      {/* Farcaster Profile */}
      <div className="bg-gray-800 rounded-lg px-3 py-2 flex items-center">
        {farcasterUser?.pfpUrl && (
          <img
            src={farcasterUser.pfpUrl}
            alt={farcasterUser.username}
            className="w-6 h-6 rounded-full mr-2"
          />
        )}
        <span className="text-sm font-medium">@{farcasterUser?.username}</span>
      </div>

      {/* Custom Wallet Button */}
      <div className="flex items-center gap-2">
        <div className="bg-gray-800 rounded-lg px-3 py-2 flex items-center">
          <Wallet className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-sm font-medium">{formatAddress(address || '')}</span>
        </div>
        
        {/* Disconnect Menu */}
        <div className="relative group">
          <button className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors">
            <LogOut className="w-4 h-4 text-gray-400" />
          </button>
          
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <button
              onClick={signOutFarcaster}
              className="w-full text-left px-4 py-2 hover:bg-gray-700 rounded-t-lg text-sm"
            >
              Disconnect Farcaster
            </button>
            <button
              onClick={disconnectWallet}
              className="w-full text-left px-4 py-2 hover:bg-gray-700 rounded-b-lg text-sm"
            >
              Disconnect Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}