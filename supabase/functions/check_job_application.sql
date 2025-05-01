
CREATE OR REPLACE FUNCTION public.check_job_application(p_job_id UUID, p_craftsman_id UUID)
RETURNS TABLE(exists BOOLEAN) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT EXISTS (
    SELECT 1
    FROM job_applications
    WHERE job_id = p_job_id
    AND craftsman_id = p_craftsman_id
  );
END;
$$;
