import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('farcaster_token');
    
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    return NextResponse.json({ 
      user: {
        fid: decoded.fid,
        username: decoded.username,
        displayName: decoded.displayName,
        pfpUrl: decoded.pfpUrl,
      }
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ user: null });
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await request.json();
    
    const token = jwt.sign(
      {
        fid: user.fid,
        username: user.username,
        displayName: user.displayName,
        pfpUrl: user.pfpUrl,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const cookieStore = cookies();
    cookieStore.set('farcaster_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}