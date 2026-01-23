import { Pool } from 'pg';

async function setupDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🏗️  Setting up comprehensive database schema...\n');

    // Drop existing tables (if you want to start fresh)
    // await pool.query(`DROP TABLE IF EXISTS trades, user_profiles, users CASCADE;`);

    // Users table - Authentication & Core Info
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        email_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );
    `);

    // User Profiles - Personal & Account Details
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(50),
        country VARCHAR(100),
        city VARCHAR(100),
        address TEXT,
        postal_code VARCHAR(20),
        date_of_birth DATE,
        
        -- Trading Account Details
        account_number VARCHAR(50) UNIQUE,
        account_type VARCHAR(50) DEFAULT 'standard',
        account_balance DECIMAL(15, 2) DEFAULT 0.00,
        account_currency VARCHAR(10) DEFAULT 'USD',
        
        -- KYC/Verification
        kyc_status VARCHAR(50) DEFAULT 'pending',
        id_document_type VARCHAR(50),
        id_document_number VARCHAR(100),
        id_verified_at TIMESTAMP,
        
        -- Trading Settings
        leverage INTEGER DEFAULT 100,
        margin_level DECIMAL(5, 2) DEFAULT 100.00,
        
        -- Profile
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
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Trades table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trades (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        trade_number VARCHAR(50) UNIQUE,
        symbol VARCHAR(20) NOT NULL,
        type VARCHAR(10) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        price DECIMAL(15, 4) NOT NULL,
        
        -- Trade Details
        open_price DECIMAL(15, 4),
        close_price DECIMAL(15, 4),
        stop_loss DECIMAL(15, 4),
        take_profit DECIMAL(15, 4),
        
        -- Financial
        profit_loss DECIMAL(15, 2),
        commission DECIMAL(10, 2) DEFAULT 0.00,
        swap DECIMAL(10, 2) DEFAULT 0.00,
        
        -- Status
        status VARCHAR(50) DEFAULT 'open',
        opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        closed_at TIMESTAMP,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Transactions table - Deposits/Withdrawals
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        transaction_number VARCHAR(50) UNIQUE,
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        
        -- Payment Details
        payment_method VARCHAR(50),
        payment_reference VARCHAR(255),
        
        -- Status
        status VARCHAR(50) DEFAULT 'pending',
        processed_at TIMESTAMP,
        
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Support Tickets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ticket_number VARCHAR(50) UNIQUE,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        priority VARCHAR(50) DEFAULT 'normal',
        assigned_to INTEGER REFERENCES users(id),
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Audit Log table
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // MT5 Accounts table
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, account_number)
      );
    `);

    // VPS Instances table - for tracking VPS provisioning for MT5 accounts
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(mt5_account_id)
      );
    `);

    // Automation Jobs table - for tracking EA deployment and automation tasks
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        metadata JSONB
      );
    `);

    // Community Posts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS community_posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        image_url TEXT,
        profit_amount DECIMAL(15, 2),
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Community Post Likes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS community_post_likes (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES community_posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, user_id)
      );
    `);

    console.log('✅ All tables created successfully!\n');

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
      CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
      CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_mt5_accounts_user_id ON mt5_accounts(user_id);
      CREATE INDEX IF NOT EXISTS idx_mt5_accounts_status ON mt5_accounts(status);
      CREATE INDEX IF NOT EXISTS idx_mt5_accounts_automation_status ON mt5_accounts(automation_status);
      CREATE INDEX IF NOT EXISTS idx_vps_instances_mt5_account_id ON vps_instances(mt5_account_id);
      CREATE INDEX IF NOT EXISTS idx_vps_instances_status ON vps_instances(status);
      CREATE INDEX IF NOT EXISTS idx_automation_jobs_mt5_account ON automation_jobs(mt5_account_id);
      CREATE INDEX IF NOT EXISTS idx_automation_jobs_status ON automation_jobs(status);
      CREATE INDEX IF NOT EXISTS idx_automation_jobs_vps_instance ON automation_jobs(vps_instance_id);
      CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
      CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
    `);

    console.log('✅ Indexes created\n');

    console.log('📋 Database Schema Summary:');
    console.log('─────────────────────────────');
    console.log('  ✓ users - Authentication & core user data');
    console.log('  ✓ user_profiles - Personal info, KYC, account details');
    console.log('  ✓ trades - Trading history & positions');
    console.log('  ✓ transactions - Deposits & withdrawals');
    console.log('  ✓ notifications - User notifications');
    console.log('  ✓ support_tickets - Customer support');
    console.log('  ✓ audit_logs - System activity tracking');
    console.log('  ✓ mt5_accounts - MT5/MT4 trading account connections (with automation fields)');
    console.log('  ✓ vps_instances - VPS tracking for automated trading');
    console.log('  ✓ automation_jobs - EA deployment & automation job tracking');
    console.log('  ✓ community_posts - Community feed posts');
    console.log('  ✓ community_post_likes - Post likes tracking');
    console.log('');
    console.log('🎉 Database schema setup complete!');

  } catch (error) {
    console.error('❌ Setup error:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase();
