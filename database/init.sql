-- Initialize AU Trading Database

-- Create trades table
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

-- Create index for faster queries
CREATE INDEX idx_trades_symbol ON trades(symbol);
CREATE INDEX idx_trades_created_at ON trades(created_at DESC);

-- Insert sample data
INSERT INTO trades (symbol, type, amount, price, status) VALUES
('AUDUSD', 'BUY', 1.5, 0.6542, 'COMPLETED'),
('AUDUSD', 'SELL', 1.2, 0.6555, 'COMPLETED'),
('AUDUSD', 'BUY', 2.0, 0.6548, 'PENDING'),
('EURUSD', 'BUY', 1.0, 1.0932, 'COMPLETED'),
('GBPUSD', 'SELL', 0.8, 1.2745, 'COMPLETED');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON trades
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
