import { NextRequest, NextResponse } from 'next/server';
import { validateFrameAction } from '../utils';
import { encodeFunctionData } from 'viem';
import PredictionMarketArtifact from '@/app/lib/abis/PredictionMarket.json';
const PredictionMarketABI = PredictionMarketArtifact.abi;
import { CONTRACT_ADDRESSES } from '@/app/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate frame action
    const isValid = await validateFrameAction(data);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid frame action' }, 
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const marketId = searchParams.get('id');
    const side = searchParams.get('side');
    
    if (!marketId || !side) {
      return NextResponse.json(
        { error: 'Missing market ID or side' }, 
        { status: 400 }
      );
    }

    const { untrustedData } = data;
    const { fid, inputText } = untrustedData;

    // Default bet amount if not provided
    const betAmount = inputText ? parseFloat(inputText) : 10; // 10 USDC default
    
    // Validate bet amount
    if (isNaN(betAmount) || betAmount < 1) {
      return NextResponse.json(
        { error: 'Invalid bet amount. Minimum is 1 USDC' }, 
        { status: 400 }
      );
    }

    // Generate transaction data for betting
    const calldata = encodeFunctionData({
      abi: PredictionMarketABI,
      functionName: 'placeBet',
      args: [
        parseInt(marketId),
        side === 'yes',
        BigInt(betAmount * 1_000_000) // Convert to USDC decimals (6)
      ]
    });

    // Return transaction frame
    return NextResponse.json({
      chainId: 'eip155:84532', // Base Sepolia
      method: 'eth_sendTransaction',
      params: {
        abi: PredictionMarketABI,
        to: CONTRACT_ADDRESSES.predictionMarket,
        data: calldata,
        value: '0',
      },
      attribution: false,
    });
  } catch (error) {
    console.error('Bet action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}