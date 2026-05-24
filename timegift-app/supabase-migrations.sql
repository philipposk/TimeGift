-- Idempotent additions to base schema (supabase-schema.sql).
-- Run after the base schema in Supabase SQL editor.

-- Memory fields on gifts (used by /memories page + AddMemoryModal)
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS memory_photo_url TEXT;
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS memory_story TEXT;
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS memory_location TEXT;
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS memory_created_at TIMESTAMPTZ;

-- Per-user rate limit ledger for AI endpoints
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user_window ON ai_usage(user_id, created_at);

ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own AI usage" ON ai_usage;
CREATE POLICY "Users can view their own AI usage" ON ai_usage
  FOR SELECT USING (user_id = auth.uid());

-- Atomic random-exchange pair matching.
-- Pairs the two oldest unmatched queue entries, creates the two mutual gifts,
-- and flips both queue rows to matched in one transaction.
-- Returns the gift IDs created (empty array if no pair available).
CREATE OR REPLACE FUNCTION match_random_exchange_pair()
RETURNS TABLE(gift_id_a UUID, gift_id_b UUID) AS $$
DECLARE
  q1 random_exchange_queue%ROWTYPE;
  q2 random_exchange_queue%ROWTYPE;
  new_a UUID;
  new_b UUID;
BEGIN
  -- Lock the two oldest unmatched entries so concurrent runs don't collide.
  SELECT * INTO q1
    FROM random_exchange_queue
    WHERE matched = false
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN RETURN; END IF;

  SELECT * INTO q2
    FROM random_exchange_queue
    WHERE matched = false AND id <> q1.id
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

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

-- Storage bucket for memory photos (idempotent via DO block)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'memories') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('memories', 'memories', true);
  END IF;
END $$;

-- Allow authed users to upload to memories/{auth.uid()}/...
DROP POLICY IF EXISTS "Users upload own memory photos" ON storage.objects;
CREATE POLICY "Users upload own memory photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'memories' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Public can read memory photos" ON storage.objects;
CREATE POLICY "Public can read memory photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'memories');
