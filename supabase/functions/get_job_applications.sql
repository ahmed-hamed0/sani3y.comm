
-- Get job applications with security enhancement
CREATE OR REPLACE FUNCTION public.get_job_applications(job_id_param uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  job_client_id uuid;
  result jsonb;
BEGIN
  -- Get client ID for requested job
  SELECT client_id INTO job_client_id
  FROM public.jobs
  WHERE id = job_id_param;
  
  -- Security check - ensure user is authorized to see these applications
  -- Only the job owner or admin can view applications
  IF auth.uid() IS NULL OR (auth.uid() <> job_client_id AND NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
  )) THEN
    RETURN jsonb_build_object('error', 'Unauthorized access', 'status', 403);
  END IF;
  
  -- Get applications
  SELECT jsonb_build_object(
    'status', 200,
    'data', COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id', app.id,
          'craftsman_id', app.craftsman_id,
          'job_id', app.job_id,
          'proposal', app.proposal,
          'budget', app.budget,
          'status', app.status,
          'created_at', app.created_at,
          'craftsman', jsonb_build_object(
            'id', prof.id,
            'name', prof.full_name,
            'avatar', prof.avatar_url,
            'rating', prof.rating,
            'phone', prof.phone
          )
        )
      )
      FROM public.job_applications app
      JOIN public.profiles prof ON app.craftsman_id = prof.id
      WHERE app.job_id = job_id_param
      ORDER BY app.created_at DESC), 
      '[]'::jsonb
    )
  ) INTO result;
  
  RETURN result;
END;
$function$;
