const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Redis client
let redisClient;
(async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL,
    });
    await redisClient.connect();
    console.log('✅ Connected to Redis');
  } catch (error) {
    console.error('❌ Redis connection error:', error);
  }
})();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'AU-Next API'
  });
});

// Get all trades
app.get('/api/trades', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM trades ORDER BY created_at DESC LIMIT 100'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching trades:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new trade
app.post('/api/trades', async (req, res) => {
  try {
    const { symbol, type, amount, price } = req.body;
    const result = await pool.query(
      'INSERT INTO trades (symbol, type, amount, price) VALUES ($1, $2, $3, $4) RETURNING *',
      [symbol, type, amount, price]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating trade:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get trading stats (with Redis caching)
app.get('/api/stats', async (req, res) => {
  try {
    // Try to get from cache
    if (redisClient) {
      const cached = await redisClient.get('stats');
      if (cached) {
        return res.json({ success: true, data: JSON.parse(cached), cached: true });
      }
    }

    // Query database
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_trades,
        SUM(CASE WHEN type = 'BUY' THEN 1 ELSE 0 END) as buy_trades,
        SUM(CASE WHEN type = 'SELL' THEN 1 ELSE 0 END) as sell_trades,
        AVG(amount) as avg_amount
      FROM trades
    `);

    const stats = result.rows[0];

    // Cache for 60 seconds
    if (redisClient) {
      await redisClient.setEx('stats', 60, JSON.stringify(stats));
    }

    res.json({ success: true, data: stats, cached: false });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing connections...');
  await pool.end();
  if (redisClient) await redisClient.quit();
  process.exit(0);
});
