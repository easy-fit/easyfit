'use client';

import { DollarSign, ShoppingBag, Package, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AnalyticsKPIs } from '@/types/analytics';

interface AnalyticsKPICardsProps {
  kpis: AnalyticsKPIs;
}

export function AnalyticsKPICards({ kpis }: AnalyticsKPICardsProps) {
  const kpiCards = [
    {
      title: 'Ingresos Totales',
      icon: DollarSign,
      value: `$${kpis.totalRevenue.current.toLocaleString()}`,
      change: kpis.totalRevenue.change,
    },
    {
      title: 'Pedidos Totales',
      icon: ShoppingBag,
      value: kpis.totalOrders.current.toString(),
      change: kpis.totalOrders.change,
    },
    {
      title: 'Ticket Promedio',
      icon: Package,
      value: `$${kpis.averageTicket.current}`,
      change: kpis.averageTicket.change,
    },
    {
      title: 'Tasa de Compra',
      icon: TrendingUp,
      value: `${kpis.purchaseRate.current.toFixed(1)}%`,
      change: kpis.purchaseRate.change,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {kpiCards.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <div className={`flex items-center text-xs ${kpi.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {kpi.change >= 0 ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              {kpi.change.toFixed(1)}% vs período anterior
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
