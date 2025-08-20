import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StoreImageUpload } from './store-image-upload';
import { ImageIcon } from 'lucide-react';
import { StoreSettingsFormValues } from '@/constants/store-settings';

interface StoreCustomizationSectionProps {
  form: UseFormReturn<StoreSettingsFormValues>;
  onLogoUpload: (file: File) => void;
  onBannerUpload: (file: File) => void;
  isUploadingLogo: boolean;
  isUploadingBanner: boolean;
}

export function StoreCustomizationSection({
  form,
  onLogoUpload,
  onBannerUpload,
  isUploadingLogo,
  isUploadingBanner,
}: StoreCustomizationSectionProps) {
  return (
    <Card className="shadow-sm border-0 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-[#20313A] text-xl">
          <div className="p-2 bg-[#DBF7DC] rounded-lg">
            <ImageIcon className="h-5 w-5 text-[#20313A]" />
          </div>
          Personalización
        </CardTitle>
        <CardDescription className="text-gray-600">
          Personaliza la apariencia de tu tienda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <StoreImageUpload
            label="Logo de la Tienda"
            recommendedSize="200x200px (formato cuadrado)"
            imageUrl={form.watch('customization')?.logoUrl}
            onImageSelect={onLogoUpload}
            isUploading={isUploadingLogo}
            aspectRatio="square"
          />
          
          <StoreImageUpload
            label="Banner de la Tienda"
            recommendedSize="1200x600px (formato 2:1)"
            imageUrl={form.watch('customization')?.bannerUrl}
            onImageSelect={onBannerUpload}
            isUploading={isUploadingBanner}
            aspectRatio="banner"
          />
        </div>
      </CardContent>
    </Card>
  );
}