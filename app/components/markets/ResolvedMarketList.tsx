'use client';

import { Market } from '@/app/lib/types';
import { ResolvedMarketCard } from './ResolvedMarketCard';

interface ResolvedMarketListProps {
  resolvedMarkets: Market[];
  onResolve?: () => void;
}

export function ResolvedMarketList({ resolvedMarkets, onResolve }: ResolvedMarketListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resolvedMarkets.map((market) => (
        <ResolvedMarketCard key={market.id} market={market} onResolve={onResolve} />
      ))}
    </div>
  );
} 