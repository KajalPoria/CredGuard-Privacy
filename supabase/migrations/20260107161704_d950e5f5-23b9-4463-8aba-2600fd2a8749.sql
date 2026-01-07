-- Add DELETE policy for loan_applications table
CREATE POLICY "Users can delete their own loan applications"
ON public.loan_applications
FOR DELETE
USING (auth.uid() = user_id);