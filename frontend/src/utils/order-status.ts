import { statusMapping, RETURN_FLOW_STATUSES } from '@/constants/order-status';
import type { OrderStatus } from '@/types/order';

// Helper function to get relevant status steps based on order status and shipping type
export const getStatusSteps = (currentStatus: OrderStatus, _shippingType?: string) => {
  // Type the array to accept any status mapping value
  const baseStatuses: Array<typeof statusMapping[keyof typeof statusMapping]> = [
    statusMapping.order_placed, 
    statusMapping.order_accepted
  ];

  // Always include rider assignment step for all shipping types
  baseStatuses.push(statusMapping.rider_assigned, statusMapping.in_transit, statusMapping.delivered);

  // If current status is in return flow, add all return flow steps
  if (RETURN_FLOW_STATUSES.includes(currentStatus)) {
    baseStatuses.push(
      statusMapping.awaiting_return_pickup,
      statusMapping.returning_to_store,
      statusMapping.store_checking_returns,
    );

    // Add final return status based on current status
    if (currentStatus === 'return_completed') {
      baseStatuses.push(statusMapping.return_completed);
    }
  } else if (currentStatus === 'purchased') {
    // For purchased status, show completed flow
    baseStatuses.push(statusMapping.purchased);
  }

  return baseStatuses;
};