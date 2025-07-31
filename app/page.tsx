'use client';

import { useState } from 'react';
import { useWeb3Auth } from '@/app/hooks/useWeb3Auth';
import { useMarkets, useResolvedMarkets } from '@/app/hooks/useContracts';
import { Header } from '@/app/components/shared/Header';
import { MarketList } from '@/app/components/markets/MarketList';
import { ResolvedMarketList } from '@/app/components/markets/ResolvedMarketList';
import { CreateMarketWizard } from '@/app/components/markets/CreateMarketWizard';
import { AuthGuard } from '@/app/components/auth/AuthGuard';

export default function Home() {
  const { isFullyAuthenticated } = useWeb3Auth();
  const { markets, loading, refetch } = useMarkets();
  const { resolvedMarkets, loading: resolvedLoading, refetch: refetchResolved } = useResolvedMarkets();
  const [showCreateMarket, setShowCreateMarket] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>(() => {
    // Only access sessionStorage on the client side
    if (typeof window !== 'undefined') {
      const storedTab = sessionStorage.getItem('activeTab') as 'active' | 'resolved' | null;
      if (storedTab) {
        // Clear the stored tab so it doesn't persist beyond this load
        sessionStorage.removeItem('activeTab');
        return storedTab;
      }
    }
    return 'active';
  });

  if (!isFullyAuthenticated) {
    return <AuthGuard />;
  }

  const handleRefetch = () => {
    refetch();
    refetchResolved();
  };

  const handleResetSession = () => {
    // Clear any cached data
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      localStorage.clear();
    }
    // Force a hard refresh
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Crypto Prediction Markets
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Bet on cryptocurrency price movements with USDC on Base
          </p>
          <p className="text-sm text-gray-500 mb-4">
            🧪 Test Environment: Using test USDC on Base Sepolia testnet
          </p>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={handleResetSession}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              title="Reset browser session (debug)"
            >
              Reset Session
            </button>
            <button
              onClick={() => setShowCreateMarket(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Create New Market
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-white">{markets.length}</p>
            <p className="text-gray-400">Active Markets</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-white">
              ${markets.reduce((sum, m) => sum + parseFloat(m.yesPool) + parseFloat(m.noPool), 0).toLocaleString()}
            </p>
            <p className="text-gray-400">Total Volume</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-white">{resolvedMarkets.length}</p>
            <p className="text-gray-400">Resolved Markets</p>
          </div>
        </div>

        {/* Market Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'active'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Active Markets ({markets.length})
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'resolved'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Resolved Markets ({resolvedMarkets.length})
            </button>
          </div>
        </div>

        {/* Markets Content */}
        {activeTab === 'active' ? (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Active Markets</h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              </div>
            ) : markets.length === 0 ? (
              <div className="text-center py-12 bg-gray-800 rounded-lg">
                <p className="text-gray-400 mb-4">No active markets yet</p>
                <button
                  onClick={() => setShowCreateMarket(true)}
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  Create the first market
                </button>
              </div>
            ) : (
              <MarketList markets={markets} onBet={handleRefetch} />
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Resolved Markets</h2>
            {resolvedLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              </div>
            ) : resolvedMarkets.length === 0 ? (
              <div className="text-center py-12 bg-gray-800 rounded-lg">
                <p className="text-gray-400 mb-4">No resolved markets yet</p>
                <p className="text-sm text-gray-500">Markets will appear here once they are resolved</p>
              </div>
            ) : (
              <ResolvedMarketList resolvedMarkets={resolvedMarkets} onResolve={handleRefetch} />
            )}
          </div>
        )}
      </main>

      {/* Create Market Modal */}
      {showCreateMarket && (
        <CreateMarketWizard
          onClose={() => setShowCreateMarket(false)}
          onCreate={() => {
            setShowCreateMarket(false);
            handleRefetch();
          }}
        />
      )}
    </div>
  );
}