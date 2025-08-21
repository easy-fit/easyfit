'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useCurrentStore } from '@/contexts/store-context';
import { useEasyFitToast } from '@/hooks/use-toast';
import { useUpdateStore, useUploadStoreLogo, useUploadStoreBanner } from '@/hooks/api/use-stores';
import { useImageUpload } from '@/hooks/use-image-upload';
import { useStoreSettingsForm } from '@/hooks/settings/use-store-settings-form';
import type { UpdateStoreDTO } from '@/types/store';
import type { Address } from '@/types/global';
import { StoreSettingsFormValues } from '@/constants/store-settings';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { StoreSidebar } from '@/components/dashboard/store-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { StoreLocationModal } from '@/components/location/store-location-modal';
import { StoreBasicInfo } from '@/components/settings/store-basic-info';
import { StoreAddressSection } from '@/components/settings/store-address-section';
import { StoreHoursSection } from '@/components/settings/store-hours-section';
import { StoreTagsSection } from '@/components/settings/store-tags-section';
import { StoreCustomizationSection } from '@/components/settings/store-customization-section';
import { Save, Store, Truck, Loader2 } from 'lucide-react';
import { Form } from '@/components/ui/form';

export default function StoreSettingsPage() {
  const { id } = useParams() as { id: string };
  const { store, storeName, logoUrl, isLoading: storeLoading, canManageStore, accessType } = useCurrentStore();
  const toast = useEasyFitToast();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // API mutations
  const updateStoreMutation = useUpdateStore();
  const uploadLogoMutation = useUploadStoreLogo(id);
  const uploadBannerMutation = useUploadStoreBanner(id);

  // Form setup
  const form = useStoreSettingsForm({ store: store || undefined });

  // Image upload functionality
  const { uploadImages } = useImageUpload({
    onUploadComplete: (result) => {
      if (result.allSuccessful) {
        toast.success('Imagen subida exitosamente');
      } else {
        toast.warning('Algunas imágenes fallaron al subir');
      }
    },
    onUploadError: (error) => {
      toast.error('Error subiendo imagen', { description: error });
    },
  });

  const handleSubmit = async (data: StoreSettingsFormValues) => {
    try {
      const updateData: UpdateStoreDTO = {
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        cuit: data.cuit,
        tags: data.tags,
        pickupHours: data.pickupHours,
        customization: data.customization,
        // isOpen is now automatically managed by backend cron job based on pickup hours
        address: data.address,
      };

      await updateStoreMutation.mutateAsync({ id, store: updateData });
      toast.success('Configuración guardada exitosamente');
    } catch (error) {
      toast.error('Error al guardar configuración', {
        description: 'Por favor, intenta nuevamente',
      });
    }
  };

  const handleLocationSelect = (selectedAddress: Address) => {
    form.setValue('address', selectedAddress);
    setIsLocationModalOpen(false);
    toast.success('Dirección actualizada en el formulario. Haz clic en "Guardar" para confirmar los cambios.');
  };

  const handleLogoUpload = async (file: File) => {
    try {
      const key = `store-logos/${id}/${Date.now()}-${file.name}`;
      const response = await uploadLogoMutation.mutateAsync({
        key,
        contentType: file.type,
      });
      console.log(response);

      if (response.data.uploadInfo) {
        const signedUrl = {
          key_img: response.data.uploadInfo.key,
          url: response.data.uploadInfo.url,
        };

        const uploadResult = await uploadImages([file], [signedUrl]);
        if (uploadResult.allSuccessful) {
          const currentCustomization = form.getValues('customization') || {};
          form.setValue('customization', {
            ...currentCustomization,
            logoUrl: response.data.uploadInfo.key,
          });
          toast.success('Logo subido exitosamente');
        }
      }
    } catch (error) {
      toast.error('Error al subir logo');
    }
  };

  const handleBannerUpload = async (file: File) => {
    try {
      const key = `store-banners/${id}/${Date.now()}-${file.name}`;
      const response = await uploadBannerMutation.mutateAsync({
        key,
        contentType: file.type,
      });

      if (response.data.uploadInfo) {
        const signedUrl = {
          key_img: response.data.uploadInfo.key,
          url: response.data.uploadInfo.url,
        };
        const uploadResult = await uploadImages([file], [signedUrl]);
        if (uploadResult.allSuccessful) {
          const currentCustomization = form.getValues('customization') || {};
          form.setValue('customization', {
            ...currentCustomization,
            bannerUrl: response.data.uploadInfo.key,
          });
          toast.success('Banner subido exitosamente');
        }
      }
    } catch (error) {
      toast.error('Error al subir banner');
    }
  };

  const isUpdating = updateStoreMutation.isPending || uploadLogoMutation.isPending || uploadBannerMutation.isPending;

  // Handle loading state
  if (storeLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#9EE493] mx-auto mb-4" />
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  // Handle no store state
  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error cargando la tienda</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <StoreSidebar storeName={storeName} logoUrl={logoUrl} active="settings" baseHref={`/dashboard/${id}`} userRole={accessType} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4 shadow-sm">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2 flex-1">
            <Store className="h-5 w-5 text-[#20313A]" />
            <h1 className="text-base md:text-lg font-semibold text-[#20313A]">Configuración de Tienda</h1>
            <Badge variant="secondary" className="bg-[#DBF7DC] text-[#20313A] border-[#9EE493]">
              {store.status === 'active' ? 'Activa' : 'Inactiva'}
            </Badge>
          </div>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isUpdating}
            className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A] font-medium px-6 py-2 h-10 shadow-sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {isUpdating ? 'Guardando...' : 'Guardar'}
          </Button>
        </header>

        <main className="flex-1 space-y-8 p-4 md:p-6 bg-gray-50">
          {!canManageStore && (
            <Card className="shadow-sm border-0 bg-blue-50 border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                    Manager
                  </Badge>
                  <div>
                    <p className="text-blue-800 font-medium mb-1">Acceso limitado a configuración</p>
                    <p className="text-blue-700 text-sm">
                      Como manager, puedes gestionar horarios y etiquetas. Solo el propietario puede modificar información básica y diseño.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              {canManageStore && <StoreBasicInfo form={form} store={store} />}

              {canManageStore && <StoreAddressSection form={form} store={store} onChangeAddress={() => setIsLocationModalOpen(true)} />}

              <StoreHoursSection form={form} />

              <StoreTagsSection form={form} />

              {canManageStore && (
                <StoreCustomizationSection
                  form={form}
                  onLogoUpload={handleLogoUpload}
                  onBannerUpload={handleBannerUpload}
                  isUploadingLogo={uploadLogoMutation.isPending}
                  isUploadingBanner={uploadBannerMutation.isPending}
                />
              )}

              {/* Shipping Options - Coming Soon */}
              <Card className="shadow-sm border-0 bg-white opacity-60">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-[#20313A] text-xl">
                    <div className="p-2 bg-[#DBF7DC] rounded-lg">
                      <Truck className="h-5 w-5 text-[#20313A]" />
                    </div>
                    Opciones de Envío
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      Próximamente
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Esta funcionalidad estará disponible pronto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg opacity-50">
                    <Switch
                      id="freeShipping"
                      checked={false}
                      disabled={true}
                      className="data-[state=checked]:bg-[#9EE493]"
                    />
                    <Label htmlFor="freeShipping" className="text-sm font-medium text-[#20313A]">
                      Envío Gratis
                    </Label>
                  </div>
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">Estamos trabajando en las opciones de envío.</p>
                    <p className="text-gray-500 text-sm">¡Pronto estará disponible!</p>
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </main>
      </SidebarInset>

      <StoreLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSelect={handleLocationSelect}
        currentLocation={`${form.watch('address')?.formatted?.street || store.address?.formatted?.street || ''} ${
          form.watch('address')?.formatted?.streetNumber || store.address?.formatted?.streetNumber || ''
        }, ${form.watch('address')?.formatted?.city || store.address?.formatted?.city || ''}`}
      />
    </SidebarProvider>
  );
}
