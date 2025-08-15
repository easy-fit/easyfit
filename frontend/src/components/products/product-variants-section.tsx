/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type { Control, UseFieldArrayReturn, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VariantCard } from './variant-card';
import type { ProductFormValues } from './product-form-schema';

interface ProductVariantsSectionProps {
  control: Control<ProductFormValues>;
  setValue: UseFormSetValue<ProductFormValues>;
  watch: UseFormWatch<ProductFormValues>;
  fieldArray: UseFieldArrayReturn<ProductFormValues, 'variants', 'id'>;
  watchedCategory: string;
  onAddVariant: () => void;
  onDefaultChange: (index: number, checked: boolean) => void;
  formErrors?: any;
}

export function ProductVariantsSection({
  control,
  setValue,
  watch,
  fieldArray,
  watchedCategory,
  onAddVariant,
  onDefaultChange,
  formErrors,
}: ProductVariantsSectionProps) {
  const { fields, remove } = fieldArray;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Variantes del Producto</CardTitle>
          <Button
            type="button"
            variant="outline"
            onClick={onAddVariant}
            className="border-[#9EE493] text-[#20313A] hover:bg-[#DBF7DC] bg-transparent"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Variante
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {fields.map((field, index) => (
          <VariantCard
            key={field.id}
            control={control}
            setValue={setValue}
            watch={watch}
            variantIndex={index}
            canRemove={fields.length > 1}
            watchedCategory={watchedCategory}
            onRemove={() => remove(index)}
            onDefaultChange={(checked) => onDefaultChange(index, checked)}
          />
        ))}

        {formErrors?.variants?.root && <p className="text-sm text-red-600">{formErrors.variants.root.message}</p>}
      </CardContent>
    </Card>
  );
}
