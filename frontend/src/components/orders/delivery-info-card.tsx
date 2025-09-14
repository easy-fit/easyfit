'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Star, Bike } from 'lucide-react';
import type { CompleteOrder } from '@/types/order';

interface DeliveryInfoCardProps {
  order: CompleteOrder;
  deliveryTimeFrame: string;
  riderLocation: { latitude: number; longitude: number } | null;
}

export function DeliveryInfoCard({ order, deliveryTimeFrame, riderLocation }: DeliveryInfoCardProps) {
  if (!['rider_assigned', 'in_transit', 'delivered', 'awaiting_return_pickup'].includes(order.status)) {
    return null;
  }

  return (
    <div className="lg:hidden space-y-4"> {/* Show only on mobile */}
      {/* Rider Info - Clean like Rappi */}
      {order.riderDetails && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Rider Avatar with Motorbike Icon */}
              <div className="w-12 h-12 bg-[#9EE493] rounded-full flex items-center justify-center flex-shrink-0">
                <Bike className="w-6 h-6 text-[#20313A]" />
              </div>
              
              {/* Rider Details */}
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Tu repartidor</p>
                <p className="font-semibold text-[#20313A] text-base">
                  {order.riderDetails.name} {order.riderDetails.surname}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {order.riderDetails.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">{order.riderDetails.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Code - Simple and Clean */}
      {order.deliveryVerification?.code && (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Código de entrega</p>
            <div className="bg-gray-50 px-4 py-3 rounded-lg">
              <span className="text-2xl font-bold text-[#20313A] tracking-wider font-mono">
                {order.deliveryVerification.code}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Muestra este código al repartidor</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}