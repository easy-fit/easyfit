'use client';

import { useState } from 'react';
import { useAvailableRiders, useAssignRider, useForceStatusTransition } from '@/hooks/api/use-admin';
import { OrderStatus } from '@/types/order';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Settings, User, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ManualOrderControlProps {
  orderId: string;
  currentStatus: OrderStatus;
  onClose?: () => void;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  order_placed: 'Pedido Realizado',
  order_accepted: 'Pedido Aceptado',
  order_canceled: 'Pedido Cancelado',
  pending_rider: 'Esperando Repartidor',
  rider_assigned: 'Repartidor Asignado',
  in_transit: 'En Tránsito',
  delivered: 'Entregado',
  awaiting_return_pickup: 'Esperando Retiro',
  returning_to_store: 'Volviendo a Tienda',
  store_checking_returns: 'Revisando Devoluciones',
  purchased: 'Comprado',
  return_completed: 'Devolución Completa',
  stolen: 'Extraviado',
};

export function ManualOrderControl({ orderId, currentStatus, onClose }: ManualOrderControlProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [selectedRider, setSelectedRider] = useState<string>('');
  const [showConfirmStatus, setShowConfirmStatus] = useState(false);
  const [showConfirmRider, setShowConfirmRider] = useState(false);

  const { data: ridersData, isLoading: ridersLoading } = useAvailableRiders(orderId);
  const assignRiderMutation = useAssignRider();
  const forceStatusMutation = useForceStatusTransition();

  const riders = ridersData?.data?.riders || [];
  const availableRiders = riders.filter((r) => r.isAvailable);
  const unavailableRiders = riders.filter((r) => !r.isAvailable);

  const allStatuses: OrderStatus[] = [
    'order_placed',
    'order_accepted',
    'order_canceled',
    'pending_rider',
    'rider_assigned',
    'in_transit',
    'delivered',
    'awaiting_return_pickup',
    'returning_to_store',
    'store_checking_returns',
    'purchased',
    'return_completed',
    'stolen',
  ];

  const handleStatusChange = async () => {
    if (!selectedStatus) return;

    try {
      await forceStatusMutation.mutateAsync({
        orderId,
        status: selectedStatus,
        reason: 'Manual admin override',
      });

      toast.success('Estado actualizado correctamente', {
        description: `Estado cambiado a: ${STATUS_LABELS[selectedStatus]}`,
      });

      setShowConfirmStatus(false);
      setSelectedStatus('');
      onClose?.();
    } catch (error: any) {
      toast.error('Error al cambiar estado', {
        description: error?.message || 'Ocurrió un error al cambiar el estado',
      });
    }
  };

  const handleRiderAssignment = async () => {
    if (!selectedRider) return;

    const rider = riders.find((r) => r._id === selectedRider);
    if (!rider) return;

    try {
      await assignRiderMutation.mutateAsync({
        orderId,
        riderId: selectedRider,
      });

      toast.success('Repartidor asignado correctamente', {
        description: `${rider.name} ${rider.surname} ha sido asignado`,
      });

      setShowConfirmRider(false);
      setSelectedRider('');
      onClose?.();
    } catch (error: any) {
      toast.error('Error al asignar repartidor', {
        description: error?.message || 'Ocurrió un error al asignar el repartidor',
      });
    }
  };

  const selectedRiderData = riders.find((r) => r._id === selectedRider);

  return (
    <div className="space-y-6">
      {/* Current Status Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Estado Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="outline" className="text-base px-4 py-2">
            {STATUS_LABELS[currentStatus]}
          </Badge>
        </CardContent>
      </Card>

      {/* Status Change Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Cambiar Estado (Override)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedStatus} onValueChange={(val) => setSelectedStatus(val as OrderStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar nuevo estado" />
            </SelectTrigger>
            <SelectContent>
              {allStatuses.map((status) => (
                <SelectItem key={status} value={status} disabled={status === currentStatus}>
                  {STATUS_LABELS[status]}
                  {status === currentStatus && ' (Actual)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => setShowConfirmStatus(true)}
            disabled={!selectedStatus || selectedStatus === currentStatus || forceStatusMutation.isPending}
            className="w-full"
          >
            {forceStatusMutation.isPending ? 'Cambiando...' : 'Cambiar Estado'}
          </Button>

          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Esto omitirá las validaciones normales del sistema
          </p>
        </CardContent>
      </Card>

      {/* Rider Assignment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Asignar Repartidor Manualmente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ridersLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              <Select value={selectedRider} onValueChange={setSelectedRider}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar repartidor" />
                </SelectTrigger>
                <SelectContent>
                  {availableRiders.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        Disponibles
                      </div>
                      {availableRiders.map((rider) => (
                        <SelectItem key={rider._id} value={rider._id}>
                          <div className="flex items-center gap-2">
                            {rider.name} {rider.surname}
                            <Badge variant="default" className="ml-auto text-xs">
                              ✓ Disponible
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}

                  {unavailableRiders.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        No Disponibles
                      </div>
                      {unavailableRiders.map((rider) => (
                        <SelectItem key={rider._id} value={rider._id}>
                          <div className="flex items-center gap-2">
                            {rider.name} {rider.surname}
                            <Badge variant="secondary" className="ml-auto text-xs">
                              Ocupado
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>

              {riders.length === 0 && (
                <p className="text-sm text-muted-foreground">No hay repartidores disponibles</p>
              )}

              <Button
                onClick={() => setShowConfirmRider(true)}
                disabled={!selectedRider || assignRiderMutation.isPending}
                className="w-full"
                variant="secondary"
              >
                {assignRiderMutation.isPending ? 'Asignando...' : 'Asignar Repartidor'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Status Change Confirmation Dialog */}
      <Dialog open={showConfirmStatus} onOpenChange={setShowConfirmStatus}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Cambio de Estado</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cambiar el estado del pedido?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Estado Actual:</span>
              <Badge variant="outline">{STATUS_LABELS[currentStatus]}</Badge>
            </div>
            <div className="flex items-center justify-center py-2">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Nuevo Estado:</span>
              <Badge>{selectedStatus && STATUS_LABELS[selectedStatus]}</Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Este cambio omitirá las validaciones normales del sistema y puede afectar el flujo del pedido.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmStatus(false)}>
              Cancelar
            </Button>
            <Button onClick={handleStatusChange} disabled={forceStatusMutation.isPending}>
              {forceStatusMutation.isPending ? 'Cambiando...' : 'Confirmar Cambio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rider Assignment Confirmation Dialog */}
      <Dialog open={showConfirmRider} onOpenChange={setShowConfirmRider}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Asignación de Repartidor</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas asignar este repartidor al pedido?
            </DialogDescription>
          </DialogHeader>
          {selectedRiderData && (
            <div className="py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Repartidor:</span>
                <span className="text-sm">
                  {selectedRiderData.name} {selectedRiderData.surname}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estado:</span>
                <Badge variant={selectedRiderData.isAvailable ? 'default' : 'secondary'}>
                  {selectedRiderData.isAvailable ? 'Disponible' : 'No Disponible'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm text-muted-foreground">{selectedRiderData.email}</span>
              </div>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            El repartidor será notificado inmediatamente y se actualizará el estado del pedido.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmRider(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRiderAssignment} disabled={assignRiderMutation.isPending}>
              {assignRiderMutation.isPending ? 'Asignando...' : 'Confirmar Asignación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
