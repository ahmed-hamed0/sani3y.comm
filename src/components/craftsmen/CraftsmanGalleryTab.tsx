
import { User } from 'lucide-react';
import { Craftsman } from '@/types/craftsman';

interface CraftsmanGalleryTabProps {
  craftsman: Craftsman;
}

export const CraftsmanGalleryTab = ({ craftsman }: CraftsmanGalleryTabProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">معرض الأعمال السابقة</h2>
      
      {craftsman.gallery && craftsman.gallery.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {craftsman.gallery.map((image, index) => (
            <div key={index} className="aspect-square overflow-hidden rounded-md">
              <img
                src={image}
                alt={`عمل سابق ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <User className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">لا توجد صور لأعمال سابقة</p>
        </div>
      )}
    </div>
  );
};
