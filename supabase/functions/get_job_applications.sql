
CREATE OR REPLACE FUNCTION public.get_job_applications(p_job_id UUID)
RETURNS TABLE(
  id UUID,
  job_id UUID,
  craftsman_id UUID,
  proposal TEXT,
  budget INTEGER,
  status TEXT,
  submitted_at TIMESTAMPTZ,
  craftsman_name TEXT,
  craftsman_avatar TEXT,
  craftsman_specialty TEXT,
  craftsman_rating NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ja.id,
    ja.job_id,
    ja.craftsman_id,
    ja.proposal,
    ja.budget,
    ja.status,
    ja.submitted_at,
    p.full_name AS craftsman_name,
    p.avatar_url AS craftsman_avatar,
    cd.specialty AS craftsman_specialty,
    p.rating AS craftsman_rating
  FROM 
    job_applications ja
    JOIN profiles p ON ja.craftsman_id = p.id
    LEFT JOIN craftsman_details cd ON ja.craftsman_id = cd.id
  WHERE 
    ja.job_id = p_job_id
  ORDER BY 
    ja.submitted_at DESC;
END;
$$;
