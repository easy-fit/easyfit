import { Control } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { SizeSelector } from './SizeSelector';
import { ColorSelector } from './ColorSelector';
import { VariantImageUpload } from './VariantImageUpload';
import type { ProductFormValues } from './schemas';

interface VariantFormItemProps {
  control: Control<ProductFormValues>;
  index: number;
  canRemove: boolean;
  category?: string;
  onRemove: (index: number) => void;
  onDefaultChange: (index: number, checked: boolean) => void;
  onImageUpload: (variantIndex: number, files: FileList | null) => void;
  onImageRemove: (variantIndex: number, imageIndex: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watchVariant: any;
}

export function VariantFormItem({
  control,
  index,
  canRemove,
  category,
  onRemove,
  onDefaultChange,
  onImageUpload,
  onImageRemove,
  watchVariant,
}: VariantFormItemProps) {
  return (
    <div className="border rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-[#20313A]">
          Variante {index + 1}
          {watchVariant._id && (
            <Badge variant="outline" className="ml-2 text-xs">
              Existente
            </Badge>
          )}
        </h4>
        <div className="flex items-center gap-3">
          <FormField
            control={control}
            name={`variants.${index}.isDefault`}
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => onDefaultChange(index, checked as boolean)}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">Predeterminada</FormLabel>
              </FormItem>
            )}
          />
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
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
          control={control}
          name={`variants.${index}.size`}
          render={({ field }) => <SizeSelector field={field} category={category} />}
        />

        <FormField
          control={control}
          name={`variants.${index}.color`}
          render={({ field }) => <ColorSelector field={field} />}
        />

        <FormField
          control={control}
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
          control={control}
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
          control={control}
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

      {/* Images Section */}
      <VariantImageUpload
        images={watchVariant.images || []}
        variantIndex={index}
        onImageUpload={onImageUpload}
        onImageRemove={onImageRemove}
      />
    </div>
  );
}
