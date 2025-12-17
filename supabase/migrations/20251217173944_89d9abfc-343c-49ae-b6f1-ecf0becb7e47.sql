-- Add institution columns to loan_applications
ALTER TABLE public.loan_applications 
ADD COLUMN institution_name TEXT,
ADD COLUMN institution_country TEXT DEFAULT 'Global';

-- Create index for faster queries
CREATE INDEX idx_loan_applications_institution ON public.loan_applications(institution_name);