-- 1. Create session_chunks table
CREATE TABLE IF NOT EXISTS session_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536), -- Truncated text-embedding-004 or OpenAI large
  pattern_surfaced TEXT,
  dna_scores JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add Index
CREATE INDEX IF NOT EXISTS session_embedding_idx ON session_chunks USING ivfflat (embedding vector_cosine_ops);

-- 3. RLS Policies
ALTER TABLE session_chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own session chunks" ON session_chunks FOR ALL USING (auth.uid()::text = user_id);

-- 4. RPC: match_research_chunks
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

-- 5. RPC: match_session_chunks
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
