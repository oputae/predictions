import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasAlchemyId: !!process.env.NEXT_PUBLIC_ALCHEMY_ID,
    hasWalletConnectId: !!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    hasContractAddress: !!process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS,
    hasUsdcAddress: !!process.env.NEXT_PUBLIC_USDC_ADDRESS,
    network: process.env.NEXT_PUBLIC_NETWORK,
    chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
    url: process.env.NEXT_PUBLIC_URL,
  });
} 