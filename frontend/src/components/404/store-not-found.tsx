'use client';

import { useRouter } from 'next/navigation';
import { Store, ArrowLeft, Home } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface StoreNotFoundProps {
  title?: string;
  description?: string;
  showCreateStore?: boolean;
}

export function StoreNotFound({
  title = 'Tienda no encontrada',
  description = 'La tienda que estás buscando no existe o no tenés permisos para acceder a ella.',
  showCreateStore = true,
}: StoreNotFoundProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="max-w-lg w-full text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <Store className="h-10 w-10 text-gray-400" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          <p className="text-gray-600">{description}</p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]"
          >
            <Home className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>

          {showCreateStore && (
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard?create=true')}
              className="w-full border-[#2F4858] text-[#2F4858] hover:bg-[#DBF7DC]"
            >
              <Store className="h-4 w-4 mr-2" />
              Crear Nueva Tienda
            </Button>
          )}

          <Button variant="ghost" onClick={() => router.back()} className="w-full text-gray-600 hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver Atrás
          </Button>
        </div>
      </div>
    </div>
  );
}
