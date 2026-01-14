import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getRedisClient } from '@/lib/redis';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AU-Next API',
    checks: {
      database: 'unknown',
      redis: 'unknown',
    },
  };

  // Check database connection
  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    health.checks.database = 'connected';
  } catch (error) {
    health.checks.database = 'disconnected';
    health.status = 'degraded';
  }

  // Check Redis connection
  try {
    const redis = await getRedisClient();
    if (redis) {
      await redis.ping();
      health.checks.redis = 'connected';
    } else {
      health.checks.redis = 'not configured';
    }
  } catch (error) {
    health.checks.redis = 'disconnected';
  }

  return NextResponse.json(health);
}
