
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export const SecurityNoteCard = () => {
  return (
    <Card className="bg-gray-50">
      <CardContent className="pt-6">
        <div className="flex items-center text-amber-700 mb-2">
          <ShieldCheck className="ml-2 w-5 h-5" />
          <CardTitle className="text-base">نصائح الأمان</CardTitle>
        </div>
        <CardDescription className="text-gray-600 text-xs">
          <ul className="list-disc pr-4 space-y-1">
            <li>قم بالتواصل مع الصنايعية عبر المنصة فقط</li>
            <li>لا تقم بالدفع قبل اكتمال العمل والتأكد من جودته</li>
            <li>احرص على مراجعة تقييمات الصنايعية قبل قبول العروض</li>
          </ul>
        </CardDescription>
      </CardContent>
    </Card>
  );
};
