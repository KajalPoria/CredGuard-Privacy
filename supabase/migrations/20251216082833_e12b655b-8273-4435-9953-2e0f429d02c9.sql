-- Create loan_applications table to track loan history
CREATE TABLE public.loan_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  purpose TEXT,
  tenure INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  eligibility TEXT,
  recommended_min DECIMAL(12,2),
  recommended_max DECIMAL(12,2),
  risk_score INTEGER,
  fraud_likelihood DECIMAL(4,1),
  fairness_score INTEGER,
  cryptographic_proof TEXT,
  reasoning TEXT[],
  decision_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own loan applications"
ON public.loan_applications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loan applications"
ON public.loan_applications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loan applications"
ON public.loan_applications
FOR UPDATE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_loan_applications_updated_at
BEFORE UPDATE ON public.loan_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();