import { Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ShippingType } from '@/types/order';

interface ShippingTypeBadgeProps {
  allowedShippingTypes?: ShippingType[];
  variant?: 'card' | 'detail';
}

export function ShippingTypeBadge({ allowedShippingTypes, variant = 'card' }: ShippingTypeBadgeProps) {
  // Don't show badge if no restrictions or allows all types
  if (!allowedShippingTypes || allowedShippingTypes.length === 0) {
    return null;
  }

  // Check if restricted to simple shipping only
  const isSimpleOnly = allowedShippingTypes.length === 1 && allowedShippingTypes[0] === 'simple';

  if (!isSimpleOnly) {
    return null; // Don't show badge if multiple shipping types allowed
  }

  if (variant === 'card') {
    // Compact version for product cards
    return (
      <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs flex items-center gap-1 px-2 py-0.5">
        <Truck className="h-3 w-3" />
        <span>Solo envío simple</span>
      </Badge>
    );
  }

  // Detailed version for product page
  return (
    <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
      <Truck className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-semibold text-orange-900">Envío simple únicamente</p>
        <p className="text-xs text-orange-700 mt-0.5">
          Este producto solo está disponible para envío tradicional sin opción de prueba inmediata.
        </p>
      </div>
    </div>
  );
}