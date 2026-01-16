import { Pool } from 'pg';

async function seedDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🌱 Seeding database with comprehensive data...\n');

    // Insert Admin Users
    const adminUsers = [
      ['admin@au.com', 'admin', 'admin'],
      ['support@au.com', 'admin', 'admin'],
    ];

    for (const [email, password, role] of adminUsers) {
      const result = await pool.query(`
        INSERT INTO users (email, password, role, status, email_verified, last_login)
        VALUES ($1, $2, $3, 'active', true, NOW())
        ON CONFLICT (email) DO UPDATE SET last_login = NOW()
        RETURNING id
      `, [email, password, role]);
    }

    // Insert Regular Users with Full Profiles
    const users = [
      {
        email: 'user@au.com',
        password: 'user',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1-555-0101',
        country: 'United States',
        city: 'New York',
        address: '123 Wall Street',
        postalCode: '10005',
        dob: '1990-05-15',
        accountType: 'standard',
      },
      {
        email: 'sarah.anderson@example.com',
        password: 'password123',
        firstName: 'Sarah',
        lastName: 'Anderson',
        phone: '+44-20-7123-4567',
        country: 'United Kingdom',
        city: 'London',
        address: '45 Trading Square',
        postalCode: 'EC2A 4BX',
        dob: '1988-08-22',
        accountType: 'premium',
      },
      {
        email: 'michael.chen@example.com',
        password: 'password123',
        firstName: 'Michael',
        lastName: 'Chen',
        phone: '+65-6123-4567',
        country: 'Singapore',
        city: 'Singapore',
        address: '88 Finance Street',
        postalCode: '018956',
        dob: '1992-03-10',
        accountType: 'standard',
      },
      {
        email: 'emma.wilson@example.com',
        password: 'password123',
        firstName: 'Emma',
        lastName: 'Wilson',
        phone: '+61-2-9876-5432',
        country: 'Australia',
        city: 'Sydney',
        address: '12 Market Plaza',
        postalCode: '2000',
        dob: '1995-11-30',
        accountType: 'vip',
      },
      {
        email: 'david.martinez@example.com',
        password: 'password123',
        firstName: 'David',
        lastName: 'Martinez',
        phone: '+34-91-123-4567',
        country: 'Spain',
        city: 'Madrid',
        address: '67 Trader Avenue',
        postalCode: '28001',
        dob: '1987-07-18',
        accountType: 'standard',
      },
    ];

    for (const user of users) {
      // Insert user
      const userResult = await pool.query(`
        INSERT INTO users (email, password, role, status, email_verified, last_login)
        VALUES ($1, $2, 'user', 'active', true, NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days')
        ON CONFLICT (email) DO UPDATE SET last_login = NOW()
        RETURNING id
      `, [user.email, user.password]);

      const userId = userResult.rows[0].id;

      // Insert user profile
      const accountNumber = `AU${String(userId).padStart(8, '0')}`;
      const accountBalance = (Math.random() * 50000 + 5000).toFixed(2);

      await pool.query(`
        INSERT INTO user_profiles (
          user_id, first_name, last_name, phone, country, city, address, postal_code,
          date_of_birth, account_number, account_type, account_balance, account_currency,
          kyc_status, id_document_type, leverage, margin_level, timezone, language
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        ON CONFLICT DO NOTHING
      `, [
        userId, user.firstName, user.lastName, user.phone, user.country, user.city, 
        user.address, user.postalCode, user.dob, accountNumber, user.accountType,
        accountBalance, 'USD', 'verified', 'passport', 100, 100.00, 'UTC', 'en'
      ]);
    }

    console.log('✅ Users and profiles seeded\n');

    // Get all regular user IDs
    const usersResult = await pool.query("SELECT id FROM users WHERE role = 'user'");
    const userIds = usersResult.rows.map(row => row.id);

    // Insert Trades
    const symbols = ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD', 'ETHUSD', 'AUDUSD', 'NZDUSD'];
    const types = ['BUY', 'SELL'];
    const statuses = ['open', 'closed', 'closed', 'closed']; // More closed than open

    for (let i = 0; i < 100; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const amount = (Math.random() * 10 + 0.1).toFixed(2);
      const openPrice = (Math.random() * 50000 + 1000).toFixed(4);
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const tradeNumber = `T${Date.now()}${i}`;
      
      const closePrice = status === 'closed' ? (parseFloat(openPrice) * (1 + (Math.random() - 0.5) * 0.1)).toFixed(4) : null;
      const profitLoss = status === 'closed' ? ((parseFloat(closePrice!) - parseFloat(openPrice)) * parseFloat(amount)).toFixed(2) : null;

      await pool.query(`
        INSERT INTO trades (
          user_id, trade_number, symbol, type, amount, price, open_price, close_price,
          stop_loss, take_profit, profit_loss, commission, status, opened_at, closed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 
          NOW() - INTERVAL '${Math.floor(Math.random() * 90)} days',
          ${status === 'closed' ? `NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days'` : 'NULL'}
        )
      `, [
        userId, tradeNumber, symbol, type, amount, openPrice, openPrice, closePrice,
        (parseFloat(openPrice) * 0.95).toFixed(4), (parseFloat(openPrice) * 1.05).toFixed(4),
        profitLoss, 2.50, status
      ]);
    }

    console.log('✅ Trades seeded\n');

    // Insert Transactions
    const transactionTypes = ['deposit', 'withdrawal'];
    const paymentMethods = ['bank_transfer', 'credit_card', 'crypto', 'paypal'];
    const transactionStatuses = ['completed', 'completed', 'completed', 'pending'];

    for (let i = 0; i < 50; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const amount = (Math.random() * 5000 + 100).toFixed(2);
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const status = transactionStatuses[Math.floor(Math.random() * transactionStatuses.length)];
      const txNumber = `TX${Date.now()}${i}`;

      await pool.query(`
        INSERT INTO transactions (
          user_id, transaction_number, type, amount, currency, payment_method,
          payment_reference, status, processed_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 
          ${status === 'completed' ? `NOW() - INTERVAL '${Math.floor(Math.random() * 60)} days'` : 'NULL'},
          NOW() - INTERVAL '${Math.floor(Math.random() * 90)} days'
        )
      `, [
        userId, txNumber, type, amount, 'USD', paymentMethod, `REF${Math.random().toString(36).substr(2, 9).toUpperCase()}`, status
      ]);
    }

    console.log('✅ Transactions seeded\n');

    // Insert Notifications
    const notificationTypes = ['trade', 'account', 'system', 'promotion'];
    const notifications = [
      { type: 'trade', title: 'Trade Executed', message: 'Your XAUUSD trade has been executed successfully.' },
      { type: 'account', title: 'Deposit Received', message: 'Your deposit of $5,000 has been credited to your account.' },
      { type: 'system', title: 'System Maintenance', message: 'Scheduled maintenance on Sunday 2AM-4AM UTC.' },
      { type: 'account', title: 'KYC Verified', message: 'Your account has been successfully verified.' },
      { type: 'trade', title: 'Margin Alert', message: 'Your margin level is below 120%. Please add funds.' },
      { type: 'promotion', title: 'Special Offer', message: '50% bonus on your next deposit!' },
    ];

    for (const userId of userIds) {
      for (let i = 0; i < 5; i++) {
        const notification = notifications[Math.floor(Math.random() * notifications.length)];
        const isRead = Math.random() > 0.4;

        await pool.query(`
          INSERT INTO notifications (user_id, type, title, message, is_read, read_at, created_at)
          VALUES ($1, $2, $3, $4, $5, 
            ${isRead ? `NOW() - INTERVAL '${Math.floor(Math.random() * 10)} days'` : 'NULL'},
            NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days'
          )
        `, [userId, notification.type, notification.title, notification.message, isRead]);
      }
    }

    console.log('✅ Notifications seeded\n');

    // Insert Support Tickets
    const ticketSubjects = [
      'Cannot complete trade transaction',
      'Account verification question',
      'Withdrawal not received',
      'Platform login issues',
      'Trading fees inquiry',
    ];
    const priorities = ['low', 'normal', 'high'];
    const ticketStatuses = ['open', 'open', 'resolved', 'resolved'];

    for (let i = 0; i < 20; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const subject = ticketSubjects[Math.floor(Math.random() * ticketSubjects.length)];
      const status = ticketStatuses[Math.floor(Math.random() * ticketStatuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const ticketNumber = `TICKET${String(1000 + i).padStart(4, '0')}`;

      await pool.query(`
        INSERT INTO support_tickets (
          user_id, ticket_number, subject, message, status, priority, resolved_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6,
          ${status === 'resolved' ? `NOW() - INTERVAL '${Math.floor(Math.random() * 20)} days'` : 'NULL'},
          NOW() - INTERVAL '${Math.floor(Math.random() * 60)} days'
        )
      `, [
        userId, ticketNumber, subject, 
        'This is a detailed description of the support issue that needs to be resolved.',
        status, priority
      ]);
    }

    console.log('✅ Support tickets seeded\n');

    // Insert Audit Logs
    const actions = ['login', 'logout', 'trade_open', 'trade_close', 'deposit', 'withdrawal', 'profile_update'];
    
    for (const userId of userIds) {
      for (let i = 0; i < 10; i++) {
        const action = actions[Math.floor(Math.random() * actions.length)];
        
        await pool.query(`
          INSERT INTO audit_logs (user_id, action, entity_type, ip_address, user_agent, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '${Math.floor(Math.random() * 90)} days')
        `, [
          userId, action, 'user',
          `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        ]);
      }
    }

    console.log('✅ Audit logs seeded\n');

    // Show summary
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const profileCount = await pool.query('SELECT COUNT(*) FROM user_profiles');
    const tradeCount = await pool.query('SELECT COUNT(*) FROM trades');
    const transactionCount = await pool.query('SELECT COUNT(*) FROM transactions');
    const notificationCount = await pool.query('SELECT COUNT(*) FROM notifications');
    const ticketCount = await pool.query('SELECT COUNT(*) FROM support_tickets');
    const auditCount = await pool.query('SELECT COUNT(*) FROM audit_logs');

    console.log('📊 Database Summary:');
    console.log('─────────────────────────────');
    console.log(`  Users: ${userCount.rows[0].count}`);
    console.log(`  User Profiles: ${profileCount.rows[0].count}`);
    console.log(`  Trades: ${tradeCount.rows[0].count}`);
    console.log(`  Transactions: ${transactionCount.rows[0].count}`);
    console.log(`  Notifications: ${notificationCount.rows[0].count}`);
    console.log(`  Support Tickets: ${ticketCount.rows[0].count}`);
    console.log(`  Audit Logs: ${auditCount.rows[0].count}`);
    console.log('');
    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('📝 Test Credentials:');
    console.log('  Admin: admin@au.com / admin');
    console.log('  User: user@au.com / user');
    console.log('  User: sarah.anderson@example.com / password123');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await pool.end();
  }
}

seedDatabase();
