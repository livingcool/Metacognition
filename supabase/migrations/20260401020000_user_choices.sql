-- 1. Create table for user choices
CREATE TABLE IF NOT EXISTS user_choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  choice_id TEXT NOT NULL,
  choice_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add Index for fast analysis access
CREATE INDEX IF NOT EXISTS user_choices_user_id_idx ON user_choices(user_id);
CREATE INDEX IF NOT EXISTS user_choices_session_id_idx ON user_choices(session_id);

-- 3. Enable RLS
ALTER TABLE user_choices ENABLE ROW LEVEL SECURITY;

-- 4. Secure RLS policies
CREATE POLICY "Users can manage their own choice logs" ON user_choices FOR ALL USING (auth.uid()::text = user_id);
