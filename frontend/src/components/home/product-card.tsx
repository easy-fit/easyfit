'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // Use placeholder for now since we're not handling images yet
  const imageUrl = '/product-example.jpg'; // Placeholder image, replace with actual logic if needed

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="group cursor-pointer bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
        {/* Product Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 mb-3 rounded-t-lg">
          <Image
            src={imageUrl || '/placeholder.svg'}
            alt={product.title}
            fill
            className="object-cover object-center group-hover:scale-102 transition-transform duration-200"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </div>

        {/* Product Info */}
        <div className="p-3">
          <h3 className="font-semibold text-easyfit-blue-dark font-satoshi text-sm mb-1 truncate">{product.title}</h3>
          <p className="text-xs text-gray-500 mb-2">{product.store?.name || 'Tienda'}</p>

          {/* Price */}
          <div className="mb-2">
            <span className="text-sm font-semibold text-easyfit-blue-dark">
              ${(product.minPrice || 0).toLocaleString('es-AR')}
            </span>
          </div>

          {/* Color Variants - Real colors from API */}
          <div className="flex items-center gap-1">
            {(product.availableColors || []).map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: color }}
                title={`Color ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
