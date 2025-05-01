
import { Award, CheckCircle } from 'lucide-react';
import { Craftsman } from '@/types/craftsman';

interface CraftsmanAboutTabProps {
  craftsman: Craftsman;
}

export const CraftsmanAboutTab = ({ craftsman }: CraftsmanAboutTabProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-right">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3">نبذة عن الصنايعي</h2>
        <p className="text-gray-700">{craftsman.bio || 'لا توجد معلومات متاحة عن هذا الصنايعي'}</p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3">الخبرات والمهارات</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center">
            <Award className="h-5 w-5 text-primary ml-2" />
            <span>خبرة {craftsman.experience} سنوات</span>
          </div>
          
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-primary ml-2" />
            <span>{craftsman.completedJobs} مهمة مكتملة</span>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="font-semibold mb-2">المهارات:</h3>
          <ul className="list-disc list-inside space-y-1 text-right" dir="rtl">
            {craftsman.skills && craftsman.skills.length > 0 ? (
              craftsman.skills.map((skill, index) => (
                <li key={index} className="flex items-center gap-2 justify-end">
                  {skill}
                  <span className="text-primary">•</span>
                </li>
              ))
            ) : (
              <li>لا توجد مهارات محددة</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
