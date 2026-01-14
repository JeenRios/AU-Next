import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET (hidden)' : 'NOT SET',
      REDIS_URL: process.env.REDIS_URL ? 'SET (hidden)' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
      // Show partial connection strings for debugging
      db_partial: process.env.DATABASE_URL?.substring(0, 30) + '...',
      redis_partial: process.env.REDIS_URL?.substring(0, 20) + '...',
    }
  });
}
