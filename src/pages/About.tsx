
import MainLayout from '@/components/layouts/MainLayout';

const About = () => {
  return (
    <MainLayout>
      <div className="container-custom py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">عن منصة صنايعي.كوم</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4 text-primary">من نحن</h2>
          <p className="text-lg mb-6 leading-relaxed text-gray-700">
            صنايعي دوت كوم هي منصة إلكترونية مبتكرة تهدف إلى ربط أصحاب المهارات والحرفيين المحترفين بالعملاء الذين يبحثون عن خدماتهم. 
            نسعى لتوفير منصة سهلة الاستخدام تساعد على إيجاد صنايعية موثوقين ومحترفين في مختلف المجالات مثل السباكة، الكهرباء، النجارة، الدهانات وغيرها.
          </p>
          
          <h2 className="text-2xl font-bold mb-4 text-primary">رؤيتنا</h2>
          <p className="text-lg mb-6 leading-relaxed text-gray-700">
            نطمح أن نكون المنصة الرائدة في مجال ربط الصنايعية بالعملاء في الوطن العربي، وأن نساهم في تطوير قطاع الخدمات المنزلية والاحترافية من خلال بناء شبكة قوية من الحرفيين المهرة والعملاء السعداء.
          </p>
          
          <h2 className="text-2xl font-bold mb-4 text-primary">مهمتنا</h2>
          <p className="text-lg mb-6 leading-relaxed text-gray-700">
            تتمثل مهمتنا في توفير تجربة سلسلة وآمنة لكل من الصنايعية والعملاء، وتسهيل عملية البحث والتواصل وتنفيذ المهام بشكل يضمن رضا جميع الأطراف. نسعى لرفع مستوى الخدمات المقدمة وتوفير فرص عمل أفضل للصنايعية المحترفين.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              ١
            </div>
            <h3 className="text-xl font-bold mb-3">سهولة الاستخدام</h3>
            <p className="text-gray-600">
              منصة بسيطة وسهلة الاستخدام، تمكن المستخدمين من البحث بسهولة والتواصل مع الصنايعية.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              ٢
            </div>
            <h3 className="text-xl font-bold mb-3">صنايعية موثوقين</h3>
            <p className="text-gray-600">
              نضمن أن جميع الصنايعية على منصتنا موثوقين ومحترفين من خلال نظام التقييمات والمراجعات.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              ٣
            </div>
            <h3 className="text-xl font-bold mb-3">تواصل فعال</h3>
            <p className="text-gray-600">
              نظام مراسلة داخلي يسهل التواصل بين العملاء والصنايعية لمناقشة تفاصيل المهام.
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-primary text-center">الأسئلة الشائعة</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-2">كيف أنشئ حساب على المنصة؟</h3>
              <p className="text-gray-700">
                يمكنك إنشاء حساب بسهولة من خلال الضغط على "تسجيل جديد" واختيار نوع الحساب (عميل أو صنايعي) وملء البيانات المطلوبة.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-2">كيف يتم الدفع مقابل الخدمات؟</h3>
              <p className="text-gray-700">
                حالياً، يتم الاتفاق على طريقة الدفع بين العميل والصنايعي مباشرة. نحن نعمل على إضافة نظام دفع آمن داخل المنصة قريباً.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-2">هل يمكنني إلغاء مهمة بعد نشرها؟</h3>
              <p className="text-gray-700">
                نعم، يمكنك إلغاء المهمة طالما لم يتم قبولها من قبل أي صنايعي. بعد قبول المهمة، يرجى التواصل مع الصنايعي للاتفاق على الإلغاء.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-2">كيف يتم اختيار أفضل الصنايعية؟</h3>
              <p className="text-gray-700">
                يتم عرض الصنايعية حسب التقييمات والمراجعات من العملاء السابقين، بالإضافة إلى عدد المهام المكتملة وسرعة الاستجابة.
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-lg mb-4">
            هل لديك أسئلة أخرى أو اقتراحات؟ لا تتردد في التواصل معنا
          </p>
          <a href="mailto:info@sanaaie.com" className="text-primary hover:underline text-lg font-semibold">
            info@sanaaie.com
          </a>
        </div>
      </div>
    </MainLayout>
  );
};

export default About;
