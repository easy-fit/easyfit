'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Package } from 'lucide-react';
import { buildImageUrl } from '@/lib/utils/image-url';
import { formatPrice } from '@/utils/formatters';
import Image from 'next/image';
import type { CompleteOrder } from '@/types/order';

interface CollapsibleProductsSectionProps {
  order: CompleteOrder;
  isActiveDelivery: boolean;
}

export function CollapsibleProductsSection({ order, isActiveDelivery }: CollapsibleProductsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const totalItems = order.orderItems.length;
  const totalPrice = order.total;
  
  // On desktop or non-active deliveries, always show expanded
  if (!isActiveDelivery) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-[#20313A] font-satoshi">Productos del Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.orderItems.map((item) => (
            <ProductCard key={item._id} item={item} />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Desktop Version - Always Expanded */}
      <Card className="hidden lg:block">
        <CardHeader>
          <CardTitle className="text-[#20313A] font-satoshi">Productos del Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.orderItems.map((item) => (
            <ProductCard key={item._id} item={item} />
          ))}
        </CardContent>
      </Card>

      {/* Mobile Version - Collapsible */}
      <div className="lg:hidden">
        {!isExpanded ? (
          // Collapsed State - Summary Card
          <Card>
            <CardContent 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setIsExpanded(true)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-semibold text-[#20313A] font-helvetica">
                      Productos ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                    </p>
                    <p className="text-sm text-gray-600">Total: {formatPrice(totalPrice)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#9EE493] font-medium">Ver detalles</span>
                  <ChevronDown className="w-5 h-5 text-[#9EE493]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Expanded State - Full Product List
          <Card>
            <CardHeader>
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsExpanded(false)}
              >
                <CardTitle className="text-[#20313A] font-satoshi">Productos del Pedido</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Ocultar</span>
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.orderItems.map((item) => (
                <ProductCard key={item._id} item={item} />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

// Extracted Product Card Component for Reuse
function ProductCard({ item }: { item: CompleteOrder['orderItems'][0] }) {
  return (
    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="relative w-20 h-20 bg-white rounded-lg flex-shrink-0 overflow-hidden">
        <Image
          src={buildImageUrl(item.variantId.images?.[0].key)}
          alt={item.variantId.productId.title}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-[#20313A] font-helvetica mb-1">
          {item.variantId.productId.title}
        </h4>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600">Talle {item.variantId.size}</span>
          </div>
          <div className="flex items-center gap-1">
            <div 
              className="w-4 h-4 rounded-full border border-gray-300" 
              style={{ backgroundColor: item.variantId.color }}
              title={`Color ${item.variantId.color}`}
            />
          </div>
        </div>
        <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-[#20313A] font-helvetica">
          {formatPrice(item.unitPrice * item.quantity)}
        </p>
        {item.quantity > 1 && (
          <p className="text-sm text-gray-500">
            {formatPrice(item.unitPrice)} por unidad
          </p>
        )}
      </div>
    </div>
  );
}