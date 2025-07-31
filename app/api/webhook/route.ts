import { NextRequest, NextResponse } from 'next/server';

// Farcaster webhook endpoint for notifications
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { type, data: webhookData } = data;

    console.log('Webhook received:', type, webhookData);

    switch (type) {
      case 'cast.created':
        // Handle when someone casts about a market
        await handleCastCreated(webhookData);
        break;
        
      case 'follow.created':
        // Handle new follower
        await handleFollowCreated(webhookData);
        break;
        
      case 'reaction.created':
        // Handle reactions to market frames
        await handleReactionCreated(webhookData);
        break;
        
      default:
        console.log('Unknown webhook type:', type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' }, 
      { status: 500 }
    );
  }
}

async function handleCastCreated(data: any) {
  // Process cast creation
  // Could notify market creator when their market is shared
  console.log('Cast created:', data);
}

async function handleFollowCreated(data: any) {
  // Process new follow
  // Could send welcome message with active markets
  console.log('New follow:', data);
}

async function handleReactionCreated(data: any) {
  // Process reaction
  // Could track engagement on market frames
  console.log('Reaction created:', data);
}

// Verify webhook signature (important for production)
export async function GET(request: NextRequest) {
  // Webhook verification endpoint
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('hub.challenge');
  
  if (challenge) {
    // Respond to Farcaster hub challenge
    return new Response(challenge, {
      headers: { 'Content-Type': 'text/plain' },
    });
  }
  
  return NextResponse.json({ 
    status: 'Webhook endpoint active',
    supportedEvents: ['cast.created', 'follow.created', 'reaction.created']
  });
}