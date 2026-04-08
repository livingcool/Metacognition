-- Mirror AI - Consolidated Restoration Schema
-- Version: 0b1d879-compatible
-- Date: 2026-04-08

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. TABLES

-- Users table (Primary target for Clerk Webhooks)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Clerk User ID
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Messages table (Core conversation history)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB, -- Stores patternDetected, dnaScores, question, choices, nodes, thinkingRationale
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cognitive Profiles table (DNA and Patterns)
CREATE TABLE IF NOT EXISTS cognitive_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  dominant_patterns JSONB DEFAULT '[]'::jsonb, -- Store patterns with resonance
  dna_history JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of DNAScore objects
  calibration_score INTEGER DEFAULT 0,
  belief_update_rate FLOAT DEFAULT 0,
  weekly_insight TEXT,
  radar_data JSONB DEFAULT '{
    "curiosity": 50,
    "analyticalDepth": 50,
    "skepticism": 50,
    "reflectiveTendency": 50,
    "openness": 50,
    "decisiveness": 50
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research Corpus (Static Knowledge Base)
CREATE TABLE IF NOT EXISTS research_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536), -- Gemini-compatible dimension
  author TEXT NOT NULL,
  year INTEGER NOT NULL,
  bias_categories TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session Chunks (User Memory Vector Store)
CREATE TABLE IF NOT EXISTS session_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536),
  pattern_surfaced TEXT,
  dna_scores JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Choices (Signal Logging)
CREATE TABLE IF NOT EXISTS user_choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  choice_id TEXT NOT NULL,
  choice_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Decisions table (Decision Archaeology)
CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  predicted_confidence INTEGER DEFAULT 50 CHECK (predicted_confidence >= 0 AND predicted_confidence <= 100), -- Defaulted to 50 for code compatibility
  assumptions JSONB NOT NULL DEFAULT '[]'::jsonb,
  outcome_note TEXT,
  actual_outcome_binary BOOLEAN,
  calibration_gap INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Daily Cognitive Snapshots (Analytics/Dashboard data)
CREATE TABLE IF NOT EXISTS daily_cognitive_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  calibration_score INTEGER NOT NULL,
  assumption_load INTEGER NOT NULL,
  belief_update_count INTEGER NOT NULL DEFAULT 0,
  dominant_bias TEXT,
  radar_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS research_embedding_idx ON research_chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS session_embedding_idx ON session_chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS messages_session_id_idx ON messages(session_id);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS user_choices_session_idx ON user_choices(session_id);

-- 4. FUNCTIONS (RPCs)

-- Search Research Corpus
CREATE OR REPLACE FUNCTION match_research_chunks (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  filename TEXT,
  content TEXT,
  author TEXT,
  year INTEGER,
  bias_categories TEXT[],
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    research_chunks.id,
    research_chunks.filename,
    research_chunks.content,
    research_chunks.author,
    research_chunks.year,
    research_chunks.bias_categories,
    1 - (research_chunks.embedding <=> query_embedding) AS similarity
  FROM research_chunks
  WHERE 1 - (research_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY research_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Search User/Session History
CREATE OR REPLACE FUNCTION match_session_chunks (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id TEXT
)
RETURNS TABLE (
  id UUID,
  session_id UUID,
  content TEXT,
  pattern_surfaced TEXT,
  dna_scores JSONB,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    session_chunks.id,
    session_chunks.session_id,
    session_chunks.content,
    session_chunks.pattern_surfaced,
    session_chunks.dna_scores,
    1 - (session_chunks.embedding <=> query_embedding) AS similarity
  FROM session_chunks
  WHERE session_chunks.user_id = p_user_id
    AND 1 - (session_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY session_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 5. RLS POLICIES
-- Enabling RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cognitive_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_cognitive_snapshots ENABLE ROW LEVEL SECURITY;

-- User Ownership Policies
DROP POLICY IF EXISTS "Users can view their own record" ON users;
CREATE POLICY "Users can view their own record" ON users FOR SELECT USING (auth.uid()::text = id);

DROP POLICY IF EXISTS "Users can manage their own sessions" ON sessions;
CREATE POLICY "Users can manage their own sessions" ON sessions FOR ALL USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can manage their own messages" ON messages;
CREATE POLICY "Users can manage their own messages" ON messages FOR ALL USING (
  EXISTS (SELECT 1 FROM sessions WHERE id = messages.session_id AND user_id = auth.uid()::text)
);

DROP POLICY IF EXISTS "Users can view their own profile" ON cognitive_profiles;
CREATE POLICY "Users can view their own profile" ON cognitive_profiles FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can manage their own session chunks" ON session_chunks;
CREATE POLICY "Users can manage their own session chunks" ON session_chunks FOR ALL USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can manage their own choices" ON user_choices;
CREATE POLICY "Users can manage their own choices" ON user_choices FOR ALL USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can manage their own decisions" ON decisions;
CREATE POLICY "Users can manage their own decisions" ON decisions FOR ALL USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can view their own snapshots" ON daily_cognitive_snapshots;
CREATE POLICY "Users can view their own snapshots" ON daily_cognitive_snapshots FOR SELECT USING (auth.uid()::text = user_id);

-- Research Access
DROP POLICY IF EXISTS "Research chunks are readable by all authenticated users" ON research_chunks;
CREATE POLICY "Research chunks are readable by all authenticated users" ON research_chunks FOR SELECT TO authenticated USING (true);
