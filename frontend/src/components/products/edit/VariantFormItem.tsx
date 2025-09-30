import { Control } from 'react-hook-form';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { SizeSelector } from './SizeSelector';
import { ColorSelector } from './ColorSelector';
import { VariantImageUpload } from './VariantImageUpload';
import { BulkSizeSelector } from '../bulk-size-selector';
import type { ProductFormValues } from './schemas';

interface BulkSizeData {
  size: string;
  stock: number;
  sku: string;
}

interface VariantFormItemProps {
  control: Control<ProductFormValues>;
  index: number;
  canRemove: boolean;
  category?: string;
  productId: string;
  onRemove: (index: number) => void;
  onDeleteVariant?: (variantId: string) => Promise<void>;
  onDefaultChange: (index: number, checked: boolean) => void;
  onImageUpload: (variantIndex: number, files: FileList | null) => void;
  onImageRemove: (variantIndex: number, imageIndex: number) => void;
  onDeleteImage?: (variantId: string, imageKey: string) => Promise<void>;
  onBulkAdd?: (baseVariantIndex: number, bulkSizes: BulkSizeData[]) => void;
  isDeleting?: boolean;
  isDeletingImage?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watchVariant: any;
}

export function VariantFormItem({
  control,
  index,
  canRemove,
  category,
  productId,
  onRemove,
  onDeleteVariant,
  onDefaultChange,
  onImageUpload,
  onImageRemove,
  onDeleteImage,
  onBulkAdd,
  isDeleting = false,
  isDeletingImage = false,
  watchVariant,
}: VariantFormItemProps) {
  const handleDelete = async () => {
    const isExistingVariant = watchVariant._id;
    
    if (isExistingVariant) {
      // Show confirmation for existing variants
      if (window.confirm('¿Estás seguro de eliminar esta variante? Esta acción no se puede deshacer.')) {
        try {
          await onDeleteVariant?.(watchVariant._id);
        } catch (error) {
          console.error('Error deleting variant:', error);
        }
      }
    } else {
      // For new variants, just remove from form
      onRemove(index);
    }
  };
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
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
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
                  placeholder=""
                  {...field}
                  value={field.value || ''}
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
                  placeholder=""
                  {...field}
                  value={field.value || ''}
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
        productId={productId}
        variantId={watchVariant._id}
        onImageUpload={onImageUpload}
        onImageRemove={onImageRemove}
        onDeleteImage={onDeleteImage}
        isDeletingImage={isDeletingImage}
      />

      {/* Bulk Size Addition - Only show if variant has color, price and size defined */}
      {watchVariant?.color && watchVariant?.price && watchVariant?.size && onBulkAdd && category && (
        <BulkSizeSelector
          category={category}
          currentSize={watchVariant.size}
          onBulkAdd={(bulkSizes) => onBulkAdd(index, bulkSizes)}
        />
      )}
    </div>
  );
}
