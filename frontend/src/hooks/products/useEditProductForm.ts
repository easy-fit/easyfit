import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormValues } from '@/components/products/edit/schemas';
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

  const { fields, append, remove, replace } = useFieldArray({
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
            sku: variant.sku,
            isDefault: variant.isDefault,
            images:
              variant.images?.map((img: any) => ({
                key: img.key,
                preview: buildImageUrl(img.key),
                altText: img.altText || '',
                order: img.order,
                contentType: img.contentType,
                isNew: false,
              })) || [],
          })) || [],
      };

      // Reset form with loaded data
      form.reset(formData);
      replace(formData.variants);
    }
  }, [productData, form, replace]);

  const addVariant = () => {
    append({
      size: '',
      color: '',
      stock: 0,
      price: 0,
      sku: '',
      isDefault: false,
      images: [],
    });
  };

  const removeVariant = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleDefaultChange = (index: number, checked: boolean) => {
    if (checked) {
      // Uncheck all other variants
      fields.forEach((_, i) => {
        if (i !== index) {
          form.setValue(`variants.${i}.isDefault`, false);
        }
      });
    }
    form.setValue(`variants.${index}.isDefault`, checked);
  };

  const handleImageUpload = (variantIndex: number, files: FileList | null) => {
    if (!files) return;

    const currentImages = form.getValues(`variants.${variantIndex}.images`) || [];
    const newImages = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      altText: '',
      isNew: true,
    }));

    form.setValue(`variants.${variantIndex}.images`, [...currentImages, ...newImages]);
  };

  const removeImage = (variantIndex: number, imageIndex: number) => {
    const currentImages = form.getValues(`variants.${variantIndex}.images`) || [];
    const updatedImages = currentImages.filter((_, i) => i !== imageIndex);
    form.setValue(`variants.${variantIndex}.images`, updatedImages);
  };

  return {
    form,
    fields,
    addVariant,
    removeVariant,
    handleDefaultChange,
    handleImageUpload,
    removeImage,
  };
}