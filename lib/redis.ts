import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let isConnecting = false;

export async function getRedisClient(): Promise<RedisClientType | null> {
  // If Redis URL not configured, return null (optional feature)
  if (!process.env.REDIS_URL) {
    console.log('⚠️  Redis URL not configured - caching disabled');
    return null;
  }

  // Return existing client if already connected
  if (redisClient?.isOpen) {
    return redisClient;
  }

  // Avoid multiple simultaneous connection attempts
  if (isConnecting) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return redisClient?.isOpen ? redisClient : null;
  }

  try {
    isConnecting = true;
    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.log('❌ Redis connection failed after 3 retries');
            return new Error('Redis connection failed');
          }
          return retries * 1000;
        },
      },
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('❌ Redis connection error:', error);
    redisClient = null;
    return null;
  } finally {
    isConnecting = false;
  }
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient();
    if (!client) return null;

    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

export async function setCachedData(key: string, data: any, expirySeconds: number = 60): Promise<boolean> {
  try {
    const client = await getRedisClient();
    if (!client) return false;

    await client.setEx(key, expirySeconds, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
}

export async function deleteCachedData(key: string): Promise<boolean> {
  try {
    const client = await getRedisClient();
    if (!client) return false;

    await client.del(key);
    return true;
  } catch (error) {
    console.error('Redis delete error:', error);
    return false;
  }
}
