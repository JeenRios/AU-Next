import { Pool } from 'pg';
import { NextResponse } from 'next/server';

export async function GET() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Insert Admin Users
    await pool.query(`
      INSERT INTO users (email, password, role, status, email_verified, last_login)
      VALUES ('admin@au.com', 'admin', 'admin', 'active', true, NOW()),
             ('support@au.com', 'admin', 'admin', 'active', true, NOW())
      ON CONFLICT (email) DO NOTHING
    `);

    // Insert Regular Users
    const users = [
      ['user@au.com', 'user', 'John', 'Doe', '+1-555-0101', 'United States', 'New York', '123 Wall Street', '10005', '1990-05-15'],
      ['sarah.anderson@example.com', 'password123', 'Sarah', 'Anderson', '+44-20-7123-4567', 'United Kingdom', 'London', '45 Trading Square', 'EC2A 4BX', '1988-08-22'],
      ['michael.chen@example.com', 'password123', 'Michael', 'Chen', '+65-6123-4567', 'Singapore', 'Singapore', '88 Finance Street', '018956', '1992-03-10'],
      ['emma.wilson@example.com', 'password123', 'Emma', 'Wilson', '+61-2-9876-5432', 'Australia', 'Sydney', '12 Market Plaza', '2000', '1995-11-30'],
      ['david.martinez@example.com', 'password123', 'David', 'Martinez', '+34-91-123-4567', 'Spain', 'Madrid', '67 Trader Avenue', '28001', '1987-07-18'],
    ];

    for (const user of users) {
      const result = await pool.query(`
        INSERT INTO users (email, password, role, status, email_verified)
        VALUES ($1, $2, 'user', 'active', true)
        ON CONFLICT (email) DO UPDATE SET last_login = NOW()
        RETURNING id
      `, [user[0], user[1]]);

      const userId = result.rows[0].id;
      const accountNumber = `AU${String(userId).padStart(8, '0')}`;
      const balance = (Math.random() * 50000 + 5000).toFixed(2);

      await pool.query(`
        INSERT INTO user_profiles (
          user_id, first_name, last_name, phone, country, city, address, postal_code,
          date_of_birth, account_number, account_balance, kyc_status, id_document_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'verified', 'passport')
        ON CONFLICT (user_id) DO NOTHING
      `, [userId, user[2], user[3], user[4], user[5], user[6], user[7], user[8], user[9], accountNumber, balance]);
    }

    // Get user IDs
    const usersResult = await pool.query("SELECT id FROM users WHERE role = 'user'");
    const userIds = usersResult.rows.map(row => row.id);

    // Insert Trades
    const symbols = ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD', 'ETHUSD'];
    for (let i = 0; i < 50; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const type = Math.random() > 0.5 ? 'BUY' : 'SELL';
      const amount = (Math.random() * 10 + 0.1).toFixed(2);
      const price = (Math.random() * 50000 + 1000).toFixed(4);
      const status = Math.random() > 0.3 ? 'closed' : 'open';
      const tradeNumber = `T${Date.now()}${i}`;
      
      await pool.query(`
        INSERT INTO trades (user_id, trade_number, symbol, type, amount, price, open_price, status)
        VALUES ($1, $2, $3, $4, $5, $6, $6, $7)
      `, [userId, tradeNumber, symbol, type, amount, price, status]);
    }

    // Insert Transactions
    for (let i = 0; i < 30; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const type = Math.random() > 0.5 ? 'deposit' : 'withdrawal';
      const amount = (Math.random() * 5000 + 100).toFixed(2);
      const txNumber = `TX${Date.now()}${i}`;

      await pool.query(`
        INSERT INTO transactions (user_id, transaction_number, type, amount, status)
        VALUES ($1, $2, $3, $4, 'completed')
      `, [userId, txNumber, type, amount]);
    }

    // Insert Notifications
    for (const userId of userIds) {
      await pool.query(`
        INSERT INTO notifications (user_id, type, title, message)
        VALUES 
          ($1, 'trade', 'Trade Executed', 'Your trade has been executed successfully.'),
          ($1, 'account', 'Deposit Received', 'Your deposit has been credited.')
      `, [userId]);
    }

    // Insert Support Tickets
    for (let i = 0; i < 10; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const ticketNumber = `TICKET${String(1000 + i).padStart(4, '0')}`;

      await pool.query(`
        INSERT INTO support_tickets (user_id, ticket_number, subject, message, status)
        VALUES ($1, $2, 'Account Inquiry', 'I need help with my account.', 'open')
      `, [userId, ticketNumber]);
    }

    await pool.end();

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully! Added 7 users, 50 trades, 30 transactions, and more.',
      credentials: {
        admin: 'admin@au.com / admin',
        user: 'user@au.com / user'
      }
    });

  } catch (error: any) {
    await pool.end();
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
