/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormValues } from '@/components/products/product-form-schema';
import { buildImageUrl } from '@/lib/utils/image-url';
import type { ProductCategory } from '@/types/product';

export function useEditProductForm(productData?: any) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '' as ProductCategory,
      status: 'draft',
      variants: [],
    },
  });

  const fieldArray = useFieldArray({
    control: form.control,
    name: 'variants',
  });

  // Load product data into form when available
  React.useEffect(() => {
    if (productData?.data) {
      const product = productData.data;

      // Transform API data to form format
      const formData: ProductFormValues = {
        title: product.title,
        description: product.description || '',
        category: product.category as ProductCategory,
        status: product.status,
        variants:
          product.variants?.map((variant: any) => ({
            _id: variant._id,
            size: variant.size,
            color: variant.color,
            stock: variant.stock,
            price: variant.price, // Price stored as whole amount
            discount: variant.discount ?? 0,
            sku: variant.sku,
            isDefault: variant.isDefault,
            images:
              variant.images?.map((img: any) => ({
                _id: img._id,
                key: img.key,
                preview: buildImageUrl(img.key),
                altText: img.altText || '',
                order: img.order,
                contentType: img.contentType,
                isNew: img.isNew ?? false,
              })) || [],
          })) || [],
      };

      // Reset form with loaded data
      form.reset(formData);
      fieldArray.replace(formData.variants);
    }
  }, [productData, form, fieldArray]);

  const addVariant = () => {
    fieldArray.append({
      size: '',
      color: '',
      stock: 0,
      price: 0,
      discount: 0,
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
