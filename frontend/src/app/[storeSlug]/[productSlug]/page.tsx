/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ProductImageGallery } from '@/components/product/product-image-gallery';
import { ProductVariantSelector } from '@/components/product/product-variant-selector';
import { ProductBenefits } from '@/components/product/product-benefits';
import { useProductBySlug } from '@/hooks/api/use-products';
import { useStoreBySlug } from '@/hooks/api/use-stores';
import { useCreateCartItem } from '@/hooks/api/use-cart';
import { ArrowLeft, Heart, Share2, ShoppingCart, Store, Package } from 'lucide-react';
import Link from 'next/link';
import { useEasyFitToast } from '@/hooks/use-toast';
import { CategoryUtils } from '@/lib/utils/categoryUtils';
import type { Variant } from '@/types/variant';
import { ShippingTypeBadge } from '@/components/product/shipping-type-badge';
import { calculateDiscountedPrice } from '@/lib/utils/variant-operations';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useEasyFitToast();
  const storeSlug = params.storeSlug as string;
  const productSlug = params.productSlug as string;

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  // API calls
  const {
    data: productData,
    isLoading: productLoading,
    error: productError,
  } = useProductBySlug(storeSlug, productSlug);
  const { data: storeData, isLoading: storeLoading } = useStoreBySlug(storeSlug);

  const product = productData?.data;
  const store = storeData?.data;

  const createCartItemMutation = useCreateCartItem();

  // Set default variant when product loads
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0 && !selectedVariant) {
      const defaultVariant = product.variants.find((v) => v.isDefault) || product.variants[0];
      if (defaultVariant) {
        setSelectedVariant(defaultVariant);
        setSelectedSize(defaultVariant.size);
        setSelectedColor(defaultVariant.color);
      }
    }
  }, [product, selectedVariant]);

  // Loading state
  if (productLoading || storeLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7]">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (productError || !product) {
    return (
      <div className="min-h-screen bg-[#F7F7F7]">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#20313A] mb-2">Producto no encontrado</h3>
              <p className="text-gray-600 mb-4">El producto que buscás no existe o no está disponible.</p>
              <Button onClick={() => router.back()} className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]">
                Volver
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleVariantChange = (size: string, color: string) => {
    if (!product || !product.variants) return;

    const variant = product.variants.find((v) => v.size === size && v.color === color);
    if (variant) {
      setSelectedVariant(variant);
      setSelectedSize(size);
      setSelectedColor(color);
    } else {
      // Si no existe la combinación exacta, buscar la variante más cercana
      const fallbackVariant =
        product.variants.find((v) => v.size === size) ||
        product.variants.find((v) => v.color === color) ||
        product.variants[0];

      if (fallbackVariant) {
        setSelectedVariant(fallbackVariant);
        setSelectedSize(fallbackVariant.size);
        setSelectedColor(fallbackVariant.color);
      }
    }
  };

  const handleColorChange = (color: string) => {
    // Buscar una variante con este color, preferiblemente con el talle actual
    const variantWithSameSize = product.variants?.find((v) => v.color === color && v.size === selectedSize);
    const variantWithColor = product.variants?.find((v) => v.color === color && v.stock > 0);

    const targetVariant = variantWithSameSize || variantWithColor;

    if (targetVariant) {
      handleVariantChange(targetVariant.size, color);
    }
  };

  const handleSizeChange = (size: string) => {
    // Buscar una variante con este talle, preferiblemente con el color actual
    const variantWithSameColor = product.variants?.find((v) => v.size === size && v.color === selectedColor);
    const variantWithSize = product.variants?.find((v) => v.size === size && v.stock > 0);

    const targetVariant = variantWithSameColor || variantWithSize;

    if (targetVariant) {
      handleVariantChange(size, targetVariant.color);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Mirá este producto en EasyFit: ${product.title}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.validationError('variante', 'Por favor seleccioná una variante');
      return;
    }

    if (selectedVariant.stock === 0) {
      toast.quantityUpdateError({ message: 'Este producto no tiene stock disponible' });
      return;
    }

    try {
      await createCartItemMutation.mutateAsync({
        variantId: selectedVariant._id,
        quantity: 1,
      });

      toast.success('¡Producto agregado al carrito!', {
        description: `${product.title} - Talle ${selectedSize}, Color ${selectedColor}`,
        duration: 1500,
      });
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.smartError(error, 'Error al agregar al carrito');
    }
  };

  // Helper function to get category display name
  const getCategoryDisplayName = (category: string) => {
    if (CategoryUtils.isValidCategory(category)) {
      return CategoryUtils.getCategoryDisplayName(category);
    }
    return category;
  };

  const currentImages = selectedVariant?.images || [];

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-[#20313A]">
            Inicio
          </Link>
          <span>/</span>
          <Link href={`/${storeSlug}`} className="hover:text-[#20313A]">
            {store?.name}
          </Link>
          <span>/</span>
          <span className="text-[#20313A]">{product.title}</span>
        </div>

        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 hover:bg-[#DBF7DC] text-[#20313A]">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <ProductImageGallery images={currentImages} productTitle={product.title} />

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold text-[#20313A] font-helvetica mb-2">{product.title}</h1>
                  {store && (
                    <Link
                      href={`/${storeSlug}`}
                      className="flex items-center gap-2 text-gray-600 hover:text-[#20313A] mb-3"
                    >
                      <Store className="h-4 w-4" />
                      <span className="text-sm">{store.name}</span>
                    </Link>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Badge variant="outline" className="text-xs">
                {getCategoryDisplayName(product.category)}
              </Badge>
            </div>

            {/* Discounted Price */}
            <div className="space-y-2">
              {selectedVariant && selectedVariant.discount > 0 ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="destructive" className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[12px] font-bold z-10 shadow-sm">
                      {selectedVariant.discount}% OFF
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-lg text-gray-400 line-through">
                      ${selectedVariant.price.toLocaleString('es-AR')}
                    </span>
                    <span className="text-3xl font-bold text-[#20313A]">
                      ${calculateDiscountedPrice(selectedVariant.price, selectedVariant.discount).toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-3xl font-bold text-[#20313A]">
                  ${selectedVariant?.price.toLocaleString('es-AR')}
                </div>
              )}
              <p className="text-sm text-gray-600">Precio por prenda</p>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold text-[#20313A] mb-2">Descripción</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Shipping Type Badge */}
            <ShippingTypeBadge allowedShippingTypes={product.allowedShippingTypes} variant="detail" />

            <Separator />

            {/* Variant Selection */}
            <ProductVariantSelector
              variants={product.variants!}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              selectedVariant={selectedVariant}
              onSizeChange={handleSizeChange}
              onColorChange={handleColorChange}
            />

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                size="lg"
                disabled={!selectedVariant || selectedVariant.stock === 0 || createCartItemMutation.isPending}
                onClick={handleAddToCart}
                className="w-full bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A] font-semibold h-12"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {createCartItemMutation.isPending ? 'Agregando...' : 'Probar en casa'}
              </Button>
              <p className="text-xs text-gray-600 text-center">
                Probá antes de comprar. Solo pagás por lo que te quedás.
              </p>
            </div>

            {/* Benefits */}
            <ProductBenefits />
          </div>
        </div>
      </main>
    </div>
  );
}
