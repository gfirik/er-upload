import { useRef } from "react";
import { Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";

interface ImageUploaderProps {
  images: File[];
  setImages: (files: File[]) => void;
}

export default function ImageUploader({
  images,
  setImages,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 5 - images.length);
    setImages([...images, ...newFiles]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Label>Rasmlar (maks. 5 ta)</Label>
      <input
        type="file"
        accept="image/*"
        multiple
        hidden
        ref={fileInputRef}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div
        className="flex h-32 w-full cursor-pointer items-center justify-center rounded-md border border-dashed border-gray-300 bg-muted hover:bg-muted/70"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-center">
          <Upload className="mx-auto h-6 w-6 text-gray-500" />
          <p className="text-sm text-gray-500">Rasmlarni yuklash</p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(img)}
                className="h-24 w-full rounded-md object-cover border"
              />
              <button
                type="button"
                className="absolute top-1 right-1 rounded-full bg-red-500 text-white p-0.5"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
