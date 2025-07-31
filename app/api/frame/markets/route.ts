import { NextRequest, NextResponse } from 'next/server';
import { validateFrameAction, getFrameHtml } from '../utils';

const FRAME_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

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

    // In production, fetch active markets from blockchain
    // For now, return frame with market selection
    return new NextResponse(
      getFrameHtml({
        title: "Active Markets",
        description: "Select a market to view details",
        image: `${FRAME_URL}/api/frame/image?view=markets`,
        buttons: [
          { 
            label: "BTC > $130k", 
            action: "post", 
            target: `${FRAME_URL}/api/frame?id=0` 
          },
          { 
            label: "ETH > $5k", 
            action: "post", 
            target: `${FRAME_URL}/api/frame?id=1` 
          },
          { 
            label: "View All", 
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
  } catch (error) {
    console.error('Markets action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}