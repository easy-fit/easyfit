'use client';

import { useState, useEffect, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { commonColors, getSizeOptions } from './product-form-constants';

export interface VariantCombination {
  color: string;
  size: string;
  stock: number;
  price: number;
  sku: string;
  selected: boolean;
}

export interface VariantsManagerData {
  variants: VariantCombination[];
  selectedCount: number;
}

interface ProductVariantsManagerProps {
  category: string;
  basePrice: number;
  baseSku: string;
  onChange: (data: VariantsManagerData) => void;
}

export function ProductVariantsManager({
  category,
  basePrice,
  baseSku,
  onChange,
}: ProductVariantsManagerProps) {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [customSizes, setCustomSizes] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantCombination[]>([]);
  const [bulkPrice, setBulkPrice] = useState<number>(basePrice);
  const [bulkStock, setBulkStock] = useState<number>(0);
  const [newCustomSize, setNewCustomSize] = useState<string>('');

  const suggestedSizes = getSizeOptions(category);
  const allSizes = [...new Set([...suggestedSizes, ...customSizes])];

  const generateSku = useCallback((color: string, size: string) => {
    const colorCode = color.substring(0, 3).toUpperCase();
    const sizeCode = size.toUpperCase();
    return `${baseSku}-${colorCode}-${sizeCode}`;
  }, [baseSku]);

  // Generate all possible combinations when colors or sizes change
  useEffect(() => {
    const newVariants: VariantCombination[] = [];

    selectedColors.forEach(color => {
      allSizes.forEach(size => {
        newVariants.push({
          color,
          size,
          stock: 0,
          price: basePrice,
          sku: generateSku(color, size),
          selected: false,
        });
      });
    });

    setVariants(newVariants);
  }, [selectedColors, allSizes.length, basePrice, baseSku, generateSku]);

  // Notify parent when variants change
  const notifyParent = useCallback(() => {
    const selectedVariants = variants.filter(v => v.selected);
    onChange({
      variants: selectedVariants,
      selectedCount: selectedVariants.length,
    });
  }, [variants, onChange]);

  useEffect(() => {
    notifyParent();
  }, [notifyParent]);

  const handleColorToggle = (color: string, checked: boolean) => {
    if (checked) {
      setSelectedColors(prev => [...prev, color]);
    } else {
      setSelectedColors(prev => prev.filter(c => c !== color));
    }
  };

  const handleAddCustomSize = () => {
    if (newCustomSize && !allSizes.includes(newCustomSize)) {
      setCustomSizes(prev => [...prev, newCustomSize]);
      setNewCustomSize('');
    }
  };

  const handleRemoveCustomSize = (size: string) => {
    setCustomSizes(prev => prev.filter(s => s !== size));
  };

  const handleVariantToggle = (color: string, size: string, checked: boolean) => {
    setVariants(prev => prev.map(variant =>
      variant.color === color && variant.size === size
        ? { ...variant, selected: checked }
        : variant
    ));
  };

  const handleVariantUpdate = (color: string, size: string, field: 'stock' | 'price', value: number) => {
    setVariants(prev => prev.map(variant =>
      variant.color === color && variant.size === size
        ? {
            ...variant,
            [field]: value,
            sku: field === 'price' ? variant.sku : generateSku(color, size)
          }
        : variant
    ));
  };

  const handleBulkSetPrice = () => {
    setVariants(prev => prev.map(variant =>
      variant.selected ? { ...variant, price: bulkPrice } : variant
    ));
  };

  const handleBulkSetStock = () => {
    setVariants(prev => prev.map(variant =>
      variant.selected ? { ...variant, stock: bulkStock } : variant
    ));
  };

  const handleSelectAll = () => {
    setVariants(prev => prev.map(variant => ({ ...variant, selected: true })));
  };

  const handleClearAll = () => {
    setVariants(prev => prev.map(variant => ({ ...variant, selected: false })));
  };

  const selectedVariantsCount = variants.filter(v => v.selected).length;

  if (allSizes.length === 0 && customSizes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Variantes del Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Selecciona una categoría válida para mostrar talles sugeridos, o agrega talles personalizados.
          </p>

          {/* Add custom size section */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium mb-2 block">Agregar Talles Personalizados</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ej: S, M, L, 85, 90, etc."
                value={newCustomSize}
                onChange={(e) => setNewCustomSize(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSize()}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddCustomSize}
                disabled={!newCustomSize || allSizes.includes(newCustomSize)}
                className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]"
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Variantes del Producto</CardTitle>
          <Badge variant={selectedVariantsCount > 0 ? "default" : "secondary"}>
            {selectedVariantsCount} variante{selectedVariantsCount !== 1 ? 's' : ''} seleccionada{selectedVariantsCount !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color Selection */}
        <div>
          <Label className="text-base font-medium mb-3 block">Colores Disponibles</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {commonColors.map((color) => (
              <div key={color.value} className="flex items-center space-x-2 p-2 border rounded-md">
                <Checkbox
                  id={`color-${color.value}`}
                  checked={selectedColors.includes(color.value)}
                  onCheckedChange={(checked) => handleColorToggle(color.value, !!checked)}
                />
                <div
                  className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: color.value }}
                />
                <Label htmlFor={`color-${color.value}`} className="text-sm font-medium cursor-pointer">
                  {color.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Size Management */}
        <div>
          <Label className="text-base font-medium mb-3 block">Talles</Label>

          {/* Suggested Sizes */}
          {suggestedSizes.length > 0 && (
            <div className="mb-3">
              <Label className="text-sm text-gray-600 mb-2 block">Sugerencias para esta categoría:</Label>
              <div className="flex flex-wrap gap-2">
                {suggestedSizes.map((size) => (
                  <Badge key={size} variant="outline" className="text-sm py-1 px-2">
                    {size}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Custom Sizes */}
          {customSizes.length > 0 && (
            <div className="mb-3">
              <Label className="text-sm text-gray-600 mb-2 block">Talles personalizados:</Label>
              <div className="flex flex-wrap gap-2">
                {customSizes.map((size) => (
                  <Badge key={size} variant="secondary" className="text-sm py-1 px-2 pr-1">
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

          {/* Add Custom Size */}
          <div className="border rounded-lg p-3 bg-gray-50">
            <Label className="text-sm font-medium mb-2 block">Agregar Talle Personalizado</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ej: S, M, L, 85, 90, etc."
                value={newCustomSize}
                onChange={(e) => setNewCustomSize(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSize()}
                className="flex-1 h-9"
              />
              <Button
                type="button"
                onClick={handleAddCustomSize}
                disabled={!newCustomSize || allSizes.includes(newCustomSize)}
                size="sm"
                className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]"
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </div>
            {newCustomSize && allSizes.includes(newCustomSize) && (
              <p className="text-xs text-amber-600 mt-1">Este talle ya existe</p>
            )}
          </div>
        </div>

        {/* Variants Matrix */}
        {selectedColors.length > 0 && allSizes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-medium">Matriz de Variantes</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={variants.length === 0}
                >
                  Seleccionar Todo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  disabled={selectedVariantsCount === 0}
                >
                  Limpiar Todo
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedVariantsCount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-3">Acciones en Lote</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm">Precio:</Label>
                    <Input
                      type="number"
                      min="500"
                      step="0.01"
                      value={bulkPrice}
                      onChange={(e) => setBulkPrice(Number.parseFloat(e.target.value) || basePrice)}
                      className="w-24 h-8"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleBulkSetPrice}>
                      Aplicar a {selectedVariantsCount}
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm">Stock:</Label>
                    <Input
                      type="number"
                      min="0"
                      value={bulkStock}
                      onChange={(e) => setBulkStock(Number.parseInt(e.target.value) || 0)}
                      className="w-24 h-8"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleBulkSetStock}>
                      Aplicar a {selectedVariantsCount}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Variants Grid */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left font-medium text-gray-900">Color/Talle</th>
                      {allSizes.map(size => (
                        <th key={size} className="p-3 text-center font-medium text-gray-900 min-w-[120px]">
                          {size}
                          {customSizes.includes(size) && (
                            <Badge variant="secondary" className="ml-1 text-xs">Custom</Badge>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedColors.map(color => {
                      const colorInfo = commonColors.find(c => c.value === color);
                      return (
                        <tr key={color} className="border-t">
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: color }}
                              />
                              <span className="font-medium">{colorInfo?.name}</span>
                            </div>
                          </td>
                          {allSizes.map(size => {
                            const variant = variants.find(v => v.color === color && v.size === size);
                            if (!variant) return <td key={size} className="p-3"></td>;

                            return (
                              <td key={`${color}-${size}`} className="p-3">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-center">
                                    <Checkbox
                                      checked={variant.selected}
                                      onCheckedChange={(checked) =>
                                        handleVariantToggle(color, size, !!checked)
                                      }
                                    />
                                  </div>
                                  {variant.selected && (
                                    <>
                                      <div>
                                        <Label className="text-xs text-gray-600">Stock:</Label>
                                        <Input
                                          type="number"
                                          min="0"
                                          value={variant.stock}
                                          onChange={(e) =>
                                            handleVariantUpdate(color, size, 'stock',
                                              Number.parseInt(e.target.value) || 0)
                                          }
                                          className="w-full h-7 text-xs"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-xs text-gray-600">Precio:</Label>
                                        <Input
                                          type="number"
                                          min="500"
                                          step="0.01"
                                          value={variant.price}
                                          onChange={(e) =>
                                            handleVariantUpdate(color, size, 'price',
                                              Number.parseFloat(e.target.value) || basePrice)
                                          }
                                          className="w-full h-7 text-xs"
                                        />
                                      </div>
                                      <div className="text-xs text-gray-500 font-mono">
                                        {variant.sku}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedVariantsCount > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Resumen</h4>
                <p className="text-sm text-green-800">
                  Se crearán <strong>{selectedVariantsCount}</strong> variantes del producto.
                </p>
              </div>
            )}
          </div>
        )}

        {selectedColors.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Selecciona al menos un color para comenzar a crear variantes.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
