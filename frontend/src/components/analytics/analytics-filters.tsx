'use client';

import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DateRangeFilter, OrderTypeFilter } from '@/types/analytics';

interface AnalyticsFiltersProps {
  dateRange: DateRangeFilter;
  orderType: OrderTypeFilter;
  onDateRangeChange: (value: DateRangeFilter) => void;
  onOrderTypeChange: (value: OrderTypeFilter) => void;
}

export function AnalyticsFilters({
  dateRange,
  orderType,
  onDateRangeChange,
  onOrderTypeChange,
}: AnalyticsFiltersProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="overflow-x-auto">
        <div className="flex flex-wrap items-center gap-4 min-w-fit">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select value={dateRange} onValueChange={onDateRangeChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="7days">Últimos 7 días</SelectItem>
                <SelectItem value="30days">Últimos 30 días</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={orderType} onValueChange={onOrderTypeChange}>
            <SelectTrigger className="w-[175px]">
              <SelectValue placeholder="Tipo de pedido" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los pedidos</SelectItem>
              <SelectItem value="completed">Completados</SelectItem>
              <SelectItem value="returned">Devueltos</SelectItem>
              <SelectItem value="purchased">Comprados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
