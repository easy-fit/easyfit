'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, AlertCircle, CheckCircle } from 'lucide-react';
import { useEasyFitToast } from '@/hooks/use-toast';
import { useBulkUpdateProducts } from '@/hooks/api/use-products';

interface BulkProductStatusModalProps {
  open: boolean;
  onClose: () => void;
  selectedProductIds: string[];
  productNames: Record<string, string>; // productId -> product name mapping
}

type ProductStatus = 'published' | 'draft';

export function BulkProductStatusModal({
  open,
  onClose,
  selectedProductIds,
  productNames
}: BulkProductStatusModalProps) {
  const toast = useEasyFitToast();
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus>('published');
  const bulkUpdateMutation = useBulkUpdateProducts();

  const statusOptions = [
    { value: 'published', label: 'Publicado', color: 'bg-green-100 text-green-800' },
    { value: 'draft', label: 'Borrador', color: 'bg-yellow-100 text-yellow-800' }
  ];

  const selectedStatusOption = statusOptions.find(option => option.value === selectedStatus);

  const handleSave = async () => {
    if (selectedProductIds.length === 0) {
      toast.error('Error', { description: 'No hay productos seleccionados' });
      return;
    }

    try {
      const result = await bulkUpdateMutation.mutateAsync({
        productIds: selectedProductIds,
        updateData: { status: selectedStatus }
      });

      toast.success('Estado actualizado', {
        description: `${result.data.successful} productos actualizados correctamente${result.data.failed > 0 ? `, ${result.data.failed} fallidos` : ''}`
      });

      onClose();
    } catch (error) {
      toast.error('Error', {
        description: 'No se pudieron actualizar los productos. Intentá nuevamente.'
      });
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Cambiar Estado de Productos
          </DialogTitle>
          <DialogDescription>
            Cambiá el estado de {selectedProductIds.length} producto{selectedProductIds.length !== 1 ? 's' : ''} seleccionado{selectedProductIds.length !== 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nuevo Estado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedStatus} onValueChange={(value: ProductStatus) => setSelectedStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={option.color}>
                          {option.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedStatusOption && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Estado seleccionado:</span>
                  <Badge variant="secondary" className={selectedStatusOption.color}>
                    {selectedStatusOption.label}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Products List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Productos Seleccionados ({selectedProductIds.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {selectedProductIds.map(productId => (
                  <div key={productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {productNames[productId] || `Producto ${productId}`}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Warning Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Esta acción cambiará el estado de todos los productos seleccionados. Los productos con estado "Borrador" no serán visibles para los clientes.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-600">
              {selectedProductIds.length} productos serán actualizados
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose} disabled={bulkUpdateMutation.isPending}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={bulkUpdateMutation.isPending}
                className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]"
              >
                {bulkUpdateMutation.isPending ? 'Actualizando...' : `Actualizar ${selectedProductIds.length} productos`}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}