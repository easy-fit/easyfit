'use client';

import { Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductMetrics {
  totalProducts: number;
  lowStockCount: number;
  publishedProducts: number;
  draftProducts: number;
  topCategory: {
    name: string;
    count: number;
  };
  categoriesBreakdown: Record<string, number>;
  stockBreakdown: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
}

interface ProductMetricsCardsProps {
  metrics: ProductMetrics;
}

export function ProductMetricsCards({ metrics }: ProductMetricsCardsProps) {
  const metricsCards = [
    {
      title: 'Total Productos',
      icon: Package,
      value: metrics.totalProducts.toString(),
      subtitle: `${metrics.publishedProducts} publicados, ${metrics.draftProducts} borradores`,
      color: 'text-blue-600',
    },
    {
      title: 'Stock Bajo',
      icon: AlertTriangle,
      value: metrics.lowStockCount.toString(),
      subtitle: 'Requieren atención',
      color: metrics.lowStockCount > 0 ? 'text-orange-600' : 'text-green-600',
    },
    {
      title: 'Categoría Principal',
      icon: TrendingUp,
      value: metrics.topCategory.name,
      subtitle: `${metrics.topCategory.count} productos`,
      color: 'text-green-600',
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      {metricsCards.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
