'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VariantImageUpload } from './variant-image-upload';
import type { UploadState } from '@/types/upload';

interface ImageData {
  file?: File;
  preview: string;
  altText?: string;
  uploadState?: UploadState;
}

interface ProductImagesFormProps {
  images: ImageData[];
  onImagesChange: (images: ImageData[]) => void;
}

export function ProductImagesForm({ images, onImagesChange }: ProductImagesFormProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Imágenes del Producto</CardTitle>
        <p className="text-sm text-gray-600">Estas imágenes se aplicarán a todas las variantes del producto.</p>
      </CardHeader>
      <CardContent>
        <VariantImageUpload
          images={images}
          onImagesChange={onImagesChange}
          variantIndex={0} // Not used in this context
        />
      </CardContent>
    </Card>
  );
}
