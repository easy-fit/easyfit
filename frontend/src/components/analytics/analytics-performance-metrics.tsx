'use client';

import { TrendingUp, TrendingDown, Star, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PerformanceMetrics } from '@/types/analytics';

interface AnalyticsPerformanceMetricsProps {
  performanceMetrics: PerformanceMetrics;
  uniqueCustomers: number;
}

export function AnalyticsPerformanceMetrics({ performanceMetrics, uniqueCustomers }: AnalyticsPerformanceMetricsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas de Rendimiento</CardTitle>
        <CardDescription>Indicadores clave del negocio</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm">Tasa de conversión</span>
            </div>
            <span className="font-medium text-green-600">{performanceMetrics.conversionRate.toFixed(1)}%</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-sm">Tasa de devolución</span>
            </div>
            <span className="font-medium text-red-500">{performanceMetrics.returnRate.toFixed(1)}%</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Calificación promedio</span>
            </div>
            <span className="font-medium">{performanceMetrics.avgRating}/5</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Clientes únicos</span>
            </div>
            <span className="font-medium">{uniqueCustomers}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
