'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { StoreSidebar } from '@/components/dashboard/store-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, UserPlus, Loader2, Shield, ChevronLeft, UserCheck, Clock } from 'lucide-react';
import { useCurrentStore } from '@/contexts/store-context';
import { useStoreManagers } from '@/hooks/api/use-store-managers';
import { useAuth } from '@/hooks/use-auth';
import { ManagerCard } from '@/components/managers/manager-card';
import { CreateManagerModal } from '@/components/managers/create-manager-modal';

export default function StoreManagersPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuth();
  const { store, storeName, logoUrl, isLoading: storeLoading } = useCurrentStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Only allow store owners to access this page (not managers)
  const isStoreOwner = user?.role === 'merchant' || user?.role === 'admin';

  const {
    data: managers,
    isLoading: managersLoading,
    error: managersError,
    refetch: refetchManagers,
  } = useStoreManagers(id, isStoreOwner);

  // Handle loading states
  if (storeLoading || (managersLoading && managers === undefined)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SidebarProvider>
          <StoreSidebar storeName={storeName || ''} logoUrl={logoUrl} active="managers" baseHref={`/dashboard/${id}`} userRole="owner" />
          <SidebarInset>
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#9EE493] mx-auto mb-4" />
                <p className="text-gray-600">Cargando equipo...</p>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
  }

  // Handle unauthorized access
  if (!isStoreOwner) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SidebarProvider>
          <StoreSidebar storeName={storeName || ''} logoUrl={logoUrl} active="managers" baseHref={`/dashboard/${id}`} userRole="owner" />
          <SidebarInset>
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center max-w-md mx-auto">
                <div className="p-4 bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-orange-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
                <p className="text-gray-600 mb-4">Solo los propietarios de la tienda pueden gestionar el equipo.</p>
                <Button onClick={() => router.push(`/dashboard/${id}`)} variant="outline">
                  Volver al Dashboard
                </Button>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
  }

  // Handle error state
  if (managersError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SidebarProvider>
          <StoreSidebar storeName={storeName || ''} logoUrl={logoUrl} active="managers" baseHref={`/dashboard/${id}`} userRole="owner" />
          <SidebarInset>
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <p className="text-red-600 mb-4">Error cargando el equipo</p>
                <Button onClick={() => refetchManagers()} variant="outline">
                  Reintentar
                </Button>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
  }

  const activeManagers = managers?.filter((assignment) => assignment.isActive) || [];
  const totalManagers = activeManagers.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarProvider>
        <StoreSidebar storeName={storeName || ''} logoUrl={logoUrl} active="managers" baseHref={`/dashboard/${id}`} />
        <SidebarInset>
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4 shadow-sm">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />

            <div className="flex items-center gap-2 flex-1">
              <div className="p-2 bg-[#DBF7DC] rounded-lg">
                <Users className="h-5 w-5 text-[#20313A]" />
              </div>
              <div>
                <h1 className="text-base md:text-lg font-semibold text-[#20313A]">Gestión de Equipo</h1>
                <p className="text-xs text-gray-600 hidden md:block">Administra los managers de {storeName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A] font-medium"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Agregar Manager</span>
                <span className="sm:hidden">Agregar</span>
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 space-y-6 p-4 md:p-6">
            {/* Stats Card */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-[#20313A]">
                  <UserCheck className="h-5 w-5" />
                  Resumen del Equipo
                </CardTitle>
                <CardDescription>Estado actual del equipo de gestión de tu tienda</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-[#DBF7DC] rounded-lg">
                    <div className="text-2xl font-bold text-[#20313A]">{totalManagers}</div>
                    <div className="text-sm text-gray-600">Managers Activos</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-800">1</div>
                    <div className="text-sm text-gray-600">Propietario</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-800">{totalManagers + 1}</div>
                    <div className="text-sm text-gray-600">Total del Equipo</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Managers List */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[#20313A]">Managers del Equipo</CardTitle>
                    <CardDescription>Usuarios con acceso completo a la gestión de la tienda</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {totalManagers === 0 ? (
                  // Empty State
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 bg-gray-100 rounded-full mb-4">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay managers agregados</h3>
                    <p className="text-gray-600 mb-6 max-w-sm">
                      Los managers pueden ayudarte a gestionar la tienda con acceso completo al dashboard.
                    </p>
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A] font-medium"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Agregar Primer Manager
                    </Button>
                  </div>
                ) : (
                  // Managers Grid
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {activeManagers.map((assignment) => (
                      <ManagerCard
                        key={assignment._id}
                        assignment={assignment}
                        storeId={id}
                        onRemove={() => refetchManagers()}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="border-0 shadow-sm bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-1">¿Cómo funcionan los managers?</h4>
                    <p className="text-sm text-blue-800 mb-2">
                      Los managers tienen acceso completo al dashboard de tu tienda y pueden:
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Gestionar pedidos y responder a clientes</li>
                      <li>• Administrar productos y inventario</li>
                      <li>• Ver estadísticas y reportes</li>
                      <li>• Acceder a todas las funciones operativas</li>
                    </ul>
                    <p className="text-xs text-blue-600 mt-2">
                      <strong>Nota:</strong> Solo los propietarios pueden agregar o remover managers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </SidebarProvider>

      {/* Create Manager Modal */}
      <CreateManagerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        storeId={id}
        storeName={storeName}
      />
    </div>
  );
}
