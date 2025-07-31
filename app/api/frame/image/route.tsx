import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

async function getMarketData(marketId: string) {
  // In production, fetch from your API or blockchain
  // For now, return mock data
  return {
    question: `Will BTC be above $130,000?`,
    currentPrice: 124500,
    targetPrice: 130000,
    timeLeft: '6h 24m',
    yesPool: 1500,
    noPool: 2300,
    yesOdds: 60,
    noOdds: 40,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const marketId = searchParams.get('id');

    if (!marketId) {
      // Main markets overview image
      return new ImageResponse(
        (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              backgroundColor: '#111827',
              backgroundImage: 'linear-gradient(to bottom, #111827, #000000)',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <h1 
                style={{ 
                  fontSize: 72, 
                  fontWeight: 'bold',
                  marginBottom: 20,
                  background: 'linear-gradient(to right, #a855f7, #3b82f6)',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Crypto Predictions
              </h1>
              <p style={{ fontSize: 32, color: '#9ca3af', marginBottom: 40 }}>
                Bet on cryptocurrency price movements
              </p>
              <div style={{ display: 'flex', gap: 60 }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 48, fontWeight: 'bold', color: '#ffffff' }}>12</p>
                  <p style={{ fontSize: 24, color: '#6b7280' }}>Active Markets</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 48, fontWeight: 'bold', color: '#ffffff' }}>$45.2K</p>
                  <p style={{ fontSize: 24, color: '#6b7280' }}>Total Volume</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 48, fontWeight: 'bold', color: '#ffffff' }}>1%</p>
                  <p style={{ fontSize: 24, color: '#6b7280' }}>Fee on Profits</p>
                </div>
              </div>
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: 30,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: '#a855f7',
                }}
              />
              <p style={{ fontSize: 20, color: '#6b7280' }}>Powered by Base</p>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    // Specific market image
    const marketData = await getMarketData(marketId);
    
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: '#111827',
            color: 'white',
            padding: 60,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h1 style={{ fontSize: 48, marginBottom: 30, color: '#ffffff' }}>
            {marketData.question}
          </h1>
          
          <div style={{ display: 'flex', gap: 50, marginBottom: 50 }}>
            <div>
              <p style={{ fontSize: 20, color: '#9ca3af', marginBottom: 10 }}>Current Price</p>
              <p style={{ fontSize: 40, fontWeight: 'bold', color: '#ffffff' }}>
                ${marketData.currentPrice.toLocaleString()}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 20, color: '#9ca3af', marginBottom: 10 }}>Target Price</p>
              <p style={{ fontSize: 40, fontWeight: 'bold', color: '#ffffff' }}>
                ${marketData.targetPrice.toLocaleString()}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 20, color: '#9ca3af', marginBottom: 10 }}>Ends in</p>
              <p style={{ fontSize: 40, fontWeight: 'bold', color: '#ffffff' }}>
                {marketData.timeLeft}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, marginTop: 'auto' }}>
            <div 
              style={{ 
                flex: 1, 
                backgroundColor: '#10b981', 
                padding: 40, 
                borderRadius: 16,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <p style={{ fontSize: 32, marginBottom: 15, fontWeight: 'bold' }}>YES</p>
              <p style={{ fontSize: 56, fontWeight: 'bold', marginBottom: 15 }}>
                {marketData.yesOdds}%
              </p>
              <p style={{ fontSize: 24 }}>${marketData.yesPool.toLocaleString()}</p>
            </div>
            <div 
              style={{ 
                flex: 1, 
                backgroundColor: '#ef4444', 
                padding: 40, 
                borderRadius: 16,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <p style={{ fontSize: 32, marginBottom: 15, fontWeight: 'bold' }}>NO</p>
              <p style={{ fontSize: 56, fontWeight: 'bold', marginBottom: 15 }}>
                {marketData.noOdds}%
              </p>
              <p style={{ fontSize: 24 }}>${marketData.noPool.toLocaleString()}</p>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Image generation error:', error);
    
    // Fallback error image
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: '#111827',
            color: '#ef4444',
            fontSize: 32,
          }}
        >
          Error generating image
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}