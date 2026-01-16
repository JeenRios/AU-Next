import { Pool } from 'pg';
import { NextResponse } from 'next/server';

export async function GET() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Create users table (safe - won't drop existing data)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        status VARCHAR(50) DEFAULT 'active',
        email_verified BOOLEAN DEFAULT false,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
    `);

    // Create user_profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(50),
        country VARCHAR(100),
        city VARCHAR(100),
        address TEXT,
        postal_code VARCHAR(20),
        date_of_birth DATE,
        account_number VARCHAR(50) UNIQUE,
        account_type VARCHAR(50) DEFAULT 'standard',
        account_balance DECIMAL(15, 2) DEFAULT 0.00,
        account_currency VARCHAR(10) DEFAULT 'USD',
        kyc_status VARCHAR(50) DEFAULT 'pending',
        id_document_type VARCHAR(50),
        id_document_number VARCHAR(100),
        id_verified_at TIMESTAMP,
        leverage INTEGER DEFAULT 100,
        margin_level DECIMAL(10, 2) DEFAULT 100.00,
        avatar_url TEXT,
        timezone VARCHAR(50) DEFAULT 'UTC',
        language VARCHAR(10) DEFAULT 'en',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_profiles_kyc_status ON user_profiles(kyc_status);
    `);

    // Create trades table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trades (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        trade_number VARCHAR(50) UNIQUE NOT NULL,
        symbol VARCHAR(20) NOT NULL,
        type VARCHAR(10) NOT NULL,
        amount DECIMAL(15, 4) NOT NULL,
        price DECIMAL(15, 4),
        open_price DECIMAL(15, 4),
        close_price DECIMAL(15, 4),
        stop_loss DECIMAL(15, 4),
        take_profit DECIMAL(15, 4),
        profit_loss DECIMAL(15, 2),
        commission DECIMAL(10, 2) DEFAULT 0.00,
        swap DECIMAL(10, 2) DEFAULT 0.00,
        status VARCHAR(50) DEFAULT 'open',
        opened_at TIMESTAMP DEFAULT NOW(),
        closed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
      CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
      CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
    `);

    // Create transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        transaction_number VARCHAR(50) UNIQUE NOT NULL,
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        payment_method VARCHAR(50),
        payment_reference VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending',
        processed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
    `);

    // Create notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    `);

    // Create support_tickets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ticket_number VARCHAR(50) UNIQUE NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT,
        status VARCHAR(50) DEFAULT 'open',
        priority VARCHAR(50) DEFAULT 'normal',
        assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
      CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
    `);

    // Create audit_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id INTEGER,
        ip_address VARCHAR(50),
        user_agent TEXT,
        details JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
    `);

    await pool.end();

    return NextResponse.json({ 
      success: true, 
      message: 'Database schema created successfully! All 7 tables are ready.' 
    });

  } catch (error: any) {
    await pool.end();
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
