/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { ProductFilterOptions } from '@/types/product';
import type { StoreFilterOptions } from '@/types/store';

interface FiltersProps {
  filters: ProductFilterOptions | StoreFilterOptions;
  onFiltersChange: (filters: ProductFilterOptions | StoreFilterOptions) => void;
  isOpen: boolean;
  onToggle: () => void;
  type: 'products' | 'stores';
}

const sortOptions = {
  products: [
    { value: 'createdAt', label: 'Más recientes' },
    { value: 'price', label: 'Precio: menor a mayor' },
    { value: '-price', label: 'Precio: mayor a menor' },
    { value: 'title', label: 'Nombre A-Z' },
  ],
  stores: [
    { value: 'createdAt', label: 'Más recientes' },
    { value: 'averageRating', label: 'Mejor calificados' },
    { value: 'name', label: 'Nombre A-Z' },
  ],
};

export function Filters({ filters, onFiltersChange, isOpen, onToggle, type }: FiltersProps) {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (type === 'products') {
      const productFilters = filters as ProductFilterOptions;
      if (productFilters.minPrice) count++;
      if (productFilters.maxPrice) count++;
    }
    if (type === 'stores') {
      const storeFilters = filters as StoreFilterOptions;
      if (storeFilters.tags) count++;
      if (storeFilters.rating) count++;
    }
    if (filters.sort) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onToggle}
          className="flex items-center gap-2 border-[#2F4858] text-[#2F4858] hover:bg-[#DBF7DC] bg-transparent"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 bg-[#9EE493] text-[#20313A]">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-600 hover:text-[#20313A]">
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Active Filters Tags */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="outline" className="flex items-center gap-1">
              Búsqueda: {filters.search}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('search', undefined)} />
            </Badge>
          )}
          {type === 'products' && (filters as ProductFilterOptions).minPrice && (
            <Badge variant="outline" className="flex items-center gap-1">
              Min: ${(filters as ProductFilterOptions).minPrice}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('minPrice', undefined)} />
            </Badge>
          )}
          {type === 'products' && (filters as ProductFilterOptions).maxPrice && (
            <Badge variant="outline" className="flex items-center gap-1">
              Max: ${(filters as ProductFilterOptions).maxPrice}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('maxPrice', undefined)} />
            </Badge>
          )}
        </div>
      )}

      {/* Filters Panel */}
      {isOpen && (
        <Card className="border-gray-200">
          <CardContent className="p-4 space-y-6">
            {/* Sort By */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#20313A]">Ordenar por</Label>
              <Select value={filters.sort || ''} onValueChange={(value) => updateFilter('sort', value || undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar orden" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions[type].map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product-specific filters */}
            {type === 'products' && (
              <>
                {/* Price Range */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-[#20313A]">Precio</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-gray-600">Mínimo</Label>
                      <input
                        type="number"
                        placeholder="0"
                        value={(filters as ProductFilterOptions).minPrice || ''}
                        onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-[#9EE493] focus:ring-[#9EE493]"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Máximo</Label>
                      <input
                        type="number"
                        placeholder="Sin límite"
                        value={(filters as ProductFilterOptions).maxPrice || ''}
                        onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-[#9EE493] focus:ring-[#9EE493]"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Store-specific filters */}
            {type === 'stores' && (
              <>
                {/* Rating */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#20313A]">Calificación mínima</Label>
                  <Select
                    value={(filters as StoreFilterOptions).rating?.toString() || ''}
                    onValueChange={(value) => updateFilter('rating', value ? Number(value) : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Cualquier calificación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4+ estrellas</SelectItem>
                      <SelectItem value="3">3+ estrellas</SelectItem>
                      <SelectItem value="2">2+ estrellas</SelectItem>
                      <SelectItem value="1">1+ estrellas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
