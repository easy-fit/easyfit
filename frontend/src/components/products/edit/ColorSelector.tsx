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
  // Check if current value is a predefined color or custom hex (case-insensitive)
  const matchingColor = commonColors.find(color => color.value.toLowerCase() === field.value?.toLowerCase());
  const isCustomColor = field.value &&
    field.value !== 'custom' &&
    !matchingColor;


  // Get the display value for the select
  const selectValue = isCustomColor ? 'custom' : field.value;

  const handleSelectChange = (value: string) => {
    if (value === 'custom') {
      // If switching to custom, set to 'custom' to show the inputs
      field.onChange('custom');
    } else {
      // Predefined color selected
      field.onChange(value);
    }
  };

  return (
    <FormItem>
      <FormLabel>Color *</FormLabel>
      <Select onValueChange={handleSelectChange} value={selectValue}>
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
          {isCustomColor && (
            <SelectItem value="custom">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: field.value }} />
                {field.value}
              </div>
            </SelectItem>
          )}
          {!isCustomColor && (
            <SelectItem value="custom">Personalizado...</SelectItem>
          )}
        </SelectContent>
      </Select>
      {(field.value === 'custom' || isCustomColor) && (
        <div className="mt-2 flex gap-2">
          <Input
            type="color"
            value={field.value === 'custom' ? '#ffffff' : field.value}
            onChange={(e) => field.onChange(e.target.value)}
            className="w-12 h-10 p-1 border rounded"
          />
          <Input
            placeholder="#FFFFFF"
            value={field.value === 'custom' ? '' : field.value}
            onChange={(e) => {
              const inputValue = e.target.value;
              // If user types a valid hex color, use it; otherwise keep the input
              if (inputValue.match(/^#[0-9A-Fa-f]{6}$/) || inputValue === '') {
                field.onChange(inputValue || 'custom');
              } else {
                field.onChange(inputValue);
              }
            }}
            className="flex-1"
          />
        </div>
      )}
      <FormMessage />
    </FormItem>
  );
}
