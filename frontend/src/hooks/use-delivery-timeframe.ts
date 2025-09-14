import { useCallback } from 'react';
import type { CompleteOrder } from '@/types/order';
import { calculateDistance } from '@/utils/geo';
import { formatTimeFrame } from '@/utils/formatters';

interface UseDeliveryTimeFrameProps {
  order: CompleteOrder | null;
  riderLocation: { latitude: number; longitude: number } | null;
}

export const useDeliveryTimeFrame = ({ order, riderLocation }: UseDeliveryTimeFrameProps) => {
  const getDeliveryTimeFrame = useCallback(() => {
    if (!order) return '';
    
    // If rider has real-time location, calculate dynamic ETA
    if (riderLocation && order.shipping.address.coordinates) {
      const [customerLng, customerLat] = order.shipping.address.coordinates;
      const distance = calculateDistance(riderLocation.latitude, riderLocation.longitude, customerLat, customerLng);

      // Estimate time based on distance (assuming 20 km/h average speed)
      const estimatedMinutes = Math.ceil(distance * 3); // 3 minutes per km
      const bufferMinutes = Math.max(5, Math.min(15, estimatedMinutes * 0.3)); // 30% buffer, min 5, max 15

      const now = new Date();
      const startTime = new Date(now.getTime() + estimatedMinutes * 60000);
      const endTime = new Date(now.getTime() + (estimatedMinutes + bufferMinutes) * 60000);

      return `${formatTimeFrame(startTime)} - ${formatTimeFrame(endTime)}`;
    }

    // Static calculation based on assignment time
    if (order.riderAssignment?.assignedAt) {
      const assignedTime = new Date(order.riderAssignment.assignedAt);
      const estimatedDuration = order.shipping.durationMinutes || 45;

      const startTime = new Date(assignedTime.getTime() + 5 * 60000);
      const endTime = new Date(assignedTime.getTime() + estimatedDuration * 60000);

      return `${formatTimeFrame(startTime)} - ${formatTimeFrame(endTime)}`;
    }

    // Fallback for non-assigned orders
    const now = new Date();
    const startTime = new Date(now.getTime() + 15 * 60000);
    const endTime = new Date(now.getTime() + 50 * 60000);

    return `${formatTimeFrame(startTime)} - ${formatTimeFrame(endTime)}`;
  }, [order, riderLocation]);

  return { getDeliveryTimeFrame };
};