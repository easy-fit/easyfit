import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { HierarchicalCategorySelector } from '@/components/products/hierarchical-category-selector';
import type { ProductCategory } from '@/types/product';
import { statusOptions } from './constants';
import type { ProductFormValues } from './schemas';

interface ProductInformationSectionProps {
  control: Control<ProductFormValues>;
}

export function ProductInformationSection({ control }: ProductInformationSectionProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Información del Producto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
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
          control={control}
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
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Descripción detallada del producto..." className="min-h-[120px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
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

        {/* Allowed Shipping Types */}
        <FormField
          control={control}
          name="allowedShippingTypes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Tipos de envío permitidos</FormLabel>
              <FormDescription className="text-sm">
                Si tu producto no puede probarse (ej: perfumes, skincare), seleccioná solo &quot;Envío Simple&quot;
              </FormDescription>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                <div className={`flex items-start p-4 rounded-lg border-2 transition-all ${
                  field.value?.includes('simple') ?? true
                    ? 'border-[#9EE493] bg-[#DBF7DC]/30'
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <Checkbox
                    checked={field.value?.includes('simple') ?? true}
                    onCheckedChange={(checked) => {
                      const current = field.value || ['simple', 'advanced', 'premium'];
                      if (checked) {
                        field.onChange([...current.filter((t) => t !== 'simple'), 'simple']);
                      } else {
                        field.onChange(current.filter((t) => t !== 'simple'));
                      }
                    }}
                    className="mt-0.5 data-[state=checked]:bg-[#9EE493] data-[state=checked]:border-[#9EE493]"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-semibold text-[#20313A]">Envío Simple</div>
                    <p className="text-xs text-gray-600 mt-1">Delivery tradicional a domicilio</p>
                  </div>
                </div>

                <div className={`flex items-start p-4 rounded-lg border-2 transition-all ${
                  field.value?.includes('advanced') ?? true
                    ? 'border-[#9EE493] bg-[#DBF7DC]/30'
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <Checkbox
                    checked={field.value?.includes('advanced') ?? true}
                    onCheckedChange={(checked) => {
                      const current = field.value || ['simple', 'advanced', 'premium'];
                      if (checked) {
                        field.onChange([...current.filter((t) => t !== 'advanced'), 'advanced']);
                      } else {
                        field.onChange(current.filter((t) => t !== 'advanced'));
                      }
                    }}
                    className="mt-0.5 data-[state=checked]:bg-[#9EE493] data-[state=checked]:border-[#9EE493]"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-semibold text-[#20313A]">Envío Avanzado</div>
                    <p className="text-xs text-gray-600 mt-1">El rider espera mientras probás (10 min)</p>
                  </div>
                </div>

                <div className={`flex items-start p-4 rounded-lg border-2 transition-all ${
                  field.value?.includes('premium') ?? true
                    ? 'border-[#9EE493] bg-[#DBF7DC]/30'
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <Checkbox
                    checked={field.value?.includes('premium') ?? true}
                    onCheckedChange={(checked) => {
                      const current = field.value || ['simple', 'advanced', 'premium'];
                      if (checked) {
                        field.onChange([...current.filter((t) => t !== 'premium'), 'premium']);
                      } else {
                        field.onChange(current.filter((t) => t !== 'premium'));
                      }
                    }}
                    className="mt-0.5 data-[state=checked]:bg-[#9EE493] data-[state=checked]:border-[#9EE493]"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-semibold text-[#20313A]">Envío Premium</div>
                    <p className="text-xs text-gray-600 mt-1">Más tiempo para probar (17 min)</p>
                  </div>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
