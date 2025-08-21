import { useState } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VariantImage {
  _id?: string;
  key?: string;
  file?: File;
  preview: string;
  altText?: string;
  order?: number;
  contentType?: string;
  isNew: boolean;
}

interface VariantImageUploadProps {
  images: VariantImage[];
  variantIndex: number;
  productId: string;
  variantId?: string;
  onImageUpload: (variantIndex: number, files: FileList | null) => void;
  onImageRemove: (variantIndex: number, imageIndex: number) => void;
  onDeleteImage?: (variantId: string, imageKey: string) => Promise<void>;
  isDeletingImage?: boolean;
}

export function VariantImageUpload({ 
  images, 
  variantIndex, 
  productId,
  variantId,
  onImageUpload, 
  onImageRemove,
  onDeleteImage,
  isDeletingImage = false
}: VariantImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [deletingImageIndex, setDeletingImageIndex] = useState<number | null>(null);

  const handleImageDelete = async (imageIndex: number) => {
    const image = images[imageIndex];
    const isExistingImage = image.key && !image.isNew;
    
    if (isExistingImage && variantId) {
      // Show confirmation for existing images
      if (window.confirm('¿Estás seguro de eliminar esta imagen? Esta acción no se puede deshacer.')) {
        try {
          setDeletingImageIndex(imageIndex);
          await onDeleteImage?.(variantId, image.key!);
        } catch (error) {
          console.error('Error deleting image:', error);
        } finally {
          setDeletingImageIndex(null);
        }
      }
    } else {
      // For new images, just remove from form
      onImageRemove(variantIndex, imageIndex);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onImageUpload(variantIndex, files);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-[#20313A]">Imágenes de la Variante</h5>
      </div>

      {/* Drag and Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-[#9EE493] bg-[#DBF7DC]'
            : 'border-gray-300 hover:border-[#9EE493] hover:bg-gray-50'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => onImageUpload(variantIndex, e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="text-center">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium text-[#20313A]">Hacé clic para subir</span> o arrastrá las
            imágenes aquí
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB cada una</p>
        </div>
      </div>

      {/* Image Preview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {images?.map((image, imageIndex) => (
          <div key={imageIndex} className="relative group">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
              <Image
                src={image.preview || '/placeholder.svg'}
                alt={`Variante ${variantIndex + 1} - Imagen ${imageIndex + 1}`}
                fill
                sizes="150px"
                className="object-cover"
              />
            </div>
            {image.isNew && (
              <Badge className="absolute top-1 left-1 text-xs bg-green-500">Nueva</Badge>
            )}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => handleImageDelete(imageIndex)}
              disabled={deletingImageIndex === imageIndex}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
            >
              {deletingImageIndex === imageIndex ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <X className="h-3 w-3" />
              )}
            </Button>
          </div>
        ))}

        {/* Empty state - only show if no images */}
        {(!images || images.length === 0) && (
          <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Sin imágenes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}