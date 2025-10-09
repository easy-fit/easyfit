'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { getSizeOptions } from './product-form-constants';

interface SizeStockData {
  size: string;
  stock: number;
  price: number;
  sku: string;
}

interface SizeStockManagerProps {
  category: string;
  currentColor: string;
  basePrice: number;
  baseSku: string;
  onSizesChange: (sizes: SizeStockData[]) => void;
}

export function SizeStockManager({
  category,
  currentColor,
  basePrice,
  baseSku,
  onSizesChange,
}: SizeStockManagerProps) {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [stockValues, setStockValues] = useState<Record<string, number>>({});
  const [priceValues, setPriceValues] = useState<Record<string, number>>({});
  const [customSizes, setCustomSizes] = useState<string[]>([]);
  const [newCustomSize, setNewCustomSize] = useState<string>('');

  const suggestedSizes = getSizeOptions(category);
  const allAvailableSizes = [...new Set([...suggestedSizes, ...customSizes])];

  const handleSizeToggle = (size: string, checked: boolean) => {
    if (checked) {
      setSelectedSizes(prev => [...prev, size]);
      setStockValues(prev => ({ ...prev, [size]: 0 }));
      setPriceValues(prev => ({ ...prev, [size]: basePrice }));
    } else {
      setSelectedSizes(prev => prev.filter(s => s !== size));
      setStockValues(prev => {
        const { [size]: _, ...rest } = prev;
        return rest;
      });
      setPriceValues(prev => {
        const { [size]: _, ...rest } = prev;
        return rest;
      });
    }

    // Notify parent of changes
    updateParent();
  };

  const handleStockChange = (size: string, stock: number) => {
    setStockValues(prev => ({ ...prev, [size]: stock }));
    updateParent();
  };

  const handlePriceChange = (size: string, price: number) => {
    setPriceValues(prev => ({ ...prev, [size]: price }));
    updateParent();
  };

  const handleAddCustomSize = () => {
    if (newCustomSize && !allAvailableSizes.includes(newCustomSize)) {
      setCustomSizes(prev => [...prev, newCustomSize]);
      setNewCustomSize('');
    }
  };

  const handleRemoveCustomSize = (size: string) => {
    setCustomSizes(prev => prev.filter(s => s !== size));
    // If the size was selected, unselect it
    if (selectedSizes.includes(size)) {
      handleSizeToggle(size, false);
    }
  };

  const updateParent = () => {
    // Use setTimeout to ensure state is updated
    setTimeout(() => {
      const sizeData: SizeStockData[] = selectedSizes.map(size => ({
        size,
        stock: stockValues[size] || 0,
        price: priceValues[size] || basePrice,
        sku: generateSku(size),
      }));
      onSizesChange(sizeData);
    }, 0);
  };

  const generateSku = (size: string) => {
    // Simple SKU generation pattern
    return `${baseSku}-${size}`;
  };

  return (
    <div className="border-t pt-4">
      <div className="mb-4">
        <h4 className="text-sm font-medium text-[#20313A] mb-2">Talles y Stock</h4>
        <p className="text-xs text-gray-600">
          Selecciona los talles disponibles para este color y especifica el stock y precio de cada uno:
        </p>
      </div>

      {/* Add Custom Size Section */}
      <div className="mb-4 p-3 bg-gray-50 border rounded-lg">
        <Label className="text-xs font-medium mb-2 block">Agregar Talle Personalizado</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ej: S, M, L, 85, 90, etc."
            value={newCustomSize}
            onChange={(e) => setNewCustomSize(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSize()}
            className="flex-1 h-8 text-xs"
          />
          <Button
            type="button"
            onClick={handleAddCustomSize}
            disabled={!newCustomSize || allAvailableSizes.includes(newCustomSize)}
            size="sm"
            className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A] h-8 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Agregar
          </Button>
        </div>
        {newCustomSize && allAvailableSizes.includes(newCustomSize) && (
          <p className="text-xs text-amber-600 mt-1">Este talle ya existe</p>
        )}
      </div>

      {/* Show Suggested and Custom Sizes */}
      {suggestedSizes.length > 0 && (
        <div className="mb-3">
          <Label className="text-xs text-gray-600 mb-2 block">Talles sugeridos:</Label>
          <div className="flex flex-wrap gap-2">
            {suggestedSizes.map((size) => (
              <Badge key={size} variant="outline" className="text-xs">
                {size}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {customSizes.length > 0 && (
        <div className="mb-3">
          <Label className="text-xs text-gray-600 mb-2 block">Talles personalizados:</Label>
          <div className="flex flex-wrap gap-2">
            {customSizes.map((size) => (
              <Badge key={size} variant="secondary" className="text-xs pr-1">
                {size}
                <button
                  type="button"
                  onClick={() => handleRemoveCustomSize(size)}
                  className="ml-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {allAvailableSizes.length > 0 ? (
          allAvailableSizes.map((size) => (
            <div key={size} className="flex items-center space-x-3 p-3 border rounded-md bg-gray-50">
              <Checkbox
                id={`size-${size}`}
                checked={selectedSizes.includes(size)}
                onCheckedChange={(checked) => handleSizeToggle(size, !!checked)}
              />
              <Label htmlFor={`size-${size}`} className="flex-1 font-medium min-w-[60px] flex items-center gap-2">
                Talle {size}
                {customSizes.includes(size) && (
                  <Badge variant="secondary" className="text-xs">Personalizado</Badge>
                )}
              </Label>
              {selectedSizes.includes(size) && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Label className="text-xs text-gray-600">Stock:</Label>
                    <Input
                      type="number"
                      min="0"
                      value={stockValues[size] || 0}
                      onChange={(e) => handleStockChange(size, Number.parseInt(e.target.value) || 0)}
                      className="w-16 h-8 text-sm"
                    />
                  </div>
                  <div className="flex items-center space-x-1">
                    <Label className="text-xs text-gray-600">Precio:</Label>
                    <Input
                      type="number"
                      min="500"
                      step="0.01"
                      value={priceValues[size] || basePrice}
                      onChange={(e) => handlePriceChange(size, Number.parseFloat(e.target.value) || basePrice)}
                      className="w-20 h-8 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm">
            No hay talles disponibles. Agrega un talle personalizado arriba.
          </div>
        )}
      </div>

      {selectedSizes.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            ✓ {selectedSizes.length} talle{selectedSizes.length > 1 ? 's' : ''} seleccionado{selectedSizes.length > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
