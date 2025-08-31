-- Create Analytics table for admin dashboard
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    total_sales DECIMAL(15, 2) DEFAULT 0.00 NOT NULL,
    total_orders INTEGER DEFAULT 0 NOT NULL,
    total_users INTEGER DEFAULT 0 NOT NULL,
    new_users INTEGER DEFAULT 0 NOT NULL,
    total_products INTEGER DEFAULT 0 NOT NULL,
    orders_status JSONB DEFAULT '{
        "pending": 0,
        "processing": 0,
        "shipped": 0,
        "delivered": 0,
        "cancelled": 0,
        "refunded": 0
    }'::jsonb,
    payments_status JSONB DEFAULT '{
        "pending": 0,
        "processing": 0,
        "completed": 0,
        "failed": 0,
        "cancelled": 0,
        "refunded": 0
    }'::jsonb,
    top_selling_products JSONB DEFAULT '[]'::jsonb,
    top_categories JSONB DEFAULT '[]'::jsonb,
    avg_order_value DECIMAL(10, 2) DEFAULT 0.00,
    conversion_rate DECIMAL(5, 4) DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on date for faster queries
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date);

-- Insert initial record for today (with proper UUID)
INSERT INTO analytics (id, date) VALUES (gen_random_uuid(), CURRENT_DATE)
ON CONFLICT (date) DO NOTHING;