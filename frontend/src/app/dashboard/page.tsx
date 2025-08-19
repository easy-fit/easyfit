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
import { useRoleBasedDashboard } from '@/hooks/api/use-stores';
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
  const { data, isLoading, error: isError, userRole, isManager, isMerchant } = useRoleBasedDashboard();

  // Derive handy objects
  const summary = data?.data.dashboard.summary;
  const stores = data?.data.dashboard.stores ?? [];
  console.log(stores);
  const merchantName = user ? `${user.name} ${user.surname}` : 'Merchant';

  // Debug log for manager data

  // Helper function to safely render address
  // const formatAddress = (address: any): string => {
  //   if (!address) return 'Dirección no disponible';

  //   // Handle string address
  //   if (typeof address === 'string') return address;

  //   // Handle object address with formatted property
  //   if (typeof address === 'object' && address.formatted) {
  //     return address.formatted;
  //   }

  //   // Handle object address with individual properties
  //   if (typeof address === 'object' && address.street && address.city) {
  //     const streetNumber = address.streetNumber ? ` ${address.streetNumber}` : '';
  //     return `${address.street}${streetNumber}, ${address.city}`.trim();
  //   }

  //   // Fallback for any other object structure
  //   if (typeof address === 'object') {
  //     console.warn('Unexpected address object structure:', address);
  //     return 'Dirección no disponible';
  //   }

  //   return 'Dirección no disponible';
  // };

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
            <p className="text-gray-600">
              {isManager
                ? 'Gestiona las tiendas asignadas, productos y pedidos.'
                : 'Administra tus tiendas, productos y pedidos desde un solo lugar.'}
            </p>
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
              {/* Stores Card - Show for both merchants and managers */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isManager ? 'Tiendas Asignadas' : 'Tiendas Activas'}
                  </CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.totalStores || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {summary.activeStores || 0} activas, {summary.inactiveStores || 0} inactivas
                  </p>
                </CardContent>
              </Card>

              {/* Products Card - Only for merchants */}
              {!isManager && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Productos Totales</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.totalProducts || 0}</div>
                    <p className="text-xs text-green-600">+2 desde la semana pasada</p>
                  </CardContent>
                </Card>
              )}

              {/* Orders Card - Only for merchants */}
              {!isManager && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Órdenes Totales</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.totalOrders || 0}</div>
                    <p className="text-xs text-green-600">{summary.completedOrders || 0} completadas</p>
                  </CardContent>
                </Card>
              )}

              {/* Revenue Card - Only for merchants */}
              {!isManager && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos de la Semana</CardTitle>
                    <div className="h-4 w-4 text-muted-foreground">$</div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {summary.weeklyRevenue ? summary.weeklyRevenue.toLocaleString('es-AR') : '$0'}
                    </div>
                    <p className={`text-xs ${(summary.weeklyRevenueChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(summary.weeklyRevenueChange || 0) >= 0 ? '+' : ''}
                      {summary.weeklyRevenueChange || 0}% vs semana anterior
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Stores Section */}
          {!isLoading && !isError && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{isManager ? 'Tiendas Asignadas' : 'Mis Tiendas'}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {stores.map((store: any) => (
                  <Card key={store.id || store._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{store.name}</CardTitle>
                      <CardDescription className="sr-only">Sin descripción</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Only show metrics for merchants, simplified for managers */}
                      {!isManager && (
                        <>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-[#9EE493]">{store.productCount || 0}</div>
                            <div className="text-sm text-gray-600">Productos</div>
                          </div>

                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600">
                              {typeof store.address === 'string' ? store.address : 'Dirección disponible en tienda'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Stars rating={Number(store.rating ?? 0)} />
                            <span className="text-sm text-gray-600">
                              {Number(store.rating ?? 0).toFixed(1)} ({store.reviewCount || 0} reseñas)
                            </span>
                          </div>
                        </>
                      )}

                      {/* Simplified manager view */}
                      {isManager && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              store.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {store.status === 'active' ? 'Activa' : 'Inactiva'}
                            </div>
                          </div>
                          
                          {store.assignedAt && (
                            <div className="text-xs text-gray-500">
                              Asignada el {new Date(store.assignedAt).toLocaleDateString('es-AR')}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="pt-2">
                        <Button
                          size="sm"
                          className="w-full bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]"
                          onClick={() => router.push(`/dashboard/${store.id || store._id}`)}
                        >
                          Ver Tienda
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Crear Tienda card at the end, only for merchants/owners */}
                {!isManager && (
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
                )}
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
