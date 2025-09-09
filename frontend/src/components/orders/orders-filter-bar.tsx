'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface OrderFilters {
  status?: string;
  dateRange?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface OrdersFilterBarProps {
  filters: OrderFilters;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
  onDateRangeChange: (dateRange: string) => void;
  onSortChange: (sortBy: string, sortOrder?: 'asc' | 'desc') => void;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'order_placed', label: 'Pendientes' },
  { value: 'order_accepted', label: 'Aceptados' },
  { value: 'pending_rider,rider_assigned,in_transit', label: 'En proceso' },
  { value: 'delivered', label: 'Entregados' },
  { value: 'purchased', label: 'Comprados' },
  { value: 'return_completed', label: 'Devueltos' },
  { value: 'order_canceled,stolen', label: 'Cancelados' },
];

const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'Todo el tiempo' },
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Última semana' },
  { value: 'month', label: 'Último mes' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Fecha de pedido' },
  { value: 'total', label: 'Monto total' },
  { value: 'status', label: 'Estado' },
];

export function OrdersFilterBar({
  filters,
  onSearchChange,
  onStatusChange,
  onDateRangeChange,
  onSortChange,
}: OrdersFilterBarProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const handleSearchSubmit = useCallback(() => {
    onSearchChange(searchValue);
  }, [searchValue, onSearchChange]);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  }, [handleSearchSubmit]);

  const handleClearSearch = useCallback(() => {
    setSearchValue('');
    onSearchChange('');
  }, [onSearchChange]);

  const toggleSortOrder = useCallback(() => {
    const newOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(filters.sortBy || 'createdAt', newOrder);
  }, [filters.sortBy, filters.sortOrder, onSortChange]);

  const hasActiveFilters = Boolean(
    filters.search || 
    filters.status || 
    filters.dateRange ||
    (filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc')
  );

  const clearAllFilters = useCallback(() => {
    setSearchValue('');
    onSearchChange('');
    onStatusChange('all');
    onDateRangeChange('all');
    onSortChange('createdAt', 'desc');
  }, [onSearchChange, onStatusChange, onDateRangeChange, onSortChange]);

  const getStatusOption = (value: string) => 
    STATUS_OPTIONS.find(option => option.value === value) || STATUS_OPTIONS[0];

  const getDateRangeOption = (value: string) => 
    DATE_RANGE_OPTIONS.find(option => option.value === value) || DATE_RANGE_OPTIONS[0];

  const getSortOption = (value: string) => 
    SORT_OPTIONS.find(option => option.value === value) || SORT_OPTIONS[0];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search and Primary Filters Row */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por número de pedido o cliente..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-10 pr-10"
              />
              {searchValue && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="min-w-0 md:w-48">
              <Select
                value={filters.status || 'all'}
                onValueChange={onStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="min-w-0 md:w-40">
              <Select
                value={filters.dateRange || 'all'}
                onValueChange={onDateRangeChange}
              >
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Fecha" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <Select
                value={filters.sortBy || 'createdAt'}
                onValueChange={(value) => onSortChange(value, filters.sortOrder)}
              >
                <SelectTrigger className="md:w-44">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
                className="px-3"
              >
                {filters.sortOrder === 'asc' ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Active Filters and Clear All */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <span className="text-sm text-gray-600">Filtros activos:</span>
              
              {filters.search && (
                <Badge variant="secondary" className="gap-1">
                  Búsqueda: {filters.search}
                  <button onClick={handleClearSearch} className="ml-1 hover:bg-gray-200 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.status && filters.status !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {getStatusOption(filters.status).label}
                  <button 
                    onClick={() => onStatusChange('all')} 
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.dateRange && filters.dateRange !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {getDateRangeOption(filters.dateRange).label}
                  <button 
                    onClick={() => onDateRangeChange('all')} 
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {(filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc') && (
                <Badge variant="secondary" className="gap-1">
                  {getSortOption(filters.sortBy || 'createdAt').label} 
                  ({filters.sortOrder === 'asc' ? 'Ascendente' : 'Descendente'})
                  <button 
                    onClick={() => onSortChange('createdAt', 'desc')} 
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="ml-2 text-gray-600 hover:text-gray-800"
              >
                <X className="h-4 w-4 mr-1" />
                Limpiar todo
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}