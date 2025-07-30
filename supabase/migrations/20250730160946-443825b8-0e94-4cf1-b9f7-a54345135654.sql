-- Fix security warnings

-- 1. Fix function search path - update the search_similar_images function
CREATE OR REPLACE FUNCTION public.search_similar_images(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.8,
  match_count int DEFAULT 10,
  filter_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  filename text,
  file_path text,
  description text,
  similarity float,
  metadata jsonb,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    i.id,
    i.filename,
    i.file_path,
    i.description,
    1 - (i.embedding <=> query_embedding) as similarity,
    i.metadata,
    i.created_at
  FROM public.images i
  WHERE 
    (filter_user_id IS NULL OR i.user_id = filter_user_id)
    AND 1 - (i.embedding <=> query_embedding) > match_threshold
  ORDER BY i.embedding <=> query_embedding
  LIMIT match_count;
$$;