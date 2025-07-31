'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ExternalLink, Clock, CheckCircle, Gift, TrendingUp, TrendingDown } from 'lucide-react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '@/app/lib/constants';
import PredictionMarketArtifact from '@/app/lib/abis/PredictionMarket.json';

const PredictionMarketABI = PredictionMarketArtifact.abi;

interface ActivityItem {
  id: string;
  type: 'bet' | 'resolve' | 'claim' | 'create';
  marketId: number;
  marketQuestion: string;
  amount?: string;
  side?: 'yes' | 'no';
  txHash: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
}

export function ActivityFeed() {
  const { address } = useAccount();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!address || !isOpen) return;

    const fetchActivities = async () => {
      setLoading(true);
      try {
        const provider = new ethers.providers.Web3Provider((window.ethereum as any) || {});
        const contract = new ethers.Contract(
          CONTRACT_ADDRESSES.predictionMarket as `0x${string}`,
          PredictionMarketABI,
          provider
        );

        // Get all events for this user
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 10000); // Last 10k blocks

        // Get market creation events
        const marketCreatedEvents = await contract.queryFilter(
          contract.filters.MarketCreated(null, address),
          fromBlock,
          currentBlock
        );

        // Get bet placed events
        const betPlacedEvents = await contract.queryFilter(
          contract.filters.BetPlaced(null, address),
          fromBlock,
          currentBlock
        );

        // Get market resolved events
        const marketResolvedEvents = await contract.queryFilter(
          contract.filters.MarketResolved(),
          fromBlock,
          currentBlock
        );

        // Get winnings claimed events
        const winningsClaimedEvents = await contract.queryFilter(
          contract.filters.WinningsClaimed(null, address),
          fromBlock,
          currentBlock
        );

        const activityItems: ActivityItem[] = [];

        // Process market creation events
        for (const event of marketCreatedEvents) {
          const block = await provider.getBlock(event.blockNumber);
          activityItems.push({
            id: `${event.transactionHash}-create`,
            type: 'create',
            marketId: event.args?.marketId?.toNumber() || 0,
            marketQuestion: event.args?.question || 'Unknown Market',
            txHash: event.transactionHash,
            timestamp: new Date((block?.timestamp || 0) * 1000),
            status: 'confirmed'
          });
        }

        // Process bet placed events
        for (const event of betPlacedEvents) {
          const block = await provider.getBlock(event.blockNumber);
          activityItems.push({
            id: `${event.transactionHash}-bet`,
            type: 'bet',
            marketId: event.args?.marketId?.toNumber() || 0,
            marketQuestion: 'Market Bet', // Would need to fetch from contract
            amount: ethers.utils.formatUnits(event.args?.amount || 0, 6),
            side: event.args?.isYes ? 'yes' : 'no',
            txHash: event.transactionHash,
            timestamp: new Date((block?.timestamp || 0) * 1000),
            status: 'confirmed'
          });
        }

        // Process market resolved events
        for (const event of marketResolvedEvents) {
          const block = await provider.getBlock(event.blockNumber);
          activityItems.push({
            id: `${event.transactionHash}-resolve`,
            type: 'resolve',
            marketId: event.args?.marketId?.toNumber() || 0,
            marketQuestion: 'Market Resolved', // Would need to fetch from contract
            txHash: event.transactionHash,
            timestamp: new Date((block?.timestamp || 0) * 1000),
            status: 'confirmed'
          });
        }

        // Process winnings claimed events
        for (const event of winningsClaimedEvents) {
          const block = await provider.getBlock(event.blockNumber);
          activityItems.push({
            id: `${event.transactionHash}-claim`,
            type: 'claim',
            marketId: event.args?.marketId?.toNumber() || 0,
            marketQuestion: 'Winnings Claimed', // Would need to fetch from contract
            amount: ethers.utils.formatUnits(event.args?.amount || 0, 6),
            txHash: event.transactionHash,
            timestamp: new Date((block?.timestamp || 0) * 1000),
            status: 'confirmed'
          });
        }

        // Sort by timestamp (newest first)
        activityItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        setActivities(activityItems);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [address, isOpen]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'bet':
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'resolve':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'claim':
        return <Gift className="w-4 h-4 text-purple-400" />;
      case 'create':
        return <Clock className="w-4 h-4 text-orange-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'bet':
        return `Bet ${activity.amount} USDC on ${activity.side?.toUpperCase()}`;
      case 'resolve':
        return 'Resolved market';
      case 'claim':
        return `Claimed ${activity.amount} USDC winnings`;
      case 'create':
        return 'Created market';
      default:
        return 'Unknown activity';
    }
  };

  const getBaseScanUrl = (txHash: string) => {
    return `https://sepolia.basescan.org/tx/${txHash}`;
  };

  return (
    <div className="relative">
      {/* Activity Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm text-gray-400 hover:text-white transition-colors"
      >
        <Clock className="w-4 h-4 mr-1" />
        Activity
      </button>

      {/* Activity Modal */}
      {isOpen && (
        <div className="absolute right-0 top-8 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Your Activity</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-sm text-gray-400 mt-2">Loading activity...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-400">No activity yet</p>
              </div>
            ) : (
              <div className="p-2">
                {activities.map((activity) => (
                  <div key={activity.id} className="p-3 hover:bg-gray-700 rounded-lg transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium">
                            {getActivityText(activity)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {activity.timestamp.toLocaleDateString()} {activity.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <a
                        href={getBaseScanUrl(activity.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 ml-2 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 