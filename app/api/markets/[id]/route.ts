import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, formatUnits } from 'viem';
import { baseSepolia } from 'viem/chains';
import PredictionMarketABI from '@/app/lib/abis/PredictionMarket.json';
import { CONTRACT_ADDRESSES } from '@/app/lib/constants';

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_ALCHEMY_ID 
    ? `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
    : undefined
  ),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marketId = parseInt(params.id);
    
    const marketInfo = await client.readContract({
      address: CONTRACT_ADDRESSES.predictionMarket as `0x${string}`,
      abi: PredictionMarketABI,
      functionName: 'getMarketInfo',
      args: [marketId],
    });

    const market = {
      id: marketId,
      question: marketInfo[0],
      asset: marketInfo[1],
      targetPrice: Number(marketInfo[2]),
      deadline: new Date(Number(marketInfo[3]) * 1000),
      yesPool: formatUnits(marketInfo[4], 6),
      noPool: formatUnits(marketInfo[5], 6),
      resolved: marketInfo[6],
      outcome: marketInfo[7],
      creator: marketInfo[8],
      minBet: '1', // Default, could be fetched if stored
    };

    return NextResponse.json(market);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch market' },
      { status: 500 }
    );
  }
}