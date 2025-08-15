/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { VariantFormFields } from './variant-form-fields';
import { VariantImageUpload } from './variant-image-upload';
import type { ProductFormValues } from './product-form-schema';

interface VariantCardProps {
  control: Control<ProductFormValues>;
  setValue: UseFormSetValue<ProductFormValues>;
  watch: UseFormWatch<ProductFormValues>;
  variantIndex: number;
  canRemove: boolean;
  watchedCategory: string;
  onRemove: () => void;
  onDefaultChange: (checked: boolean) => void;
}

export function VariantCard({
  control,
  setValue,
  watch,
  variantIndex,
  canRemove,
  watchedCategory,
  onRemove,
  onDefaultChange,
}: VariantCardProps) {
  const variantImages = watch(`variants.${variantIndex}.images`) || [];

  const handleImagesChange = (images: any[]) => {
    setValue(`variants.${variantIndex}.images`, images);
  };

  return (
    <div className="border rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-[#20313A]">Variante {variantIndex + 1}</h4>
        <div className="flex items-center gap-3">
          <FormField
            control={control}
            name={`variants.${variantIndex}.isDefault`}
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={onDefaultChange} />
                </FormControl>
                <FormLabel className="text-sm font-normal">Predeterminada</FormLabel>
              </FormItem>
            )}
          />
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Variant Details */}
      <VariantFormFields control={control} variantIndex={variantIndex} watchedCategory={watchedCategory} />

      {/* Images Section */}
      <VariantImageUpload images={variantImages} onImagesChange={handleImagesChange} variantIndex={variantIndex} />
    </div>
  );
}
