'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Search, Filter, Package, AlertCircle, CheckCircle, X, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useVariantsByProducts, useBulkUpdateVariants } from '@/hooks/api/use-products';
import { useEasyFitToast } from '@/hooks/use-toast';
import { ProductVariantGroup } from './product-variant-group';
import type { VariantWithProduct, BulkVariantUpdateItem } from '@/types/variant';

interface BulkVariantEditModalProps {
  open: boolean;
  onClose: () => void;
  selectedProductIds: string[];
  productNames: Record<string, string>; // productId -> product name mapping
}

interface EditableVariant extends VariantWithProduct {
  isSelected: boolean;
  newStock?: number;
  newPrice?: number;
  hasChanges?: boolean;
}

interface BulkOperation {
  type: 'stock' | 'price';
  value: number;
  operation: 'set' | 'add' | 'multiply';
}

export function BulkVariantEditModal({ 
  open, 
  onClose, 
  selectedProductIds, 
  productNames 
}: BulkVariantEditModalProps) {
  const toast = useEasyFitToast();
  
  // State
  const [variants, setVariants] = useState<EditableVariant[]>([]);
  const [filteredVariants, setFilteredVariants] = useState<EditableVariant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [colorFilter, setColorFilter] = useState<string>('');
  const [sizeFilter, setSizeFilter] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [bulkOperation, setBulkOperation] = useState<BulkOperation>({ type: 'stock', value: 0, operation: 'set' });
  const [showBulkOperations, setShowBulkOperations] = useState(false);

  // API hooks
  const { data: variantsData, isLoading, error } = useVariantsByProducts(selectedProductIds, open && selectedProductIds.length > 0);
  const bulkUpdateMutation = useBulkUpdateVariants();

  // Initialize variants when data loads
  useEffect(() => {
    if (variantsData?.data) {
      const editableVariants: EditableVariant[] = variantsData.data.map(variant => ({
        ...variant,
        isSelected: false,
        hasChanges: false,
      }));
      setVariants(editableVariants);
    }
  }, [variantsData]);

  // Filter variants
  useEffect(() => {
    let filtered = [...variants];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(variant => 
        variant.sku.toLowerCase().includes(query) ||
        variant.color.toLowerCase().includes(query) ||
        variant.size.toLowerCase().includes(query) ||
        (typeof variant.productId === 'object' && variant.productId.title.toLowerCase().includes(query))
      );
    }

    // Color filter
    if (colorFilter && colorFilter !== 'all') {
      filtered = filtered.filter(variant => variant.color === colorFilter);
    }

    // Size filter
    if (sizeFilter && sizeFilter !== 'all') {
      filtered = filtered.filter(variant => variant.size === sizeFilter);
    }

    // Stock filter
    if (stockFilter !== 'all') {
      filtered = filtered.filter(variant => {
        switch (stockFilter) {
          case 'in-stock':
            return variant.stock > 10;
          case 'low-stock':
            return variant.stock > 0 && variant.stock <= 10;
          case 'out-of-stock':
            return variant.stock === 0;
          default:
            return true;
        }
      });
    }

    // Show only selected filter
    if (showOnlySelected) {
      filtered = filtered.filter(variant => variant.isSelected);
    }

    setFilteredVariants(filtered);
  }, [variants, searchQuery, colorFilter, sizeFilter, stockFilter, showOnlySelected]);

  // Get unique colors and sizes for filter options
  const { uniqueColors, uniqueSizes } = useMemo(() => {
    const colors = [...new Set(variants.map(v => v.color))].sort();
    const sizes = [...new Set(variants.map(v => v.size))].sort();
    return { uniqueColors: colors, uniqueSizes: sizes };
  }, [variants]);

  // Group filtered variants by product
  const groupedVariants = useMemo(() => {
    const groups: Record<string, EditableVariant[]> = {};
    
    filteredVariants.forEach(variant => {
      const productId = typeof variant.productId === 'object' ? variant.productId._id : variant.productId;
      if (!groups[productId]) {
        groups[productId] = [];
      }
      groups[productId].push(variant);
    });

    return groups;
  }, [filteredVariants]);

  // Selected variants count and stats
  const selectedVariants = variants.filter(v => v.isSelected);
  const changedVariants = variants.filter(v => v.hasChanges);

  const handleSelectVariant = useCallback((variantId: string) => {
    setVariants(prev => prev.map(variant =>
      variant._id === variantId 
        ? { ...variant, isSelected: !variant.isSelected }
        : variant
    ));
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    setVariants(prev => prev.map(variant => ({ ...variant, isSelected: checked })));
  }, []);

  const handleProductSelect = useCallback((productId: string, checked: boolean) => {
    setVariants(prev => prev.map(variant => {
      const variantProductId = typeof variant.productId === 'object' ? variant.productId._id : variant.productId;
      return variantProductId === productId 
        ? { ...variant, isSelected: checked }
        : variant;
    }));
  }, []);

  const handleVariantChange = useCallback((variantId: string, field: 'stock' | 'price', value: number) => {
    setVariants(prev => prev.map(variant => {
      if (variant._id !== variantId) return variant;
      
      const updated = {
        ...variant,
        [field === 'stock' ? 'newStock' : 'newPrice']: value,
        hasChanges: true,
      };
      
      return updated;
    }));
  }, []);

  const applyBulkOperation = useCallback(() => {
    if (selectedVariants.length === 0) {
      toast.error('Error', { description: 'Seleccioná al menos una variante' });
      return;
    }

    setVariants(prev => prev.map(variant => {
      if (!variant.isSelected) return variant;

      let newValue: number;
      const currentValue = bulkOperation.type === 'stock' ? variant.stock : variant.price;

      switch (bulkOperation.operation) {
        case 'set':
          newValue = bulkOperation.value;
          break;
        case 'add':
          newValue = currentValue + bulkOperation.value;
          break;
        case 'multiply':
          newValue = currentValue * (bulkOperation.value / 100);
          break;
        default:
          newValue = currentValue;
      }

      // Ensure values are valid
      if (bulkOperation.type === 'stock') {
        newValue = Math.max(0, Math.floor(newValue));
      } else {
        newValue = Math.max(0, Math.round(newValue * 100) / 100);
      }

      return {
        ...variant,
        [bulkOperation.type === 'stock' ? 'newStock' : 'newPrice']: newValue,
        hasChanges: true,
      };
    }));

    setShowBulkOperations(false);
    toast.success('Aplicado', { description: `Operación aplicada a ${selectedVariants.length} variantes` });
  }, [selectedVariants, bulkOperation, toast]);

  const handleSave = useCallback(async () => {
    const updates: BulkVariantUpdateItem[] = changedVariants.map(variant => {
      const update: BulkVariantUpdateItem = { variantId: variant._id };
      
      if (variant.newStock !== undefined) {
        update.stock = variant.newStock;
      }
      
      if (variant.newPrice !== undefined) {
        update.price = variant.newPrice;
      }

      return update;
    });

    if (updates.length === 0) {
      toast.error('Error', { description: 'No hay cambios para guardar' });
      return;
    }

    try {
      const result = await bulkUpdateMutation.mutateAsync({ updates });
      
      toast.success('Guardado exitoso', {
        description: `${result.data.successful} variantes actualizadas correctamente${result.data.failed > 0 ? `, ${result.data.failed} fallidas` : ''}`
      });

      if (result.data.errors.length > 0) {
        console.error('Bulk update errors:', result.data.errors);
      }

      onClose();
    } catch (error) {
      toast.error('Error', { 
        description: 'No se pudieron guardar los cambios. Intentá nuevamente.' 
      });
    }
  }, [changedVariants, bulkUpdateMutation, toast, onClose]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Edición en Lote de Variantes
          </DialogTitle>
          <DialogDescription>
            Editá múltiples variantes de {selectedProductIds.length} producto{selectedProductIds.length !== 1 ? 's' : ''} seleccionado{selectedProductIds.length !== 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar las variantes. Intentá nuevamente.
            </AlertDescription>
          </Alert>
        )}

        {/* Filters and Stats */}
        <div className="space-y-4 border-b pb-4">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por SKU, color, talle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={colorFilter} onValueChange={setColorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los colores</SelectItem>
                {uniqueColors.map(color => (
                  <SelectItem key={color} value={color}>{color}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sizeFilter} onValueChange={setSizeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por talle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los talles</SelectItem>
                {uniqueSizes.map(size => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stockFilter} onValueChange={(value: any) => setStockFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo el stock</SelectItem>
                <SelectItem value="in-stock">En stock (+10)</SelectItem>
                <SelectItem value="low-stock">Stock bajo (1-10)</SelectItem>
                <SelectItem value="out-of-stock">Sin stock (0)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{filteredVariants.length} variantes mostradas</span>
              <Badge variant={selectedVariants.length > 0 ? 'default' : 'secondary'}>
                {selectedVariants.length} seleccionadas
              </Badge>
              <Badge variant={changedVariants.length > 0 ? 'destructive' : 'secondary'}>
                {changedVariants.length} con cambios
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowOnlySelected(!showOnlySelected)}
              >
                {showOnlySelected ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                {showOnlySelected ? 'Ver todas' : 'Solo seleccionadas'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkOperations(!showBulkOperations)}
                disabled={selectedVariants.length === 0}
              >
                <Filter className="h-4 w-4 mr-2" />
                Operaciones en lote
              </Button>
            </div>
          </div>

          {/* Bulk Operations Panel */}
          {showBulkOperations && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Operaciones en Lote - {selectedVariants.length} variantes seleccionadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-4 gap-3">
                  <Select value={bulkOperation.type} onValueChange={(value: 'stock' | 'price') => setBulkOperation(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stock">Stock</SelectItem>
                      <SelectItem value="price">Precio</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={bulkOperation.operation} onValueChange={(value: 'set' | 'add' | 'multiply') => setBulkOperation(prev => ({ ...prev, operation: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="set">Establecer</SelectItem>
                      <SelectItem value="add">Sumar</SelectItem>
                      <SelectItem value="multiply">Multiplicar por %</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    placeholder="Valor"
                    value={bulkOperation.value}
                    onChange={(e) => setBulkOperation(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                  />

                  <Button onClick={applyBulkOperation} size="sm">
                    Aplicar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Grouped Products */}
        <div className="flex-1 min-h-0 overflow-hidden border rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Package className="h-8 w-8 mx-auto mb-4 text-gray-400 animate-pulse" />
                <p className="text-gray-600">Cargando variantes...</p>
              </div>
            </div>
          ) : Object.keys(groupedVariants).length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No hay variantes que coincidan con los filtros.</p>
            </div>
          ) : (
            <div className="overflow-auto h-full">
              {Object.entries(groupedVariants).map(([productId, productVariants]) => {
                const productName = typeof productVariants[0]?.productId === 'object' 
                  ? productVariants[0].productId.title 
                  : productNames[productId] || 'Producto';
                
                return (
                  <ProductVariantGroup
                    key={productId}
                    productId={productId}
                    productName={productName}
                    variants={productVariants}
                    onVariantSelect={handleSelectVariant}
                    onProductSelect={handleProductSelect}
                    onVariantChange={handleVariantChange}
                  />
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-600">
              {changedVariants.length > 0 && (
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="h-4 w-4" />
                  {changedVariants.length} variantes con cambios sin guardar
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={changedVariants.length === 0 || bulkUpdateMutation.isPending}
                className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]"
              >
                {bulkUpdateMutation.isPending ? 'Guardando...' : `Guardar ${changedVariants.length} cambios`}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}