'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/product';

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
  const imageUrl = `/${currentImage.key}`;

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="group cursor-pointer bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
        {/* Product Image Container */}
        <div
          className="relative aspect-[4/5] overflow-hidden bg-gray-50 mb-3 rounded-t-lg"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            src={imageUrl || '/placeholder.svg'}
            alt={currentImage?.altText || product.title}
            fill
            className="object-cover object-center group-hover:scale-102 transition-all duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </div>

        {/* Product Info */}
        <div className="p-3">
          <h3 className="font-semibold text-easyfit-blue-dark font-satoshi text-sm mb-1 truncate">{product.title}</h3>
          <p className="text-xs text-gray-500 mb-2">{product.store!.name}</p>

          {/* Price */}
          <div className="mb-2">
            <span className="text-sm font-semibold text-easyfit-blue-dark">
              ${product.minPrice!.toLocaleString('es-AR')}
            </span>
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
