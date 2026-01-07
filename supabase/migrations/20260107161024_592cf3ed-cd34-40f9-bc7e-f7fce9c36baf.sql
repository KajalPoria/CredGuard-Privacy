-- Create a table for trust score history
CREATE TABLE public.trust_score_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL,
  change_reason TEXT,
  behavioral_metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trust_score_history ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own trust score history" 
ON public.trust_score_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trust score history" 
ON public.trust_score_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_trust_score_history_user_id ON public.trust_score_history(user_id);
CREATE INDEX idx_trust_score_history_created_at ON public.trust_score_history(created_at DESC);

-- Create trigger to record trust score changes
CREATE OR REPLACE FUNCTION public.record_trust_score_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.trust_score IS DISTINCT FROM NEW.trust_score THEN
    INSERT INTO public.trust_score_history (user_id, score, change_reason)
    VALUES (NEW.user_id, NEW.trust_score, 'Profile update');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER on_trust_score_change
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.record_trust_score_change();

-- Insert initial trust score history for existing users
INSERT INTO public.trust_score_history (user_id, score, change_reason)
SELECT user_id, COALESCE(trust_score, 750), 'Initial score'
FROM public.profiles
WHERE NOT EXISTS (
  SELECT 1 FROM public.trust_score_history h WHERE h.user_id = profiles.user_id
);