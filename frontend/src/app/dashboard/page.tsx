/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Store, MapPin, Star, Plus } from 'lucide-react';

import { MerchantNavbar } from '@/components/dashboard/merchant-navbar';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { useAuth } from '@/hooks/use-auth';
import { useGetDashboard } from '@/hooks/api/use-stores';
import { CreateStoreDialog } from '@/components/dashboard/create-store-dialog';

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const items = useMemo(() => Array.from({ length: 5 }), []);
  return (
    <div className="flex items-center">
      {items.map((_, i) => (
        <Star key={i} className={i < full ? 'h-4 w-4 text-yellow-400 fill-current' : 'h-4 w-4 text-gray-300'} />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, isLoading, isError } = useGetDashboard();

  // Role guard (client-side safety in addition to middleware)
  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'merchant' && user.role !== 'admin') {
      router.replace('/unauthorized');
    }
  }, [isAuthenticated, user, router]);

  // Derive handy objects
  const summary = data?.data.dashboard.summary;
  const stores = data?.data.dashboard.stores ?? [];
  const merchantName = user ? `${user.name} ${user.surname}` : 'Merchant';

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar (same design as provided) */}
        <MerchantNavbar />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Welcome */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {'¡Hola, '}
              {merchantName}
              {'! 👋'}
            </h2>
            <p className="text-gray-600">{'Administra tus tiendas, productos y pedidos desde un solo lugar.'}</p>
          </div>

          {/* Loading / Error */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Cargando...</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-6 w-24 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-40 bg-gray-100 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {isError && (
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Error al cargar el dashboard</CardTitle>
                  <CardDescription>Intenta nuevamente en unos segundos.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          )}

          {/* Stats Cards */}
          {!isLoading && !isError && summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tiendas Activas</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.totalStores}</div>
                  <p className="text-xs text-muted-foreground">
                    {summary.activeStores} activas, {summary.inactiveStores} inactivas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Productos Totales</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.totalProducts}</div>
                  <p className="text-xs text-green-600">+2 desde la semana pasada</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Órdenes Totales</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.totalOrders}</div>
                  <p className="text-xs text-green-600">{summary.completedOrders} completadas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos de la Semana</CardTitle>
                  <div className="h-4 w-4 text-muted-foreground">$</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.weeklyRevenue.toLocaleString('es-AR')}</div>
                  <p className={`text-xs ${summary.weeklyRevenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {summary.weeklyRevenueChange >= 0 ? '+' : ''}
                    {summary.weeklyRevenueChange}% vs semana anterior
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Stores Section */}
          {!isLoading && !isError && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Mis Tiendas</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {stores.map((store: any) => (
                  <Card key={store.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{store.name}</CardTitle>
                      <CardDescription className="sr-only">Sin descripción</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-[#9EE493]">{store.productCount}</div>
                        <div className="text-sm text-gray-600">Productos</div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{store.address}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Stars rating={Number(store.rating ?? 0)} />
                        <span className="text-sm text-gray-600">
                          {Number(store.rating ?? 0).toFixed(1)} ({store.reviewCount} reseñas)
                        </span>
                      </div>

                      <div className="pt-2">
                        <Button
                          size="sm"
                          className="w-full bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]"
                          onClick={() => router.push(`/dashboard/${store.id}`)}
                        >
                          Ver Tienda
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Crear Tienda card at the end, minimal: plus icon + button */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                      <Plus className="h-10 w-10 text-[#20313A]" />
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]"
                      onClick={() => setIsCreateOpen(true)}
                    >
                      Crear tienda
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          <CreateStoreDialog
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            onCreated={() => {
              // Optionally navigate to the new store dashboard
              // router.push(`/dashboard/${id}`);
            }}
          />
        </main>
      </div>
    </AuthGuard>
  );
}
