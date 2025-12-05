import { z } from 'zod';

export const variantSchema = z.object({
  _id: z.string().optional(), // For existing variants
  size: z.string().min(1, 'Talle requerido'),
  color: z.string().min(1, 'Color requerido'),
  stock: z.number().min(0, 'Stock debe ser mayor o igual a 0'),
  price: z.number().min(1, 'Precio debe ser mayor a 0'),
  discount: z.number().min(0, 'Descuento debe ser 0 o mayor').max(99, 'Descuento máximo es 99%'),
  sku: z.string().min(1, 'SKU requerido'),
  isDefault: z.boolean().optional(),
  images: z.array(
    z.object({
      _id: z.string().optional(), // For existing images
      key: z.string().optional(),
      file: z.any().optional(),
      preview: z.string(),
      altText: z.string().optional(),
      order: z.number().optional(),
      contentType: z.string().optional(),
      isNew: z.boolean(), // Flag for new images
    }),
  ),
});

export const productSchema = z
  .object({
    title: z.string().min(1, 'Título requerido').max(100, 'Título muy largo'),
    description: z.string().optional(),
    category: z.string().min(1, 'Categoría requerida'),
    status: z.enum(['published', 'draft', 'deleted'], {
      message: 'Estado requerido',
    }),
    allowedShippingTypes: z.array(z.enum(['simple', 'advanced', 'premium'])).optional(),
    variants: z.array(variantSchema).min(1, 'Al menos una variante es requerida'),
  })
  .refine((data) => data.variants.some((variant) => variant.isDefault), {
    message: 'Al menos una variante debe ser marcada como predeterminada',
    path: ['variants'],
  });

export type ProductFormValues = z.infer<typeof productSchema>;
export type VariantFormValues = z.infer<typeof variantSchema>;