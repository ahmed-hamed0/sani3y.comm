
CREATE OR REPLACE FUNCTION public.get_craftsman_reviews(p_craftsman_id UUID)
RETURNS TABLE(
  id UUID,
  rating INTEGER,
  comment TEXT,
  created_at TIMESTAMPTZ,
  reviewer_id UUID,
  reviewer_name TEXT,
  reviewer_avatar TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.rating,
    r.comment,
    r.created_at,
    r.reviewer_id,
    p.full_name AS reviewer_name,
    p.avatar_url AS reviewer_avatar
  FROM 
    reviews r
    JOIN profiles p ON r.reviewer_id = p.id
  WHERE 
    r.reviewed_id = p_craftsman_id
  ORDER BY 
    r.created_at DESC;
END;
$$;
