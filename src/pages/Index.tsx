
import { useEffect, useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import Hero from '@/components/home/Hero';
import HowItWorks from '@/components/home/HowItWorks';
import FeaturedCraftsmen from '@/components/home/FeaturedCraftsmen';
import FeaturedJobs from '@/components/home/FeaturedJobs';
import Testimonials from '@/components/home/Testimonials';
import CallToAction from '@/components/home/CallToAction';
import { supabase } from '@/integrations/supabase/client';

interface CraftsmanData {
  id: string;
  name: string;
  specialty: string;
  avatar: string | undefined;
  rating: number;
  location: {
    governorate: string;
    city: string;
  };
  completedJobs: number;
  availability: boolean;
  isOnline: boolean;
}

interface JobData {
  id: string;
  title: string;
  description: string;
  category: string;
  location: {
    governorate: string;
    city: string;
  };
  budget?: {
    min: number;
    max: number;
  };
  clientId: string;
  status: 'open' | 'assigned' | 'completed';
  postedAt: Date;
}

const Index = () => {
  const [topCraftsmen, setTopCraftsmen] = useState<CraftsmanData[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobData[]>([]);

  useEffect(() => {
    const loadTopCraftsmen = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            avatar_url,
            governorate,
            city,
            rating,
            role,
            craftsman_details (
              specialty,
              bio,
              completed_jobs,
              is_available
            )
          `)
          .eq('role', 'craftsman')
          .order('rating', { ascending: false })
          .limit(4);

        if (error) {
          console.error('Error loading top craftsmen:', error);
          return;
        }

        if (data) {
          const formattedCraftsmen = data
            .filter(item => item.craftsman_details)
            .map(item => ({
              id: item.id,
              name: item.full_name,
              specialty: item.craftsman_details?.specialty || 'غير محدد',
              avatar: item.avatar_url || undefined,
              rating: item.rating || 0,
              location: {
                governorate: item.governorate,
                city: item.city
              },
              completedJobs: item.craftsman_details?.completed_jobs || 0,
              availability: item.craftsman_details?.is_available || false,
              isOnline: item.craftsman_details?.is_available || false
            }));

          setTopCraftsmen(formattedCraftsmen);
        }
      } catch (error) {
        console.error('Error in loadTopCraftsmen:', error);
      }
    };

    const loadRecentJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) {
          console.error('Error loading recent jobs:', error);
          return;
        }

        if (data && data.length > 0) {
          const formattedJobs = data.map(job => ({
            id: job.id,
            title: job.title,
            description: job.description,
            category: job.category,
            location: {
              governorate: job.governorate,
              city: job.city
            },
            budget: job.budget_min && job.budget_max 
              ? { min: job.budget_min, max: job.budget_max } 
              : undefined,
            clientId: job.client_id,
            status: job.status as 'open' | 'assigned' | 'completed',
            postedAt: new Date(job.created_at)
          }));

          setRecentJobs(formattedJobs);
        }
      } catch (error) {
        console.error('Error in loadRecentJobs:', error);
      }
    };

    loadTopCraftsmen();
    loadRecentJobs();
  }, []);

  return (
    <MainLayout>
      <Hero />
      {recentJobs.length > 0 && <FeaturedJobs jobs={recentJobs} />}
      {topCraftsmen.length > 0 && <FeaturedCraftsmen craftsmen={topCraftsmen} />}
      <HowItWorks />
      <Testimonials />
      <CallToAction />
    </MainLayout>
  );
};

export default Index;
