-- TimeGift Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  privacy_level TEXT CHECK (privacy_level IN ('closed', 'friends', 'public')) DEFAULT 'friends',
  accept_stranger_gifts BOOLEAN DEFAULT false,
  opt_in_random_exchange BOOLEAN DEFAULT false,
  total_hours_gifted DECIMAL DEFAULT 0,
  total_hours_received DECIMAL DEFAULT 0,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gifts table
CREATE TABLE IF NOT EXISTS gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
  recipient_email TEXT,
  recipient_phone TEXT,
  message TEXT NOT NULL,
  time_amount INTEGER NOT NULL, -- in minutes
  original_time_amount INTEGER NOT NULL, -- for tracking decay
  time_unit TEXT CHECK (time_unit IN ('minutes', 'hours', 'days')) DEFAULT 'hours',
  purpose_type TEXT CHECK (purpose_type IN ('anything', 'specific')) DEFAULT 'anything',
  purpose_details TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'scheduled', 'completed', 'expired', 'declined')) DEFAULT 'pending',
  availability_data JSONB, -- sender's available time slots
  scheduled_datetime TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  photo_card_url TEXT,
  is_random_exchange BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  gift_id UUID REFERENCES gifts(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('gift_received', 'gift_accepted', 'gift_scheduled', 'reminder', 'friend_request', 'system')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  sent_via TEXT CHECK (sent_via IN ('in_app', 'email', 'sms', 'whatsapp', 'viber', 'messenger')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

-- Random Exchange Queue table
CREATE TABLE IF NOT EXISTS random_exchange_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  time_amount INTEGER NOT NULL,
  time_unit TEXT CHECK (time_unit IN ('minutes', 'hours', 'days')) DEFAULT 'hours',
  purpose_type TEXT CHECK (purpose_type IN ('anything', 'specific')) DEFAULT 'anything',
  purpose_details TEXT,
  matched BOOLEAN DEFAULT false,
  matched_with UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_gifts_sender ON gifts(sender_id);
CREATE INDEX idx_gifts_recipient ON gifts(recipient_id);
CREATE INDEX idx_gifts_status ON gifts(status);
CREATE INDEX idx_friendships_user ON friendships(user_id);
CREATE INDEX idx_friendships_friend ON friendships(friend_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- Insert default admin settings
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
  ('theme', '{"default": "light", "allow_user_override": true}', 'Theme configuration'),
  ('time_decay', '{"enabled": true, "rate_percent": 5, "interval_days": 7, "grace_period_days": 3}', 'Time decay configuration'),
  ('notifications', '{"frequency": "immediate", "channels": ["in_app", "email"], "reminder_messages": ["You have been summoned!", "Time to be redeemed!", "Someone awaits your gift of time!"]}', 'Notification settings'),
  ('vonage_api', '{"api_key": "", "api_secret": "", "enabled": false}', 'Vonage SMS API configuration'),
  ('whatsapp_api', '{"api_key": "", "enabled": false}', 'WhatsApp API configuration'),
  ('groq_api', '{"api_key": "", "model": "llama-3.3-70b-versatile", "enabled": false}', 'Groq AI API configuration'),
  ('random_exchange', '{"enabled": true, "match_similar_time": true}', 'Random gift exchange settings')
ON CONFLICT (setting_key) DO NOTHING;

-- Create test user with password: 123456
-- Note: You'll need to create this user via Supabase Auth UI or API
-- The password hash below is for '123456' but Supabase handles auth separately

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gifts_updated_at BEFORE UPDATE ON gifts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE random_exchange_queue ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view public profiles" ON users
  FOR SELECT USING (
    privacy_level = 'public' OR
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM friendships
      WHERE (user_id = auth.uid() AND friend_id = users.id AND status = 'accepted')
         OR (friend_id = auth.uid() AND user_id = users.id AND status = 'accepted')
    )
  );

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

-- Gifts policies
CREATE POLICY "Users can view their sent gifts" ON gifts
  FOR SELECT USING (sender_id = auth.uid());

CREATE POLICY "Users can view their received gifts" ON gifts
  FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "Users can create gifts" ON gifts
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their sent gifts" ON gifts
  FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Recipients can update received gifts" ON gifts
  FOR UPDATE USING (recipient_id = auth.uid());

-- Friendships policies
CREATE POLICY "Users can view their friendships" ON friendships
  FOR SELECT USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can create friendships" ON friendships
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their friendships" ON friendships
  FOR UPDATE USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Admin settings policies (only admins can modify)
CREATE POLICY "Anyone can view admin settings" ON admin_settings
  FOR SELECT USING (true);

CREATE POLICY "Only admins can update settings" ON admin_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- Random exchange queue policies
CREATE POLICY "Users can view their queue entries" ON random_exchange_queue
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert queue entries" ON random_exchange_queue
  FOR INSERT WITH CHECK (user_id = auth.uid());
