import { Pool } from 'pg';

// Create a singleton pool instance
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

export async function query(text: string, params?: any[]) {
  const pool = getPool();
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Initialize database tables if they don't exist
export async function initDatabase() {
  const pool = getPool();
  
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS trades (
      id SERIAL PRIMARY KEY,
      symbol VARCHAR(10) NOT NULL,
      type VARCHAR(10) NOT NULL CHECK (type IN ('BUY', 'SELL')),
      amount DECIMAL(18, 8) NOT NULL,
      price DECIMAL(18, 8) NOT NULL,
      status VARCHAR(20) DEFAULT 'PENDING',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
    CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at DESC);

    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    DROP TRIGGER IF EXISTS update_trades_updated_at ON trades;
    CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON trades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    INSERT INTO trades (symbol, type, amount, price, status)
    SELECT * FROM (VALUES
      ('AUDUSD', 'BUY', 1.5, 0.6542, 'COMPLETED'),
      ('AUDUSD', 'SELL', 1.2, 0.6555, 'COMPLETED'),
      ('AUDUSD', 'BUY', 2.0, 0.6548, 'PENDING'),
      ('EURUSD', 'BUY', 1.0, 1.0932, 'COMPLETED'),
      ('GBPUSD', 'SELL', 0.8, 1.2745, 'COMPLETED')
    ) AS v(symbol, type, amount, price, status)
    WHERE NOT EXISTS (SELECT 1 FROM trades LIMIT 1);
  `;

  try {
    await pool.query(createTableQuery);
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
}
