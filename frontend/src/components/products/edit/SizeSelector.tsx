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

  return (
    <FormItem>
      <FormLabel>Talle *</FormLabel>
      <Select onValueChange={field.onChange} value={field.value}>
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
          <SelectItem value="custom">Personalizado...</SelectItem>
        </SelectContent>
      </Select>
      {field.value === 'custom' && (
        <Input placeholder="Talle personalizado" onChange={(e) => field.onChange(e.target.value)} className="mt-2" />
      )}
      <FormMessage />
    </FormItem>
  );
}
