'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormValues } from '@/components/products/product-form-schema';
import type { ProductCategory } from '@/types/product';

interface BulkSizeData {
  size: string;
  stock: number;
  sku: string;
}

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

  const addBulkVariants = (baseVariantIndex: number, bulkSizes: BulkSizeData[]) => {
    const baseVariant = form.getValues(`variants.${baseVariantIndex}`);
    
    if (!baseVariant) {
      return;
    }

    // Create new variants based on the base variant but with different sizes and stocks
    const newVariants = bulkSizes.map((bulkSize) => ({
      ...baseVariant,
      size: bulkSize.size,
      stock: bulkSize.stock,
      sku: bulkSize.sku,
      isDefault: false,
      // Add isBulk flag to identify these variants for backend processing
      isBulk: true,
    }));

    // Add all new variants to the form
    newVariants.forEach((variant) => {
      fieldArray.append(variant);
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
    addBulkVariants,
    handleDefaultChange,
  };
}
