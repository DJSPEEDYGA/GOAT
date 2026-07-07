-- GOAT Royalty App - Complete Database Schema
-- Run this in Supabase SQL Editor if tables don't exist after restore

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Royalties Table
CREATE TABLE IF NOT EXISTS royalties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  source TEXT NOT NULL,
  platform TEXT,
  date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracks Table
CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  duration INTEGER,
  genre TEXT,
  isrc TEXT,
  release_date DATE,
  plays INTEGER DEFAULT 0,
  streams INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  cover_url TEXT,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contracts Table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  party_name TEXT NOT NULL,
  party_email TEXT,
  contract_type TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active',
  terms TEXT,
  royalty_split DECIMAL(5,2),
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  value INTEGER NOT NULL,
  date DATE NOT NULL,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Copyrights Table
CREATE TABLE IF NOT EXISTS copyrights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  registration_number TEXT,
  registration_date DATE,
  expiry_date DATE,
  status TEXT DEFAULT 'active',
  description TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  status TEXT DEFAULT 'pending',
  stripe_payment_id TEXT,
  description TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  artist_name TEXT,
  email TEXT,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  social_links JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_royalties_user_id ON royalties(user_id);
CREATE INDEX IF NOT EXISTS idx_royalties_date ON royalties(date);
CREATE INDEX IF NOT EXISTS idx_tracks_user_id ON tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_user_id ON contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_track_id ON analytics(track_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date);
CREATE INDEX IF NOT EXISTS idx_copyrights_user_id ON copyrights(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE royalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE copyrights ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only see their own data

-- Royalties policies
CREATE POLICY "Users can view own royalties" ON royalties
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own royalties" ON royalties
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own royalties" ON royalties
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own royalties" ON royalties
  FOR DELETE USING (auth.uid() = user_id);

-- Tracks policies
CREATE POLICY "Users can view own tracks" ON tracks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tracks" ON tracks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tracks" ON tracks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tracks" ON tracks
  FOR DELETE USING (auth.uid() = user_id);

-- Contracts policies
CREATE POLICY "Users can view own contracts" ON contracts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contracts" ON contracts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contracts" ON contracts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contracts" ON contracts
  FOR DELETE USING (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Users can view own analytics" ON analytics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics" ON analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Copyrights policies
CREATE POLICY "Users can view own copyrights" ON copyrights
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own copyrights" ON copyrights
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own copyrights" ON copyrights
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own copyrights" ON copyrights
  FOR DELETE USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_royalties_updated_at BEFORE UPDATE ON royalties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON tracks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_copyrights_updated_at BEFORE UPDATE ON copyrights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - for testing)
-- Uncomment to add test data

/*
INSERT INTO royalties (user_id, amount, source, platform, date, status) VALUES
  (auth.uid(), 1250.50, 'Streaming', 'Spotify', '2024-01-15', 'paid'),
  (auth.uid(), 850.25, 'Streaming', 'Apple Music', '2024-01-15', 'paid'),
  (auth.uid(), 450.00, 'Downloads', 'iTunes', '2024-01-20', 'pending');

INSERT INTO tracks (user_id, title, artist, duration, genre, plays) VALUES
  (auth.uid(), 'Summer Vibes', 'DJ Speedy', 245, 'Electronic', 15420),
  (auth.uid(), 'Night Drive', 'DJ Speedy', 198, 'House', 8930),
  (auth.uid(), 'City Lights', 'DJ Speedy', 312, 'Techno', 12450);
*/