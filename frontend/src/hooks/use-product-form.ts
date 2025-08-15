'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormValues } from '@/components/products/product-form-schema';
import type { ProductCategory } from '@/types/product';

export function useProductForm() {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '' as ProductCategory,
      status: 'draft',
      variants: [
        {
          size: '',
          color: '',
          stock: 0,
          price: 0,
          sku: '',
          isDefault: true,
          images: [],
        },
      ],
    },
  });

  const fieldArray = useFieldArray({
    control: form.control,
    name: 'variants',
  });

  const addVariant = () => {
    fieldArray.append({
      size: '',
      color: '',
      stock: 0,
      price: 0,
      sku: '',
      isDefault: false,
      images: [],
    });
  };

  const handleDefaultChange = (index: number, checked: boolean) => {
    if (checked) {
      // Uncheck all other variants
      fieldArray.fields.forEach((_, i) => {
        if (i !== index) {
          form.setValue(`variants.${i}.isDefault`, false);
        }
      });
    }
    form.setValue(`variants.${index}.isDefault`, checked);
  };

  return {
    form,
    fieldArray,
    addVariant,
    handleDefaultChange,
  };
}
