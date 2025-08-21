'use client';

import { Button } from '@/components/ui/button';
import type { Variant } from '@/types/variant';

interface ProductVariantSelectorProps {
  variants: Variant[];
  selectedSize: string;
  selectedColor: string;
  selectedVariant: Variant | null;
  onSizeChange: (size: string) => void;
  onColorChange: (color: string) => void;
}

export function ProductVariantSelector({
  variants,
  selectedSize,
  selectedColor,
  selectedVariant,
  onSizeChange,
  onColorChange,
}: ProductVariantSelectorProps) {
  // Get unique sizes and colors
  const availableSizes = [...new Set(variants.map((v) => v.size))];
  const availableColors = [...new Set(variants.map((v) => v.color))];

  return (
    <div className="space-y-4">
      {/* Color Selection */}
      <div>
        <h3 className="font-semibold text-[#20313A] mb-3">Color</h3>
        <div className="flex gap-2">
          {availableColors.map((color) => {
            // Un color está disponible si existe al menos una variante con ese color que tenga stock
            const isAvailable = variants.some((v) => v.color === color && v.stock > 0);
            return (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                disabled={!isAvailable}
                className={`w-8 h-8 rounded-full border-2 ${
                  selectedColor === color ? 'border-[#20313A]' : 'border-gray-300'
                } ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ backgroundColor: color }}
                title={`Color ${color} ${!isAvailable ? '(No disponible)' : ''}`}
              />
            );
          })}
        </div>
      </div>

      {/* Size Selection */}
      <div>
        <h3 className="font-semibold text-[#20313A] mb-3">Talle</h3>
        <div className="flex gap-2">
          {availableSizes.map((size) => {
            // Un talle está disponible si existe al menos una variante con ese talle que tenga stock
            const isAvailable = variants.some((v) => v.size === size && v.stock > 0);
            return (
              <Button
                key={size}
                variant={selectedSize === size ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSizeChange(size)}
                disabled={!isAvailable}
                className={
                  selectedSize === size
                    ? 'bg-[#9EE493] text-[#20313A] hover:bg-[#8BD480]'
                    : `border-gray-300 hover:bg-gray-50 bg-transparent ${
                        !isAvailable ? 'opacity-50 cursor-not-allowed' : ''
                      }`
                }
              >
                {size}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Current Selection Info */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600 flex items-center gap-2">
          Seleccionado: <span className="font-medium text-[#20313A]">Talle {selectedSize}</span> •{' '}
          <span className="font-medium text-[#20313A] flex items-center gap-1">
            Color
            <div
              className="w-4 h-4 rounded-full border border-gray-300 inline-block"
              style={{ backgroundColor: selectedColor }}
            />
          </span>
        </p>
      </div>

      {/* Stock Info */}
      {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${selectedVariant.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-gray-600">
            {selectedVariant.stock === 1 ? 'Última unidad' : selectedVariant.stock < 5 ? 'Últimas unidades' : ''}
          </span>
        </div>
      )}
      {selectedVariant && selectedVariant.stock === 0 && (
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-gray-600">Sin stock</span>
        </div>
      )}
    </div>
  );
}
