'use client';

import { Star, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

interface StoreCardProps {
  store: {
    _id: string;
    name: string;
    slug: string;
    averageRating: number;
    tags: string[];
    approximateDeliveryTime?: number | null; // minutes
    approximateShippingCost?: number | null; // in thousands (pesos)
    customization?: {
      logoUrl?: string;
      bannerUrl?: string;
    };
  };
}

export function StoreCard({ store }: StoreCardProps) {
  // Format delivery time as range (original time - original time + 10)
  const formatDeliveryTime = (minutes: number | null | undefined = 25) => {
    if (!minutes) return 'Tiempo no disponible';

    const minTime = minutes;
    const maxTime = minutes + 10;

    return `${minTime}-${maxTime} min`;
  };

  // Format shipping cost (value comes in thousands, round up)
  const formatShippingCost = (amount: number | null | undefined = 1600) => {
    if (!amount) return 'No disponible';
    if (amount === 0) return 'Gratis';

    // Round up and format as pesos
    const roundedAmount = Math.ceil(amount);
    return `$${roundedAmount.toLocaleString('es-AR')}`;
  };

  return (
    <Link href={`${store.slug}`}>
      <Card className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden py-0">
        <CardContent className="p-0">
          {/* Store Image - Made shorter */}
          <div className="relative aspect-[5/2.5] overflow-hidden">
            <Image
              src={store.customization?.bannerUrl || '/placeholder.svg'}
              alt={store.name}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />

            {/* Tags */}
            <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2 flex gap-1">
              {store.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-white/90 text-[#20313A] text-[10px] md:text-xs px-1.5 py-0.5 md:px-2 md:py-1"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Store Logo - Made bigger */}
            <div className="absolute bottom-1.5 left-1.5 md:bottom-2 md:left-2 w-8 h-8 md:w-12 md:h-12 rounded-full overflow-hidden bg-white shadow-lg border-2 border-white">
              <Image
                src={store.customization?.logoUrl || '/placeholder.svg'}
                alt={`${store.name} logo`}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 32px, 48px"
              />
            </div>
          </div>

          {/* Store Info */}
          <div className="p-2.5 md:p-3">
            <div className="flex items-center justify-between mb-1.5 md:mb-2">
              <h3 className="font-semibold text-[#20313A] font-satoshi text-xs md:text-sm truncate pr-2">
                {store.name}
              </h3>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="h-2.5 w-2.5 md:h-3 md:w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-600">{store.averageRating.toFixed(1)}</span>
              </div>
            </div>

            {/* Delivery Time and Shipping Cost */}
            <div className="flex items-center gap-1 text-[10px] md:text-xs text-gray-600">
              <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
              <span>
                {formatDeliveryTime(store.approximateDeliveryTime)} · Envío{' '}
                {formatShippingCost(store.approximateShippingCost)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
