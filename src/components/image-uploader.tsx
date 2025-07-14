import { Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";

interface ImageUploaderProps {
  images: File[];
  setImages: (files: File[]) => void;
}

export default function ImageUploader({
  images,
  setImages,
}: ImageUploaderProps) {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalFiles = [...images, ...files].slice(0, 5);
    setImages(totalFiles);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  useEffect(() => {
    return () => {
      images.forEach((file: File) =>
        URL.revokeObjectURL(URL.createObjectURL(file))
      );
    };
  }, [images]);

  return (
    <div className="space-y-4">
      <Label>Rasmlar</Label>
      <div className="grid grid-cols-2 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative">
            <img
              src={URL.createObjectURL(image)}
              alt={`Upload ${index + 1}`}
              className="w-full h-24 object-cover rounded-md"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {images.length < 5 && (
          <label className="border-2 border-dashed border-muted-foreground/25 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer transition-colors h-24 hover:bg-muted/50">
            <Upload size={24} className="text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Rasm yuklash</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={images.length >= 5}
            />
          </label>
        )}
      </div>
    </div>
  );
}
