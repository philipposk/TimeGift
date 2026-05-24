-- Migration #2: Lifecycle, safety, privacy, friends-in-gifting.
-- Idempotent. Run after supabase-schema.sql + supabase-migrations.sql.

-- ============================================================
-- A. Gift lifecycle columns
-- ============================================================

ALTER TABLE gifts ADD COLUMN IF NOT EXISTS declined_at TIMESTAMPTZ;
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS archived_by_sender BOOLEAN DEFAULT false;
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS archived_by_recipient BOOLEAN DEFAULT false;

-- Per-gift opt-out of decay (gifts can mark "no decay, just expire").
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS decay_enabled BOOLEAN DEFAULT true;
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS decay_warned_at TIMESTAMPTZ;

-- Drop dead column.
ALTER TABLE gifts DROP COLUMN IF EXISTS photo_card_url;

-- Allow 'cancelled' status. Recreate the check constraint.
ALTER TABLE gifts DROP CONSTRAINT IF EXISTS gifts_status_check;
ALTER TABLE gifts ADD CONSTRAINT gifts_status_check
  CHECK (status IN ('pending','accepted','scheduled','completed','expired','declined','cancelled'));

-- ============================================================
-- B. Claim tokens for non-user recipients
-- ============================================================

CREATE TABLE IF NOT EXISTS claim_tokens (
  token TEXT PRIMARY KEY,
  gift_id UUID NOT NULL REFERENCES gifts(id) ON DELETE CASCADE,
  recipient_email TEXT,
  recipient_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  claimed_at TIMESTAMPTZ,
  claimed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_claim_tokens_gift ON claim_tokens(gift_id);
CREATE INDEX IF NOT EXISTS idx_claim_tokens_email ON claim_tokens(recipient_email) WHERE recipient_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_claim_tokens_phone ON claim_tokens(recipient_phone) WHERE recipient_phone IS NOT NULL;

ALTER TABLE claim_tokens ENABLE ROW LEVEL SECURITY;

-- Claim tokens never readable by anon REST. Lookup goes through service-role
-- via API route only.

-- ============================================================
-- C. Blocks (per-user block list)
-- ============================================================

CREATE TABLE IF NOT EXISTS blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Either blocked_user_id OR blocked_email OR blocked_phone is set.
  blocked_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blocked_email TEXT,
  blocked_phone TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT blocks_target_required CHECK (
    blocked_user_id IS NOT NULL
    OR blocked_email IS NOT NULL
    OR blocked_phone IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked_user ON blocks(blocked_user_id) WHERE blocked_user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_block_user ON blocks(blocker_id, blocked_user_id) WHERE blocked_user_id IS NOT NULL;

ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own blocks" ON blocks;
CREATE POLICY "Users see own blocks" ON blocks
  FOR SELECT USING (blocker_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own blocks" ON blocks;
CREATE POLICY "Users insert own blocks" ON blocks
  FOR INSERT WITH CHECK (blocker_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own blocks" ON blocks;
CREATE POLICY "Users delete own blocks" ON blocks
  FOR DELETE USING (blocker_id = auth.uid());

-- ============================================================
-- D. Reports (random-exchange safety)
-- ============================================================

CREATE TABLE IF NOT EXISTS gift_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  gift_id UUID REFERENCES gifts(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gift_reports_reported ON gift_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_gift_reports_open ON gift_reports(resolved) WHERE resolved = false;

ALTER TABLE gift_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reporters see own reports" ON gift_reports;
CREATE POLICY "Reporters see own reports" ON gift_reports
  FOR SELECT USING (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Anyone authed can file report" ON gift_reports;
CREATE POLICY "Anyone authed can file report" ON gift_reports
  FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Admins see all reports" ON gift_reports;
CREATE POLICY "Admins see all reports" ON gift_reports
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================================
-- E. Notifications: extend type enum + add updates
-- ============================================================

-- Add new notification types without losing existing rows.
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'gift_received','gift_accepted','gift_scheduled','gift_declined','gift_cancelled',
    'gift_completed','gift_decay_warning','reminder',
    'friend_request','friend_accepted',
    'system'
  ));

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- ============================================================
-- F. Random-exchange better matcher
-- ============================================================
-- Match by time-amount bucket so q1 and q2 trade comparable amounts.
-- Bucket = round time_amount to nearest 30 min. Pairs oldest within same bucket.

CREATE OR REPLACE FUNCTION match_random_exchange_pair()
RETURNS TABLE(gift_id_a UUID, gift_id_b UUID) AS $$
DECLARE
  q1 random_exchange_queue%ROWTYPE;
  q2 random_exchange_queue%ROWTYPE;
  new_a UUID;
  new_b UUID;
  q1_bucket INT;
BEGIN
  SELECT * INTO q1
    FROM random_exchange_queue
    WHERE matched = false
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN RETURN; END IF;

  q1_bucket := (q1.time_amount / 30) * 30;

  -- Try same bucket first.
  SELECT * INTO q2
    FROM random_exchange_queue
    WHERE matched = false
      AND id <> q1.id
      AND (time_amount / 30) * 30 = q1_bucket
      AND user_id <> q1.user_id
      -- Don't pair people who have blocked each other.
      AND NOT EXISTS (
        SELECT 1 FROM blocks
        WHERE (blocker_id = q1.user_id AND blocked_user_id = random_exchange_queue.user_id)
           OR (blocker_id = random_exchange_queue.user_id AND blocked_user_id = q1.user_id)
      )
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

  -- Fallback: any unmatched non-self non-blocked.
  IF NOT FOUND THEN
    SELECT * INTO q2
      FROM random_exchange_queue
      WHERE matched = false
        AND id <> q1.id
        AND user_id <> q1.user_id
        AND NOT EXISTS (
          SELECT 1 FROM blocks
          WHERE (blocker_id = q1.user_id AND blocked_user_id = random_exchange_queue.user_id)
             OR (blocker_id = random_exchange_queue.user_id AND blocked_user_id = q1.user_id)
        )
      ORDER BY created_at ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED;
  END IF;

  IF NOT FOUND THEN RETURN; END IF;

  INSERT INTO gifts (
    sender_id, recipient_id, message,
    time_amount, original_time_amount, time_unit,
    purpose_type, purpose_details,
    status, is_random_exchange
  ) VALUES (
    q1.user_id, q2.user_id,
    'A random act of kindness - sharing my time with you!',
    q1.time_amount, q1.time_amount, q1.time_unit,
    q1.purpose_type, q1.purpose_details,
    'pending', true
  ) RETURNING id INTO new_a;

  INSERT INTO gifts (
    sender_id, recipient_id, message,
    time_amount, original_time_amount, time_unit,
    purpose_type, purpose_details,
    status, is_random_exchange
  ) VALUES (
    q2.user_id, q1.user_id,
    'A random act of kindness - sharing my time with you!',
    q2.time_amount, q2.time_amount, q2.time_unit,
    q2.purpose_type, q2.purpose_details,
    'pending', true
  ) RETURNING id INTO new_b;

  UPDATE random_exchange_queue
    SET matched = true, matched_with = q2.user_id
    WHERE id = q1.id;

  UPDATE random_exchange_queue
    SET matched = true, matched_with = q1.user_id
    WHERE id = q2.id;

  gift_id_a := new_a;
  gift_id_b := new_b;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- G. Friendship RLS: tighten + add accept/reject by friend_id
-- ============================================================
-- Existing policy allows user_id OR friend_id to update. Keep that.

-- Helpful index for friend-checks on gift create.
CREATE INDEX IF NOT EXISTS idx_friendships_pair ON friendships(user_id, friend_id, status);

-- ============================================================
-- H. Gift RLS update: also allow viewing through claim_token via service role
-- ============================================================
-- No change needed - service role bypasses RLS for claim flow.

-- ============================================================
-- I. Default settings updates: softer decay, default channels
-- ============================================================

UPDATE admin_settings
SET setting_value = '{"enabled": true, "rate_percent": 2, "interval_days": 7, "grace_period_days": 7, "warning_lead_days": 1}'::jsonb
WHERE setting_key = 'time_decay';

-- random_exchange match bucket size (minutes) - used by RPC fallback when
-- exact bucket match misses. Currently RPC uses 30 min hard-coded; this is
-- recorded for future tuning.
UPDATE admin_settings
SET setting_value = setting_value || '{"bucket_minutes": 30}'::jsonb
WHERE setting_key = 'random_exchange';
