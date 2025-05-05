
-- Check job application security enhancement
CREATE OR REPLACE FUNCTION public.check_job_application(p_craftsman_id uuid, p_job_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result jsonb;
BEGIN
  -- Verify user permissions
  IF auth.uid() IS NULL OR auth.uid() <> p_craftsman_id THEN
    RETURN jsonb_build_object('error', 'Unauthorized access', 'status', 403);
  END IF;

  -- Check if application exists
  SELECT jsonb_build_object(
    'status', 200,
    'data', jsonb_build_object(
      'exists', EXISTS (
        SELECT 1
        FROM public.job_applications
        WHERE craftsman_id = p_craftsman_id AND job_id = p_job_id
      )
    )
  ) INTO result;

  RETURN result;
END;
$function$;
