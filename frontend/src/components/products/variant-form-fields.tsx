'use client';

import { useState } from 'react';
import type { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getSizeOptions } from './product-form-constants';
import { ColorSelector } from './edit/ColorSelector';
import type { ProductFormValues } from './product-form-schema';

interface VariantFormFieldsProps {
  control: Control<ProductFormValues>;
  variantIndex: number;
  watchedCategory: string;
}

export function VariantFormFields({ control, variantIndex, watchedCategory }: VariantFormFieldsProps) {
  const [showSizeSuggestions, setShowSizeSuggestions] = useState(false);
  const suggestedSizes = getSizeOptions(watchedCategory);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <FormField
        control={control}
        name={`variants.${variantIndex}.size`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Talle *</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  placeholder={suggestedSizes.length > 0 ? "Ej: S, M, L, 85, 90, etc." : "Ingrese el talle"}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  onFocus={() => suggestedSizes.length > 0 && setShowSizeSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSizeSuggestions(false), 200)}
                />
                {showSizeSuggestions && suggestedSizes.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    <div className="p-2 bg-gray-50 border-b text-xs text-gray-600 font-medium">
                      Talles sugeridos (o ingresá uno personalizado)
                    </div>
                    <div className="p-2 grid grid-cols-3 gap-1">
                      {suggestedSizes.map((size) => (
                        <Button
                          key={size}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            field.onChange(size);
                            setShowSizeSuggestions(false);
                          }}
                          className="h-8 text-xs"
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </FormControl>
            {field.value && !suggestedSizes.includes(field.value) && (
              <Badge variant="secondary" className="text-xs mt-1">
                Talle personalizado
              </Badge>
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
