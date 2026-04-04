-- 1. Create a function to extract user_id from session context
-- This is a fallback for when a native Supabase-Clerk JWT handshake is not configured.
CREATE OR REPLACE FUNCTION mirror_auth_uid() RETURNS TEXT AS $$
  -- Try to get from JWT first (Standard Supabase Auth)
  -- Fallback to custom session variable 'mirror.user_id'
  SELECT 
    COALESCE(
      NULLIF(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', ''),
      current_setting('mirror.user_id', true)
    );
$$ LANGUAGE sql STABLE;

-- 2. Undo the temporary disablement of RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cognitive_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_cognitive_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_choices ENABLE ROW LEVEL SECURITY;

-- 3. DROP existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Users can view their own record" ON users;
DROP POLICY IF EXISTS "Users can manage their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can manage their own messages" ON messages;
DROP POLICY IF EXISTS "Users can view their own profile" ON cognitive_profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON cognitive_profiles;
DROP POLICY IF EXISTS "Public can view research" ON research_chunks;
DROP POLICY IF EXISTS "Research chunks are readable by all authenticated users" ON research_chunks;
DROP POLICY IF EXISTS "Research chunks are readable by active sessions" ON research_chunks;
DROP POLICY IF EXISTS "Users can manage their own session chunks" ON session_chunks;
DROP POLICY IF EXISTS "Users can manage their own decisions" ON decisions;
DROP POLICY IF EXISTS "Users can view their own snapshots" ON daily_cognitive_snapshots;
DROP POLICY IF EXISTS "Users can manage their own choices" ON user_choices;

-- 4. IMPLEMENT Hardened Policies using mirror_auth_uid()

-- USERS: Can only see their own identity record
CREATE POLICY "Users can view their own record" ON users 
  FOR SELECT USING (mirror_auth_uid() = id);

-- SESSIONS: Full access to own sessions
CREATE POLICY "Users can manage their own sessions" ON sessions 
  FOR ALL USING (mirror_auth_uid() = user_id);

-- MESSAGES: Can only access if the parent session belongs to the user
CREATE POLICY "Users can manage their own messages" ON messages 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = messages.session_id 
      AND sessions.user_id = mirror_auth_uid()
    )
  );

-- PROFILES: Select/Update own cognitive profile
CREATE POLICY "Users can manage their own profile" ON cognitive_profiles 
  FOR ALL USING (mirror_auth_uid() = user_id);

-- DECISIONS: Full access to own decisions
CREATE POLICY "Users can manage their own decisions" ON decisions 
  FOR ALL USING (mirror_auth_uid() = user_id);

-- SESSION CHUNKS: Full access to own session chunks
CREATE POLICY "Users can manage their own session chunks" ON session_chunks 
  FOR ALL USING (mirror_auth_uid() = user_id);

-- SNAPSHOTS: Read own longitudinal data
CREATE POLICY "Users can view their own snapshots" ON daily_cognitive_snapshots 
  FOR SELECT USING (mirror_auth_uid() = user_id);

-- CHOICES: Full access to own choices
CREATE POLICY "Users can manage their own choices" ON user_choices 
  FOR ALL USING (mirror_auth_uid() = user_id);

-- RESEARCH: Readable by any user with a valid session context
-- (In alpha, we allow all authenticated users to read the corpus)
CREATE POLICY "Research chunks are readable by active sessions" ON research_chunks 
  FOR SELECT USING (mirror_auth_uid() IS NOT NULL);

-- 5. Helper function for the API to set the session context securely
-- Note: This is usually called as part of a transaction or via SET LOCAL
CREATE OR REPLACE FUNCTION set_mirror_user(uid TEXT) RETURNS VOID AS $$
BEGIN
  PERFORM set_config('mirror.user_id', uid, true);
END;
$$ LANGUAGE plpgsql;
