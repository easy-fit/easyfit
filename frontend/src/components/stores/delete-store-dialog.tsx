'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteStore } from '@/hooks/api/use-stores';
import { useEasyFitToast } from '@/hooks/use-toast';
import { translateAndExtractError } from '@/lib/error-translations';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteStoreDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  storeName: string;
  redirectAfterDelete?: boolean;
}

export function DeleteStoreDialog({ 
  isOpen, 
  onOpenChange, 
  storeId, 
  storeName,
  redirectAfterDelete = false 
}: DeleteStoreDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteStoreMutation = useDeleteStore();
  const toast = useEasyFitToast();
  const router = useRouter();

  const handleDelete = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    
    try {
      await deleteStoreMutation.mutateAsync(storeId);
      
      toast.success('Tienda eliminada exitosamente', {
        description: `La tienda "${storeName}" ha sido eliminada permanentemente.`
      });
      
      onOpenChange(false);
      
      if (redirectAfterDelete) {
        router.push('/dashboard');
      }
      
    } catch (error: any) {
      console.error('Error deleting store:', error);
      
      const translatedError = translateAndExtractError(error, 'Error al eliminar tienda');
      
      toast.error('Error al eliminar tienda', {
        description: translatedError,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            ¿Eliminar tienda?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Estás a punto de eliminar permanentemente la tienda{' '}
              <strong className="text-gray-900">&quot;{storeName}&quot;</strong>.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
              <p className="text-red-800 font-medium text-sm">⚠️ Esta acción es irreversible</p>
              <ul className="text-red-700 text-sm space-y-1 ml-4">
                <li>• Se eliminará toda la información de la tienda</li>
                <li>• Se perderán todas las configuraciones personalizadas</li>
                <li>• Los productos deben ser eliminados primero</li>
              </ul>
            </div>
            <p className="text-gray-600">
              Si estás seguro de continuar, confirma la eliminación haciendo clic en el botón rojo.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Eliminando...' : 'Eliminar Tienda'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}