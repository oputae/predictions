import { NextRequest, NextResponse } from 'next/server';
import { getFrameHtml, validateFrameAction } from './utils';

const FRAME_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

// GET request - returns frame metadata
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const marketId = searchParams.get('id');

  if (!marketId) {
    // Show main frame with overview
    return new NextResponse(
      getFrameHtml({
        title: "Crypto Prediction Markets",
        description: "Bet on cryptocurrency price movements with USDC",
        image: `${FRAME_URL}/api/frame/image`,
        buttons: [
          { 
            label: "View Markets", 
            action: "post", 
            target: `${FRAME_URL}/api/frame/markets` 
          },
          { 
            label: "Create Market", 
            action: "link", 
            target: FRAME_URL 
          }
        ]
      }),
      { 
        headers: { 
          'Content-Type': 'text/html',
          'Cache-Control': 'no-store, max-age=0'
        } 
      }
    );
  }

  // Show specific market frame
  return new NextResponse(
    getFrameHtml({
      title: "Market Details",
      description: `Market #${marketId}`,
      image: `${FRAME_URL}/api/frame/image?id=${marketId}`,
      buttons: [
        { 
          label: "Bet YES", 
          action: "post", 
          target: `${FRAME_URL}/api/frame/bet?id=${marketId}&side=yes` 
        },
        { 
          label: "Bet NO", 
          action: "post", 
          target: `${FRAME_URL}/api/frame/bet?id=${marketId}&side=no` 
        },
        { 
          label: "View in App", 
          action: "link", 
          target: `${FRAME_URL}/market/${marketId}` 
        }
      ]
    }),
    { 
      headers: { 
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store, max-age=0'
      } 
    }
  );
}

// POST request - handles frame actions
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

    const { untrustedData } = data;
    const { buttonIndex, inputText } = untrustedData;

    // Main frame action - view markets
    if (request.url.includes('/api/frame') && !request.url.includes('/api/frame/')) {
      return NextResponse.json({
        type: 'frame',
        frameUrl: `${FRAME_URL}/api/frame/markets`,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Frame action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}