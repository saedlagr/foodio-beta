-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('food-images', 'food-images', true);

-- Create images table for metadata and vector storage
CREATE TABLE public.images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  content_type TEXT,
  description TEXT,
  embedding vector(1536), -- For OpenAI embeddings
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on images table
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Create policies for images
CREATE POLICY "Users can view their own images" 
ON public.images 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own images" 
ON public.images 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own images" 
ON public.images 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create storage policies for food-images bucket
CREATE POLICY "Users can view their own food images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'food-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own food images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'food-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own food images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'food-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own food images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'food-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function for similarity search
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

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_images_updated_at
BEFORE UPDATE ON public.images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();