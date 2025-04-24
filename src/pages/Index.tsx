
import MainLayout from '@/components/layouts/MainLayout';
import Hero from '@/components/home/Hero';
import HowItWorks from '@/components/home/HowItWorks';
import FeaturedCraftsmen from '@/components/home/FeaturedCraftsmen';
import FeaturedJobs from '@/components/home/FeaturedJobs';
import Testimonials from '@/components/home/Testimonials';
import CallToAction from '@/components/home/CallToAction';

const Index = () => {
  return (
    <MainLayout>
      <Hero />
      <HowItWorks />
      <FeaturedCraftsmen />
      <FeaturedJobs />
      <Testimonials />
      <CallToAction />
    </MainLayout>
  );
};

export default Index;
