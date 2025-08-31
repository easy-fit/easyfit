import { useEffect } from 'react';
import { webSocketClient } from '@/lib/websocket/websocket-client';
import { statusMapping, COMPLETED_ORDER_STATUSES } from '@/constants/order-status';
import { useEasyFitToast } from '@/hooks/use-toast';
import type { CompleteOrder, OrderStatus, TryPeriodInfo } from '@/types/order';

interface UseOrderWebSocketProps {
  order: CompleteOrder | null;
  orderId: string;
  user: any;
  onStatusUpdate: () => void;
  onRiderLocationUpdate: (location: { latitude: number; longitude: number }) => void;
  onTryPeriodUpdate: (data: TryPeriodInfo) => void;
  onShowTryPeriodModal: () => void;
  onShowSuccessModal: () => void;
  hasShownSuccessModal: (orderId: string) => boolean;
  markSuccessModalShown: (orderId: string) => void;
}

export const useOrderWebSocket = ({
  order,
  orderId,
  user,
  onStatusUpdate,
  onRiderLocationUpdate,
  onTryPeriodUpdate,
  onShowTryPeriodModal,
  onShowSuccessModal,
  hasShownSuccessModal,
  markSuccessModalShown,
}: UseOrderWebSocketProps) => {
  const toast = useEasyFitToast();

  useEffect(() => {
    if (order && user) {
      // Skip WebSocket connection for completed orders
      if (COMPLETED_ORDER_STATUSES.includes(order.status)) {
        console.log(`Order ${orderId} is completed (${order.status}), skipping WebSocket connection`);
        return;
      }

      webSocketClient.connect();
      webSocketClient.joinOrder(orderId);

      // Define event handlers
      const handleStatusUpdate = (data: any) => {
        if (data.data.order._id === orderId) {
          const newStatus = data.data.newStatus as OrderStatus;

          // Update the query cache with new status
          onStatusUpdate();

          // Handle final statuses - show success modal
          if (newStatus === 'purchased' || newStatus === 'return_completed') {
            // Check if we've already shown the success modal for this order
            if (!hasShownSuccessModal(orderId)) {
              // Mark as shown and display the modal
              markSuccessModalShown(orderId);
              onShowSuccessModal();
            }
          } else {
            // Show regular toast for other status updates
            toast.info(`Estado actualizado: ${statusMapping[newStatus]?.label || newStatus}`);
          }
        }
      };

      const handleTrackingUpdate = (data: any) => {
        if (data.data.orderId === orderId) {
          // Update rider location for real-time tracking
          if (data.data.location) {
            onRiderLocationUpdate(data.data.location);
          }

          console.log('Delivery tracking update:', data);
          toast.info('Ubicación del repartidor actualizada');
        }
      };

      const handleTryPeriodUpdate = (data: any) => {
        if (data.data.orderId === orderId) {
          console.log('Try period update:', data);

          switch (data.data.type) {
            case 'try_period_started':
              onTryPeriodUpdate(data.data.tryPeriod);
              onShowTryPeriodModal();
              toast.info('¡Período de prueba iniciado! Decide qué productos conservar.');
              break;

            case 'try_period_updated':
              onTryPeriodUpdate(data.data.tryPeriod);
              break;

            case 'try_period_expired':
              onTryPeriodUpdate(data.data.tryPeriod);
              toast.warning('¡Tiempo agotado! Decide rápidamente para evitar cargos adicionales.');
              break;

            case 'try_period_finalized':
              onTryPeriodUpdate(data.data.tryPeriod);
              // Note: Modal will be closed by the WebSocket event handler in the parent component
              toast.success('Decisiones confirmadas. Procesando tu pedido...');
              onStatusUpdate(); // Refresh order data
              break;
          }
        }
      };

      // Listen for events
      webSocketClient.on('order:status_update', handleStatusUpdate);
      webSocketClient.on('delivery:tracking_update', handleTrackingUpdate);
      webSocketClient.on('try_period:update', handleTryPeriodUpdate);

      return () => {
        webSocketClient.leaveOrder(orderId);
        webSocketClient.off('order:status_update', handleStatusUpdate);
        webSocketClient.off('delivery:tracking_update', handleTrackingUpdate);
        webSocketClient.off('try_period:update', handleTryPeriodUpdate);
      };
    }
  }, [
    order,
    orderId,
    user,
    onStatusUpdate,
    onRiderLocationUpdate,
    onTryPeriodUpdate,
    onShowTryPeriodModal,
    onShowSuccessModal,
    hasShownSuccessModal,
    markSuccessModalShown,
    toast,
  ]);
};