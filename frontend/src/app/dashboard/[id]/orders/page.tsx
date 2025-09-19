'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useCurrentStore } from '@/contexts/store-context';
import { useStoreOrders } from '@/hooks/api/use-stores';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { StoreSidebar } from '@/components/dashboard/store-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrderCard } from '@/components/dashboard/order-card';
import { OrdersFilterBar } from '@/components/orders/orders-filter-bar';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  RefreshCw, 
  Loader2,
  Package,
  Calendar,
  TrendingUp,
  Clock
} from 'lucide-react';
import type { StoreOrder } from '@/types/store';
import type { OrderStatus } from '@/types/order';

interface OrderFilters {
  status?: string;
  dateRange?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export default function StoreOrdersPage() {
  const { id } = useParams() as { id: string };
  const searchParams = useSearchParams();
  const router = useRouter();
  const { store, storeName, logoUrl, accessType } = useCurrentStore();

  // Parse filters from URL search params
  const filters = useMemo<OrderFilters>(() => ({
    status: searchParams.get('status') || '',
    dateRange: searchParams.get('dateRange') || '',
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
  }), [searchParams]);

  // Build API parameters from filters
  const apiParams = useMemo(() => {
    const params: Record<string, any> = {
      page: filters.page,
      limit: filters.limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };

    if (filters.status) {
      params.status = filters.status;
    }

    if (filters.search) {
      params.search = filters.search;
    }

    if (filters.dateRange) {
      // Convert dateRange presets to actual dates
      const now = new Date();
      switch (filters.dateRange) {
        case 'today':
          params.since = new Date(now.setHours(0, 0, 0, 0)).toISOString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          params.since = weekAgo.toISOString();
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          params.since = monthAgo.toISOString();
          break;
      }
    }

    return params;
  }, [filters]);

  const {
    data: ordersData,
    isLoading,
    isError,
    refetch,
  } = useStoreOrders(id, apiParams);

  const orders = ordersData?.data?.orders || [];
  const pagination = ordersData?.data?.pagination;

  // Update URL with new filters
  const updateFilters = useCallback((newFilters: Partial<OrderFilters>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when changing filters (except when explicitly changing page)
    if (!newFilters.page) {
      params.delete('page');
    }

    router.push(`/dashboard/${id}/orders?${params.toString()}`, { scroll: false });
  }, [id, router, searchParams]);

  const handleSearch = useCallback((search: string) => {
    updateFilters({ search, page: 1 });
  }, [updateFilters]);

  const handleStatusFilter = useCallback((status: string) => {
    updateFilters({ status: status === 'all' ? '' : status, page: 1 });
  }, [updateFilters]);

  const handleDateRangeFilter = useCallback((dateRange: string) => {
    updateFilters({ dateRange: dateRange === 'all' ? '' : dateRange, page: 1 });
  }, [updateFilters]);

  const handleSortChange = useCallback((sortBy: string, sortOrder?: 'asc' | 'desc') => {
    updateFilters({ sortBy, sortOrder: sortOrder || filters.sortOrder });
  }, [updateFilters, filters.sortOrder]);

  const handlePageChange = useCallback((page: number) => {
    updateFilters({ page });
  }, [updateFilters]);

  // Order statistics for header cards
  const orderStats = useMemo(() => {
    if (!orders.length) return { total: 0, pending: 0, completed: 0, todayTotal: 0 };

    const today = new Date().toDateString();
    const pending = orders.filter(order => order.status === 'order_placed').length;
    const completed = orders.filter(order => 
      ['purchased', 'return_completed'].includes(order.status)
    ).length;
    const todayOrders = orders.filter(order => 
      new Date(order.createdAt).toDateString() === today
    ).length;

    return {
      total: orders.length,
      pending,
      completed,
      todayTotal: todayOrders,
    };
  }, [orders]);

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#9EE493] mx-auto mb-4" />
          <p className="text-gray-600">Cargando tienda...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <StoreSidebar
        storeName={storeName}
        logoUrl={logoUrl}
        active="orders"
        baseHref={`/dashboard/${id}`}
        userRole={accessType}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4 shadow-sm">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2 flex-1">
            <ClipboardList className="h-5 w-5 text-[#20313A]" />
            <h1 className="text-base md:text-lg font-semibold text-[#20313A]">
              Historial de Pedidos
            </h1>
            {orderStats.total > 0 && (
              <Badge variant="secondary" className="bg-[#DBF7DC] text-[#20313A] border-[#9EE493]">
                {orderStats.total} pedidos
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </header>

        <main className="flex-1 space-y-6 p-4 md:p-6 bg-gray-50">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orderStats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {orderStats.todayTotal} hoy
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{orderStats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  Requieren atención
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completados</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{orderStats.completed}</div>
                <p className="text-xs text-muted-foreground">
                  Finalizados
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hoy</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{orderStats.todayTotal}</div>
                <p className="text-xs text-muted-foreground">
                  Pedidos de hoy
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters Section */}
          <OrdersFilterBar
            filters={filters}
            onSearchChange={handleSearch}
            onStatusChange={handleStatusFilter}
            onDateRangeChange={handleDateRangeFilter}
            onSortChange={handleSortChange}
          />

          {/* Orders List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pedidos</CardTitle>
                  <CardDescription>
                    Historial completo de pedidos de la tienda
                  </CardDescription>
                </div>
                {pagination && (
                  <div className="text-sm text-muted-foreground">
                    Página {pagination.current} de {Math.ceil(pagination.total / filters.limit!)}
                    {' · '}
                    {pagination.total} pedidos en total
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#9EE493] mr-2" />
                  <span className="text-gray-600">Cargando pedidos...</span>
                </div>
              )}

              {isError && (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">Error al cargar los pedidos</p>
                  <Button onClick={() => refetch()} variant="outline">
                    Reintentar
                  </Button>
                </div>
              )}

              {!isLoading && !isError && orders.length === 0 && (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No se encontraron pedidos</p>
                  <p className="text-sm text-gray-500">
                    {filters.search || filters.status || filters.dateRange
                      ? 'Prueba ajustando los filtros de búsqueda'
                      : 'Los pedidos aparecerán aquí una vez que los clientes realicen compras'
                    }
                  </p>
                </div>
              )}

              {!isLoading && !isError && orders.length > 0 && (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={{
                        ...order,
                        status: order.status as OrderStatus,
                      }}
                      acceptingEnabled={false}
                      showActions={false}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.total > filters.limit! && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(filters.page! - 1)}
                      disabled={!pagination.hasPrev}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-gray-600">
                      Página {pagination.current} de {Math.ceil(pagination.total / filters.limit!)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(filters.page! + 1)}
                      disabled={!pagination.hasNext}
                    >
                      Siguiente
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Mostrando {Math.min(filters.limit!, pagination.count)} de {pagination.total} pedidos
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}