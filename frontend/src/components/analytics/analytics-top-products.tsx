'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { TopProduct } from '@/types/analytics';

interface AnalyticsTopProductsProps {
  topProducts: TopProduct[];
}

export function AnalyticsTopProducts({ topProducts }: AnalyticsTopProductsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos Más Vendidos</CardTitle>
        <CardDescription>Top 5 productos por cantidad vendida</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProducts.length > 0 ? (
            topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#9EE493] flex items-center justify-center text-sm font-medium text-[#20313A]">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.sales} unidades</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${product.revenue.toLocaleString()}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">No hay datos de productos disponibles</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
