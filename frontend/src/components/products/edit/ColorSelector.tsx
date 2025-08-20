/* eslint-disable @typescript-eslint/no-explicit-any */
import { ControllerRenderProps } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { commonColors } from './constants';

interface ColorSelectorProps {
  field: ControllerRenderProps<any, any>;
}

export function ColorSelector({ field }: ColorSelectorProps) {
  return (
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
                <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: color.value }} />
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
          <Input placeholder="#FFFFFF" onChange={(e) => field.onChange(e.target.value)} className="flex-1" />
        </div>
      )}
      <FormMessage />
    </FormItem>
  );
}
