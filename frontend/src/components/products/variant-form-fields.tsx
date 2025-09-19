'use client';

import type { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { getSizeOptions } from './product-form-constants';
import { ColorSelector } from './edit/ColorSelector';
import type { ProductFormValues } from './product-form-schema';

interface VariantFormFieldsProps {
  control: Control<ProductFormValues>;
  variantIndex: number;
  watchedCategory: string;
}

export function VariantFormFields({ control, variantIndex, watchedCategory }: VariantFormFieldsProps) {
  const sizeOptions = getSizeOptions(watchedCategory);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <FormField
        control={control}
        name={`variants.${variantIndex}.size`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Talle *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {sizeOptions.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
                <Separator />
                <SelectItem value="custom">Personalizado...</SelectItem>
              </SelectContent>
            </Select>
            {field.value === 'custom' && (
              <Input
                placeholder="Talle personalizado"
                onChange={(e) => field.onChange(e.target.value)}
                className="mt-2"
              />
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`variants.${variantIndex}.color`}
        render={({ field }) => (
          <ColorSelector field={field} />
        )}
      />

      <FormField
        control={control}
        name={`variants.${variantIndex}.stock`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Stock *</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                placeholder="Ej: 10"
                {...field}
                value={field.value === 0 ? '' : field.value}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    field.onChange('');
                  } else {
                    field.onChange(Number.parseInt(value) || 0);
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    field.onChange(0);
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`variants.${variantIndex}.price`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Precio *</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Ej: 25000"
                {...field}
                value={field.value === 0 ? '' : field.value}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    field.onChange('');
                  } else {
                    field.onChange(Number.parseFloat(value) || 0);
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    field.onChange(0);
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`variants.${variantIndex}.sku`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>SKU *</FormLabel>
            <FormControl>
              <Input placeholder="Ej: CAM-ROJ-M" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
