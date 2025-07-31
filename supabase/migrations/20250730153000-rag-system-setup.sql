-- Create knowledge_base table for RAG system
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(1536) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create vector similarity search function
CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE(
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.content,
    kb.metadata,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_base kb
  WHERE 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create policies for knowledge_base
CREATE POLICY "Enable read access for all users" 
ON public.knowledge_base 
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for service role" 
ON public.knowledge_base 
FOR INSERT 
TO 'service_role'
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_knowledge_base_updated_at
BEFORE UPDATE ON public.knowledge_base
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, tokens)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    10 -- Default 10 tokens for new users
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create tokens function if it doesn't exist
CREATE OR REPLACE FUNCTION public.deduct_tokens(
  target_user_id UUID,
  token_amount INTEGER,
  transaction_description TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_tokens INTEGER;
BEGIN
  -- Get current token count
  SELECT tokens INTO current_tokens
  FROM public.profiles
  WHERE user_id = target_user_id;
  
  -- Check if user has enough tokens
  IF current_tokens IS NULL OR current_tokens < token_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct tokens
  UPDATE public.profiles
  SET tokens = tokens - token_amount
  WHERE user_id = target_user_id;
  
  -- Log transaction
  INSERT INTO public.token_transactions (
    user_id,
    amount,
    type,
    description,
    balance_after
  )
  VALUES (
    target_user_id,
    -token_amount,
    'deduction',
    transaction_description,
    current_tokens - token_amount
  );
  
  RETURN TRUE;
END;
$$;

-- Add tokens function
CREATE OR REPLACE FUNCTION public.add_tokens(
  target_user_id UUID,
  token_amount INTEGER,
  transaction_description TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_tokens INTEGER;
BEGIN
  -- Get current token count
  SELECT tokens INTO current_tokens
  FROM public.profiles
  WHERE user_id = target_user_id;
  
  IF current_tokens IS NULL THEN
    current_tokens := 0;
  END IF;
  
  -- Add tokens
  UPDATE public.profiles
  SET tokens = tokens + token_amount
  WHERE user_id = target_user_id;
  
  -- Log transaction
  INSERT INTO public.token_transactions (
    user_id,
    amount,
    type,
    description,
    balance_after
  )
  VALUES (
    target_user_id,
    token_amount,
    'addition',
    transaction_description,
    current_tokens + token_amount
  );
  
  RETURN TRUE;
END;
$$;

-- Create token_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.token_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('addition', 'deduction')),
  description TEXT,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for token_transactions
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for token_transactions
CREATE POLICY "Users can view their own transactions" 
ON public.token_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding ON public.knowledge_base USING hnsw (embedding vector_cosine_ops);

-- Add column for tokens in profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'tokens') THEN
    ALTER TABLE public.profiles ADD COLUMN tokens INTEGER DEFAULT 10;
  END IF;
END $$;