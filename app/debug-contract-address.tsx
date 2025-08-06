'use client';

import { CONTRACT_ADDRESSES } from '@/app/lib/constants';

export default function DebugContractAddress() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Contract Address Debug</h1>
      <div className="bg-gray-800 p-4 rounded">
        <p><strong>Prediction Market Address:</strong> {CONTRACT_ADDRESSES.predictionMarket}</p>
        <p><strong>USDC Address:</strong> {CONTRACT_ADDRESSES.usdc}</p>
        <p><strong>Environment Variable:</strong> {process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS || 'Not set'}</p>
        <p><strong>Expected New Address:</strong> 0x7523E0adB28C63f511518df485838ff5b2F16a13</p>
        <p><strong>Old Address:</strong> 0x669174fC3ED415eF6aC095428cA96404007b68F0</p>
      </div>
    </div>
  );
} 