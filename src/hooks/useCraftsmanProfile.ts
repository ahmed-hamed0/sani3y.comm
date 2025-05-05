
import { useState, useEffect } from 'react';
import { Craftsman } from '@/types/craftsman';
import { supabase } from '@/integrations/supabase/client';

export const useCraftsmanProfile = (id: string | undefined) => {
  const [craftsman, setCraftsman] = useState<Craftsman | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const loadCraftsmanProfile = async () => {
      try {
        setLoading(true);
        
        // Fetch craftsman profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(`
            id, 
            full_name, 
            avatar_url, 
            governorate, 
            city, 
            phone,
            rating,
            created_at
          `)
          .eq('id', id)
          .eq('role', 'craftsman')
          .single();
        
        if (profileError) {
          console.error('Error fetching craftsman profile:', profileError);
          setError('حدث خطأ أثناء تحميل بيانات الصنايعي');
          return;
        }
        
        if (!profile) {
          setError('لم يتم العثور على الصنايعي');
          return;
        }
        
        // Fetch craftsman details
        const { data: details, error: detailsError } = await supabase
          .from('craftsman_details')
          .select(`
            specialty,
            bio,
            skills,
            completed_jobs,
            experience_years,
            is_available,
            gallery
          `)
          .eq('id', id)
          .single();
        
        if (detailsError) {
          console.error('Error fetching craftsman details:', detailsError);
        }
        
        const craftsmanData: Craftsman = {
          id: profile.id,
          name: profile.full_name,
          specialty: details?.specialty || 'غير محدد',
          avatar: profile.avatar_url || undefined,
          bio: details?.bio || '',
          rating: profile.rating || 0,
          location: {
            governorate: profile.governorate || 'غير محدد',
            city: profile.city || 'غير محدد'
          },
          completedJobs: details?.completed_jobs || 0,
          skills: details?.skills || [],
          gallery: details?.gallery || [],
          experience: details?.experience_years || 0,
          isOnline: details?.is_available || false,
          availability: details?.is_available || false,
          createdAt: new Date(profile.created_at),
          phone: profile.phone || '',
          email: undefined, // Add the optional email property
          role: 'craftsman' // Add the role property
        };
        
        setCraftsman(craftsmanData);
      } catch (err) {
        console.error('Error in loadCraftsmanProfile:', err);
        setError('حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    };
    
    loadCraftsmanProfile();
  }, [id]);

  return {
    craftsman,
    loading,
    error
  };
};
