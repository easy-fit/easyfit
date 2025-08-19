'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { StoreSidebar } from '@/components/dashboard/store-sidebar';
import { ProductBasicInfo } from '@/components/products/product-basic-info';
import { ProductVariantsSection } from '@/components/products/product-variants-section';

import { useCurrentStore } from '@/contexts/store-context';
import { useEasyFitToast } from '@/hooks/use-toast';
import { useCreateProduct } from '@/hooks/api/use-products';
import { useProductForm } from '@/hooks/use-product-form';
import { useImageUpload } from '@/hooks/use-image-upload';
import type { ProductFormValues } from '@/components/products/product-form-schema';

export default function NewProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const { storeName, logoUrl, accessType } = useCurrentStore();
  const toast = useEasyFitToast();
  const [isCreating, setIsCreating] = React.useState(false);
  const [uploadingImages, setUploadingImages] = React.useState(false);
  const createProductMutation = useCreateProduct();

  const { form, fieldArray, addVariant, handleDefaultChange } = useProductForm();
  const watchedCategory = form.watch('category');
  
  const { uploadImages } = useImageUpload({
    onUploadComplete: (result) => {
      if (result.allSuccessful) {
        toast.success('Imágenes subidas', {
          description: 'Todas las imágenes se subieron correctamente'
        });
      } else {
        toast.warning('Algunas imágenes fallaron', {
          description: `${result.failedCount} de ${result.results.length} imágenes no se pudieron subir`
        });
      }
    },
    onUploadError: (error) => {
      toast.error('Error subiendo imágenes', {
        description: error
      });
    }
  });

  const handleSubmit = async (data: ProductFormValues) => {
    setIsCreating(true);
    try {
      // Generate random keys for images
      const generateRandomKey = () => `${Math.random().toString(36).substr(2, 9)}.jpg`;

      // Transform form data to match API structure
      const productPayload = {
        storeId: id,
        product: {
          title: data.title,
          description: data.description || '',
          category: data.category,
          status: data.status,
        },
        variants: data.variants.map((variant) => ({
          size: variant.size,
          color: variant.color,
          price: variant.price,
          stock: variant.stock,
          sku: variant.sku,
          isDefault: variant.isDefault,
          images: variant.images.map((image, index) => ({
            key: generateRandomKey(),
            contentType: image.file?.type || 'image/jpeg',
            altText: image.altText || 'Imagen del producto',
            order: index + 1,
          })),
        })),
      };

      // Create product and get signed URLs
      const response = await createProductMutation.mutateAsync(productPayload);
      const signedUrls = response.data.signedUrls;

      // Collect all image files from variants
      const allImageFiles: File[] = [];
      data.variants.forEach((variant) => {
        variant.images.forEach((image) => {
          if (image.file) {
            allImageFiles.push(image.file);
          }
        });
      });

      // Upload images if there are any
      if (allImageFiles.length > 0 && signedUrls.length > 0) {
        setUploadingImages(true);
        toast.info('Subiendo imágenes...', {
          description: `Subiendo ${allImageFiles.length} imágenes`
        });

        try {
          const uploadResult = await uploadImages(allImageFiles, signedUrls);
          
          if (!uploadResult.allSuccessful) {
            toast.warning('Producto creado con advertencias', {
              description: `El producto se creó pero ${uploadResult.failedCount} imágenes no se pudieron subir`,
            });
          }
        } finally {
          setUploadingImages(false);
        }
      }

      toast.success('Producto creado', {
        description: 'El producto se creó exitosamente',
      });

      router.push(`/dashboard/${id}/products`);
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Error al crear producto', {
        description: 'No se pudo crear el producto. Intentá nuevamente.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarProvider>
        <StoreSidebar storeName={storeName} logoUrl={logoUrl} active="products" baseHref={`/dashboard/${id}`} userRole={accessType} />
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
              <h1 className="text-base md:text-lg font-semibold text-[#20313A]">Nuevo Producto</h1>
              <Badge variant="secondary">Creación</Badge>
            </div>
          </header>

          <main className="p-4 md:p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-6xl mx-auto space-y-8">
                {/* Product Information */}
                <ProductBasicInfo control={form.control} />

                {/* Variants Section */}
                <ProductVariantsSection
                  control={form.control}
                  setValue={form.setValue}
                  watch={form.watch}
                  fieldArray={fieldArray}
                  watchedCategory={watchedCategory}
                  onAddVariant={addVariant}
                  onDefaultChange={handleDefaultChange}
                  formErrors={form.formState.errors}
                />

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pb-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/dashboard/${id}/products`)}
                    disabled={isCreating}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreating || uploadingImages}
                    className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A] min-w-[120px]"
                  >
                    {uploadingImages 
                      ? 'Subiendo imágenes...' 
                      : isCreating 
                      ? 'Creando...' 
                      : 'Crear Producto'
                    }
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
