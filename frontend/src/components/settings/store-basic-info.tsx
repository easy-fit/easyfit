import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Building, Store, Mail, Phone, Instagram, Facebook, Twitter } from 'lucide-react';
import { StoreSettingsFormValues } from '@/constants/store-settings';
import type { Store as StoreType } from '@/types/store';

interface StoreBasicInfoProps {
  form: UseFormReturn<StoreSettingsFormValues>;
  store: StoreType;
}

export function StoreBasicInfo({ form, store }: StoreBasicInfoProps) {
  return (
    <Card className="shadow-sm border-0 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-[#20313A] text-xl">
          <div className="p-2 bg-[#DBF7DC] rounded-lg">
            <Building className="h-5 w-5 text-[#20313A]" />
          </div>
          Información Básica
        </CardTitle>
        <CardDescription className="text-gray-600">Configura los datos principales de tu tienda</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="storeName" className="text-sm font-medium text-[#20313A] flex items-center gap-2">
              <Store className="h-4 w-4" />
              Nombre de la Tienda
            </Label>
            <Input
              id="storeName"
              value={store.name}
              disabled
              className="h-11 border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-[#20313A] flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email de Contacto
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    className="h-11 border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-[#20313A] flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Teléfono
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="+54 11 1234-5678"
                    className="h-11 border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[#20313A]">Tipo de Tienda</Label>
            <Input
              value={store.storeType === 'physical' ? 'Física' : 'Online'}
              disabled
              className="h-11 border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
          <FormField
            control={form.control}
            name="isOpen"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-3 pt-8">
                <FormControl>
                  <Switch
                    checked={field.value}
                    disabled
                    className="data-[state=checked]:bg-[#9EE493] data-[state=unchecked]:bg-gray-200 opacity-75"
                  />
                </FormControl>
                <div className="flex flex-col">
                  <FormLabel className="text-sm font-medium text-[#20313A]">Tienda Abierta (Automático)</FormLabel>
                  <p className="text-xs text-gray-600">
                    El estado se actualiza automáticamente según los horarios de retiro
                  </p>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-[#20313A] mb-4">Redes Sociales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="customization.socialLinks.instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-[#20313A] flex items-center gap-2">
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="@usuario o https://instagram.com/usuario"
                        className="h-11 border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customization.socialLinks.facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-[#20313A] flex items-center gap-2">
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://facebook.com/pagina"
                        className="h-11 border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customization.socialLinks.twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-[#20313A] flex items-center gap-2">
                      <Twitter className="h-4 w-4" />
                      Twitter/X
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="@usuario o https://twitter.com/usuario"
                        className="h-11 border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customization.socialLinks.tiktok"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-[#20313A] flex items-center gap-2">
                      <div className="h-4 w-4 flex items-center justify-center text-xs font-bold">🎵</div>
                      TikTok
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="@usuario o https://tiktok.com/@usuario"
                        className="h-11 border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
