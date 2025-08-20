/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { StoreSidebar } from '@/components/dashboard/store-sidebar';

import { useCurrentStore } from '@/contexts/store-context';
import { useEasyFitToast } from '@/hooks/use-toast';
import { useProduct, useUpdateProduct, useCreateVariant } from '@/hooks/api/use-products';
import { useImageUpload } from '@/hooks/use-image-upload';
import { useEditProductForm } from '@/hooks/products/useEditProductForm';

// Components
import { ProductInformationSection } from '@/components/products/edit/ProductInformationSection';
import { VariantFormItem } from '@/components/products/edit/VariantFormItem';
import { LoadingState, ErrorState } from '@/components/products/edit/EditProductPageStates';

// Utils
import { updateProductData, processAllVariants, showResults } from '@/lib/utils/variant-operations';

export default function EditProductPage({ params }: { params: Promise<{ id: string; productId: string }> }) {
  const router = useRouter();
  const { id, productId } = React.use(params);
  const { storeName, logoUrl, accessType } = useCurrentStore();
  const toast = useEasyFitToast();
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Fetch product data
  const { data: productData, isLoading, error } = useProduct(productId);
  const updateProductMutation = useUpdateProduct(productId);
  const createVariantMutation = useCreateVariant(productId);

  // Use the custom hook for form management
  const { form, fields, addVariant, removeVariant, handleDefaultChange, handleImageUpload, removeImage } =
    useEditProductForm(productData);

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

  const watchedCategory = form.watch('category');

  const handleSubmit = async (data: any) => {
    setIsUpdating(true);

    const callbacks = {
      onUpdate: (message: string) => {
        toast.info('Producto actualizado', { description: message });
      },
      onSuccess: (message: string, description?: string) => {
        toast.success('Producto actualizado completamente', { description });
      },
      onWarning: (message: string, description?: string) => {
        toast.warning(message, { description });
      },
      onError: (message: string, description?: string) => {
        toast.error(message, { description });
      },
      uploadImages,
    };

    try {
      // Update product data
      await updateProductData(productId, data, updateProductMutation, callbacks);

      // Process all variants
      const result = await processAllVariants(productId, data.variants, createVariantMutation, callbacks);

      // Show final results
      showResults(result, callbacks);
      
      // Navigate back
      router.push(`/dashboard/${id}/products`);
    } catch (error) {
      callbacks.onError('Error al actualizar producto', 'No se pudieron guardar los cambios. Intentá nuevamente.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Loading state
  if (isLoading) {
    return <LoadingState storeName={storeName} logoUrl={logoUrl} storeId={id} message="Cargando producto..." userRole={accessType as 'owner' | 'manager' | 'none'} />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        storeName={storeName}
        logoUrl={logoUrl}
        storeId={id}
        message="Error cargando el producto"
        onGoBack={() => router.push(`/dashboard/${id}/products`)}
        userRole={accessType as 'owner' | 'manager' | 'none'}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarProvider>
        <StoreSidebar storeName={storeName} logoUrl={logoUrl} active="products" baseHref={`/dashboard/${id}`} userRole={accessType as 'owner' | 'manager' | 'none'} />
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
                <ProductInformationSection control={form.control} />

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
                      <VariantFormItem
                        key={field.id}
                        control={form.control}
                        index={index}
                        canRemove={fields.length > 1}
                        category={watchedCategory}
                        onRemove={removeVariant}
                        onDefaultChange={handleDefaultChange}
                        onImageUpload={handleImageUpload}
                        onImageRemove={removeImage}
                        watchVariant={form.watch(`variants.${index}`)}
                      />
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
