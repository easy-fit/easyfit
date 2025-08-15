'use client';

import { DollarSign, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { ChartDataPoint, DateRangeFilter } from '@/types/analytics';

interface AnalyticsSalesChartProps {
  chartData: ChartDataPoint[];
  chartView: 'revenue' | 'orders';
  dateRange: DateRangeFilter;
  onChartViewChange: (view: 'revenue' | 'orders') => void;
}

export function AnalyticsSalesChart({ chartData, chartView, dateRange, onChartViewChange }: AnalyticsSalesChartProps) {
  const getChartConfig = () => {
    if (chartView === 'revenue') {
      return {
        data: chartData,
        actualKey: 'currentRevenue' as const,
        anteriorKey: 'previousRevenue' as const,
        title: 'Ventas por Día',
        description: `Ingresos de los ${
          dateRange === 'today' ? 'hoy' : dateRange === '7days' ? 'últimos 7 días' : 'últimos 30 días'
        }`,
        formatValue: (value: number) => `$${value.toLocaleString()}`,
      };
    } else {
      return {
        data: chartData,
        actualKey: 'currentOrders' as const,
        anteriorKey: 'previousOrders' as const,
        title: 'Ordenes por Día',
        description: `Cantidad de ordenes de ${
          dateRange === 'today' ? 'hoy' : dateRange === '7days' ? 'los últimos 7 días' : 'los últimos 30 días'
        }`,
        formatValue: (value: number) => `${value} ordenes`,
      };
    }
  };

  const chartConfig = getChartConfig();

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{chartConfig.title}</CardTitle>
            <CardDescription>{chartConfig.description}</CardDescription>
          </div>
          {/* Chart View Toggle */}
          <div className="inline-flex overflow-hidden rounded-lg border bg-white shadow-sm">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onChartViewChange('revenue')}
              className={`rounded-none font-medium transition-colors ${
                chartView === 'revenue' ? 'bg-[#9EE493] text-[#20313A] hover:bg-[#8BD480]' : 'hover:bg-gray-50'
              }`}
            >
              <DollarSign className="h-4 w-4 mr-1.5" />
              Ingresos
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onChartViewChange('orders')}
              className={`rounded-none border-l font-medium transition-colors ${
                chartView === 'orders' ? 'bg-[#9EE493] text-[#20313A] hover:bg-[#8BD480]' : 'hover:bg-gray-50'
              }`}
            >
              <Package className="h-4 w-4 mr-1.5" />
              Ordenes
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 pb-4 overflow-hidden">
        <ChartContainer
          config={{
            actual: {
              label: 'Período Actual',
              color: '#9EE493',
            },
            anterior: {
              label: 'Período Anterior',
              color: '#9EE493',
            },
          }}
          className="h-[400px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartConfig.data}
              barCategoryGap="30%"
              barGap={2}
              margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const currentData = chartConfig.data.find((item) => item.date === label);
                    if (currentData) {
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-medium">{label}</p>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span
                                className="inline-block w-3 h-3 mr-2"
                                style={{
                                  backgroundColor: 'transparent',
                                  backgroundImage:
                                    'repeating-linear-gradient(45deg, #9EE493, #9EE493 1px, transparent 1px, transparent 3px)',
                                  border: '1px solid #9EE493',
                                }}
                              ></span>
                              Período Anterior: {chartConfig.formatValue(currentData[chartConfig.anteriorKey])}
                            </p>
                            <p className="text-sm">
                              <span className="inline-block w-3 h-3 mr-2 bg-[#9EE493]"></span>
                              Período Actual: {chartConfig.formatValue(currentData[chartConfig.actualKey])}
                            </p>
                          </div>
                        </div>
                      );
                    }
                  }
                  return null;
                }}
              />
              <Bar dataKey={chartConfig.anteriorKey} fill="url(#diagonalHatch)" stroke="#9EE493" strokeWidth={1} />
              <Bar dataKey={chartConfig.actualKey} fill="#9EE493" />
              <defs>
                <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="6" height="6">
                  <rect width="6" height="6" fill="white" />
                  <path
                    d="M 0,6 l 6,-6 M -1.5,1.5 l 3,-3 M 4.5,7.5 l 3,-3"
                    stroke="#9EE493"
                    strokeWidth="1.5"
                    opacity="1"
                  />
                </pattern>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Legend */}
        <div className="flex items-center justify-start gap-6 px-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#9EE493] rounded-full"></div>
            <span className="text-sm text-gray-600">Período Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-[#9EE493] bg-white relative overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    #9EE493,
                    #9EE493 1px,
                    transparent 1px,
                    transparent 3px
                  )`,
                }}
              ></div>
            </div>
            <span className="text-sm text-gray-600">Período Anterior</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
