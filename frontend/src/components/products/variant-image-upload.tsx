'use client';

import * as React from 'react';
import { Upload, X, ImageIcon, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadState } from '@/types/upload';

interface VariantImage {
  file?: File;
  preview: string;
  altText?: string;
  uploadState?: UploadState;
}

interface VariantImageUploadProps {
  images: VariantImage[];
  onImagesChange: (images: VariantImage[]) => void;
  variantIndex: number;
  isUploading?: boolean;
  onRetryUpload?: (imageIndex: number) => void;
}

export function VariantImageUpload({
  images,
  onImagesChange,
  variantIndex,
  isUploading = false,
  onRetryUpload,
}: VariantImageUploadProps) {
  const [dragActive, setDragActive] = React.useState(false);

  const handleImageUpload = (files: FileList | null) => {
    if (!files || isUploading) return;

    const newImages = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      altText: '',
      uploadState: { status: 'idle' as const },
    }));

    onImagesChange([...images, ...newImages]);
  };

  const getUploadStatusIcon = (uploadState?: UploadState) => {
    if (!uploadState) return null;

    switch (uploadState.status) {
      case 'uploading':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getUploadProgress = (uploadState?: UploadState) => {
    return uploadState?.progress?.percentage || 0;
  };

  const removeImage = (imageIndex: number) => {
    if (isUploading) return;
    const updatedImages = images.filter((_, i) => i !== imageIndex);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-[#20313A]">Imágenes de la Variante</h5>
      </div>

      {/* Drag and Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          isUploading
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : dragActive
            ? 'border-[#9EE493] bg-[#DBF7DC]'
            : 'border-gray-300 hover:border-[#9EE493] hover:bg-gray-50'
        }`}
        onDragEnter={(e) => {
          if (isUploading) return;
          e.preventDefault();
          e.stopPropagation();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          if (isUploading) return;
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);
        }}
        onDragOver={(e) => {
          if (isUploading) return;
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          if (isUploading) return;
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);

          const files = e.dataTransfer.files;
          if (files && files.length > 0) {
            handleImageUpload(files);
          }
        }}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleImageUpload(e.target.files)}
          className={`absolute inset-0 w-full h-full opacity-0 ${
            isUploading ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
          disabled={isUploading}
        />
        <div className="text-center">
          <Upload className={`h-8 w-8 mx-auto mb-2 ${isUploading ? 'text-gray-300' : 'text-gray-400'}`} />
          <p className={`text-sm mb-1 ${isUploading ? 'text-gray-400' : 'text-gray-600'}`}>
            <span className={`font-medium ${isUploading ? 'text-gray-400' : 'text-[#20313A]'}`}>
              {isUploading ? 'Subiendo...' : 'Hacé clic para subir'}
            </span>{' '}
            {!isUploading && 'o arrastrá las imágenes aquí'}
          </p>
          <p className={`text-xs ${isUploading ? 'text-gray-400' : 'text-gray-500'}`}>
            PNG, JPG, GIF hasta 10MB cada una
          </p>
        </div>
      </div>

      {/* Image Preview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {images.map((image, imageIndex) => {
          const uploadState = image.uploadState;
          const progress = getUploadProgress(uploadState);
          const statusIcon = getUploadStatusIcon(uploadState);

          return (
            <div key={imageIndex} className="relative group">
              <div
                className={`aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 ${
                  uploadState?.status === 'success'
                    ? 'border-green-200'
                    : uploadState?.status === 'error'
                    ? 'border-red-200'
                    : uploadState?.status === 'uploading'
                    ? 'border-blue-200'
                    : 'border-gray-200'
                }`}
              >
                <Image
                  src={image.preview || '/placeholder.svg'}
                  alt={`Variante ${variantIndex + 1} - Imagen ${imageIndex + 1}`}
                  fill
                  sizes="150px"
                  className="object-cover"
                />

                {/* Upload overlay */}
                {uploadState?.status === 'uploading' && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
                    <div className="text-white text-xs mb-2">{progress}%</div>
                    <Progress value={progress} className="w-3/4 h-1" />
                  </div>
                )}

                {/* Status indicator */}
                {statusIcon && (
                  <div className="absolute top-2 left-2 bg-white rounded-full p-1 shadow-sm">{statusIcon}</div>
                )}

                {/* Error overlay with retry button */}
                {uploadState?.status === 'error' && onRetryUpload && (
                  <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex flex-col items-center justify-center">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => onRetryUpload(imageIndex)}
                      className="text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Reintentar
                    </Button>
                    {uploadState.error && (
                      <p className="text-white text-xs mt-1 text-center px-2">{uploadState.error}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Remove button */}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeImage(imageIndex)}
                className={`absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 transition-opacity ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : 'opacity-0 group-hover:opacity-100'
                }`}
                disabled={isUploading}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          );
        })}

        {/* Empty state - only show if no images */}
        {images.length === 0 && (
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
