'use client';

import type { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HierarchicalCategorySelector } from './hierarchical-category-selector';
import { statusOptions } from './product-form-constants';
import type { ProductCategory } from '@/types/product';

interface ProductBasicFormValues {
  title: string;
  description?: string;
  category: ProductCategory;
  status: 'published' | 'draft' | 'deleted';
  baseSku: string;
  basePrice: number;
  images: Array<{
    file?: File;
    preview: string;
    altText?: string;
    uploadState?: unknown;
  }>;
}

interface ProductBasicFormProps {
  control: Control<ProductBasicFormValues>;
}

export function ProductBasicForm({ control }: ProductBasicFormProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Información del Producto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <FormField
            control={control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título del Producto *</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Camiseta básica de algodón" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe tu producto..." className="min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría *</FormLabel>
              <FormControl>
                <HierarchicalCategorySelector
                  value={field.value as ProductCategory}
                  onValueChange={field.onChange}
                  placeholder="Seleccionar categoría"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Base SKU */}
          <FormField
            control={control}
            name="baseSku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU Base *</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: CAM-BAS" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Base Price */}
          <FormField
            control={control}
            name="basePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio Base *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="500"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 500)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
