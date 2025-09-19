/* eslint-disable @typescript-eslint/no-explicit-any */
import { ControllerRenderProps } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { getSizesForCategory } from './constants';

interface SizeSelectorProps {
  field: ControllerRenderProps<any, any>;
  category?: string;
}

export function SizeSelector({ field, category }: SizeSelectorProps) {
  const availableSizes = getSizesForCategory(category || '');
  const isCorseteria = category === 'mujer.corseteria';

  // For corseteria, check if current value is in available sizes or is custom
  const isCustomSize = isCorseteria || (field.value && !availableSizes.includes(field.value) && field.value !== 'custom');

  return (
    <FormItem>
      <FormLabel>Talle *</FormLabel>
      {isCorseteria ? (
        // For corseteria, use direct input since sizes are numeric and varied
        <FormControl>
          <Input
            placeholder="Ej: 85, 90, 95..."
            value={field.value || ''}
            onChange={(e) => field.onChange(e.target.value)}
          />
        </FormControl>
      ) : (
        <Select onValueChange={field.onChange} value={isCustomSize ? 'custom' : field.value}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {availableSizes.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
            {availableSizes.length > 0 && <Separator />}
            {isCustomSize && (
              <SelectItem value="custom">
                {field.value} (Personalizado)
              </SelectItem>
            )}
            {!isCustomSize && (
              <SelectItem value="custom">Personalizado...</SelectItem>
            )}
          </SelectContent>
        </Select>
      )}
      {field.value === 'custom' && !isCorseteria && (
        <Input placeholder="Talle personalizado" onChange={(e) => field.onChange(e.target.value)} className="mt-2" />
      )}
      <FormMessage />
    </FormItem>
  );
}
