'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Package2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { VariantWithProduct } from '@/types/variant';
import { calculateDiscountedPrice } from '@/lib/utils/variant-operations';

interface EditableVariant extends VariantWithProduct {
  isSelected: boolean;
  newStock?: number;
  newPrice?: number;
  newDiscount?: number;
  hasChanges?: boolean;
}

interface ProductVariantGroupProps {
  productId: string;
  productName: string;
  variants: EditableVariant[];
  onVariantSelect: (variantId: string) => void;
  onProductSelect: (productId: string, selected: boolean) => void;
  onVariantChange: (variantId: string, field: 'stock' | 'price' | 'discount', value: number) => void;
}

export function ProductVariantGroup({
  productId,
  productName,
  variants,
  onVariantSelect,
  onProductSelect,
  onVariantChange,
}: ProductVariantGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const selectedVariantsCount = variants.filter(v => v.isSelected).length;
  const allSelected = variants.length > 0 && selectedVariantsCount === variants.length;
  const someSelected = selectedVariantsCount > 0 && selectedVariantsCount < variants.length;
  const changedVariantsCount = variants.filter(v => v.hasChanges).length;

  const handleProductSelection = (checked: boolean) => {
    onProductSelect(productId, checked);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleHeaderClick = (e: React.MouseEvent) => {
    // Don't toggle if clicking on checkbox or its label
    const target = e.target as HTMLElement;
    if (target.closest('label') || target.closest('[role="checkbox"]') || target.closest('input[type="checkbox"]')) {
      return;
    }
    toggleExpanded();
  };

  const getStockStatusColor = (stock: number) => {
    if (stock === 0) return 'text-red-600';
    if (stock <= 10) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="border-b last:border-b-0">
      {/* Product Header */}
      <div 
        className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer select-none"
        onClick={handleHeaderClick}
      >
        <div className="p-1 h-auto min-w-0 flex items-center justify-center">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          )}
        </div>

        <Checkbox
          checked={allSelected}
          ref={(el) => {
            if (el instanceof HTMLInputElement) el.indeterminate = someSelected;
          }}
          onCheckedChange={handleProductSelection}
        />

        <Package2 className="h-5 w-5 text-gray-600" />

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{productName}</h3>
          <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
            <span>{variants.length} variante{variants.length !== 1 ? 's' : ''}</span>
            {selectedVariantsCount > 0 && (
              <Badge variant="default" className="text-xs">
                {selectedVariantsCount} seleccionada{selectedVariantsCount !== 1 ? 's' : ''}
              </Badge>
            )}
            {changedVariantsCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {changedVariantsCount} con cambios
              </Badge>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-500">
          {isExpanded ? 'Ocultar' : 'Mostrar'} variantes
        </div>
      </div>

      {/* Variants List */}
      {isExpanded && (
        <div className="divide-y">
          {variants.map((variant) => {
            const finalPrice = calculateDiscountedPrice(
              variant.newPrice ?? variant.price,
              variant.newDiscount ?? variant.discount
            );
            const originalFinalPrice = calculateDiscountedPrice(variant.price, variant.discount);

            return (
              <div 
                key={variant._id} 
                className={`flex items-center gap-3 p-4 pl-12 hover:bg-gray-50 transition-colors ${
                  variant.isSelected ? 'bg-blue-50' : ''
                }`}
              >
                <Checkbox
                  checked={variant.isSelected}
                  onCheckedChange={() => onVariantSelect(variant._id)}
                />

                {/* Variant Info */}
                <div className="flex-1 grid grid-cols-7 gap-4 items-center min-w-0">
                  {/* SKU */}
                  <div className="min-w-0">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono block truncate">
                      {variant.sku}
                    </code>
                  </div>

                  {/* Color */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: variant.color }}
                    />
                    <span className="text-sm text-gray-700 truncate">{variant.color}</span>
                  </div>

                  {/* Size */}
                  <div>
                    <Badge variant="outline" className="text-xs">
                      {variant.size}
                    </Badge>
                  </div>

                  {/* Stock */}
                  <div className="min-w-0">
                    <Input
                      type="number"
                      min="0"
                      value={variant.newStock !== undefined ? variant.newStock : variant.stock}
                      onChange={(e) => onVariantChange(variant._id, 'stock', parseInt(e.target.value) || 0)}
                      className="w-full h-8 text-xs"
                    />
                    {variant.newStock !== undefined && variant.newStock !== variant.stock && (
                      <p className="text-xs text-gray-500 mt-1">
                        Original: <span className={getStockStatusColor(variant.stock)}>{variant.stock}</span>
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-600">$</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.newPrice !== undefined ? variant.newPrice : variant.price}
                        onChange={(e) => onVariantChange(variant._id, 'price', parseFloat(e.target.value) || 0)}
                        className="flex-1 h-8 text-xs"
                      />
                    </div>
                    {variant.newPrice !== undefined && variant.newPrice !== variant.price && (
                      <p className="text-xs text-gray-500 mt-1">
                        Original: ${variant.price.toLocaleString('es-AR')}
                      </p>
                    )}
                  </div>

                  {/* Discount */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min="0"
                        max="99"
                        value={variant.newDiscount !== undefined ? variant.newDiscount : variant.discount}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          const clampedValue = Math.min(Math.max(value, 0), 99);
                          onVariantChange(variant._id, 'discount', clampedValue);
                        }}
                        className="flex-1 h-8 text-xs"
                        placeholder="0"
                      />
                      <span className="text-xs text-gray-600">%</span>
                    </div>
                    {(variant.newDiscount ?? variant.discount) > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        Final: ${finalPrice.toLocaleString('es-AR')}
                      </p>
                    )}
                    {variant.newDiscount !== undefined && variant.newDiscount !== variant.discount && (
                      <p className="text-xs text-gray-500">
                        Original: {variant.discount}%
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex flex-col gap-1">
                    {variant.hasChanges && (
                      <Badge variant="destructive" className="text-xs">
                        Modificado
                      </Badge>
                    )}
                    <span className={`text-xs font-medium ${getStockStatusColor(variant.newStock ?? variant.stock)}`}>
                      {(variant.newStock ?? variant.stock) === 0 
                        ? 'Sin stock' 
                        : (variant.newStock ?? variant.stock) <= 10 
                          ? 'Stock bajo' 
                          : 'En stock'
                      }
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}