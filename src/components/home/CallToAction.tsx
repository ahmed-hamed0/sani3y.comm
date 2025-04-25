
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CallToAction = () => {
  return (
    <section className="py-16 bg-accent text-white">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">انضم إلينا اليوم وابدأ رحلتك مع صنايعي.كوم</h2>
          <p className="text-xl text-white/80 mb-8">
            سواء كنت تبحث عن صنايعي محترف أو كنت صنايعي يبحث عن فرص عمل، هذه هي المنصة المثالية لك
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-black">
              <Link to="/sign-up">تسجيل حساب جديد</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-accent-dark hover:bg-accent-dark/90 text-white">
              <Link to="/about">معرفة المزيد</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
