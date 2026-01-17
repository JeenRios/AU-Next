import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET current session info
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        user: null
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: session.user,
      expiresAt: session.expiresAt
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({
      authenticated: false,
      user: null
    });
  }
}
