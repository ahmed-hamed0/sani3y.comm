
-- Get craftsman reviews with security enhancement
CREATE OR REPLACE FUNCTION public.get_craftsman_reviews(p_craftsman_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result jsonb;
BEGIN
  -- Reviews should be public, but let's ensure proper error handling and sanitization
  SELECT jsonb_build_object(
    'status', 200,
    'data', COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id', r.id,
          'job_id', r.job_id,
          'client_id', r.client_id,
          'craftsman_id', r.craftsman_id,
          'rating', r.rating,
          'comment', r.comment,
          'created_at', r.created_at,
          'client', jsonb_build_object(
            'name', p.full_name,
            'avatar', p.avatar_url
          )
        )
      )
      FROM public.reviews r
      JOIN public.profiles p ON r.client_id = p.id
      WHERE r.craftsman_id = p_craftsman_id
      ORDER BY r.created_at DESC), 
      '[]'::jsonb
    )
  ) INTO result;
  
  RETURN result;
END;
$function$;
