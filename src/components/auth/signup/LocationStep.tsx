import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { RegisterFormValues } from "@/lib/auth";
import { Spinner } from "@/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

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

interface LocationStepProps {
  form: UseFormReturn<RegisterFormValues>;
  role: string;
  isLoading: boolean;
  onPrevStep: () => void;
  onNextStep?: (e: React.FormEvent) => void;
}

const LocationStep = ({
  form,
  role,
  isLoading,
  onPrevStep,
  onNextStep,
}: LocationStepProps) => {
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const selectedGovernorate = form.watch("governorate");
  
  useEffect(() => {
    if (selectedGovernorate) {
      const citiesForGovernorate = CITIES[selectedGovernorate as keyof typeof CITIES] || [];
      setAvailableCities(citiesForGovernorate);
      
      // If the current city isn't in the new list of cities, reset it
      const currentCity = form.getValues("city");
      if (currentCity && !citiesForGovernorate.includes(currentCity)) {
        form.setValue("city", "");
      }
    } else {
      setAvailableCities([]);
    }
  }, [selectedGovernorate, form]);
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">معلومات الموقع</h2>
      
      <FormField
        control={form.control}
        name="governorate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>المحافظة</FormLabel>
            <FormControl>
              <Select
                disabled={isLoading}
                onValueChange={field.onChange}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المحافظة" />
                </SelectTrigger>
                <SelectContent>
                  {GOVERNORATES.map((gov) => (
                    <SelectItem key={gov} value={gov}>
                      {gov}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>المدينة</FormLabel>
            <FormControl>
              <Select
                disabled={isLoading || !selectedGovernorate}
                onValueChange={field.onChange}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!selectedGovernorate ? "اختر المحافظة أولاً" : "اختر المدينة"} />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="agreeTerms"
        render={({ field }) => (
          <FormItem className="flex items-start space-x-3 space-x-reverse space-y-0 rounded-md">
            <FormControl>
              <Checkbox 
                checked={field.value} 
                onCheckedChange={field.onChange}
                disabled={isLoading} 
              />
            </FormControl>
            <FormLabel className="font-normal">
              أوافق على <a href="/terms" className="text-primary hover:underline">شروط الخدمة</a> و <a href="/privacy" className="text-primary hover:underline">سياسة الخصوصية</a>
            </FormLabel>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevStep}
          disabled={isLoading}
        >
          رجوع
        </Button>
        {role === 'craftsman' && onNextStep ? (
          <Button
            type="button"
            onClick={onNextStep}
            disabled={isLoading}
          >
            التالي
          </Button>
        ) : (
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner size="sm" className="mr-2" /> جارٍ التسجيل...
              </>
            ) : (
              "إنشاء الحساب"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default LocationStep;
