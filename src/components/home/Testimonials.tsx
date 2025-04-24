
import { useState } from 'react';
import { Star } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  text: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'أحمد محمد',
    role: 'عميل',
    avatar: '/placeholder.svg',
    text: 'وجدت صنايعي ممتاز من خلال المنصة ساعدني في إصلاح مشكلة كهرباء معقدة كانت تواجهني. كان محترف جداً وأنجز العمل بسرعة ودقة.',
    rating: 5
  },
  {
    id: 2,
    name: 'سارة علي',
    role: 'عميل',
    avatar: '/placeholder.svg',
    text: 'استخدمت المنصة للعثور على سباك لإصلاح تسريب في مطبخي. وصل في الموعد المحدد وأنهى العمل باحترافية. سأستخدم المنصة مرة أخرى بالتأكيد.',
    rating: 4
  },
  {
    id: 3,
    name: 'محمود إبراهيم',
    role: 'صنايعي',
    avatar: '/placeholder.svg',
    text: 'منصة رائعة ساعدتني في الوصول إلى عملاء جدد وزيادة دخلي. التقييمات التي أحصل عليها ساعدت في بناء سمعة جيدة لي كنقاش محترف.',
    rating: 5
  }
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex(prev => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex(prev => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-16 bg-primary/5">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">آراء المستخدمين</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            تعرف على آراء عملائنا وصنايعيتنا في تجربة استخدام المنصة
          </p>
        </div>

        <div className="max-w-3xl mx-auto relative">
          {/* Current testimonial */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row md:items-center mb-6">
              <img 
                src={testimonials[activeIndex].avatar} 
                alt={testimonials[activeIndex].name}
                className="w-16 h-16 rounded-full object-cover mx-auto md:mx-0"
              />
              <div className="mt-4 md:mt-0 md:mr-4 text-center md:text-right">
                <h3 className="font-bold text-lg">{testimonials[activeIndex].name}</h3>
                <p className="text-gray-600">{testimonials[activeIndex].role}</p>
                <div className="flex justify-center md:justify-start mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${i < testimonials[activeIndex].rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <blockquote className="text-gray-700 text-lg">
              "{testimonials[activeIndex].text}"
            </blockquote>
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center mt-6 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full ${
                  index === activeIndex ? 'bg-primary' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation arrows */}
          <button
            onClick={handlePrev}
            className="absolute top-1/2 -translate-y-1/2 right-0 md:-right-12 bg-white rounded-full p-2 shadow-md"
            aria-label="Previous testimonial"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0L5.414 10l5.879-5.879a1 1 0 011.414 1.414L8.328 10l5.793 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute top-1/2 -translate-y-1/2 left-0 md:-left-12 bg-white rounded-full p-2 shadow-md"
            aria-label="Next testimonial"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 4.293a1 1 0 011.414 0L14.586 10l-5.879 5.879a1 1 0 01-1.414-1.414L11.672 10 5.879 4.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
