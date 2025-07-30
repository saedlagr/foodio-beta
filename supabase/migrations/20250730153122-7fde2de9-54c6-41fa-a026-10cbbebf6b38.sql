-- Add tokens column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN tokens INTEGER DEFAULT 0;

-- Create a tokens_transactions table to track token usage
CREATE TABLE public.tokens_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive for adding tokens, negative for spending
  type TEXT NOT NULL, -- 'purchase', 'usage', 'bonus', etc.
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tokens_transactions
ALTER TABLE public.tokens_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for tokens_transactions
CREATE POLICY "Users can view their own token transactions" 
ON public.tokens_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own token transactions" 
ON public.tokens_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to add tokens and create transaction record
CREATE OR REPLACE FUNCTION public.add_tokens(user_email TEXT, token_amount INTEGER, transaction_type TEXT DEFAULT 'bonus', transaction_description TEXT DEFAULT 'Token bonus')
RETURNS BOOLEAN AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT au.id INTO target_user_id
  FROM auth.users au
  WHERE au.email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update tokens in profiles
  UPDATE public.profiles 
  SET tokens = COALESCE(tokens, 0) + token_amount
  WHERE user_id = target_user_id;
  
  -- Create transaction record
  INSERT INTO public.tokens_transactions (user_id, amount, type, description)
  VALUES (target_user_id, token_amount, transaction_type, transaction_description);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create function to deduct tokens
CREATE OR REPLACE FUNCTION public.deduct_tokens(target_user_id UUID, token_amount INTEGER, transaction_description TEXT DEFAULT 'Token usage')
RETURNS BOOLEAN AS $$
DECLARE
  current_tokens INTEGER;
BEGIN
  -- Get current token count
  SELECT COALESCE(tokens, 0) INTO current_tokens
  FROM public.profiles 
  WHERE user_id = target_user_id;
  
  -- Check if user has enough tokens
  IF current_tokens < token_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct tokens
  UPDATE public.profiles 
  SET tokens = tokens - token_amount
  WHERE user_id = target_user_id;
  
  -- Create transaction record
  INSERT INTO public.tokens_transactions (user_id, amount, type, description)
  VALUES (target_user_id, -token_amount, 'usage', transaction_description);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Add 100 tokens to saedlagr@gmail.com account
SELECT public.add_tokens('saedlagr@gmail.com', 100, 'bonus', 'Initial testing tokens');