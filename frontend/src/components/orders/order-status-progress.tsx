'use client';

import { CheckCircle, Check, Truck, Package, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { statusMapping, COMPLETED_ORDER_STATUSES } from '@/constants/order-status';
import { getStatusSteps } from '@/utils/order-status';
import type { OrderStatus } from '@/types/order';

interface OrderStatusProgressProps {
  status: OrderStatus;
  shippingType: string;
  deliveryTimeFrame?: string;
  isActiveDelivery?: boolean;
}

export function OrderStatusProgress({ status, shippingType, deliveryTimeFrame, isActiveDelivery }: OrderStatusProgressProps) {
  const statusSteps = getStatusSteps(status, shippingType);
  const currentStatusIndex = statusSteps.findIndex((s) => s === statusMapping[status]);
  const isCompleted = COMPLETED_ORDER_STATUSES.includes(status);

  // Rappi-style status mapping for cleaner icons
  const getStatusIcon = (statusType: string, isComplete: boolean, isCurrent: boolean) => {
    const iconClass = isComplete ? "w-4 h-4 text-[#20313A]" : "w-4 h-4 text-gray-400";
    
    switch (statusType) {
      case 'order_placed':
        return <Package className={iconClass} />;
      case 'order_accepted':
        return <CheckCircle className={iconClass} />;
      case 'rider_assigned':
        return <User className={iconClass} />;
      case 'in_transit':
        return <Truck className={iconClass} />;
      case 'delivered':
        return <CheckCircle className={iconClass} />;
      default:
        return <Package className={iconClass} />;
    }
  };

  if (isCompleted) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#9EE493] flex items-center justify-center mb-4 mx-auto">
            <CheckCircle className="w-8 h-8 text-[#20313A]" />
          </div>
          <h3 className="text-xl font-bold text-[#20313A] mb-2">
            {statusMapping[status]?.label}
          </h3>
          <p className="text-gray-600 text-center mb-3">
            {statusMapping[status]?.description}
          </p>
          <Badge className="bg-[#9EE493] text-[#20313A] hover:bg-[#8BD480]">
            Pedido Completado
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        {/* Current Status Title - Rappi Style */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-[#20313A] mb-1">
            {statusMapping[status]?.label}
          </h2>
          <p className="text-gray-600 text-sm">
            {statusMapping[status]?.description}
          </p>
        </div>

        {/* Progress Dots - Rappi Style */}
        <div className="relative flex items-center justify-between mb-4">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-200 -translate-y-1/2">
            <div
              className="h-full bg-[#9EE493] transition-all duration-300"
              style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Status Dots */}
          {statusSteps.map((statusStep, index) => {
            const isStatusCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const statusKey = Object.keys(statusMapping).find(
              key => statusMapping[key as keyof typeof statusMapping] === statusStep
            ) as keyof typeof statusMapping;

            return (
              <div
                key={`${statusStep.label}-${index}`}
                className="relative"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 relative ${
                    isStatusCompleted
                      ? 'bg-[#9EE493] border-[#9EE493] text-[#20313A]'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {getStatusIcon(statusKey, isStatusCompleted, isCurrent)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Delivery Time - Integrated like Rappi */}
        {isActiveDelivery && deliveryTimeFrame && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Tiempo estimado:</span>
            <span className="font-semibold text-[#20313A]">{deliveryTimeFrame}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}