'use client';

import * as React from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { getSizeOptions } from './product-form-constants';

interface BulkSizeData {
  size: string;
  stock: number;
  sku: string;
}

interface BulkSizeSelectorProps {
  category: string;
  currentSize: string;
  onBulkAdd: (bulkSizes: BulkSizeData[]) => void;
}

export function BulkSizeSelector({ category, currentSize, onBulkAdd }: BulkSizeSelectorProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [bulkSizes, setBulkSizes] = React.useState<BulkSizeData[]>([
    { size: '', stock: 0, sku: '' }
  ]);

  const sizeOptions = getSizeOptions(category);
  const availableSizes = sizeOptions.filter(size => size !== currentSize);

  const addBulkSize = () => {
    setBulkSizes([...bulkSizes, { size: '', stock: 0, sku: '' }]);
  };

  const removeBulkSize = (index: number) => {
    setBulkSizes(bulkSizes.filter((_, i) => i !== index));
  };

  const updateBulkSize = (index: number, field: keyof BulkSizeData, value: string | number) => {
    const updated = [...bulkSizes];
    updated[index] = { ...updated[index], [field]: value };
    setBulkSizes(updated);
  };

  const handleBulkAdd = () => {
    const validSizes = bulkSizes.filter(bs => bs.size && bs.sku);
    if (validSizes.length > 0) {
      onBulkAdd(validSizes);
      setBulkSizes([{ size: '', stock: 0, sku: '' }]);
      setIsExpanded(false);
    }
  };

  const isValid = bulkSizes.some(bs => bs.size && bs.sku);

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <Button
        type="button"
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between text-left p-0 h-auto font-medium text-gray-700 hover:bg-transparent"
      >
        <span>Agregar talles adicionales</span>
        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-gray-600">
            Agregá más talles que compartirán el mismo color, precio e imágenes de esta variante.
          </p>

          {bulkSizes.map((bulkSize, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-4">
                <Label className="text-xs">Talle</Label>
                <Select
                  value={bulkSize.size}
                  onValueChange={(value) => updateBulkSize(index, 'size', value)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-3">
                <Label className="text-xs">Stock</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder=""
                  value={bulkSize.stock || ''}
                  onChange={(e) => updateBulkSize(index, 'stock', Number.parseInt(e.target.value) || 0)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="col-span-4">
                <Label className="text-xs">SKU</Label>
                <Input
                  placeholder="Ej: CAM-ROJ-L"
                  value={bulkSize.sku}
                  onChange={(e) => updateBulkSize(index, 'sku', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="col-span-1">
                {bulkSizes.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBulkSize(index)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addBulkSize}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Agregar Talle
            </Button>

            <Button
              type="button"
              onClick={handleBulkAdd}
              disabled={!isValid}
              size="sm"
              className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A] text-xs"
            >
              Crear Variantes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}