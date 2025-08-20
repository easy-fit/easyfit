'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useStoreBySlug } from '@/hooks/api/use-stores';
import { useProductsByStore } from '@/hooks/api/use-products';
import { ProductCard } from '@/components/home/product-card';
import { buildStoreAssetUrl } from '@/lib/utils/image-url';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Truck,
  StoreIcon,
  Heart,
  Share2,
} from 'lucide-react';
import Image from 'next/image';
import { useEasyFitToast } from '@/hooks/use-toast';
import { Product } from '@/types/product';

const dayNames = {
  mon: 'Lunes',
  tue: 'Martes',
  wed: 'Miércoles',
  thu: 'Jueves',
  fri: 'Viernes',
  sat: 'Sábado',
  sun: 'Domingo',
};

export default function StorePage() {
  const params = useParams();
  const router = useRouter();
  const toast = useEasyFitToast();
  const storeSlug = params.storeSlug as string;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // API calls
  const { data: storeData, isLoading: storeLoading, error: storeError } = useStoreBySlug(storeSlug);
  const { data: productsData, isLoading: productsLoading, error: productsError } = useProductsByStore(storeSlug);

  const store = storeData?.data;
  const products = productsData?.data || [];

  // Loading state
  if (storeLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7]">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (storeError || !store) {
    return (
      <div className="min-h-screen bg-[#F7F7F7]">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <StoreIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#20313A] mb-2">Tienda no encontrada</h3>
              <p className="text-gray-600 mb-4">La tienda que buscás no existe o no está disponible.</p>
              <Button onClick={() => router.push('/')} className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]">
                Volver al inicio
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formatTime = (time: string) => {
    if (time === '00:00') return 'Cerrado';
    return time;
  };

  const isStoreOpen = () => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5);

    const todayHours = store.pickupHours.find((h) => h.day === currentDay);
    if (!todayHours || todayHours.open === '00:00') return false;

    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: store.name,
          text: `Mirá esta tienda en EasyFit: ${store.name}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  // Get unique categories from products
  const categories = ['all', ...new Set(products.map((p: Product) => p.category))];

  const filteredProducts =
    selectedCategory === 'all' ? products : products.filter((p: Product) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 hover:bg-[#DBF7DC] text-[#20313A]">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        {/* Store Banner */}
        <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-6">
          <Image
            src={buildStoreAssetUrl(store.customization?.bannerUrl, '/banner-store.jpg')}
            alt={`Banner de ${store.name}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
          <div className="absolute inset-0 bg-black/20" />

          {/* Store Logo */}
          <div className="absolute bottom-4 left-4 w-20 h-20 rounded-full overflow-hidden bg-white shadow-lg border-4 border-white">
            <Image
              src={buildStoreAssetUrl(store.customization?.logoUrl, '/logo-stores.jpg')}
              alt={`Logo de ${store.name}`}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="secondary" size="icon" onClick={handleShare} className="bg-white/90 hover:bg-white">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Store Header Info */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-[#20313A] font-helvetica">{store.name}</h1>
                <Badge
                  variant={isStoreOpen() ? 'default' : 'secondary'}
                  className={isStoreOpen() ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                >
                  {isStoreOpen() ? 'Abierto' : 'Cerrado'}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">
                    {store.averageRating > 0 ? store.averageRating.toFixed(1) : 'Nuevo'}
                  </span>
                  {store.ratingCount > 0 && <span className="text-sm">({store.ratingCount} reseñas)</span>}
                </div>

                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">
                    {store.address.formatted.street} {store.address.formatted.streetNumber},{' '}
                    {store.address.formatted.city}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex gap-2 mb-4">
                {store.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Free Shipping Banner */}
              {store.options.freeShipping.enabled && (
                <div className="bg-[#DBF7DC] p-3 rounded-lg flex items-center gap-2">
                  <Truck className="h-5 w-5 text-[#20313A]" />
                  <span className="text-sm font-medium text-[#20313A]">{store.options.freeShipping.promoLabel}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Products Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#20313A] font-helvetica">Productos ({products.length})</h2>

                {/* Category Filter */}
                {categories.length > 2 && (
                  <div className="flex gap-2">
                    {categories.map((category: string) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className={
                          selectedCategory === category
                            ? 'bg-[#9EE493] text-[#20313A] hover:bg-[#8BD480]'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50 bg-transparent'
                        }
                      >
                        {category === 'all' ? 'Todos' : category}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* Products Grid */}
              {productsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                      <div className="aspect-[4/5] bg-gray-200 rounded-lg mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((product: Product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <StoreIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[#20313A] mb-2">No hay productos</h3>
                    <p className="text-gray-600">
                      {selectedCategory === 'all'
                        ? 'Esta tienda aún no tiene productos disponibles.'
                        : `No hay productos en la categoría "${selectedCategory}".`}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Store Hours */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-[#20313A] mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Horarios de atención
                </h3>
                <div className="space-y-2">
                  {store.pickupHours.map((hours) => (
                    <div key={hours.day} className="flex justify-between text-sm">
                      <span className="text-gray-600">{dayNames[hours.day as keyof typeof dayNames]}</span>
                      <span className="font-medium text-[#20313A]">
                        {hours.open === '00:00' && hours.close === '00:00'
                          ? 'Cerrado'
                          : `${formatTime(hours.open)} - ${formatTime(hours.close)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-[#20313A] mb-4">Contacto</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a href={`tel:${store.contactPhone}`} className="text-sm text-[#2F4858] hover:text-[#20313A]">
                      {store.contactPhone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a href={`mailto:${store.contactEmail}`} className="text-sm text-[#2F4858] hover:text-[#20313A]">
                      {store.contactEmail}
                    </a>
                  </div>
                </div>

                {/* Social Links */}
                {(store.customization?.socialLinks?.instagram ||
                  store.customization?.socialLinks?.facebook ||
                  store.customization?.socialLinks?.twitter) && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex gap-3">
                      {store.customization?.socialLinks?.instagram && (
                        <a
                          href={store?.customization?.socialLinks?.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-gray-100 hover:bg-[#DBF7DC] transition-colors"
                        >
                          <Instagram className="h-4 w-4 text-gray-600" />
                        </a>
                      )}
                      {store?.customization?.socialLinks?.facebook && (
                        <a
                          href={store.customization.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-gray-100 hover:bg-[#DBF7DC] transition-colors"
                        >
                          <Facebook className="h-4 w-4 text-gray-600" />
                        </a>
                      )}
                      {store?.customization?.socialLinks?.twitter && (
                        <a
                          href={store.customization.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-gray-100 hover:bg-[#DBF7DC] transition-colors"
                        >
                          <Twitter className="h-4 w-4 text-gray-600" />
                        </a>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-[#20313A] mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Ubicación
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    {store.address.formatted.street} {store.address.formatted.streetNumber}
                  </p>
                  <p>
                    {store.address.formatted.city}, {store.address.formatted.province}
                  </p>
                  <p>CP: {store.address.formatted.postalCode}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 border-[#2F4858] text-[#2F4858] hover:bg-[#DBF7DC] bg-transparent"
                  onClick={() => {
                    const [lat, lng] = store.address.location.coordinates;
                    window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
                  }}
                >
                  Ver en Google Maps
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
