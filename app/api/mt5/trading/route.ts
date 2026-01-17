import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';

const MT5_SERVICE_URL = process.env.MT5_SERVICE_URL || 'http://localhost:5000';
const MT5_SERVICE_API_KEY = process.env.MT5_SERVICE_API_KEY || 'mt5-service-secret-key';

async function proxyToMT5Service(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${MT5_SERVICE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': MT5_SERVICE_API_KEY,
      ...options.headers,
    },
  });

  return response.json();
}

// Log MT5 operations to audit log
async function logMT5Operation(userId: number, action: string, details: any) {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, details)
       VALUES ($1, $2, $3, $4)`,
      [userId, action, 'mt5_trading', JSON.stringify(details)]
    );
  } catch (error) {
    console.error('Failed to log MT5 operation:', error);
  }
}

// GET - Get MT5 service status, account info, positions, etc.
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'health';

    let endpoint = '/health';
    switch (action) {
      case 'health':
        endpoint = '/health';
        break;
      case 'account':
        endpoint = '/account';
        break;
      case 'positions':
        endpoint = '/positions';
        break;
      case 'orders':
        endpoint = '/orders';
        break;
      case 'history':
        endpoint = '/history';
        break;
      case 'symbols':
        endpoint = '/symbols';
        break;
      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    const result = await proxyToMT5Service(endpoint);
    return NextResponse.json(result);

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    // Check if MT5 service is unreachable
    if (error.cause?.code === 'ECONNREFUSED') {
      return NextResponse.json({
        success: false,
        error: 'MT5 service is not running. Start the Python MT5 service first.',
      }, { status: 503 });
    }

    console.error('MT5 trading GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Execute MT5 operations (login, trade, etc.)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const data = await request.json();
    const action = data.action;

    if (!action) {
      return NextResponse.json({ success: false, error: 'action is required' }, { status: 400 });
    }

    let endpoint = '';
    let body = {};

    switch (action) {
      case 'initialize':
        endpoint = '/initialize';
        body = { path: data.path };
        break;

      case 'login':
        endpoint = '/login';
        body = {
          account: data.account,
          password: data.password,
          server: data.server,
        };
        break;

      case 'open':
        endpoint = '/trade/open';
        body = {
          symbol: data.symbol,
          type: data.type,
          volume: data.volume,
          sl: data.sl,
          tp: data.tp,
          comment: data.comment,
          magic: data.magic,
        };
        break;

      case 'close':
        endpoint = '/trade/close';
        body = { ticket: data.ticket };
        break;

      case 'modify':
        endpoint = '/trade/modify';
        body = {
          ticket: data.ticket,
          sl: data.sl,
          tp: data.tp,
        };
        break;

      case 'shutdown':
        endpoint = '/shutdown';
        break;

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    const result = await proxyToMT5Service(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    // Log the operation
    await logMT5Operation(session.user.id, `mt5_${action}`, {
      ...body,
      password: undefined, // Never log passwords
      result: result.success ? 'success' : 'failed',
    });

    // If login was successful, update the mt5_accounts table
    if (action === 'login' && result.success && data.mt5_account_id) {
      await query(
        `UPDATE mt5_accounts SET
          status = 'active',
          ea_status = 'active',
          balance = $1,
          equity = $2,
          profit = $3,
          updated_at = NOW()
         WHERE id = $4`,
        [
          result.account?.balance || 0,
          result.account?.equity || 0,
          result.account?.profit || 0,
          data.mt5_account_id,
        ]
      );
    }

    return NextResponse.json(result);

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    // Check if MT5 service is unreachable
    if (error.cause?.code === 'ECONNREFUSED') {
      return NextResponse.json({
        success: false,
        error: 'MT5 service is not running. Start the Python MT5 service first.',
      }, { status: 503 });
    }

    console.error('MT5 trading POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
