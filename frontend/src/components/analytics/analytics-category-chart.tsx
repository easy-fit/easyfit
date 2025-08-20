'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { CategoryData } from '@/types/analytics';

interface AnalyticsCategoryChartProps {
  categoryData: CategoryData[];
}

// Category color mapping
const getCategoryDisplay = (category: string) => {
  const categoryMap = {
    clothing: { name: 'Ropa', color: '#9EE493' },
    footwear: { name: 'Calzado', color: '#20313A' },
    accessory: { name: 'Accesorios', color: '#DBF7DC' },
    fragrance: { name: 'Fragancias', color: '#2F4858' },
  };
  return categoryMap[category as keyof typeof categoryMap] || { name: category, color: '#9EE493' };
};

export function AnalyticsCategoryChart({ categoryData }: AnalyticsCategoryChartProps) {
  const chartData = categoryData.map((cat) => ({
    ...cat,
    ...getCategoryDisplay(cat.category),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas por Categoría</CardTitle>
        <CardDescription>Distribución de ingresos</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            ropa: { label: 'Ropa', color: '#9EE493' },
            calzado: { label: 'Calzado', color: '#20313A' },
            accesorios: { label: 'Accesorios', color: '#DBF7DC' },
            fragancias: { label: 'Fragancias', color: '#2F4858' },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 space-y-2">
          {chartData.length > 0 ? (
            chartData.map((item) => (
              <div key={item.category} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">No hay datos de categorías disponibles</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
