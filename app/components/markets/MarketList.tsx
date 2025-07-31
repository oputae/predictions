'use client';

import { Market } from '@/app/lib/types';
import { MarketCard } from './Marketcard';

interface MarketListProps {
  markets: Market[];
  onBet: () => void;
}

export function MarketList({ markets, onBet }: MarketListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {markets.map((market) => (
        <MarketCard key={market.id} market={market} onBet={onBet} />
      ))}
    </div>
  );
}