import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID;
    
    if (!alchemyId) {
      return NextResponse.json({ error: 'No Alchemy ID found' }, { status: 500 });
    }

    // Test Alchemy API call
    const response = await fetch(`https://base-sepolia.g.alchemy.com/v2/${alchemyId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_blockNumber',
        params: []
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ 
        error: 'Alchemy API call failed', 
        status: response.status,
        statusText: response.statusText,
        errorText 
      }, { status: 500 });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      alchemyId: alchemyId.substring(0, 10) + '...',
      blockNumber: data.result,
      response: data
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Test failed', 
      message: error.message 
    }, { status: 500 });
  }
} 