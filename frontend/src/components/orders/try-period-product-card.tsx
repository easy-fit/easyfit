'use client';

import { Button } from '@/components/ui/button';
import { Package, Check, X } from 'lucide-react';
import { buildImageUrl } from '@/lib/utils/image-url';
import { formatPrice } from '@/utils/formatters';
import Image from 'next/image';
import type { CompleteOrder } from '@/types/order';

interface TryPeriodProductCardProps {
  item: CompleteOrder['orderItems'][0];
  decision?: 'keep' | 'return';
  onDecisionChange: (orderItemId: string, decision: 'keep' | 'return') => void;
  sameVariantItems: CompleteOrder['orderItems'];
  itemIndex: number;
}

export function TryPeriodProductCard({ 
  item, 
  decision, 
  onDecisionChange, 
  sameVariantItems, 
  itemIndex 
}: TryPeriodProductCardProps) {
  const firstImage = item.variantId.images?.[0];
  const hasMultipleOfSameVariant = sameVariantItems.length > 1;

  return (
    <div
      className={`p-2 sm:p-3 border rounded-lg transition-all ${
        decision === 'keep'
          ? 'border-green-500 bg-green-50 shadow-green-100 shadow-md'
          : decision === 'return'
          ? 'border-orange-500 bg-orange-50 shadow-orange-100 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Mobile Layout - Stacked */}
      <div className="sm:hidden space-y-3">
        <div className="flex gap-3">
          {/* Product Image */}
          <div className="flex-shrink-0">
            {firstImage ? (
              <Image
                src={buildImageUrl(item.variantId.images[0].key)}
                alt={item.variantId.productId.title}
                width={50}
                height={50}
                className="rounded-md object-cover"
              />
            ) : (
              <div className="w-[50px] h-[50px] bg-gray-200 rounded-md flex items-center justify-center">
                <Package className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-[#20313A] mb-1 font-helvetica">
              {item.variantId.productId.title}
              {hasMultipleOfSameVariant && (
                <span className="ml-1 text-xs font-normal text-gray-500">
                  ({itemIndex} de {sameVariantItems.length})
                </span>
              )}
            </h3>
            <div className="flex flex-wrap gap-1 text-gray-600 text-xs mb-1">
              <span className="bg-gray-100 px-1.5 py-0.5 rounded-full font-medium text-xs">
                Talle: {item.variantId.size}
              </span>
              <span className="bg-gray-100 px-1.5 py-0.5 rounded-full font-medium text-xs flex items-center gap-1">
                Color: 
                <div
                  className="w-3 h-3 rounded-full border border-gray-300 inline-block"
                  style={{ backgroundColor: item.variantId.color }}
                />
              </span>
            </div>
            <p className="text-sm font-bold text-[#20313A] font-helvetica">
              {formatPrice(item.unitPrice)}
            </p>
          </div>

          {/* Decision Status Indicator */}
          {decision && (
            <div className="flex-shrink-0 flex items-center justify-center">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  decision === 'keep' ? 'bg-green-600' : 'bg-orange-600'
                }`}
              >
                {decision === 'keep' ? (
                  <Check className="w-2.5 h-2.5 text-white" />
                ) : (
                  <X className="w-2.5 h-2.5 text-white" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Decision Buttons - Mobile */}
        <div className="flex gap-2">
          <Button
            onClick={() => onDecisionChange(item._id, 'keep')}
            variant={decision === 'keep' ? 'default' : 'outline'}
            size="sm"
            className={`flex-1 ${
              decision === 'keep'
                ? 'bg-green-600 hover:bg-green-700 text-white font-semibold py-2 text-xs'
                : 'text-green-600 border-green-600 hover:bg-green-50 font-semibold py-2 text-xs'
            }`}
          >
            <Check className="w-3 h-3 mr-1" />
            Me lo quedo
          </Button>
          <Button
            onClick={() => onDecisionChange(item._id, 'return')}
            variant={decision === 'return' ? 'default' : 'outline'}
            size="sm"
            className={`flex-1 ${
              decision === 'return'
                ? 'bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 text-xs'
                : 'text-orange-600 border-orange-600 hover:bg-orange-50 font-semibold py-2 text-xs'
            }`}
          >
            <X className="w-3 h-3 mr-1" />
            Lo devuelvo
          </Button>
        </div>
      </div>

      {/* Desktop Layout - Horizontal */}
      <div className="hidden sm:flex gap-3">
        {/* Product Image */}
        <div className="flex-shrink-0">
          {firstImage ? (
            <Image
              src={buildImageUrl(item.variantId.images[0].key)}
              alt={item.variantId.productId.title}
              width={60}
              height={60}
              className="rounded-md object-cover"
            />
          ) : (
            <div className="w-15 h-15 bg-gray-200 rounded-md flex items-center justify-center">
              <Package className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#20313A] mb-1 font-helvetica">
              {item.variantId.productId.title}
              {hasMultipleOfSameVariant && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({itemIndex} de {sameVariantItems.length})
                </span>
              )}
            </h3>
            <div className="flex gap-1.5 text-gray-600 text-xs mb-1.5">
              <span className="bg-gray-100 px-1.5 py-0.5 rounded-full font-medium text-xs">
                Talle: {item.variantId.size}
              </span>
              <span className="bg-gray-100 px-1.5 py-0.5 rounded-full font-medium text-xs flex items-center gap-1">
                Color: 
                <div
                  className="w-3 h-3 rounded-full border border-gray-300 inline-block"
                  style={{ backgroundColor: item.variantId.color }}
                />
              </span>
            </div>
            <p className="text-base font-bold text-[#20313A] font-helvetica">
              {formatPrice(item.unitPrice)}
            </p>
          </div>

          {/* Decision Buttons */}
          <div className="flex gap-1.5 mt-2">
            <Button
              onClick={() => onDecisionChange(item._id, 'keep')}
              variant={decision === 'keep' ? 'default' : 'outline'}
              size="lg"
              className={
                decision === 'keep'
                  ? 'bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 text-xs'
                  : 'text-green-600 border-green-600 hover:bg-green-50 font-semibold px-3 py-1.5 text-xs'
              }
            >
              <Check className="w-3 h-3 mr-0.5" />
              Me lo quedo
            </Button>
            <Button
              onClick={() => onDecisionChange(item._id, 'return')}
              variant={decision === 'return' ? 'default' : 'outline'}
              size="lg"
              className={
                decision === 'return'
                  ? 'bg-orange-600 hover:bg-orange-700 text-white font-semibold px-3 py-1.5 text-xs'
                  : 'text-orange-600 border-orange-600 hover:bg-orange-50 font-semibold px-3 py-1.5 text-xs'
              }
            >
              <X className="w-3 h-3 mr-0.5" />
              Lo devuelvo
            </Button>
          </div>
        </div>

        {/* Decision Status Indicator */}
        {decision && (
          <div className="flex-shrink-0 flex items-center justify-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                decision === 'keep' ? 'bg-green-600' : 'bg-orange-600'
              }`}
            >
              {decision === 'keep' ? (
                <Check className="w-3 h-3 text-white" />
              ) : (
                <X className="w-3 h-3 text-white" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}