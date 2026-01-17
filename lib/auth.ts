import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { getRedisClient } from './redis';

const SALT_ROUNDS = 10;
const SESSION_EXPIRY = 60 * 60 * 24 * 7; // 7 days in seconds
const SESSION_COOKIE_NAME = 'au_session';
const SESSION_DATA_COOKIE_NAME = 'au_session_data';

// Secret key for signing session cookies (should be in env)
const SESSION_SECRET = process.env.SESSION_SECRET || 'au-next-session-secret-change-in-production';

// Encryption key for MT5 credentials (should be in env)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

// ============ Password Hashing ============

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============ Session Management ============

export interface SessionUser {
  id: number;
  email: string;
  role: 'user' | 'admin';
  name: string;
}

export interface Session {
  user: SessionUser;
  createdAt: number;
  expiresAt: number;
}

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Sign session data for cookie storage (fallback when Redis unavailable)
function signSessionData(session: Session): string {
  const data = JSON.stringify(session);
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('hex');
  return Buffer.from(`${data}.${signature}`).toString('base64');
}

// Verify and parse signed session data
function verifySessionData(signedData: string): Session | null {
  try {
    const decoded = Buffer.from(signedData, 'base64').toString('utf8');
    const lastDotIndex = decoded.lastIndexOf('.');
    if (lastDotIndex === -1) return null;

    const data = decoded.substring(0, lastDotIndex);
    const signature = decoded.substring(lastDotIndex + 1);

    const expectedSignature = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('hex');
    if (signature !== expectedSignature) return null;

    const session: Session = JSON.parse(data);
    if (session.expiresAt < Date.now()) return null;

    return session;
  } catch {
    return null;
  }
}

export async function createSession(user: SessionUser): Promise<string> {
  const token = generateSessionToken();
  const session: Session = {
    user,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_EXPIRY * 1000,
  };

  // Store in Redis if available
  const redis = await getRedisClient();
  if (redis) {
    await redis.setEx(`session:${token}`, SESSION_EXPIRY, JSON.stringify(session));
  }

  const cookieStore = await cookies();

  // Set session token cookie
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY,
    path: '/',
  });

  // Also store signed session data as fallback (for when Redis is unavailable)
  cookieStore.set(SESSION_DATA_COOKIE_NAME, signSessionData(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY,
    path: '/',
  });

  return token;
}

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    // Try Redis first
    const redis = await getRedisClient();
    if (redis) {
      const sessionData = await redis.get(`session:${token}`);
      if (sessionData) {
        const session: Session = JSON.parse(sessionData);
        if (session.expiresAt < Date.now()) {
          await destroySession();
          return null;
        }
        return session;
      }
    }

    // Fallback to signed cookie if Redis unavailable or session not found
    const signedData = cookieStore.get(SESSION_DATA_COOKIE_NAME)?.value;
    if (signedData) {
      const session = verifySessionData(signedData);
      if (session) return session;
    }

    return null;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      const redis = await getRedisClient();
      if (redis) {
        await redis.del(`session:${token}`);
      }
    }

    cookieStore.delete(SESSION_COOKIE_NAME);
    cookieStore.delete(SESSION_DATA_COOKIE_NAME);
  } catch {
    // Ignore errors during logout
  }
}

export async function requireAuth(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireAuth();
  if (session.user.role !== 'admin') {
    throw new Error('Forbidden');
  }
  return session;
}

// ============ Encryption for MT5 Credentials ============

export function encrypt(text: string): string {
  const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Return iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
  const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
  const parts = encryptedData.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// ============ Rate Limiting ============

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function checkRateLimit(
  key: string,
  maxRequests: number = 100,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const redis = await getRedisClient();

  if (!redis) {
    // Without Redis, allow all requests (fallback)
    return { allowed: true, remaining: maxRequests, resetAt: Date.now() + windowSeconds * 1000 };
  }

  const rateLimitKey = `ratelimit:${key}`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  // Use sorted set for sliding window rate limiting
  await redis.zRemRangeByScore(rateLimitKey, 0, windowStart);
  const requestCount = await redis.zCard(rateLimitKey);

  if (requestCount >= maxRequests) {
    const oldestRequest = await redis.zRange(rateLimitKey, 0, 0);
    const resetAt = oldestRequest.length > 0
      ? parseInt(oldestRequest[0]) + windowSeconds * 1000
      : now + windowSeconds * 1000;

    return { allowed: false, remaining: 0, resetAt };
  }

  await redis.zAdd(rateLimitKey, { score: now, value: `${now}:${crypto.randomBytes(4).toString('hex')}` });
  await redis.expire(rateLimitKey, windowSeconds);

  return {
    allowed: true,
    remaining: maxRequests - requestCount - 1,
    resetAt: now + windowSeconds * 1000,
  };
}
