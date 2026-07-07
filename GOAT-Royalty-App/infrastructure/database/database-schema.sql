-- GOAT Royalty Database Schema
-- PostgreSQL + Supabase compatible
-- Run this in your Supabase SQL editor or PostgreSQL database

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==================== USERS TABLE ====================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    display_name VARCHAR(255),
    avatar_url TEXT,
    
    -- Subscription info
    tier VARCHAR(50) DEFAULT 'free', -- free, creator, pro, royalty
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    subscription_status VARCHAR(50) DEFAULT 'inactive',
    subscription_current_period_end TIMESTAMP,
    
    -- Web3
    wallet_address VARCHAR(255),
    wallet_chain VARCHAR(50), -- ethereum, polygon, base
    nft_balance INTEGER DEFAULT 0,
    goat_token_balance DECIMAL(20, 8) DEFAULT 0,
    
    -- Profile
    bio TEXT,
    website VARCHAR(500),
    social_links JSONB DEFAULT '{}',
    
    -- Settings
    settings JSONB DEFAULT '{
        "notifications": true,
        "dark_mode": true,
        "ai_suggestions": true,
        "auto_save": true
    }',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX idx_users_wallet ON users(wallet_address);

-- ==================== SOCIAL ACCOUNTS ====================
CREATE TABLE IF NOT EXISTS social_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    platform VARCHAR(50) NOT NULL, -- instagram, twitter, tiktok, youtube, spotify, linkedin
    platform_user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    display_name VARCHAR(255),
    avatar_url TEXT,
    access_token TEXT, -- Encrypted
    refresh_token TEXT, -- Encrypted
    token_expires_at TIMESTAMP,
    
    -- Platform-specific data
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    platform_data JSONB DEFAULT '{}',
    
    -- Status
    is_connected BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, platform)
);

CREATE INDEX idx_social_accounts_user ON social_accounts(user_id);
CREATE INDEX idx_social_accounts_platform ON social_accounts(platform);

-- ==================== SCHEDULED POSTS ====================
CREATE TABLE IF NOT EXISTS scheduled_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Content
    content TEXT,
    media_urls TEXT[],
    media_type VARCHAR(50), -- image, video, carousel, story, reel
    
    -- Platforms
    platforms VARCHAR(50)[] NOT NULL, -- Array of platforms
    platform_post_ids JSONB DEFAULT '{}', -- Platform-specific post IDs after publishing
    
    -- Scheduling
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, publishing, published, failed
    error_message TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- AI-generated
    ai_generated BOOLEAN DEFAULT false,
    ai_suggestions JSONB,
    
    -- Engagement tracking
    engagement_stats JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_scheduled_posts_user ON scheduled_posts(user_id);
CREATE INDEX idx_scheduled_posts_scheduled ON scheduled_posts(scheduled_for);
CREATE INDEX idx_scheduled_posts_status ON scheduled_posts(status);

-- ==================== BRAND DEALS ====================
CREATE TABLE IF NOT EXISTS brand_deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Brand info
    brand_name VARCHAR(255) NOT NULL,
    brand_contact_name VARCHAR(255),
    brand_contact_email VARCHAR(255),
    brand_contact_phone VARCHAR(50),
    brand_logo_url TEXT,
    brand_website VARCHAR(500),
    
    -- Deal details
    deal_title VARCHAR(255) NOT NULL,
    deal_type VARCHAR(100), -- sponsorship, partnership, affiliate, licensing, appearance
    deal_value DECIMAL(12, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    payment_structure JSONB, -- { upfront: 50, milestones: [{ percent: 25, date: "..." }] }
    
    -- Deliverables
    deliverables JSONB DEFAULT '[]', -- Array of deliverable items
    content_requirements TEXT,
    
    -- Timeline
    start_date DATE,
    end_date DATE,
    
    -- Status pipeline
    status VARCHAR(50) DEFAULT 'outreach', -- outreach, negotiation, contract, active, completed, cancelled
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    
    -- Negotiation
    initial_offer DECIMAL(12, 2),
    counter_offer DECIMAL(12, 2),
    negotiation_notes TEXT,
    
    -- Contract
    contract_url TEXT,
    contract_signed_at TIMESTAMP WITH TIME ZONE,
    contract_signed_by_brand BOOLEAN DEFAULT false,
    contract_signed_by_creator BOOLEAN DEFAULT false,
    
    -- Performance
    performance_metrics JSONB DEFAULT '{}',
    
    -- Notes
    notes TEXT,
    tags VARCHAR(100)[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_brand_deals_user ON brand_deals(user_id);
CREATE INDEX idx_brand_deals_status ON brand_deals(status);
CREATE INDEX idx_brand_deals_brand ON brand_deals(brand_name);

-- ==================== TOUR/EVENTS ====================
CREATE TABLE IF NOT EXISTS tour_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Event info
    event_name VARCHAR(255) NOT NULL,
    event_type VARCHAR(100), -- concert, appearance, meet_greet, conference, pop_up
    tour_name VARCHAR(255),
    
    -- Venue
    venue_name VARCHAR(255),
    venue_address TEXT,
    venue_city VARCHAR(100),
    venue_state VARCHAR(100),
    venue_country VARCHAR(100) DEFAULT 'USA',
    venue_capacity INTEGER,
    venue_contact JSONB,
    
    -- Location coordinates for mapping
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Schedule
    event_date DATE NOT NULL,
    doors_time TIME,
    event_time TIME,
    end_time TIME,
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Financial
    guarantee_amount DECIMAL(12, 2),
    ticket_price_min DECIMAL(10, 2),
    ticket_price_max DECIMAL(10, 2),
    expected_attendance INTEGER,
    ticket_sales_link VARCHAR(500),
    
    -- Team
    team_members JSONB DEFAULT '[]', -- [{ name, role, contact, arrival_time }]
    
    -- Requirements
    rider_requirements TEXT,
    technical_requirements TEXT,
    hospitality_requirements TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'confirmed', -- tentative, confirmed, completed, cancelled
    contract_url TEXT,
    
    -- Notes
    notes TEXT,
    schedule_items JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tour_events_user ON tour_events(user_id);
CREATE INDEX idx_tour_events_date ON tour_events(event_date);
CREATE INDEX idx_tour_events_tour ON tour_events(tour_name);

-- ==================== TOUR EXPENSES ====================
CREATE TABLE IF NOT EXISTS tour_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES tour_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    category VARCHAR(100), -- travel, accommodation, food, equipment, misc
    description TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    
    expense_date DATE,
    receipt_url TEXT,
    
    is_reimbursable BOOLEAN DEFAULT false,
    is_paid BOOLEAN DEFAULT false,
    
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== MERCH PRODUCTS ====================
CREATE TABLE IF NOT EXISTS merch_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Product info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- apparel, accessories, digital, vinyl, bundle
    
    -- Pricing
    base_price DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Inventory
    sku VARCHAR(100),
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    track_inventory BOOLEAN DEFAULT true,
    
    -- Variants
    variants JSONB DEFAULT '[]', -- [{ size: "M", color: "Black", price_adjustment: 0, sku: "...", stock: 50 }]
    
    -- Media
    images TEXT[] DEFAULT '{}',
    videos TEXT[] DEFAULT '{}',
    
    -- Details
    weight_kg DECIMAL(6, 3),
    dimensions JSONB, -- { length, width, height, unit }
    
    -- Shipping
    shipping_class VARCHAR(50) DEFAULT 'standard',
    is_digital BOOLEAN DEFAULT false,
    digital_file_url TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT true,
    
    -- Stats
    sales_count INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    
    -- SEO
    slug VARCHAR(255) UNIQUE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Print-on-demand integration
    pod_provider VARCHAR(50), -- printful, printify, custom
    pod_product_id VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_merch_products_user ON merch_products(user_id);
CREATE INDEX idx_merch_products_category ON merch_products(category);
CREATE INDEX idx_merch_products_slug ON merch_products(slug);

-- ==================== ORDERS ====================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Customer info
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    
    -- Shipping
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    
    -- Items
    items JSONB NOT NULL, -- [{ product_id, variant, quantity, price, total }]
    
    -- Totals
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Payment
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed, refunded
    payment_method VARCHAR(50),
    stripe_payment_intent_id VARCHAR(255),
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Fulfillment
    fulfillment_status VARCHAR(50) DEFAULT 'unfulfilled', -- unfulfilled, processing, shipped, delivered
    tracking_number VARCHAR(255),
    tracking_url TEXT,
    carrier VARCHAR(100),
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- Notes
    customer_notes TEXT,
    internal_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(fulfillment_status);

-- ==================== ANALYTICS SNAPSHOTS ====================
CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    snapshot_date DATE NOT NULL,
    platform VARCHAR(50), -- null for aggregate
    
    -- Follower metrics
    followers_count INTEGER,
    followers_change INTEGER DEFAULT 0,
    following_count INTEGER,
    
    -- Engagement metrics
    likes_count BIGINT DEFAULT 0,
    comments_count BIGINT DEFAULT 0,
    shares_count BIGINT DEFAULT 0,
    saves_count BIGINT DEFAULT 0,
    engagement_rate DECIMAL(6, 4), -- Percentage
    
    -- Content metrics
    posts_count INTEGER DEFAULT 0,
    stories_count INTEGER DEFAULT 0,
    reels_count INTEGER DEFAULT 0,
    videos_count INTEGER DEFAULT 0,
    
    -- Reach/Impressions
    reach BIGINT DEFAULT 0,
    impressions BIGINT DEFAULT 0,
    profile_visits INTEGER DEFAULT 0,
    website_clicks INTEGER DEFAULT 0,
    
    -- Revenue (if applicable)
    revenue DECIMAL(12, 2) DEFAULT 0,
    revenue_source VARCHAR(100),
    
    -- Additional metrics (platform-specific)
    additional_metrics JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, snapshot_date, platform)
);

CREATE INDEX idx_analytics_user ON analytics_snapshots(user_id);
CREATE INDEX idx_analytics_date ON analytics_snapshots(snapshot_date);

-- ==================== AI CONTENT GENERATIONS ====================
CREATE TABLE IF NOT EXISTS ai_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    generation_type VARCHAR(100), -- caption, hashtag, bio, script, email, contract
    input_prompt TEXT,
    generated_content TEXT,
    
    -- Model info
    model VARCHAR(100), -- gpt-4, claude-3, ollama-llama3
    provider VARCHAR(50), -- openai, anthropic, local
    
    -- Tokens/Usage
    input_tokens INTEGER,
    output_tokens INTEGER,
    
    -- Feedback
    user_rating INTEGER, -- 1-5
    user_feedback TEXT,
    was_edited BOOLEAN DEFAULT false,
    was_used BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== NOTIFICATIONS ====================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    type VARCHAR(100) NOT NULL, -- subscription, post, deal, event, order, system
    title VARCHAR(255) NOT NULL,
    message TEXT,
    
    -- Action
    action_url TEXT,
    action_text VARCHAR(100),
    
    -- Related entity
    related_entity_type VARCHAR(100),
    related_entity_id UUID,
    
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Delivery
    delivered_email BOOLEAN DEFAULT false,
    delivered_push BOOLEAN DEFAULT false,
    delivered_sms BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- ==================== AUDIT LOG ====================
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    
    old_values JSONB,
    new_values JSONB,
    
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);

-- ==================== ROW LEVEL SECURITY (Supabase) ====================
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own social accounts" ON social_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own posts" ON scheduled_posts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own deals" ON brand_deals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own events" ON tour_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own expenses" ON tour_expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own products" ON merch_products FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own analytics" ON analytics_snapshots FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own generations" ON ai_generations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- ==================== FUNCTIONS ====================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON social_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scheduled_posts_updated_at BEFORE UPDATE ON scheduled_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brand_deals_updated_at BEFORE UPDATE ON brand_deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tour_events_updated_at BEFORE UPDATE ON tour_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_merch_products_updated_at BEFORE UPDATE ON merch_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_num TEXT;
BEGIN
    order_num := 'GOAT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate order number on insert
CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- ==================== VIEWS ====================

-- Dashboard stats view
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    u.id as user_id,
    u.tier,
    COUNT(DISTINCT sa.id) as connected_platforms,
    COUNT(DISTINCT sp.id) FILTER (WHERE sp.status = 'published') as published_posts,
    COUNT(DISTINCT bd.id) FILTER (WHERE bd.status = 'active') as active_deals,
    COUNT(DISTINCT te.id) FILTER (WHERE te.event_date >= CURRENT_DATE) as upcoming_events,
    COUNT(DISTINCT mp.id) FILTER (WHERE mp.is_active) as active_products,
    COALESCE(SUM(bd.deal_value) FILTER (WHERE bd.status = 'completed'), 0) as total_deal_value,
    (SELECT SUM(total) FROM orders WHERE user_id = u.id AND payment_status = 'paid') as total_merch_revenue
FROM users u
LEFT JOIN social_accounts sa ON u.id = sa.user_id AND sa.is_connected
LEFT JOIN scheduled_posts sp ON u.id = sp.user_id
LEFT JOIN brand_deals bd ON u.id = bd.user_id
LEFT JOIN tour_events te ON u.id = te.user_id
LEFT JOIN merch_products mp ON u.id = mp.user_id
GROUP BY u.id;

-- ==================== INITIAL DATA ====================

-- Insert default notification templates (optional)
INSERT INTO notifications (user_id, type, title, message) 
SELECT id, 'system', 'Welcome to GOAT Royalty!', 'Your account has been created. Start connecting your social accounts to unlock powerful creator tools.'
FROM users 
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE type = 'system' AND title = 'Welcome to GOAT Royalty!');

-- Grant necessary permissions (adjust for your Supabase setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;