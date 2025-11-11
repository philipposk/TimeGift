-- TimeGift Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  privacy_level TEXT DEFAULT 'friends' CHECK (privacy_level IN ('closed', 'friends', 'public')),
  bio TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Friend Relationships Table
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  requested_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Time Gifts Table
CREATE TABLE gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  time_amount INTEGER NOT NULL, -- in minutes
  original_time_amount INTEGER NOT NULL, -- for decay calculation
  time_unit TEXT DEFAULT 'hours' CHECK (time_unit IN ('minutes', 'hours', 'days')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'scheduled', 'completed', 'expired', 'cancelled')),
  expiry_date TIMESTAMP WITH TIME ZONE,
  decay_rate DECIMAL DEFAULT 0.05, -- 5% decay per week by default
  last_decay_applied TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  photo_url TEXT, -- for handwritten note photos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift Availability Slots (when sender is available)
CREATE TABLE gift_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gift_id UUID REFERENCES gifts(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
  start_time TIME,
  end_time TIME,
  specific_date DATE, -- for one-time availability
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift Schedules (when gift is actually scheduled)
CREATE TABLE gift_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gift_id UUID REFERENCES gifts(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('gift_received', 'gift_accepted', 'gift_scheduled', 'reminder', 'friend_request', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID, -- gift_id or friendship_id
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift Statistics Table (for caching)
CREATE TABLE gift_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  total_time_gifted INTEGER DEFAULT 0, -- in minutes
  time_gifted_this_year INTEGER DEFAULT 0,
  time_gifted_this_month INTEGER DEFAULT 0,
  total_time_received INTEGER DEFAULT 0,
  time_received_this_year INTEGER DEFAULT 0,
  time_received_this_month INTEGER DEFAULT 0,
  total_gifts_sent INTEGER DEFAULT 0,
  total_gifts_received INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- App Settings Table (for admin configuration)
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  category TEXT, -- 'notifications', 'api', 'theme', 'general'
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO app_settings (setting_key, setting_value, description, category) VALUES
  ('notification_frequency', '{"reminder_frequency_hours": 24, "max_reminders": 5}', 'How often to send reminder notifications', 'notifications'),
  ('time_decay_enabled', 'true', 'Enable time decay for unredeemed gifts', 'general'),
  ('default_decay_rate', '0.05', 'Default decay rate per week (5%)', 'general'),
  ('vonage_enabled', 'false', 'Enable Vonage SMS notifications', 'api'),
  ('vonage_config', '{}', 'Vonage API configuration', 'api'),
  ('theme_config', '{"default_theme": "system", "allow_user_preference": true}', 'Theme configuration', 'theme'),
  ('guest_access_enabled', 'true', 'Allow guest access to the app', 'general');

-- Create indexes for better performance
CREATE INDEX idx_gifts_sender ON gifts(sender_id);
CREATE INDEX idx_gifts_recipient ON gifts(recipient_id);
CREATE INDEX idx_gifts_status ON gifts(status);
CREATE INDEX idx_friendships_user ON friendships(user_id);
CREATE INDEX idx_friendships_friend ON friendships(friend_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gifts_updated_at BEFORE UPDATE ON gifts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gift_schedules_updated_at BEFORE UPDATE ON gift_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (privacy_level = 'public');

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view friends' profiles"
  ON profiles FOR SELECT
  USING (
    privacy_level = 'friends' AND
    EXISTS (
      SELECT 1 FROM friendships
      WHERE (user_id = id AND friend_id = auth.uid() AND status = 'accepted')
        OR (user_id = auth.uid() AND friend_id = id AND status = 'accepted')
    )
  );

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Friendships
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friendships"
  ON friendships FOR SELECT
  USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can create friend requests"
  ON friendships FOR INSERT
  WITH CHECK (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can update their own friendships"
  ON friendships FOR UPDATE
  USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Gifts
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view gifts they sent or received"
  ON gifts FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can create gifts"
  ON gifts FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own gifts"
  ON gifts FOR UPDATE
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Gift Availability
ALTER TABLE gift_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view availability for their gifts"
  ON gift_availability FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gifts
      WHERE gifts.id = gift_id
      AND (gifts.sender_id = auth.uid() OR gifts.recipient_id = auth.uid())
    )
  );

CREATE POLICY "Senders can manage their gift availability"
  ON gift_availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gifts
      WHERE gifts.id = gift_id AND gifts.sender_id = auth.uid()
    )
  );

-- Gift Schedules
ALTER TABLE gift_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view schedules for their gifts"
  ON gift_schedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gifts
      WHERE gifts.id = gift_id
      AND (gifts.sender_id = auth.uid() OR gifts.recipient_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage schedules for their gifts"
  ON gift_schedules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gifts
      WHERE gifts.id = gift_id
      AND (gifts.sender_id = auth.uid() OR gifts.recipient_id = auth.uid())
    )
  );

-- Gift Statistics
ALTER TABLE gift_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own statistics"
  ON gift_statistics FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view public statistics"
  ON gift_statistics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = user_id AND profiles.privacy_level = 'public'
    )
  );

CREATE POLICY "Users can view friends' statistics"
  ON gift_statistics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = user_id AND profiles.privacy_level = 'friends'
      AND EXISTS (
        SELECT 1 FROM friendships
        WHERE (friendships.user_id = user_id AND friendships.friend_id = auth.uid() AND friendships.status = 'accepted')
          OR (friendships.user_id = auth.uid() AND friendships.friend_id = user_id AND friendships.status = 'accepted')
      )
    )
  );

-- App Settings (admin only)
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view app settings"
  ON app_settings FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify app settings"
  ON app_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );
