-- Create a function to similarity search for research chunks
CREATE OR REPLACE FUNCTION match_research_chunks (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  filename text,
  content text,
  author text,
  year int,
  bias_categories text[],
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rc.id,
    rc.filename,
    rc.content,
    rc.author,
    rc.year,
    rc.bias_categories,
    1 - (rc.embedding <=> query_embedding) AS similarity
  FROM research_chunks rc
  WHERE 1 - (rc.embedding <=> query_embedding) > match_threshold
  ORDER BY rc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
