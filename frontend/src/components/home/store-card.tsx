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
    // Add other fields as needed
  };
}

export function StoreCard({ store }: StoreCardProps) {
  // Use placeholder for now since external URLs need to be configured in next.config.js
  const imageUrl = '/banner-store.jpg'; // Placeholder image, replace with actual logic if needed
  const logoUrl = '/logo-stores.jpg';

  // Format delivery time as range (original time - original time + 10)
  const formatDeliveryTime = (minutes: number | null | undefined) => {
    if (!minutes) return 'Tiempo no disponible';

    const minTime = minutes;
    const maxTime = minutes + 10;

    return `${minTime}-${maxTime} min`;
  };

  // Format shipping cost (value comes in thousands, round up)
  const formatShippingCost = (amount: number | null | undefined) => {
    if (!amount) return 'Gratis';
    if (amount === 0) return 'Gratis';

    // Round up and format as pesos
    const roundedAmount = Math.ceil(amount);
    return `$${roundedAmount.toLocaleString('es-AR')}`;
  };

  return (
    <Link href={`/stores/${store.slug}`}>
      <Card className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden py-0">
        <CardContent className="p-0">
          {/* Store Image - Made shorter */}
          <div className="relative aspect-[5/2.5] overflow-hidden">
            <Image
              src={imageUrl || '/placeholder.svg'}
              alt={store.name}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />

            {/* Tags */}
            <div className="absolute top-2 left-2 flex gap-1">
              {store.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-white/90 text-[#20313A] text-xs px-2 py-1">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Store Logo - Made bigger */}
            <div className="absolute bottom-2 left-2 w-12 h-12 rounded-full overflow-hidden bg-white shadow-lg border-2 border-white">
              <Image
                src={logoUrl || '/placeholder.svg'}
                alt={`${store.name} logo`}
                fill
                className="object-cover object-center"
                sizes="48px"
              />
            </div>
          </div>

          {/* Store Info */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-[#20313A] font-satoshi text-sm truncate pr-2">{store.name}</h3>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-600">{store.averageRating.toFixed(1)}</span>
              </div>
            </div>

            {/* Delivery Time and Shipping Cost */}
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Clock className="h-3 w-3" />
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
