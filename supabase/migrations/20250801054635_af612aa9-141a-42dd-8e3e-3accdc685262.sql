-- Create processing_jobs table to track image enhancement status
CREATE TABLE public.processing_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  original_image_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  enhanced_image_url TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own processing jobs" 
ON public.processing_jobs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own processing jobs" 
ON public.processing_jobs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can update processing jobs" 
ON public.processing_jobs 
FOR UPDATE 
USING (true);

-- Add foreign key reference to images table
ALTER TABLE public.processing_jobs 
ADD CONSTRAINT fk_processing_jobs_original_image 
FOREIGN KEY (original_image_id) REFERENCES public.images(id);

-- Add foreign key reference to user
ALTER TABLE public.processing_jobs 
ADD CONSTRAINT fk_processing_jobs_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_processing_jobs_updated_at
BEFORE UPDATE ON public.processing_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for processing_jobs table
ALTER publication supabase_realtime ADD TABLE public.processing_jobs;

-- Set replica identity for full row data in realtime updates
ALTER TABLE public.processing_jobs REPLICA IDENTITY FULL;