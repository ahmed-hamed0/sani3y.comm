
import { Check, UserPlus, Search, MessageSquare, Star } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <UserPlus className="w-10 h-10 text-primary" />,
      title: 'أنشئ حسابك',
      description: 'قم بإنشاء حساب جديد على المنصة سواء كنت عميل أو صنايعي'
    },
    {
      icon: <Search className="w-10 h-10 text-primary" />,
      title: 'ابحث عن الخدمة',
      description: 'اختر الخدمة التي تحتاجها أو تصفح المهام المتاحة'
    },
    {
      icon: <MessageSquare className="w-10 h-10 text-primary" />,
      title: 'تواصل مع الصنايعي',
      description: 'تواصل مباشرة مع الصنايعي لمناقشة تفاصيل المهمة'
    },
    {
      icon: <Check className="w-10 h-10 text-primary" />,
      title: 'أتمم المهمة',
      description: 'بعد إتمام المهمة، يمكنك تقييم الخدمة المقدمة'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">كيف تعمل المنصة</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            نوفر لك أسهل طريقة للعثور على صنايعية محترفين لمساعدتك في إصلاح أو تنفيذ المهام التي تحتاجها
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6 bg-neutral rounded-lg card-hover">
              <div className="mb-4 bg-primary/10 p-4 rounded-full">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
              <div className="mt-4 bg-gray-200 text-primary font-bold w-8 h-8 rounded-full flex items-center justify-center">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
