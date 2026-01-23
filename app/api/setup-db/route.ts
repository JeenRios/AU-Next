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
        two_factor_enabled BOOLEAN DEFAULT false,
        trading_risk_level VARCHAR(50) DEFAULT 'moderate',
        default_stop_loss DECIMAL(15, 4),
        default_take_profit DECIMAL(15, 4),
        push_notifications_enabled BOOLEAN DEFAULT true,
        sms_notifications_enabled BOOLEAN DEFAULT false,
        email_notifications_enabled BOOLEAN DEFAULT true,
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

    // Create mt5_accounts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mt5_accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        account_number VARCHAR(50) NOT NULL,
        server VARCHAR(100) NOT NULL,
        platform VARCHAR(10) DEFAULT 'MT5',
        status VARCHAR(50) DEFAULT 'pending',
        ea_status VARCHAR(50) DEFAULT 'inactive',
        balance DECIMAL(15, 2) DEFAULT 0.00,
        equity DECIMAL(15, 2) DEFAULT 0.00,
        profit DECIMAL(15, 2) DEFAULT 0.00,
        encrypted_password TEXT,
        approved_by INTEGER REFERENCES users(id),
        approved_at TIMESTAMP,
        automation_status VARCHAR(50) DEFAULT 'none',
        automation_notes TEXT,
        last_sync_at TIMESTAMP,
        gain_percentage DECIMAL(10, 2) DEFAULT 0.00,
        current_lot_size DECIMAL(10, 4) DEFAULT 0.00,
        open_positions_count INTEGER DEFAULT 0,
        last_trade_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, account_number)
      );
      CREATE INDEX IF NOT EXISTS idx_mt5_accounts_user_id ON mt5_accounts(user_id);
      CREATE INDEX IF NOT EXISTS idx_mt5_accounts_status ON mt5_accounts(status);
    `);

    // Create vps_instances table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vps_instances (
        id SERIAL PRIMARY KEY,
        mt5_account_id INTEGER REFERENCES mt5_accounts(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        ip_address VARCHAR(45),
        ssh_port INTEGER DEFAULT 22,
        ssh_username VARCHAR(100),
        encrypted_ssh_password TEXT,
        encrypted_ssh_key TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        os_type VARCHAR(50) DEFAULT 'windows',
        mt5_path TEXT,
        ea_path TEXT,
        last_health_check TIMESTAMP,
        health_status VARCHAR(50),
        notes TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(mt5_account_id)
      );
      CREATE INDEX IF NOT EXISTS idx_vps_instances_mt5_account_id ON vps_instances(mt5_account_id);
      CREATE INDEX IF NOT EXISTS idx_vps_instances_status ON vps_instances(status);
    `);

    // Create automation_jobs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS automation_jobs (
        id SERIAL PRIMARY KEY,
        mt5_account_id INTEGER REFERENCES mt5_accounts(id) ON DELETE CASCADE,
        vps_instance_id INTEGER REFERENCES vps_instances(id) ON DELETE CASCADE,
        job_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        progress INTEGER DEFAULT 0,
        message TEXT,
        error_message TEXT,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        metadata JSONB
      );
      CREATE INDEX IF NOT EXISTS idx_automation_jobs_mt5_account ON automation_jobs(mt5_account_id);
      CREATE INDEX IF NOT EXISTS idx_automation_jobs_status ON automation_jobs(status);
    `);

    // Create community_posts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS community_posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        image_url TEXT,
        profit_amount DECIMAL(15, 2),
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
    `);

    // Create community_post_likes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS community_post_likes (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES community_posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(post_id, user_id)
      );
    `);

    // Create community_comments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS community_comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES community_posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments(post_id);
    `);

    // Create user_follows table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_follows (
        id SERIAL PRIMARY KEY,
        follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(follower_id, following_id)
      );
      CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
      CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
    `);

    // Add missing columns to mt5_accounts if they don't exist
    const mt5Columns = [
      { name: 'encrypted_password', type: 'TEXT' },
      { name: 'approved_by', type: 'INTEGER REFERENCES users(id)' },
      { name: 'approved_at', type: 'TIMESTAMP' },
      { name: 'automation_status', type: "VARCHAR(50) DEFAULT 'none'" },
      { name: 'automation_notes', type: 'TEXT' },
      { name: 'last_sync_at', type: 'TIMESTAMP' },
      { name: 'gain_percentage', type: 'DECIMAL(10, 2) DEFAULT 0.00' },
      { name: 'current_lot_size', type: 'DECIMAL(10, 4) DEFAULT 0.00' },
      { name: 'open_positions_count', type: 'INTEGER DEFAULT 0' },
      { name: 'last_trade_at', type: 'TIMESTAMP' },
    ];

    for (const col of mt5Columns) {
      try {
        await pool.query(`ALTER TABLE mt5_accounts ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
      } catch (e) {
        // Column might already exist, ignore error
      }
    }

    // Add missing columns to user_profiles
    const profileColumns = [
      { name: 'two_factor_enabled', type: 'BOOLEAN DEFAULT false' },
      { name: 'trading_risk_level', type: "VARCHAR(50) DEFAULT 'moderate'" },
      { name: 'default_stop_loss', type: 'DECIMAL(15, 4)' },
      { name: 'default_take_profit', type: 'DECIMAL(15, 4)' },
      { name: 'push_notifications_enabled', type: 'BOOLEAN DEFAULT true' },
      { name: 'sms_notifications_enabled', type: 'BOOLEAN DEFAULT false' },
      { name: 'email_notifications_enabled', type: 'BOOLEAN DEFAULT true' },
      { name: 'first_name', type: 'VARCHAR(100)' },
      { name: 'last_name', type: 'VARCHAR(100)' },
      { name: 'phone', type: 'VARCHAR(50)' },
      { name: 'country', type: 'VARCHAR(100)' },
      { name: 'city', type: 'VARCHAR(100)' },
      { name: 'address', type: 'TEXT' },
      { name: 'postal_code', type: 'VARCHAR(20)' },
    ];

    for (const col of profileColumns) {
      try {
        await pool.query(`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
      } catch (e) {
        // Column might already exist, ignore error
      }
    }

    await pool.end();

    return NextResponse.json({
      success: true,
      message: 'Database schema created successfully! All tables are ready (users, user_profiles, trades, transactions, notifications, support_tickets, audit_logs, mt5_accounts, vps_instances, automation_jobs, community_posts, community_post_likes, community_comments, user_follows).'
    });

  } catch (error: any) {
    console.error('Setup DB Error:', error);
    try { await pool.end(); } catch (e) {}
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}
