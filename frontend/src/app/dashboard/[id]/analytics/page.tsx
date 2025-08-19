'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { StoreSidebar } from '@/components/dashboard/store-sidebar';

import { useStoreDetailedAnalytics } from '@/hooks/api/use-stores';
import { useCurrentStore } from '@/contexts/store-context';
import type { DateRangeFilter, OrderTypeFilter } from '@/types/analytics';

// Analytics Components
import { AnalyticsFilters } from '@/components/analytics/analytics-filters';
import { AnalyticsKPICards } from '@/components/analytics/analytics-kpi-cards';
import { AnalyticsSalesChart } from '@/components/analytics/analytics-sales-chart';
import { AnalyticsCategoryChart } from '@/components/analytics/analytics-category-chart';
import { AnalyticsTopProducts } from '@/components/analytics/analytics-top-products';
import { AnalyticsPerformanceMetrics } from '@/components/analytics/analytics-performance-metrics';

export default function StoreAnalyticsPage() {
  const { id } = useParams() as { id: string };
  const { storeName, logoUrl, accessType } = useCurrentStore();

  const [dateRange, setDateRange] = React.useState<DateRangeFilter>('7days');
  const [orderType, setOrderType] = React.useState<OrderTypeFilter>('all');
  const [chartView, setChartView] = React.useState<'revenue' | 'orders'>('revenue');

  // Fetch detailed analytics data
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useStoreDetailedAnalytics(id, {
    dateRange,
    orderType,
  });

  const analytics = analyticsData?.data;

  // Show loading state for analytics data while keeping the layout
  if (analyticsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SidebarProvider>
          <StoreSidebar storeName={storeName!} logoUrl={logoUrl} active="analytics" baseHref={`/dashboard/${id}`} userRole={accessType} />
          <SidebarInset>
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 animate-pulse text-[#9EE493] mx-auto mb-4" />
                <p className="text-gray-600">Cargando estadísticas...</p>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
  }

  // Show error state for analytics data
  if (analyticsError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SidebarProvider>
          <StoreSidebar storeName={storeName!} logoUrl={logoUrl} active="analytics" baseHref={`/dashboard/${id}`} userRole={accessType} />
          <SidebarInset>
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <TrendingDown className="h-8 w-8 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600">Error cargando estadísticas</p>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
  }

  // Show no data state
  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SidebarProvider>
          <StoreSidebar storeName={storeName!} logoUrl={logoUrl} active="analytics" baseHref={`/dashboard/${id}`} userRole={accessType} />
          <SidebarInset>
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay datos disponibles</p>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarProvider>
        <StoreSidebar storeName={storeName!} logoUrl={logoUrl} active="analytics" baseHref={`/dashboard/${id}`} userRole={accessType} />
        <SidebarInset>
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-1 h-4" />
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <h1 className="text-base md:text-lg font-semibold text-[#20313A]">Estadísticas</h1>
                <Badge variant="secondary" className="hidden md:inline-flex">
                  Análisis de Ventas
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </header>

          <main className="p-4 md:p-3 space-y-6 overflow-x-hidden">
            {/* Filters */}
            <AnalyticsFilters
              dateRange={dateRange}
              orderType={orderType}
              onDateRangeChange={setDateRange}
              onOrderTypeChange={setOrderType}
            />

            {/* KPIs */}
            <AnalyticsKPICards kpis={analytics.kpis} />

            {/* Charts Row */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 min-w-0">
              <AnalyticsSalesChart
                chartData={analytics.chartData}
                chartView={chartView}
                dateRange={dateRange}
                onChartViewChange={setChartView}
              />

              <AnalyticsCategoryChart categoryData={analytics.categoryData} />
            </div>

            {/* Additional Metrics */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <AnalyticsTopProducts topProducts={analytics.topProducts} />

              <AnalyticsPerformanceMetrics
                performanceMetrics={analytics.performanceMetrics}
                uniqueCustomers={analytics.kpis.uniqueCustomers}
              />
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
