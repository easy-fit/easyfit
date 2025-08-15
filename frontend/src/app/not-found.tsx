'use client';

import { useRouter, usePathname } from 'next/navigation';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();

  // Check if this is a dashboard/store related 404
  const isStorePage = pathname?.startsWith('/dashboard/');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-[#20313A]">404</h1>
          <h2 className="text-xl font-semibold text-gray-900">Página no encontrada</h2>
          <p className="text-gray-600">
            {isStorePage
              ? 'La tienda o página que estás buscando no existe.'
              : 'La página que estás buscando no existe o fue movida.'}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => router.push(isStorePage ? '/dashboard' : '/')}
            className="w-full bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]"
          >
            <Home className="h-4 w-4 mr-2" />
            {isStorePage ? 'Ir al Dashboard' : 'Ir al Inicio'}
          </Button>

          <Button variant="ghost" onClick={() => router.back()} className="w-full text-gray-600 hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver Atrás
          </Button>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-gray-500">
          <p>Código de error: 404</p>
        </div>
      </div>
    </div>
  );
}
