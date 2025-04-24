
import { Link } from 'react-router-dom';
import { Search, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/data/mockData';

const Hero = () => {
  return (
    <div className="bg-primary py-16 md:py-24">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Content */}
          <div className="w-full lg:w-1/2 text-center lg:text-right">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              ابحث عن أفضل الصنايعية <br />
              <span className="text-secondary">في منطقتك</span>
            </h1>
            
            <p className="text-white/90 text-lg md:text-xl mb-6">
              منصة تربط بين الصنايعية والعملاء بطريقة سهلة وموثوقة
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                asChild 
                className="bg-secondary hover:bg-secondary-dark text-black text-lg"
                size="lg"
              >
                <Link to="/sign-up">سجل كعميل</Link>
              </Button>
              <Button 
                asChild
                variant="outline" 
                className="border-white text-white hover:bg-white/10 text-lg"
                size="lg"
              >
                <Link to="/sign-up?role=craftsman">سجل كصنايعي</Link>
              </Button>
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-secondary" />
                <span className="text-white">خدمة سريعة</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-secondary" />
                <span className="text-white">صنايعية موثوقين</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-secondary" />
                <span className="text-white">سهولة في التواصل</span>
              </div>
            </div>
          </div>
          
          {/* Search Box */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-center">ابحث عن الخدمة التي تحتاجها</h2>
              <div className="flex items-center bg-gray-100 rounded-lg mb-6">
                <Search className="mx-3 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="ما هي الخدمة التي تبحث عنها؟"
                  className="bg-transparent border-none outline-none py-3 px-2 w-full"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {CATEGORIES.slice(0, 8).map(category => (
                  <Link 
                    key={category.id}
                    to={`/craftsmen?category=${category.id}`}
                    className="bg-gray-100 hover:bg-primary hover:text-white p-3 rounded-lg text-center transition-all card-hover"
                  >
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-white rounded-full mb-2">
                        {/* Use whatever icon is available for that category from lucide-react */}
                        <span className="text-primary">{category.name.charAt(0)}</span>
                      </div>
                      <span className="text-sm">{category.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
