-- Disable RLS temporarily to unblock development retrieval
ALTER TABLE session_chunks DISABLE ROW LEVEL SECURITY;
ALTER TABLE research_chunks DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;

-- Ensure public access for now as per user request
DROP POLICY IF EXISTS "Users can manage their own session chunks" ON session_chunks;
DROP POLICY IF EXISTS "Public can view research" ON research_chunks;
DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
