/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Trash2, Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { StoreSidebar } from '@/components/dashboard/store-sidebar';
import { HierarchicalCategorySelector } from '@/components/products/hierarchical-category-selector';
import type { ProductCategory } from '@/types/product';

import { useCurrentStore } from '@/contexts/store-context';
import { useEasyFitToast } from '@/hooks/use-toast';
import { useProduct, useUpdateProduct, useCreateVariant } from '@/hooks/api/use-products';
import { useImageUpload } from '@/hooks/use-image-upload';
import { buildImageUrl } from '@/lib/utils/image-url';
import { api } from '@/lib/api/client';
import type { SignedUrl } from '@/types/global';

const variantSchema = z.object({
  _id: z.string().optional(), // For existing variants
  size: z.string().min(1, 'Talle requerido'),
  color: z.string().min(1, 'Color requerido'),
  stock: z.number().min(0, 'Stock debe ser mayor o igual a 0'),
  price: z.number().min(1, 'Precio debe ser mayor a 0'),
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

const productSchema = z
  .object({
    title: z.string().min(1, 'Título requerido').max(100, 'Título muy largo'),
    description: z.string().optional(),
    category: z.string().min(1, 'Categoría requerida'),
    status: z.enum(['published', 'draft', 'deleted'], {
      message: 'Estado requerido',
    }),
    variants: z.array(variantSchema).min(1, 'Al menos una variante es requerida'),
  })
  .refine((data) => data.variants.some((variant) => variant.isDefault), {
    message: 'Al menos una variante debe ser marcada como predeterminada',
    path: ['variants'],
  });

type ProductFormValues = z.infer<typeof productSchema>;

const statusOptions = [
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
  { value: 'deleted', label: 'Archivado' },
];

const commonColors = [
  { name: 'Negro', value: '#000000' },
  { name: 'Blanco', value: '#FFFFFF' },
  { name: 'Gris', value: '#808080' },
  { name: 'Azul', value: '#0000FF' },
  { name: 'Rojo', value: '#FF0000' },
  { name: 'Verde', value: '#008000' },
  { name: 'Amarillo', value: '#FFFF00' },
  { name: 'Rosa', value: '#FFC0CB' },
  { name: 'Violeta', value: '#8A2BE2' },
  { name: 'Naranja', value: '#FFA500' },
  { name: 'Marrón', value: '#A52A2A' },
  { name: 'Beige', value: '#F5F5DC' },
];

// Helper function to get image URL from key
const getImageUrl = (key: string) => {
  return buildImageUrl(key);
};

export default function EditProductPage({ params }: { params: Promise<{ id: string; productId: string }> }) {
  const router = useRouter();
  const { id, productId } = React.use(params);
  const { storeName, logoUrl } = useCurrentStore();
  const toast = useEasyFitToast();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [dragActive, setDragActive] = React.useState<number | null>(null);
  const [originalVariants, setOriginalVariants] = React.useState<any[]>([]);

  // Fetch product data
  const { data: productData, isLoading, error } = useProduct(productId);
  const updateProductMutation = useUpdateProduct(productId);

  // Variant mutation hooks
  const createVariantMutation = useCreateVariant(productId);

  // Image upload functionality
  const { uploadImages } = useImageUpload({
    onUploadComplete: (result) => {
      if (result.allSuccessful) {
        toast.success('Imágenes subidas', {
          description: 'Todas las imágenes se subieron correctamente',
        });
      } else {
        toast.warning('Algunas imágenes fallaron', {
          description: `${result.failedCount} de ${result.results.length} imágenes no se pudieron subir`,
        });
      }
    },
    onUploadError: (error) => {
      toast.error('Error subiendo imágenes', {
        description: error,
      });
    },
  });

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
          product.variants?.map((variant) => ({
            _id: variant._id,
            size: variant.size,
            color: variant.color,
            stock: variant.stock,
            price: variant.price, // Price stored as whole amount
            sku: variant.sku,
            isDefault: variant.isDefault,
            images:
              variant.images?.map((img) => ({
                key: img.key,
                preview: getImageUrl(img.key),
                altText: img.altText || '',
                order: img.order,
                contentType: img.contentType,
                isNew: false,
              })) || [],
          })) || [],
      };

      // Store original variants for comparison
      setOriginalVariants(product.variants || []);

      // Reset form with loaded data
      form.reset(formData);
      replace(formData.variants);
    }
  }, [productData, form, replace]);

  const watchedCategory = form.watch('category');

  const handleSubmit = async (data: ProductFormValues) => {
    setIsUpdating(true);
    let successfulOperations = 0;
    let failedOperations = 0;

    try {
      // 1. Update the product first
      const productUpdatePayload = {
        title: data.title,
        description: data.description || '',
        category: data.category as ProductCategory,
        status: data.status,
      };

      await updateProductMutation.mutateAsync(productUpdatePayload);
      successfulOperations++;

      toast.info('Producto actualizado', {
        description: 'Procesando variantes...',
      });

      // 2. Handle variant operations sequentially for better error handling
      for (const variant of data.variants) {
        try {
          if (variant._id) {
            // Existing variant - update basic data first, then handle new images separately
            const existingImages = variant.images.filter((img) => !img.isNew);
            const newImages = variant.images.filter((img) => img.isNew && img.file);

            // Update variant with existing images only
            const updateVariantPayload = {
              size: variant.size,
              color: variant.color,
              stock: variant.stock,
              price: Math.round(variant.price), // Price as whole amount
              sku: variant.sku,
              isDefault: variant.isDefault,
              images: existingImages
                .filter((img) => img.key) // Filter out images without keys
                .map((img) => ({
                  key: img.key!,
                  altText: img.altText || '',
                  order: img.order || 0,
                  contentType: img.contentType || 'image/jpeg',
                })),
            };

            // Note: Using API client directly instead of useUpdateVariant hook because
            // React hooks cannot be called inside loops (Rules of Hooks)
            await api.products.updateVariant(productId, variant._id, updateVariantPayload);
            successfulOperations++;

            // Handle new images separately if any
            if (newImages.length > 0) {
              try {
                let uploadedCount = 0;

                for (let i = 0; i < newImages.length; i++) {
                  const img = newImages[i];

                  // Create image payload for this new image
                  const imagePayload = {
                    key: `${Math.random().toString(36).substr(2, 9)}.jpg`,
                    contentType: img.file?.type || 'image/jpeg',
                    altText: img.altText || 'Imagen del producto',
                  };

                  // Note: Using API client directly instead of useAddImageToProduct hook because
                  // React hooks cannot be called inside loops (Rules of Hooks)
                  const imageResponse = await api.products.addImageToProduct(productId, variant._id, imagePayload);

                  // Upload the file to R2
                  const signedUrlInfo = imageResponse.data.uploadInfo; // Direct uploadInfo object
                  console.log('Signed URL info for variant image:', signedUrlInfo);

                  const uploadResult = await uploadImages(
                    [img.file!],
                    [{ url: signedUrlInfo.url, key_img: signedUrlInfo.key }],
                  );

                  if (uploadResult.allSuccessful) {
                    uploadedCount++;
                  } else {
                    console.error(`Failed to upload image ${i + 1}`);
                  }
                }

                if (uploadedCount > 0) {
                  toast.success('Imágenes nuevas agregadas', {
                    description: `${uploadedCount} imagen${uploadedCount > 1 ? 'es' : ''} agregada${
                      uploadedCount > 1 ? 's' : ''
                    } exitosamente`,
                  });
                }

                if (uploadedCount < newImages.length) {
                  toast.warning('Algunas imágenes fallaron', {
                    description: `${newImages.length - uploadedCount} imagen${
                      newImages.length - uploadedCount > 1 ? 'es' : ''
                    } no se pudo${newImages.length - uploadedCount > 1 ? 'ieron' : ''} subir`,
                  });
                }
              } catch (imageError) {
                console.error('Error handling new images for existing variant:', imageError);
                toast.error('Error subiendo imágenes nuevas', {
                  description: 'Las imágenes nuevas no se pudieron subir',
                });
              }
            }
          } else {
            // New variant - create it
            const createVariantPayload = {
              size: variant.size,
              color: variant.color,
              stock: variant.stock,
              price: Math.round(variant.price), // Price as whole amount
              sku: variant.sku,
              isDefault: variant.isDefault,
              images: variant.images.map((img, index) => ({
                key: `${Math.random().toString(36).substr(2, 9)}.jpg`, // Generate a temporary key
                contentType: img.file?.type || 'image/jpeg',
                altText: img.altText || 'Imagen del producto',
                order: index + 1,
              })),
            };

            const result = await createVariantMutation.mutateAsync(createVariantPayload);
            successfulOperations++;
            console.log('Variant created successfully:', result);
            // Handle new images for this variant if any
            const newImages = variant.images.filter((img) => img.isNew && img.file);
            console.log('New images to upload for variant:', newImages);
            console.log('Signed URLs from variant creation:', result.data.signedUrls);
            if (newImages.length > 0 && result.data.signedUrls && result.data.signedUrls.length > 0) {
              try {
                const files = newImages.map((img) => img.file!);
                // Use the SignedUrl objects directly
                const signedUrlObjects = result.data.signedUrls as SignedUrl[];

                console.log('Signed URL objects:', signedUrlObjects);
                console.log('Files to upload:', files);

                const uploadResult = await uploadImages(files, signedUrlObjects);
                if (!uploadResult.allSuccessful) {
                  toast.warning('Algunas imágenes de variante fallaron', {
                    description: `${uploadResult.failedCount} imágenes no se pudieron subir`,
                  });
                }
              } catch (uploadError) {
                console.error('Error uploading variant images:', uploadError);
                toast.error('Error subiendo imágenes', {
                  description: 'La variante se creó pero las imágenes no se subieron',
                });
              }
            }
          }
        } catch (variantError) {
          console.error('Error processing variant:', variantError);
          failedOperations++;
        }
      }

      // 3. Show results
      if (failedOperations === 0) {
        toast.success('Producto actualizado completamente', {
          description: 'Todos los cambios se guardaron exitosamente',
        });
      } else {
        toast.warning('Actualización parcial', {
          description: `${successfulOperations} operaciones exitosas, ${failedOperations} fallaron`,
        });
      }

      router.push(`/dashboard/${id}/products`);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar producto', {
        description: 'No se pudieron guardar los cambios. Intentá nuevamente.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SidebarProvider>
          <StoreSidebar storeName={storeName} logoUrl={logoUrl} active="products" baseHref={`/dashboard/${id}`} />
          <SidebarInset>
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#9EE493] mx-auto mb-4" />
                <p className="text-gray-600">Cargando producto...</p>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SidebarProvider>
          <StoreSidebar storeName={storeName} logoUrl={logoUrl} active="products" baseHref={`/dashboard/${id}`} />
          <SidebarInset>
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <p className="text-red-600 mb-4">Error cargando el producto</p>
                <Button onClick={() => router.push(`/dashboard/${id}/products`)}>Volver a Productos</Button>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarProvider>
        <StoreSidebar storeName={storeName} logoUrl={logoUrl} active="products" baseHref={`/dashboard/${id}`} />
        <SidebarInset>
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-1 h-4" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/${id}/products`)}
              className="flex items-center gap-2 text-gray-600 hover:text-[#20313A] hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver a Productos</span>
            </Button>
            <Separator orientation="vertical" className="mx-1 h-4" />
            <div className="flex items-center gap-3">
              <h1 className="text-base md:text-lg font-semibold text-[#20313A]">Editar Producto</h1>
              <Badge variant="secondary">Edición</Badge>
            </div>
          </header>

          <main className="p-4 md:p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-6xl mx-auto space-y-8">
                {/* Product Information */}
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="text-xl">Información del Producto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Remera Básica Algodón" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
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

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descripción detallada del producto..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Seleccionar estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Variants Section */}
                <Card className="w-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Variantes del Producto</CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addVariant}
                        className="border-[#9EE493] text-[#20313A] hover:bg-[#DBF7DC] bg-transparent"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Variante
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {fields.map((field, index) => (
                      <div key={field.id} className="border rounded-lg p-6 space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium text-[#20313A]">
                            Variante {index + 1}
                            {form.watch(`variants.${index}._id`) && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Existente
                              </Badge>
                            )}
                          </h4>
                          <div className="flex items-center gap-3">
                            <FormField
                              control={form.control}
                              name={`variants.${index}.isDefault`}
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={(checked) => handleDefaultChange(index, checked as boolean)}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">Predeterminada</FormLabel>
                                </FormItem>
                              )}
                            />
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeVariant(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Variant Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                          <FormField
                            control={form.control}
                            name={`variants.${index}.size`}
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
                                    {/* Clothing sizes for most categories */}
                                    {(watchedCategory?.includes('hombre.') ||
                                      watchedCategory?.includes('mujer.') ||
                                      watchedCategory?.includes('ninos.')) &&
                                      !watchedCategory?.includes('zapatos') &&
                                      !watchedCategory?.includes('accesorios') &&
                                      ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                                        <SelectItem key={size} value={size}>
                                          {size}
                                        </SelectItem>
                                      ))}

                                    {/* Shoe sizes for zapatos categories */}
                                    {watchedCategory?.includes('zapatos') &&
                                      ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'].map((size) => (
                                        <SelectItem key={size} value={size}>
                                          {size}
                                        </SelectItem>
                                      ))}

                                    {/* One size for accessories */}
                                    {watchedCategory?.includes('accesorios') &&
                                      ['Único'].map((size) => (
                                        <SelectItem key={size} value={size}>
                                          {size}
                                        </SelectItem>
                                      ))}

                                    {/* Baby sizes for baby categories */}
                                    {watchedCategory?.includes('bebe') &&
                                      ['0-3m', '3-6m', '6-9m', '9-12m', '12-18m'].map((size) => (
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
                            control={form.control}
                            name={`variants.${index}.color`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Color *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {commonColors.map((color) => (
                                      <SelectItem key={color.value} value={color.value}>
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="w-4 h-4 rounded-full border border-gray-300"
                                            style={{ backgroundColor: color.value }}
                                          />
                                          {color.name}
                                        </div>
                                      </SelectItem>
                                    ))}
                                    <Separator />
                                    <SelectItem value="custom">Personalizado...</SelectItem>
                                  </SelectContent>
                                </Select>
                                {field.value === 'custom' && (
                                  <div className="mt-2 flex gap-2">
                                    <Input
                                      type="color"
                                      onChange={(e) => field.onChange(e.target.value)}
                                      className="w-12 h-10 p-1 border rounded"
                                    />
                                    <Input
                                      placeholder="#FFFFFF"
                                      onChange={(e) => field.onChange(e.target.value)}
                                      className="flex-1"
                                    />
                                  </div>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`variants.${index}.stock`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Stock *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`variants.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Precio *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...field}
                                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`variants.${index}.sku`}
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

                        {/* Images Section for this variant */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-[#20313A]">Imágenes de la Variante</h5>
                          </div>

                          {/* Drag and Drop Zone */}
                          <div
                            className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                              dragActive === index
                                ? 'border-[#9EE493] bg-[#DBF7DC]'
                                : 'border-gray-300 hover:border-[#9EE493] hover:bg-gray-50'
                            }`}
                            onDragEnter={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDragActive(index);
                            }}
                            onDragLeave={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDragActive(null);
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDragActive(null);

                              const files = e.dataTransfer.files;
                              if (files && files.length > 0) {
                                handleImageUpload(index, files);
                              }
                            }}
                          >
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleImageUpload(index, e.target.files)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="text-center">
                              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium text-[#20313A]">Hacé clic para subir</span> o arrastrá las
                                imágenes aquí
                              </p>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB cada una</p>
                            </div>
                          </div>

                          {/* Image Preview Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {form.watch(`variants.${index}.images`)?.map((image, imageIndex) => (
                              <div key={imageIndex} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                                  <Image
                                    src={image.preview || '/placeholder.svg'}
                                    alt={`Variante ${index + 1} - Imagen ${imageIndex + 1}`}
                                    fill
                                    sizes="150px"
                                    className="object-cover"
                                  />
                                </div>
                                {image.isNew && (
                                  <Badge className="absolute top-1 left-1 text-xs bg-green-500">Nueva</Badge>
                                )}
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeImage(index, imageIndex)}
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}

                            {/* Empty state - only show if no images */}
                            {(!form.watch(`variants.${index}.images`) ||
                              form.watch(`variants.${index}.images`)?.length === 0) && (
                              <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                <div className="text-center">
                                  <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-xs text-gray-500">Sin imágenes</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {form.formState.errors.variants?.root && (
                      <p className="text-sm text-red-600">{form.formState.errors.variants.root.message}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pb-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/dashboard/${id}/products`)}
                    disabled={isUpdating}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A] min-w-[120px]"
                  >
                    {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </form>
            </Form>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
