'use client';

import { useRouter } from 'next/navigation';
import { Store, ArrowLeft, Home, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthGuard } from '@/components/auth/auth-guard';
import { MerchantNavbar } from '@/components/dashboard/merchant-navbar';

export default function StoreNotFoundPage() {
  const router = useRouter();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <MerchantNavbar />

        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            {/* 404 Illustration */}
            <div className="mb-8">
              <div className="relative mx-auto w-32 h-32 mb-6">
                <div className="absolute inset-0 bg-gray-100 rounded-full flex items-center justify-center">
                  <Store className="h-16 w-16 text-gray-400" />
                </div>
                <div className="absolute -top-2 -right-2 bg-red-100 rounded-full p-2">
                  <Search className="h-6 w-6 text-red-500" />
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <h1 className="text-6xl font-bold text-[#20313A]">404</h1>
                <h2 className="text-2xl font-semibold text-gray-900">Tienda no encontrada</h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  La tienda que estás buscando no existe o no tenés permisos para acceder a ella.
                </p>
              </div>
            </div>

            {/* Action Cards */}
            <div className="grid gap-4 md:grid-cols-2 mb-8">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Home className="h-5 w-5 text-[#9EE493]" />
                    Volver al Dashboard
                  </CardTitle>
                  <CardDescription>Regresá a tu panel principal para ver todas tus tiendas</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]"
                  >
                    Ir al Dashboard
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Store className="h-5 w-5 text-[#9EE493]" />
                    Crear Nueva Tienda
                  </CardTitle>
                  <CardDescription>¿No encontrás tu tienda? Podés crear una nueva</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard?create=true')}
                    className="w-full border-[#2F4858] text-[#2F4858] hover:bg-[#DBF7DC]"
                  >
                    Crear Tienda
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Help Section */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-blue-900 mb-2">¿Necesitás ayuda?</h3>
                <p className="text-blue-700 text-sm mb-4">
                  Si creés que esto es un error o necesitás acceso a una tienda específica, contactanos.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/dashboard/support')}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    Contactar Soporte
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="text-blue-700 hover:bg-blue-100"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Volver Atrás
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <div className="mt-8 text-sm text-gray-500">
              <p>Código de error: STORE_NOT_FOUND</p>
              <p className="mt-1">Si el problema persiste, por favor contactá a nuestro equipo de soporte.</p>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
