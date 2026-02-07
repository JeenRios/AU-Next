/**
 * Database Schema Definitions
 * 
 * This file contains all table creation SQL statements.
 * Used by the setup-db API route and for reference.
 * 
 * To modify the schema:
 * 1. Add/update table definitions here
 * 2. Run the /api/setup-db endpoint to apply changes
 * 
 * Note: Uses IF NOT EXISTS for safe re-runs
 */

// =============================================================================
// USERS & AUTHENTICATION
// =============================================================================

export const USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    status VARCHAR(50) DEFAULT 'active',
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    last_password_change TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    last_login TIMESTAMP,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
`;

export const USER_PROFILES_TABLE = `
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
`;

// =============================================================================
// TRADING
// =============================================================================

export const TRADES_TABLE = `
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
`;

export const TRANSACTIONS_TABLE = `
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
`;

// =============================================================================
// MT5 & AUTOMATION
// =============================================================================

export const MT5_ACCOUNTS_TABLE = `
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
`;

export const VPS_INSTANCES_TABLE = `
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
`;

export const AUTOMATION_JOBS_TABLE = `
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
`;

// =============================================================================
// SUPPORT & NOTIFICATIONS
// =============================================================================

export const NOTIFICATIONS_TABLE = `
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
`;

export const SUPPORT_TICKETS_TABLE = `
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
`;

export const AUDIT_LOGS_TABLE = `
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
`;

// =============================================================================
// COMMUNITY & SOCIAL
// =============================================================================

export const COMMUNITY_POSTS_TABLE = `
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
`;

export const COMMUNITY_POST_LIKES_TABLE = `
  CREATE TABLE IF NOT EXISTS community_post_likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(post_id, user_id)
  );
`;

export const COMMUNITY_COMMENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS community_comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments(post_id);
`;

export const USER_FOLLOWS_TABLE = `
  CREATE TABLE IF NOT EXISTS user_follows (
    id SERIAL PRIMARY KEY,
    follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
  );
  CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
  CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
`;

export const TRADING_JOURNAL_TABLE = `
  CREATE TABLE IF NOT EXISTS trading_journal (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    emotion VARCHAR(50),
    tags TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS idx_trading_journal_user_id ON trading_journal(user_id);
`;

// =============================================================================
// COLUMN MIGRATIONS (for adding columns to existing tables)
// =============================================================================

export const MT5_ACCOUNTS_COLUMNS = [
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

export const USER_PROFILES_COLUMNS = [
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

// =============================================================================
// ALL TABLES (in dependency order)
// =============================================================================

export const ALL_TABLES = [
  { name: 'users', sql: USERS_TABLE },
  { name: 'user_profiles', sql: USER_PROFILES_TABLE },
  { name: 'trades', sql: TRADES_TABLE },
  { name: 'transactions', sql: TRANSACTIONS_TABLE },
  { name: 'notifications', sql: NOTIFICATIONS_TABLE },
  { name: 'support_tickets', sql: SUPPORT_TICKETS_TABLE },
  { name: 'audit_logs', sql: AUDIT_LOGS_TABLE },
  { name: 'mt5_accounts', sql: MT5_ACCOUNTS_TABLE },
  { name: 'vps_instances', sql: VPS_INSTANCES_TABLE },
  { name: 'automation_jobs', sql: AUTOMATION_JOBS_TABLE },
  { name: 'community_posts', sql: COMMUNITY_POSTS_TABLE },
  { name: 'community_post_likes', sql: COMMUNITY_POST_LIKES_TABLE },
  { name: 'community_comments', sql: COMMUNITY_COMMENTS_TABLE },
  { name: 'user_follows', sql: USER_FOLLOWS_TABLE },
  { name: 'trading_journal', sql: TRADING_JOURNAL_TABLE },
];

// =============================================================================
// HELPER: Get all column migrations
// =============================================================================

export const USERS_COLUMNS = [
  { name: 'email_verification_token', type: 'VARCHAR(255)' },
  { name: 'email_verification_expires', type: 'TIMESTAMP' },
  { name: 'password_reset_token', type: 'VARCHAR(255)' },
  { name: 'password_reset_expires', type: 'TIMESTAMP' },
  { name: 'last_password_change', type: 'TIMESTAMP' },
  { name: 'failed_login_attempts', type: 'INTEGER DEFAULT 0' },
  { name: 'locked_until', type: 'TIMESTAMP' },
  { name: 'deleted_at', type: 'TIMESTAMP' },
];

export const COLUMN_MIGRATIONS = [
  { table: 'users', columns: USERS_COLUMNS },
  { table: 'mt5_accounts', columns: MT5_ACCOUNTS_COLUMNS },
  { table: 'user_profiles', columns: USER_PROFILES_COLUMNS },
];

// =============================================================================
// INDEX MIGRATIONS (for indexes on columns added via migrations)
// =============================================================================

export const INDEX_MIGRATIONS = [
  'CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token)',
  'CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token)',
];
