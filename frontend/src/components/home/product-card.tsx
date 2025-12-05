'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/product';
import { buildImageUrl } from '@/lib/utils/image-url';
import { ShippingTypeBadge } from '@/components/product/shipping-type-badge';
import { calculateDiscountedPrice, getLowestPriceVariant } from '@/lib/utils/variant-operations';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const defaultVariant = product.variants!.find((v) => v.isDefault) || product.variants![0];

  if (!defaultVariant) return null;

  const sortedImages = [...defaultVariant.images].sort((a, b) => a.order! - b.order!);
  const primaryImage = sortedImages[0];
  const hoverImage = sortedImages[1]; // Segunda imagen para hover, si existe

  // Usar imagen principal por defecto, imagen hover si existe y está en hover
  const currentImage = isHovered && hoverImage ? hoverImage : primaryImage;
  const imageUrl = buildImageUrl(currentImage?.key);
  const { originalPrice, finalPrice, maxDiscount } = getLowestPriceVariant(product.variants!);

  return (
    <Link href={`/${product.store?.slug}/${product.slug}`}>
      <div className="group cursor-pointer bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
        {/* Product Image Container */}
        <div
          className="relative aspect-[4/4.5] overflow-hidden bg-gray-50 mb-2 rounded-t-lg"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            src={imageUrl}
            alt={currentImage?.altText || product.title}
            fill
            className="object-cover object-center group-hover:scale-102 transition-all duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />

          {/* Discount Badge */}
          {maxDiscount > 0 && (
            <div className="absolute bottom-2 left-2 bg-red-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold z-10 shadow-sm">
              {maxDiscount}% OFF
            </div>
          )}

          {/* Shipping Type Badge */}
          {product.allowedShippingTypes && (
            <div className="absolute top-2 left-2">
              <ShippingTypeBadge allowedShippingTypes={product.allowedShippingTypes} variant="card" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-2.5">
          <h3 className="font-semibold text-easyfit-blue-dark font-satoshi text-sm mb-1 truncate">{product.title}</h3>
          <p className="text-xs text-gray-500 mb-2">{product.store!.name}</p>

          {/* Price with discount */}
          <div className="mb-2">
            {maxDiscount > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 line-through">
                  ${originalPrice.toLocaleString('es-AR')}
                </span>
                <span className="text-sm font-semibold text-black">
                  ${finalPrice.toLocaleString('es-AR')}
                </span>
              </div>
            ) : (
              <span className="text-sm font-semibold text-easyfit-blue-dark">
                ${finalPrice.toLocaleString('es-AR')}
              </span>
            )}
          </div>
          
          {/* Color Variants */}
          <div className="flex items-center gap-1">
            {product.availableColors!.slice(0, 4).map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: color }}
                title={`Color ${index + 1}`}
              />
            ))}
            {product.availableColors!.length > 4 && (
              <span className="text-xs text-gray-500 ml-1">+{product.availableColors!.length - 4}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}