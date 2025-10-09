/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { getSizesForCategory } from './constants';

interface SizeSelectorProps {
  field: ControllerRenderProps<any, any>;
  category?: string;
}

export function SizeSelector({ field, category }: SizeSelectorProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestedSizes = getSizesForCategory(category || '');

  const handleSizeSelect = (size: string) => {
    field.onChange(size);
    setShowSuggestions(false);
  };

  return (
    <FormItem>
      <FormLabel>Talle *</FormLabel>
      <FormControl>
        <div className="relative">
          <Input
            placeholder={suggestedSizes.length > 0 ? "Ej: S, M, L, 85, 90, etc." : "Ingrese el talle"}
            value={field.value || ''}
            onChange={(e) => field.onChange(e.target.value)}
            onFocus={() => suggestedSizes.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {showSuggestions && suggestedSizes.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
              <div className="p-2 bg-gray-50 border-b text-xs text-gray-600 font-medium">
                Talles sugeridos (o ingresá uno personalizado)
              </div>
              <div className="p-2 grid grid-cols-3 gap-1">
                {suggestedSizes.map((size) => (
                  <Button
                    key={size}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSizeSelect(size)}
                    className="h-8 text-xs"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </FormControl>
      {field.value && !suggestedSizes.includes(field.value) && (
        <Badge variant="secondary" className="text-xs mt-1">
          Talle personalizado
        </Badge>
      )}
      <FormMessage />
    </FormItem>
  );
}
