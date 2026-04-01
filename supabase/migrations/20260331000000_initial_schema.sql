-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create Users table (Clerk sync target)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Clerk User ID
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- 4. Create Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB, -- Stores patternDetected, citation, dnaScores
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Cognitive Profiles table
CREATE TABLE IF NOT EXISTS cognitive_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  dominant_patterns TEXT[], -- e.g., ['overconfidence', 'certainty_surge']
  dna_history JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of DNAScore objects
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Research Corpus (Vector Store)
CREATE TABLE IF NOT EXISTS research_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-large dimension
  author TEXT NOT NULL,
  year INTEGER NOT NULL,
  bias_categories TEXT[] -- e.g., ['overconfidence', 'framing_effect']
);

-- 7. Create Indexes
CREATE INDEX IF NOT EXISTS research_embedding_idx ON research_chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS messages_session_id_idx ON messages(session_id);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cognitive_profiles ENABLE ROW LEVEL SECURITY;
-- research_chunks is publicly readable (or within app logic)
ALTER TABLE research_chunks ENABLE ROW LEVEL SECURITY;

-- 9. Basic RLS Policies (Draft)
CREATE POLICY "Users can view their own record" ON users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can manage their own sessions" ON sessions FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users can manage their own messages" ON messages FOR ALL USING (
  EXISTS (SELECT 1 FROM sessions WHERE id = messages.session_id AND user_id = auth.uid()::text)
);
CREATE POLICY "Users can view their own profile" ON cognitive_profiles FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Research chunks are readable by all authenticated users" ON research_chunks FOR SELECT TO authenticated USING (true);
