'use client';

import { useEffect } from 'react';
import { useProductBySlug } from '@/hooks/api/use-products';

declare global {
  interface Window {
    fbq?: (type: string, event: string, data?: any) => void;
  }
}

interface ProductPixelTrackingProps {
  storeSlug: string;
  productSlug: string;
}

export function ProductPixelTracking({ storeSlug, productSlug }: ProductPixelTrackingProps) {
  const { data: productData } = useProductBySlug(storeSlug, productSlug);
  const product = productData?.data;

  useEffect(() => {
    if (!product || typeof window === 'undefined' || !window.fbq) return;

    // Get the minimum price from variants
    const minPrice = product.variants && product.variants.length > 0
      ? Math.min(...product.variants.map((v: any) => v.price || 0))
      : 0;

    // Track ViewContent event
    window.fbq('track', 'ViewContent', {
      content_name: product.title,
      content_ids: [product._id],
      content_type: 'product',
      content_category: product.category,
      value: minPrice,
      currency: 'ARS',
    });
  }, [product]);

  return null;
}
