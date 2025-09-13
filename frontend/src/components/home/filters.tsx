/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Filter, X, MapPin, Store, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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

const storeTagOptions = [
  { value: 'ropa-casual', label: 'Ropa Casual' },
  { value: 'ropa-formal', label: 'Ropa Formal' },
  { value: 'ropa-deportiva', label: 'Ropa Deportiva' },
  { value: 'accesorios', label: 'Accesorios' },
  { value: 'calzado', label: 'Calzado' },
  { value: 'joyeria', label: 'Joyería' },
  { value: 'ropa-infantil', label: 'Ropa Infantil' },
];

const storeTypeOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'physical', label: 'Físicas' },
  { value: 'online', label: 'Online' },
];

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
      if (storeFilters.tags && storeFilters.tags !== '' && storeFilters.tags !== 'all') count++;
      if (storeFilters.rating) count++;
      if (storeFilters.isOpen) count++;
      if ((storeFilters as any).storeType && (storeFilters as any).storeType !== 'all') count++;
    }
    if (filters.sort && filters.sort !== 'default') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-4">
      {/* Simple Filter Row */}
      <div className="space-y-3">
        {/* Main Filters Row - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filters Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onToggle}
              className="h-9 text-sm border-[#2F4858] text-[#2F4858] hover:bg-[#DBF7DC] bg-transparent"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 bg-[#9EE493] text-[#20313A]">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters} 
                className="h-9 text-sm text-gray-600 hover:text-[#20313A]"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Tags */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                Búsqueda: {filters.search}
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('search', undefined)} />
              </Badge>
            )}
            {filters.sort && filters.sort !== 'default' && (
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                {sortOptions[type].find(opt => opt.value === filters.sort)?.label}
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('sort', undefined)} />
              </Badge>
            )}
            {type === 'products' && (filters as ProductFilterOptions).minPrice && (
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                Min: ${(filters as ProductFilterOptions).minPrice}
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('minPrice', undefined)} />
              </Badge>
            )}
            {type === 'products' && (filters as ProductFilterOptions).maxPrice && (
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                Max: ${(filters as ProductFilterOptions).maxPrice}
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('maxPrice', undefined)} />
              </Badge>
            )}
            {type === 'stores' && (filters as StoreFilterOptions).tags && (filters as StoreFilterOptions).tags !== 'all' && (
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                {storeTagOptions.find(opt => opt.value === (filters as StoreFilterOptions).tags)?.label}
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('tags', undefined)} />
              </Badge>
            )}
            {type === 'stores' && (filters as StoreFilterOptions).rating && (
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                {(filters as StoreFilterOptions).rating}+ estrellas
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('rating', undefined)} />
              </Badge>
            )}
            {type === 'stores' && (filters as StoreFilterOptions).isOpen && (
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                Abiertas ahora
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('isOpen', undefined)} />
              </Badge>
            )}
            {type === 'stores' && (filters as any).storeType && (filters as any).storeType !== 'all' && (
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                {storeTypeOptions.find(opt => opt.value === (filters as any).storeType)?.label}
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('storeType', undefined)} />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Expanded Filters Panel - Inline Layout */}
      {isOpen && (
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Sort By */}
              <div className="min-w-[150px]">
                <Select value={filters.sort || 'default'} onValueChange={(value) => updateFilter('sort', value === 'default' ? undefined : value)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Ordenar por</SelectItem>
                    {sortOptions[type].map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Store-specific filters */}
              {type === 'stores' && (
                <>
                  {/* Category/Tags Filter */}
                  <div className="min-w-[150px]">
                    <Select
                      value={(filters as StoreFilterOptions).tags?.toString() || 'all'}
                      onValueChange={(value) => updateFilter('tags', value === 'all' ? undefined : value)}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        {storeTagOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rating Filter */}
                  <div className="min-w-[140px]">
                    <Select
                      value={(filters as StoreFilterOptions).rating?.toString() || 'any'}
                      onValueChange={(value) => updateFilter('rating', value === 'any' ? undefined : Number(value))}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="⭐ Rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Cualquier rating</SelectItem>
                        <SelectItem value="4">4+ estrellas</SelectItem>
                        <SelectItem value="3">3+ estrellas</SelectItem>
                        <SelectItem value="2">2+ estrellas</SelectItem>
                        <SelectItem value="1">1+ estrellas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Store Type Filter */}
                  <div className="min-w-[120px]">
                    <Select
                      value={(filters as any).storeType || 'all'}
                      onValueChange={(value) => updateFilter('storeType', value === 'all' ? undefined : value)}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <Store className="h-4 w-4" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {storeTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Open Now Toggle */}
                  <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white">
                    <Clock className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Abiertas ahora</span>
                    <Switch
                      checked={(filters as StoreFilterOptions).isOpen || false}
                      onCheckedChange={(value) => updateFilter('isOpen', value || undefined)}
                    />
                  </div>
                </>
              )}

              {/* Product-specific filters */}
              {type === 'products' && (
                <>
                  {/* Price Range */}
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Precio min"
                      value={(filters as ProductFilterOptions).minPrice || ''}
                      onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-32 px-3 py-2 border border-gray-200 rounded-md text-sm h-9 focus:border-[#9EE493] focus:ring-[#9EE493]"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      placeholder="Precio max"
                      value={(filters as ProductFilterOptions).maxPrice || ''}
                      onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-32 px-3 py-2 border border-gray-200 rounded-md text-sm h-9 focus:border-[#9EE493] focus:ring-[#9EE493]"
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
