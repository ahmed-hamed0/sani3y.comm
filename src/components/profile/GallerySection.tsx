
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { uploadGalleryImage, removeGalleryImage } from '@/lib/profile';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/sonner';
import { Trash2, Upload } from 'lucide-react';

interface GallerySectionProps {
  profile: any;
}

const GallerySection = ({ profile }: GallerySectionProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [gallery, setGallery] = useState<string[]>(profile.gallery || []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !profile.id) return;

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast("حجم الملف كبير جداً (الحد الأقصى 5 ميجابايت)", {
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
      });
      return;
    }

    setIsUploading(true);
    try {
      const { success, url, error } = await uploadGalleryImage(profile.id, file);
      if (success && url) {
        setGallery(prevGallery => [...prevGallery, url]);
        toast("تم رفع الصورة بنجاح");
      } else if (error) {
        toast("خطأ في تحميل الصورة: " + error.message, {
          style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast("خطأ في تحميل الصورة: حدث خطأ غير متوقع", {
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    if (!profile.id) return;
    
    try {
      const { success, error } = await removeGalleryImage(profile.id, imageUrl);
      if (success) {
        setGallery(prevGallery => prevGallery.filter(url => url !== imageUrl));
        toast("تم حذف الصورة بنجاح");
      } else if (error) {
        toast("خطأ في حذف الصورة: " + error.message, {
          style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
        });
      }
    } catch (error) {
      console.error("Error removing image:", error);
      toast("خطأ في حذف الصورة: حدث خطأ غير متوقع", {
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
      });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <label htmlFor="gallery-upload" className="block mb-4">
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            className="w-full h-24 border-dashed"
          >
            {isUploading ? (
              <Spinner size="md" className="ml-2" />
            ) : (
              <Upload className="h-5 w-5 ml-2" />
            )}
            رفع صورة لمعرض أعمالك
          </Button>
          <input
            id="gallery-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {gallery.length === 0 ? (
        <div className="text-center py-10 bg-neutral rounded-lg">
          <p className="text-gray-500">لا توجد صور في معرض أعمالك حتى الآن</p>
          <p className="text-sm text-gray-400 mt-2">قم برفع صور لأعمالك السابقة ليراها العملاء</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {gallery.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={imageUrl}
                alt={`معرض العمل ${index + 1}`}
                className="w-full h-40 object-cover rounded-md"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(imageUrl)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GallerySection;
