/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Package, Clock4, CheckCircle2, XCircle, ChevronRight, Loader2, PauseCircle } from 'lucide-react';

import { AuthGuard } from '@/components/auth/auth-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { StoreSidebar } from '@/components/dashboard/store-sidebar';
import { useStore, useStoreOrderAnalytics, useStoreOrders, useSetStoreStatus } from '@/hooks/api/use-stores';
import { OrderCard, type Order } from '@/components/dashboard/order-card';
import { useStoreEvents, useWebSocket } from '@/hooks/use-websocket';
import type { OrderNewEvent } from '@/types/websockets';
import type { OrderStatus } from '@/types/order';

export default function StoreDashboardPage() {
  const { id } = useParams() as { id: string };
  const { data } = useStore(id);
  const { data: analyticsData, isLoading: analyticsLoading } = useStoreOrderAnalytics(id);
  const {
    data: activeOrdersData,
    isLoading: activeOrdersLoading,
    refetch: refetchActiveOrders,
  } = useStoreOrders(id, {
    status: [
      'order_accepted',
      'pending_rider',
      'rider_assigned',
      'in_transit',
      'delivered',
      'awaiting_return_pickup',
      'returning_to_store',
      'store_checking_returns',
    ].join(','),
    limit: 20,
  });
  const { respondToOrder, joinStoreChannel, leaveStoreChannel } = useStoreEvents();
  const { on, off } = useWebSocket();
  const setStoreStatusMutation = useSetStoreStatus();

  const store = data?.data;
  const storeName = store?.name ?? 'Mi Tienda';
  const logoUrl = store?.customization?.logoUrl ?? '/placeholder.svg?height=48&width=48';

  // Use real store status from API
  const storeStatus = store?.status || 'inactive';
  const acceptingOrders = storeStatus === 'active';

  const handleStatusToggle = async (newAcceptingStatus: boolean) => {
    const newStatus = newAcceptingStatus ? 'active' : 'inactive';

    try {
      await setStoreStatusMutation.mutateAsync({ id, status: newStatus });
    } catch (error) {
      console.error('Error updating store status:', error);
    }
  };

  // Use real data from API
  const analytics = analyticsData?.data;
  const pending = analytics?.pending || 0;
  const accepted = analytics?.accepted || 0;
  const rejected = analytics?.rejected || 0;

  // Separate state for pending and active orders
  const [pendingOrders, setPendingOrders] = React.useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = React.useState<Order[]>([]);

  // Update active orders when API data changes
  React.useEffect(() => {
    const apiOrders = activeOrdersData?.data?.orders || [];
    const formattedOrders: Order[] = apiOrders.map((order) => ({
      ...order,
      status: order.status as OrderStatus,
    }));
    setActiveOrders(formattedOrders);
  }, [activeOrdersData]);

  // Periodic refresh of active orders to ensure data consistency
  React.useEffect(() => {
    const interval = setInterval(() => {
      refetchActiveOrders();
    }, 100000); // Refresh every 100 seconds
    return () => clearInterval(interval);
  }, [refetchActiveOrders]);

  const handleAccept = async (orderId: string) => {
    try {
      // Send WebSocket response
      respondToOrder({
        orderId,
        storeId: id,
        accepted: true,
        timestamp: new Date(),
      });

      // Optimistically remove from pending orders
      setPendingOrders((prev) => prev.filter((o) => o.id !== orderId));

      // Refetch active orders to get the newly accepted order
      setTimeout(() => refetchActiveOrders(), 500);
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  };

  const handleReject = async (orderId: string) => {
    try {
      // Send WebSocket response
      respondToOrder({
        orderId,
        storeId: id,
        accepted: false,
        timestamp: new Date(),
      });

      // Remove from pending orders
      setPendingOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (error) {
      console.error('Error rejecting order:', error);
    }
  };

  // WebSocket connection management
  const { isConnected, connect } = useWebSocket();

  // Join store channel when connected
  React.useEffect(() => {
    if (!id || !isConnected) return;

    joinStoreChannel(id);
    return () => leaveStoreChannel(id);
  }, [id, isConnected, joinStoreChannel, leaveStoreChannel]);

  // WebSocket event listener for new orders
  React.useEffect(() => {
    if (!isConnected) {
      connect();
      return;
    }

    const handleOrderNew = (data: OrderNewEvent) => {
      const actualData = data?.data || data;

      if (!actualData?.order?._id || !actualData?.customer || !actualData?.orderItems) {
        return;
      }

      const formattedOrder: Order = {
        id: actualData.order._id,
        number: `#${actualData.order._id.slice(-4)}`,
        customer: `${actualData.customer.name} ${actualData.customer.surname}`,
        total: `$${actualData.order.total.toFixed(2)}`,
        placedAt: new Date(actualData.order.createdAt).toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        createdAt: new Date(actualData.order.createdAt).toISOString(),
        items: actualData.orderItems.map((item: any) => ({
          id: item._id,
          name: item.product.title,
          variant: `${item.variant.size} - ${item.variant.color}`,
          sku: item.variant.sku,
          quantity: item.quantity,
          price: `$${item.unitPrice.toFixed(2)}`,
        })),
        status: 'order_placed' as OrderStatus,
      };

      setPendingOrders((prev) => {
        if (prev.find((o) => o.id === formattedOrder.id)) {
          return prev;
        }
        return [formattedOrder, ...prev];
      });
    };

    on('order:new', handleOrderNew);
    return () => off('order:new', handleOrderNew);
  }, [isConnected, connect, on, off]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <SidebarProvider>
          <StoreSidebar storeName={storeName} logoUrl={logoUrl} active="home" baseHref={`/dashboard/${id}`} />
          <SidebarInset>
            {/* Header with prominent intake control */}
            <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mx-1 h-4" />
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <h1 className="text-base md:text-lg font-semibold text-[#20313A]">{storeName}</h1>
                  <Badge variant="secondary" className="hidden md:inline-flex">
                    Home
                  </Badge>
                </div>

                {/* Colorful segmented control for order intake */}
                <div className="flex items-center gap-3">
                  <span className="hidden md:inline text-sm text-gray-700">Recepción de pedidos:</span>
                  <div className="inline-flex overflow-hidden rounded-full border bg-white shadow-sm">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      aria-pressed={!acceptingOrders}
                      onClick={() => handleStatusToggle(false)}
                      disabled={setStoreStatusMutation.isPending}
                      className={`rounded-none font-medium transition-colors ${
                        !acceptingOrders ? 'bg-orange-100 text-orange-800 hover:bg-orange-100' : 'hover:bg-gray-50'
                      }`}
                    >
                      <PauseCircle className="h-4 w-4 mr-1.5" />
                      Pausado
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      aria-pressed={acceptingOrders}
                      onClick={() => handleStatusToggle(true)}
                      disabled={setStoreStatusMutation.isPending}
                      className={`rounded-none border-l font-medium transition-colors ${
                        acceptingOrders ? 'bg-[#9EE493] text-[#20313A] hover:bg-[#8BD480]' : 'hover:bg-gray-50'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      Aceptando
                    </Button>
                  </div>
                </div>
              </div>
            </header>

            <main className="p-4 md:p-6 space-y-6">
              {/* KPIs */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                    <Clock4 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pending}</div>
                    <p className="text-xs text-muted-foreground">Órdenes esperando aceptación</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Aceptadas</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{accepted}</div>
                    <p className="text-xs text-muted-foreground">En preparación</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Rechazadas</CardTitle>
                    <XCircle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{rejected}</div>
                    <p className="text-xs text-muted-foreground">Últimas 24h</p>
                  </CardContent>
                </Card>
              </div>

              {/* Órdenes pendientes - awaiting response */}
              <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Órdenes pendientes</CardTitle>
                    <CardDescription>
                      {acceptingOrders
                        ? 'Nuevas órdenes esperando tu respuesta'
                        : 'Estás pausado. Activá para recibir pedidos.'}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-orange-600">
                    {pendingOrders.length} pendientes
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingOrders.length > 0 ? (
                    pendingOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        acceptingEnabled={acceptingOrders}
                        onAccept={handleAccept}
                        onReject={handleReject}
                      />
                    ))
                  ) : (
                    <div className="flex items-center justify-center py-8 text-center">
                      <div>
                        <Clock4 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No hay órdenes pendientes</p>
                        {!acceptingOrders && (
                          <p className="text-xs text-gray-400 mt-1">Activá para recibir nuevas órdenes</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Órdenes activas - accepted and in progress */}
              <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Órdenes activas</CardTitle>
                    <CardDescription>Órdenes aceptadas en proceso de entrega</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600">
                      {activeOrders.length} activas
                    </Badge>
                    <Button variant="outline" size="sm" className="hidden md:inline-flex">
                      Ver todas
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeOrdersLoading || analyticsLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-5 w-5 animate-spin text-[#9EE493]" />
                    </div>
                  ) : activeOrders.length > 0 ? (
                    activeOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        acceptingEnabled={false} // No actions needed for active orders
                        onAccept={undefined}
                        onReject={undefined}
                      />
                    ))
                  ) : (
                    <div className="flex items-center justify-center py-8 text-center">
                      <div>
                        <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No hay órdenes activas</p>
                        <p className="text-xs text-gray-400 mt-1">Las órdenes aceptadas aparecerán aquí</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </AuthGuard>
  );
}
