import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { buildStoreAssetUrl } from '@/lib/utils/image-url';
import { Upload } from 'lucide-react';
import Image from 'next/image';

interface StoreImageUploadProps {
  label: string;
  recommendedSize: string;
  imageUrl?: string;
  onImageSelect: (file: File) => void;
  isUploading?: boolean;
  aspectRatio?: 'square' | 'banner';
}

export function StoreImageUpload({
  label,
  recommendedSize,
  imageUrl,
  onImageSelect,
  isUploading = false,
  aspectRatio = 'square',
}: StoreImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputId = `${label.toLowerCase().replace(/\s+/g, '-')}-upload`;

  const containerClasses = aspectRatio === 'square' 
    ? 'w-32 h-32' 
    : 'w-full h-32';

  const imageClasses = 'w-full h-full object-cover rounded-xl';

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files?.[0]) {
      onImageSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleClick = () => {
    if (!isUploading) {
      document.getElementById(inputId)?.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-sm font-medium text-[#20313A]">{label}</Label>
        <p className="text-xs text-gray-500">Recomendado: {recommendedSize}</p>
      </div>
      
      <div className="space-y-4">
        <div
          className={`${containerClasses} border-2 border-dashed ${
            dragActive ? 'border-[#9EE493] bg-[#DBF7DC]/30' : 'border-gray-300'
          } rounded-xl flex items-center justify-center ${
            isUploading ? 'bg-gray-100 cursor-wait' : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
          } transition-colors`}
          onClick={handleClick}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {imageUrl ? (
            <Image
              src={buildStoreAssetUrl(imageUrl)}
              alt={label}
              width={aspectRatio === 'square' ? 128 : 400}
              height={128}
              className={imageClasses}
            />
          ) : (
            <div className="text-center">
              <Upload className={`h-8 w-8 ${isUploading ? 'animate-pulse' : ''} text-gray-400 mx-auto mb-2`} />
              <p className="text-xs text-gray-500">
                {isUploading ? 'Subiendo...' : 'Arrastra o haz clic'}
              </p>
            </div>
          )}
        </div>

        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
          disabled={isUploading}
        />

        <Button
          type="button"
          variant="outline"
          className="border-gray-300 hover:bg-gray-50 text-gray-700 w-full bg-transparent"
          onClick={handleClick}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Subiendo...' : `Subir ${label}`}
        </Button>
      </div>
    </div>
  );
}