'use client';

import { Search, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductFiltersProps {
  searchQuery: string;
  category: string;
  status: string;
  stockStatus: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onStockStatusChange: (value: string) => void;
  onAddProduct: () => void;
}

export function ProductFilters({
  searchQuery,
  category,
  status,
  stockStatus,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onStockStatusChange,
  onAddProduct,
}: ProductFiltersProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={category} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="hombre">Hombre</SelectItem>
                <SelectItem value="mujer">Mujer</SelectItem>
                <SelectItem value="ninos">Niños</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
              </SelectContent>
            </Select>

            <Select value={stockStatus} onValueChange={onStockStatusChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="in-stock">En Stock</SelectItem>
                <SelectItem value="low-stock">Stock Bajo</SelectItem>
                <SelectItem value="out-of-stock">Sin Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={onAddProduct} className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
