import { NextResponse } from 'next/server';

const FRAME_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

// Frame manifest endpoint - tells Farcaster about your app
export async function GET() {
  const manifest = {
    version: '1.0.0',
    name: 'Crypto Prediction Markets',
    description: 'Bet on cryptocurrency price movements with USDC on Base',
    icon: {
      url: `${FRAME_URL}/icon.png`,
      type: 'image/png',
    },
    splash: {
      image: {
        url: `${FRAME_URL}/splash.png`,
        type: 'image/png',
      },
      backgroundColor: '#1a1a2e',
    },
    homeUrl: FRAME_URL,
    webhookUrl: `${FRAME_URL}/api/webhook`,
    frames: {
      enabled: true,
      version: 'vNext',
    },
  };

  return NextResponse.json(manifest);
}