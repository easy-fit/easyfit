'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useUsers } from '@/hooks/api/use-users';
import { useOrders } from '@/hooks/api/use-orders';
import { useCheckoutSessions } from '@/hooks/api/use-checkouts';
import { useStores } from '@/hooks/api/use-stores';
import { User, UserRole } from '@/types/user';
import { Order, OrderStatus } from '@/types/order';
import { useState } from 'react';
import {
  Users,
  Package,
  Store,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  Settings
} from 'lucide-react';
import { ManualOrderDialog } from '@/components/admin/manual-order-dialog';

// Helper function to get status color and Spanish translation
const getStatusInfo = (status: string): { color: 'default' | 'secondary' | 'destructive' | 'outline', label: string } => {
  switch (status) {
    case 'delivered':
      return { color: 'default', label: 'Entregado' };
    case 'purchased':
      return { color: 'default', label: 'Comprado' };
    case 'order_placed':
      return { color: 'secondary', label: 'Pendiente' };
    case 'pending_rider':
      return { color: 'secondary', label: 'Buscando Repartidor' };
    case 'rider_assigned':
      return { color: 'outline', label: 'Repartidor Asignado' };
    case 'in_transit':
      return { color: 'outline', label: 'En Tránsito' };
    case 'order_canceled':
      return { color: 'destructive', label: 'Cancelado' };
    case 'stolen':
      return { color: 'destructive', label: 'Extraviado' };
    case 'awaiting_return_pickup':
      return { color: 'secondary', label: 'Esperando Retiro' };
    case 'returning_to_store':
      return { color: 'outline', label: 'Volviendo a Tienda' };
    case 'store_checking_returns':
      return { color: 'outline', label: 'Revisando Devoluciones' };
    case 'return_completed':
      return { color: 'default', label: 'Devolución Completa' };
    default:
      return { color: 'outline', label: status.replace('_', ' ') };
  }
};

const getRoleInfo = (role: UserRole): { color: 'default' | 'secondary' | 'destructive' | 'outline', label: string } => {
  switch (role) {
    case 'admin':
      return { color: 'destructive', label: 'Administrador' };
    case 'merchant':
      return { color: 'default', label: 'Comerciante' };
    case 'rider':
      return { color: 'secondary', label: 'Repartidor' };
    case 'customer':
      return { color: 'outline', label: 'Cliente' };
    case 'manager':
      return { color: 'outline', label: 'Gerente' };
    default:
      return { color: 'outline', label: role };
  }
};

// Enhanced analytics calculation functions
const calculateAnalytics = (users: User[] = [], orders: Order[] = [], stores: any[] = []) => {
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  // User analytics
  const totalUsers = users.length;
  const usersByRole = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const newUsersThisWeek = users.filter(user =>
    new Date(user.createdAt) >= sevenDaysAgo
  ).length;

  // Order analytics
  const totalOrders = orders.length;
  const ordersByStatus = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const completedOrders = orders.filter(order =>
    order.status === 'purchased' || order.status === 'delivered'
  );

  const pendingOrders = orders.filter(order =>
    order.status === 'order_placed' || order.status === 'pending_rider'
  );

  const ordersThisWeek = orders.filter(order =>
    new Date(order.createdAt) >= sevenDaysAgo
  ).length;

  const ordersThisMonth = orders.filter(order =>
    new Date(order.createdAt) >= thirtyDaysAgo
  ).length;

  // Revenue analytics
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
  const revenueThisWeek = orders
    .filter(order =>
      new Date(order.createdAt) >= sevenDaysAgo &&
      (order.status === 'purchased' || order.status === 'delivered')
    )
    .reduce((sum, order) => sum + order.total, 0);

  const revenueThisMonth = orders
    .filter(order =>
      new Date(order.createdAt) >= thirtyDaysAgo &&
      (order.status === 'purchased' || order.status === 'delivered')
    )
    .reduce((sum, order) => sum + order.total, 0);

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Conversion and efficiency metrics
  const conversionRate = totalOrders > 0 ? (completedOrders.length / totalOrders) * 100 : 0;
  const cancelationRate = totalOrders > 0 ? ((ordersByStatus.order_canceled || 0) / totalOrders) * 100 : 0;

  // Issues and alerts
  const criticalIssues = (ordersByStatus.stolen || 0);
  const needsAttention = pendingOrders.length + criticalIssues;

  return {
    // Basic metrics
    totalUsers,
    totalOrders,
    totalStores: stores.length,
    totalRevenue,

    // Growth metrics
    newUsersThisWeek,
    ordersThisWeek,
    ordersThisMonth,
    revenueThisWeek,
    revenueThisMonth,

    // Breakdown data
    usersByRole,
    ordersByStatus,

    // Performance metrics
    averageOrderValue,
    conversionRate,
    cancelationRate,
    completedOrdersCount: completedOrders.length,
    pendingOrdersCount: pendingOrders.length,

    // Alerts
    criticalIssues,
    needsAttention,
  };
};

export default function AdminDashboard() {
  const { data: usersData, isLoading: usersLoading } = useUsers();
  const { data: ordersData, isLoading: ordersLoading } = useOrders();
  const { data: checkoutData, isLoading: checkoutLoading } = useCheckoutSessions();
  const { data: storesData, isLoading: storesLoading } = useStores();

  const [manualOrderDialogOpen, setManualOrderDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const users = usersData?.users || [];
  const orders = ordersData?.data || [];
  const checkoutSessions = checkoutData?.data?.checkoutSessions ? [checkoutData.data.checkoutSessions] : [];
  const stores = storesData?.data?.stores || [];

  const analytics = calculateAnalytics(users, orders, stores);

  const isLoading = usersLoading || ordersLoading || checkoutLoading || storesLoading;

  const handleOpenManualControl = (order: Order) => {
    setSelectedOrder(order);
    setManualOrderDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        {analytics.needsAttention > 0 && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            {analytics.needsAttention} Requieren Atención
          </Badge>
        )}
      </div>

      {/* Main Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.newUsersThisWeek} esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.ordersThisWeek} esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${analytics.revenueThisWeek.toLocaleString()} esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiendas Activas</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalStores}</div>
            <p className="text-xs text-muted-foreground">
              {checkoutSessions.length} sesiones activas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Promedio Pedido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.averageOrderValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              Por pedido completado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.completedOrdersCount} pedidos completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pendingOrdersCount}</div>
            <p className="text-xs text-muted-foreground">
              Requieren procesamiento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Cancelación</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.cancelationRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.criticalIssues} casos críticos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for organized content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle>Usuarios Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {users.slice(0, 8).map((user) => {
                    const roleInfo = getRoleInfo(user.role);
                    return (
                      <div key={user._id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex-1">
                          <p className="font-medium">{user.name || 'N/A'} {user.surname || ''}</p>
                          <p className="text-sm text-muted-foreground">{user.email || 'Sin email'}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : 'Fecha no disponible'}
                          </p>
                        </div>
                        <Badge variant={roleInfo.color}>
                          {roleInfo.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Pedidos Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {orders.slice(0, 8).map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    return (
                      <div key={order._id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex-1">
                          <p className="font-medium">Pedido #{order._id ? order._id.slice(-8) : 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">${order.total ? order.total.toLocaleString() : '0'}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-ES') : 'Fecha no disponible'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenManualControl(order)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Checkout Sessions */}
          {checkoutSessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sesiones de Checkout Activas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {checkoutSessions.slice(0, 6).map((session) => (
                    <div key={session._id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium">Sesión #{session._id ? session._id.slice(-8) : 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">${session.total ? session.total.toLocaleString() : '0'}</p>
                      </div>
                      <Badge variant="secondary">
                        Activo
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-6">
            {/* User Breakdown by Role */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Usuarios por Rol</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  {Object.entries(analytics.usersByRole).map(([role, count]) => {
                    const roleInfo = getRoleInfo(role as UserRole);
                    return (
                      <div key={role} className="text-center p-4 rounded-lg border">
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {roleInfo.label}
                        </div>
                        <Badge variant={roleInfo.color} className="text-xs">
                          {((count / analytics.totalUsers) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* All Users List */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Usuarios ({analytics.totalUsers})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {users.map((user) => {
                    const roleInfo = getRoleInfo(user.role);
                    return (
                      <div key={user._id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                        <div className="flex-1">
                          <p className="font-medium">{user.name || 'N/A'} {user.surname || ''}</p>
                          <p className="text-sm text-muted-foreground">{user.email || 'Sin email'}</p>
                          <p className="text-xs text-muted-foreground">
                            Registrado: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : 'Fecha no disponible'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={roleInfo.color}>
                            {roleInfo.label}
                          </Badge>
                          {user.emailVerification?.verified ? (
                            <Badge variant="default" className="text-xs">
                              Verificado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Sin Verificar
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <div className="grid gap-6">
            {/* Order Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Estado de Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                  {Object.entries(analytics.ordersByStatus).map(([status, count]) => {
                    const statusInfo = getStatusInfo(status);
                    return (
                      <div key={status} className="text-center p-4 rounded-lg border">
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {statusInfo.label}
                        </div>
                        <Badge variant={statusInfo.color} className="text-xs">
                          {((count / analytics.totalOrders) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* All Orders List */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Pedidos ({analytics.totalOrders})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {orders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    return (
                      <div key={order._id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                        <div className="flex-1">
                          <p className="font-medium">Pedido #{order._id ? order._id.slice(-8) : 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">${order.total ? order.total.toLocaleString() : '0'}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.createdAt ? `${new Date(order.createdAt).toLocaleDateString('es-ES')} - ${new Date(order.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}` : 'Fecha no disponible'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenManualControl(order)}
                            title="Gestionar manualmente"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6">
            {/* Revenue Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Ingresos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-green-600">${analytics.revenueThisWeek.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Esta Semana</div>
                  </div>
                  <div className="text-center p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">${analytics.revenueThisMonth.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Este Mes</div>
                  </div>
                  <div className="text-center p-4 rounded-lg border">
                    <div className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Histórico</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Growth Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Crecimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="text-center p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-green-600">{analytics.newUsersThisWeek}</div>
                    <div className="text-sm text-muted-foreground">Nuevos Usuarios (7 días)</div>
                  </div>
                  <div className="text-center p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">{analytics.ordersThisWeek}</div>
                    <div className="text-sm text-muted-foreground">Pedidos (7 días)</div>
                  </div>
                  <div className="text-center p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-purple-600">{analytics.ordersThisMonth}</div>
                    <div className="text-sm text-muted-foreground">Pedidos (30 días)</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Insights de Rendimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <span className="font-medium">Tasa de Conversión</span>
                    <span className="text-lg font-bold text-green-600">
                      {analytics.conversionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <span className="font-medium">Valor Promedio por Pedido</span>
                    <span className="text-lg font-bold">
                      ${analytics.averageOrderValue.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <span className="font-medium">Tasa de Cancelación</span>
                    <span className={`text-lg font-bold ${analytics.cancelationRate > 10 ? 'text-red-600' : 'text-yellow-600'}`}>
                      {analytics.cancelationRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <span className="font-medium">Pedidos Completados</span>
                    <span className="text-lg font-bold text-green-600">
                      {analytics.completedOrdersCount} ({analytics.totalOrders > 0 ? ((analytics.completedOrdersCount / analytics.totalOrders) * 100).toFixed(1) : '0'}%)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Manual Order Management Dialog */}
      {selectedOrder && (
        <ManualOrderDialog
          open={manualOrderDialogOpen}
          onOpenChange={setManualOrderDialogOpen}
          orderId={selectedOrder._id}
          currentStatus={selectedOrder.status}
          orderNumber={selectedOrder._id.slice(-8)}
        />
      )}
    </div>
  );
}