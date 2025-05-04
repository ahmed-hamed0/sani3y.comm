
CREATE TABLE IF NOT EXISTS public.user_applications_count (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  free_applications_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_applications_count ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own application count" 
ON public.user_applications_count 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own application count" 
ON public.user_applications_count 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own application count" 
ON public.user_applications_count 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_applications_count_updated_at
BEFORE UPDATE ON public.user_applications_count
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

