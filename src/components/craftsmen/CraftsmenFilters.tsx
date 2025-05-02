
import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES } from '@/data/mockData';

// Define Egyptian governorates
const GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "القليوبية", "الدقهلية", "الشرقية", "الغربية", 
  "المنوفية", "البحيرة", "كفر الشيخ", "دمياط", "بورسعيد", "الإسماعيلية", "السويس", 
  "الفيوم", "بني سويف", "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان", 
  "البحر الأحمر", "الوادي الجديد", "مطروح", "شمال سيناء", "جنوب سيناء"
];

// Define cities for each governorate
const CITIES = {
  "القاهرة": [
    "وسط البلد", "المعادي", "مدينة نصر", "مصر الجديدة", "العباسية", "حلوان", "شبرا", 
    "عين شمس", "التجمع الخامس", "الزمالك", "المرج", "السيدة زينب", "المطرية", "الوايلي", 
    "المنيل", "الخانكة", "العبور", "القاهرة الجديدة", "الشيخ زايد", "بدر", "15 مايو", 
    "المقطم", "النزهة", "الزيتون", "الزاوية الحمراء", "السلام", "طرة", "دار السلام", 
    "البساتين", "حدائق القبة", "الماظة", "مصر القديمة", "منشأة ناصر", "غرب القاهرة", 
    "شرق القاهرة"
  ],
  "الجيزة": [
    "6 أكتوبر", "بولاق الدكرور", "الدقي", "العجوزة", "الهرم", "البدرشين", "كرداسة", 
    "أطفيح", "الصف", "العياط", "الواحات البحرية", "منشأة القناطر", "أوسيم", "كفر حكيم", 
    "أبو النمرس", "الوراق", "المنيب", "إمبابة", "المناشي", "العمرانية", "الطالبية", 
    "أبو رواش", "كفر غطاطي"
  ],
  "الإسكندرية": [
    "العجمي", "سيدي جابر", "المنتزه", "العصافرة", "محرم بك", "سموحة", "العامرية", 
    "باكوس", "الورديان", "الأنفوشي", "كامب شيزار", "رأس التين", "المندرة", "السيوف", 
    "البيطاش", "الابراهيمية", "الظاهرية", "اللبان", "السرايا", "المنشية", "كليوباترا", 
    "المعمورة"
  ],
  "القليوبية": [
    "بنها", "قليوب", "شبرا الخيمة", "القناطر الخيرية", "طوخ", "كفر شكر", "الخانكة", 
    "العبور", "الخصوص", "شبين القناطر", "كفر طحلة", "قلما", "أبو زعبل", "الزهور", 
    "التلين", "المنصورة الجديدة"
  ],
  "الدقهلية": [
    "المنصورة", "طلخا", "ميت غمر", "بلقاس", "شربين", "دكرنس", "السنبلاوين", "منية النصر", 
    "الجمالية", "تمي الأمديد", "المطرية", "بني عبيد", "أجا", "ميت سلسيل", "المنزلة", 
    "ميت الخولى", "السنبلاوين الجديدة"
  ],
  "الشرقية": [
    "الزقازيق", "العاشر من رمضان", "أبو كبير", "فاقوس", "ههيا", "الإبراهيمية", "كفر صقر", 
    "أولاد صقر", "مشتول السوق", "بلبيس", "منيا القمح", "الصالحية الجديدة", "أبو حماد", 
    "القرين", "ديرب نجم", "كفر صقر الجديدة"
  ],
  "الغربية": [
    "طنطا", "المحلة الكبرى", "زفتى", "كفر الزيات", "السنطة", "سمنود", "بسيون", "قطور", 
    "شبرا ملس", "قطور الجديدة"
  ],
  "المنوفية": [
    "شبين الكوم", "منوف", "تلا", "الباجور", "أشمون", "بركة السبع", "قويسنا", "السادات", 
    "سرس الليان", "منوف الجديدة"
  ],
  "البحيرة": [
    "دمنهور", "كفر الدوار", "رشيد", "إدكو", "المحمودية", "إيتاي البارود", "أبو حمص", 
    "الدلنجات", "حوش عيسى", "وادي النطرون", "كوم حمادة", "شبراخيت", "النوبارية", "وادي النطرون الجديدة"
  ],
  "كفر الشيخ": [
    "كفر الشيخ", "دسوق", "فوه", "بيلا", "مطوبس", "الحامول", "سيدي سالم", "الرياض", 
    "بلطيم", "برج البرلس", "سيدي غازي", "الحامول الجديدة"
  ],
  "دمياط": [
    "دمياط", "فارسكور", "الزرقا", "كفر سعد", "رأس البر", "عزبة البرج", "ميت أبو غالب", 
    "كفر البطيخ", "السرو", "الروضة", "دمياط الجديدة"
  ],
  "بورسعيد": [
    "بورسعيد", "حي الضواحي", "حي الجنوب", "بور فؤاد", "حي الشرق", "حي الغرب", "حي المناخ", 
    "بورسعيد الجديدة"
  ],
  "الإسماعيلية": [
    "الإسماعيلية", "فايد", "القنطرة شرق", "التل الكبير", "أبو صوير", "القصاصين", 
    "التل الكبير الجديدة"
  ],
  "السويس": [
    "السويس", "حي الأربعين", "حي الجناين", "عتاقة", "السويس الجديدة"
  ],
  "الفيوم": [
    "الفيوم", "طامية", "سنورس", "إطسا", "يوسف الصديق", "أبشواي", "طامية الجديدة"
  ],
  "بني سويف": [
    "بني سويف", "الواسطي", "ناصر", "إهناسيا", "ببا", "سمسطا", "الفشن", "بني سويف الجديدة"
  ],
  "المنيا": [
    "المنيا", "ملوي", "دير مواس", "مغاغة", "بني مزار", "مطاي", "سمالوط", "أبو قرقاص", 
    "المنيا الجديدة"
  ],
  "أسيوط": [
    "أسيوط", "ديروط", "أبنوب", "صدفا", "القوصية", "منفلوط", "الغنايم", "أبو تيج", 
    "ساحل سليم", "أسيوط الجديدة"
  ],
  "سوهاج": [
    "سوهاج", "جرجا", "طهطا", "البلينا", "أخميم", "المراغة", "جهينة", "ساقلته", 
    "دار السلام", "سوهاج الجديدة"
  ],
  "قنا": [
    "قنا", "قوص", "نقادة", "دشنا", "أبو تشت", "نجع حمادي", "الوقف", "فرشوط", "قفط", 
    "قنا الجديدة"
  ],
  "الأقصر": [
    "الأقصر", "إسنا", "الزينية", "البياضية", "القرنة", "أرمنت", "الطود", "الأقصر الجديدة"
  ],
  "أسوان": [
    "أسوان", "كوم أمبو", "دراو", "نصر النوبة", "إدفو", "كلابشة", "أسوان الجديدة"
  ],
  "البحر الأحمر": [
    "الغردقة", "مرسى علم", "رأس غارب", "سفاجا", "القصير", "حلايب", "شلاتين", "الغردقة الجديدة"
  ],
  "الوادي الجديد": [
    "الخارجة", "الداخلة", "الفرافرة", "باريس", "بلاط", "الوادي الجديد"
  ],
  "مطروح": [
    "مرسى مطروح", "الحمام", "العلمين", "سيوة", "الضبعة", "النجيلة", "سيدي براني", 
    "السلوم", "مطروح الجديدة"
  ],
  "شمال سيناء": [
    "العريش", "الشيخ زويد", "رفح", "بئر العبد", "الحسنة", "نخل", "شمال سيناء الجديدة"
  ],
  "جنوب سيناء": [
    "شرم الشيخ", "دهب", "نويبع", "طابا", "الطور", "سانت كاترين", "أبو رديس", "أبو زنيمة", 
    "رأس سدر", "جنوب سيناء الجديدة"
  ]
} as const;

interface CraftsmenFiltersProps {
  onFilterChange: (filters: any) => void;
}

const CraftsmenFilters = ({ onFilterChange }: CraftsmenFiltersProps) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [city, setCity] = useState('');
  const [rating, setRating] = useState([0]); // Using 0 as the starting rating
  
  // Get cities based on selected governorate
  const cities = governorate ? CITIES[governorate as keyof typeof CITIES] || [] : [];
  
  const handleApplyFilters = () => {
    onFilterChange({
      searchTerm,
      category,
      governorate,
      city,
      minRating: rating[0],
    });
    setShowMobileFilters(false);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setGovernorate('');
    setCity('');
    setRating([0]);
    onFilterChange({});
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">البحث والفلترة</h2>
        <Button
          variant="outline"
          size="sm"
          className="md:hidden"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <Filter className="h-4 w-4 ml-2" />
          الفلاتر
        </Button>
      </div>

      {/* Search Input - Always visible */}
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="ابحث عن اسم أو تخصص..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Filters - togglable on mobile */}
      <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block space-y-4`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">التخصص</Label>
            <Select
              value={category}
              onValueChange={setCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="جميع التخصصات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التخصصات</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="governorate">المحافظة</Label>
            <Select
              value={governorate}
              onValueChange={(val) => {
                setGovernorate(val);
                setCity(''); // Reset city when governorate changes
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="جميع المحافظات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المحافظات</SelectItem>
                {GOVERNORATES.map(gov => (
                  <SelectItem key={gov} value={gov}>
                    {gov}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="city">المدينة</Label>
            <Select
              value={city}
              onValueChange={setCity}
              disabled={!governorate}
            >
              <SelectTrigger>
                <SelectValue placeholder={!governorate ? "اختر المحافظة أولاً" : "جميع المدن"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المدن</SelectItem>
                {cities.map(c => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="rating" className="mb-6 block">الحد الأدنى للتقييم: {rating[0]}</Label>
            <Slider
              id="rating"
              min={0} 
              max={5}
              step={1}
              value={rating}
              onValueChange={setRating}
              className="mt-6"
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button onClick={handleApplyFilters} className="flex-1">
            تطبيق الفلاتر
          </Button>
          <Button onClick={handleClearFilters} variant="outline" className="flex-1">
            إعادة ضبط
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CraftsmenFilters;
