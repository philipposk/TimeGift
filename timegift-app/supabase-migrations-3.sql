-- Migration #3: PWA push, cadence reminders, voice memos, group gifts, wishlist, offers, legacy.
-- Idempotent. Run after #2.

-- ============================================================
-- A. PWA push subscriptions
-- ============================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_subs_user ON push_subscriptions(user_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own push subs" ON push_subscriptions;
CREATE POLICY "Users see own push subs" ON push_subscriptions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own push subs" ON push_subscriptions;
CREATE POLICY "Users insert own push subs" ON push_subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own push subs" ON push_subscriptions;
CREATE POLICY "Users delete own push subs" ON push_subscriptions
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- B. Per-friend cadence (relationship reminders)
-- ============================================================

ALTER TABLE friendships ADD COLUMN IF NOT EXISTS cadence_days INTEGER;
ALTER TABLE friendships ADD COLUMN IF NOT EXISTS last_gift_at TIMESTAMPTZ;
ALTER TABLE friendships ADD COLUMN IF NOT EXISTS cadence_warned_at TIMESTAMPTZ;

-- ============================================================
-- C. Voice memos + legacy + moderation cols on gifts
-- ============================================================

ALTER TABLE gifts ADD COLUMN IF NOT EXISTS voice_url TEXT;
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS voice_duration_seconds INTEGER;
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS legacy_visible_at TIMESTAMPTZ;
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS flagged_for_review BOOLEAN DEFAULT false;
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS flag_reason TEXT;

-- Storage bucket for voice memos
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'voice') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('voice', 'voice', true);
  END IF;
END $$;

DROP POLICY IF EXISTS "Users upload own voice memos" ON storage.objects;
CREATE POLICY "Users upload own voice memos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'voice' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Public read voice memos" ON storage.objects;
CREATE POLICY "Public read voice memos" ON storage.objects
  FOR SELECT USING (bucket_id = 'voice');

-- ============================================================
-- D. Group gifts (multi-sender pool)
-- ============================================================

ALTER TABLE gifts ADD COLUMN IF NOT EXISTS is_group BOOLEAN DEFAULT false;
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS group_closed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS gift_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gift_id UUID NOT NULL REFERENCES gifts(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hours_minutes INTEGER NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gift_id, sender_id)
);

CREATE INDEX IF NOT EXISTS idx_gift_contribs_gift ON gift_contributions(gift_id);

ALTER TABLE gift_contributions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View own + own-gifts contributions" ON gift_contributions;
CREATE POLICY "View own + own-gifts contributions" ON gift_contributions
  FOR SELECT USING (
    sender_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM gifts WHERE gifts.id = gift_contributions.gift_id
        AND (gifts.sender_id = auth.uid() OR gifts.recipient_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Insert own contributions" ON gift_contributions;
CREATE POLICY "Insert own contributions" ON gift_contributions
  FOR INSERT WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "Delete own contributions" ON gift_contributions;
CREATE POLICY "Delete own contributions" ON gift_contributions
  FOR DELETE USING (sender_id = auth.uid());

-- Public join tokens for group gifts (anyone with link can contribute)
CREATE TABLE IF NOT EXISTS group_gift_invites (
  token TEXT PRIMARY KEY,
  gift_id UUID NOT NULL REFERENCES gifts(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_group_invites_gift ON group_gift_invites(gift_id);

-- ============================================================
-- E. Wishes (time wishlist)
-- ============================================================

CREATE TABLE IF NOT EXISTS wishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  hours_estimate INTEGER,
  is_public BOOLEAN DEFAULT true,
  claimed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,
  fulfilled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wishes_user ON wishes(user_id);
CREATE INDEX IF NOT EXISTS idx_wishes_open ON wishes(fulfilled) WHERE fulfilled = false;

ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View own + public + friends wishes" ON wishes;
CREATE POLICY "View own + public + friends wishes" ON wishes
  FOR SELECT USING (
    user_id = auth.uid()
    OR (is_public = true AND EXISTS (
      SELECT 1 FROM friendships
      WHERE status = 'accepted' AND (
        (user_id = auth.uid() AND friend_id = wishes.user_id)
        OR (friend_id = auth.uid() AND user_id = wishes.user_id)
      )
    ))
  );

DROP POLICY IF EXISTS "Insert own wishes" ON wishes;
CREATE POLICY "Insert own wishes" ON wishes
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Update own wishes" ON wishes;
CREATE POLICY "Update own wishes" ON wishes
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Delete own wishes" ON wishes;
CREATE POLICY "Delete own wishes" ON wishes
  FOR DELETE USING (user_id = auth.uid());

DROP TRIGGER IF EXISTS update_wishes_updated_at ON wishes;
CREATE TRIGGER update_wishes_updated_at BEFORE UPDATE ON wishes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- F. Offers (skills directory)
-- ============================================================

CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  hours_estimate INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offers_user ON offers(user_id);
CREATE INDEX IF NOT EXISTS idx_offers_active ON offers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_offers_category ON offers(category) WHERE is_active = true;

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View active offers" ON offers;
CREATE POLICY "View active offers" ON offers
  FOR SELECT USING (is_active = true OR user_id = auth.uid());

DROP POLICY IF EXISTS "Insert own offers" ON offers;
CREATE POLICY "Insert own offers" ON offers
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Update own offers" ON offers;
CREATE POLICY "Update own offers" ON offers
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Delete own offers" ON offers;
CREATE POLICY "Delete own offers" ON offers
  FOR DELETE USING (user_id = auth.uid());

DROP TRIGGER IF EXISTS update_offers_updated_at ON offers;
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- G. Reliability score view
-- ============================================================

CREATE OR REPLACE VIEW user_reliability AS
SELECT
  u.id AS user_id,
  COUNT(*) FILTER (WHERE g.status = 'completed') AS completed_count,
  COUNT(*) FILTER (WHERE g.status IN ('declined','cancelled','expired')) AS broken_count,
  COUNT(*) FILTER (WHERE g.status IN ('completed','declined','cancelled','expired')) AS total_decided,
  CASE
    WHEN COUNT(*) FILTER (WHERE g.status IN ('completed','declined','cancelled','expired')) = 0 THEN NULL
    ELSE ROUND(
      100.0 * COUNT(*) FILTER (WHERE g.status = 'completed')::numeric
      / NULLIF(COUNT(*) FILTER (WHERE g.status IN ('completed','declined','cancelled','expired')), 0)
    )
  END AS reliability_percent
FROM users u
LEFT JOIN gifts g ON (g.sender_id = u.id OR g.recipient_id = u.id)
GROUP BY u.id;

-- ============================================================
-- H. On-this-day index (for cron lookups)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_gifts_completed_at ON gifts(completed_at) WHERE completed_at IS NOT NULL;
